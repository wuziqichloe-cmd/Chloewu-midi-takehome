#!/usr/bin/env node
/**
 * token-lint — makes hardcoding a *declared* act, not an accident.
 *
 * WHY THIS EXISTS
 * Prose rules do not prevent hardcoded values. I wrote "never derive, always read
 * the frame" in my own playbook and then shipped `padding: 20px` where the Figma
 * frame said 18px — in the same session, while believing I was being careful. An
 * agent grading its own compliance ("Property-set coverage: Pass") cannot catch
 * that, because the agent is the thing that is wrong.
 *
 * THE RULE
 *   tokens.css is the ONLY file allowed to contain raw values.
 *   Components consume var(--…) and nothing else.
 *
 * THE ESCAPE HATCH (deliberate, and the interesting part)
 * Real design files contain values with no token — an off-scale 18px padding, a
 * hex the designer never bound. Those MUST be mirrored, never rounded to the
 * nearest token: rounding is silently redesigning. So a raw value is allowed if
 * and only if the line declares itself:
 *
 *     padding: var(--spacing-lg) 18px;   // source-raw: xl padding, off-scale in Figma
 *
 * That turns "I forgot" into "I declared, and here is why" — and makes every
 * exception greppable. `--report` prints them: that list IS the set of tokens the
 * design system is missing, ready to hand to the designer.
 *
 * USAGE
 *   node tools/token-lint.mjs            # gate (exit 1 on undeclared raws)
 *   node tools/token-lint.mjs --report   # the missing-token report for the team
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const TOKEN_FILE = /styles\/tokens\.css$/; // the one file allowed raw values
const CHROME = [/showcase\//, /\.stories\./]; // docs furniture, not shipped components

/* Three categories, and keeping them apart is the point:
 *   source-raw:  the source has this value and the system has NO token for it.
 *                Mirror it, never round it — and REPORT it. This list is the set
 *                of tokens the design system is missing.
 *   layout:      my own composition decision at the pattern level (a card's
 *                max-width). Not a system value, not a source value. Stays.
 *   demo-only:   docs furniture.
 * Only `source-raw` reaches the designer's report. Mixing the three would
 * contaminate that report with values nobody needs to tokenise. */
const MARKER = /source-raw:|layout:|demo-only:/;
const REPORTABLE = /source-raw:/;
const ALLOWED = new Set(["0", "1"]); // never a design decision

/** Strip block comments across lines, preserving line numbering. */
function stripComments(src) {
  const out = [];
  let inBlock = false;
  for (const line of src.split("\n")) {
    let clean = "";
    let i = 0;
    while (i < line.length) {
      if (inBlock) {
        const end = line.indexOf("*/", i);
        if (end === -1) {
          i = line.length;
        } else {
          inBlock = false;
          i = end + 2;
        }
      } else {
        const start = line.indexOf("/*", i);
        const lineComment = line.indexOf("//", i);
        if (lineComment !== -1 && (start === -1 || lineComment < start)) {
          clean += line.slice(i, lineComment);
          break;
        }
        if (start === -1) {
          clean += line.slice(i);
          break;
        }
        clean += line.slice(i, start);
        inBlock = true;
        i = start + 2;
      }
    }
    out.push(clean);
  }
  return out;
}

const RULES = [
  { id: "colour", re: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/, label: "raw colour" },
  // a px literal that is NOT inside a var() fallback
  { id: "length", re: /(?:^|[\s:,(])(\d{1,4})px\b/, label: "raw px" },
];

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const violations = [];
const declared = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (TOKEN_FILE.test(rel) || CHROME.some((r) => r.test(rel))) continue;

  const raw = readFileSync(file, "utf8");
  const isCss = rel.endsWith(".css");

  // In TSX we only care about inline styles — JSX prose and code-sample strings
  // legitimately contain hexes, and flagging them is noise that trains people to
  // ignore the linter.
  const lines = isCss
    ? stripComments(raw)
    : raw.split("\n").map((l) => (/style=\{\{/.test(l) ? l : ""));

  lines.forEach((code, i) => {
    if (!code.trim()) return;
    for (const rule of RULES) {
      const m = code.match(rule.re);
      if (!m) continue;
      if (rule.id === "length" && ALLOWED.has(m[1])) continue;

      const original = raw.split("\n")[i];
      const entry = { file: rel, line: i + 1, label: rule.label, text: original.trim() };
      (MARKER.test(original) ? declared : violations).push(entry);
    }
  });
}

if (process.argv.includes("--report")) {
  const gaps = declared.filter((d) => REPORTABLE.test(d.text));
  console.log(`\nMissing tokens — values the source uses but has no token for (${gaps.length}):\n`);
  for (const d of gaps) console.log(`  ${d.file}:${d.line}\n    ${d.text}\n`);
  console.log("Hand this list to the design team. Every line is a gap in the system.\n");
  process.exit(0);
}

if (violations.length) {
  console.error(`\n✗ ${violations.length} undeclared hardcoded value(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  — ${v.label}`);
    console.error(`    ${v.text}\n`);
  }
  console.error(`  Two legitimate fixes:
    1. Bind it. The token probably exists — check the Figma variable, don't guess.
    2. If the source genuinely has no token, MIRROR it and declare it:
         padding: 18px;   /* source-raw: xl padding is off-scale in Figma */
       Never round to the nearest token. Rounding is silently redesigning.
`);
  process.exit(1);
}

console.log(`✓ token-lint: 0 undeclared raw values  (${declared.length} declared)`);
