/**
 * sync-check — diff the RUNNING page against the Figma source.
 *
 * This is the phase-5 gate. It caught, in the dry run, four things that no
 * screenshot and no code review would have: every bordered component 2px too
 * tall, a component with no focus ring at all, an xl padding off by 2px, and a
 * Figma file that was internally inconsistent with itself.
 *
 * USAGE
 *   1. Paste the values you dumped from Figma in phase 0 into FIGMA below.
 *      DO NOT carry values over from a previous take-home. Re-read them.
 *   2. npm run dev &
 *   3. node tools/sync-check.mjs
 *
 * Exits non-zero if anything diverges, so it can gate a commit.
 */
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:5173/";

// ──────────────────────────────────────────────────────────────────────────
// FILL THIS IN FROM THE NEW FIGMA FILE. Colours as the browser reports them
// (`rgb(r, g, b)`), lengths as CSS strings ("14px"), heights as numbers.
// ──────────────────────────────────────────────────────────────────────────
const FIGMA = {
  button: {
    "primary/default":   { sel: ".sc-example .btn--primary",   fill: "rgb(87, 159, 255)",   text: "rgb(255, 255, 255)" },
    "primary/hover":     { sel: ".sc-example .btn--primary",   fill: "rgb(136, 184, 251)",  text: "rgb(255, 255, 255)" },
    "secondary/default": { sel: ".sc-example .btn--secondary", fill: "rgb(255, 255, 255)",  text: "rgb(107, 124, 136)" },
    "secondary/hover":   { sel: ".sc-example .btn--secondary", fill: "rgb(231, 240, 243)",  text: "rgb(65, 84, 101)" },
    "tertiary/default":  { sel: ".sc-example .btn--tertiary",  fill: "rgba(0, 0, 0, 0)",    text: "rgb(107, 124, 136)" },
  },
  sizes: {
    sm: { sel: ".sc-example .btn--sm", height: 36, padH: "12px", gap: "4px" },
    md: { sel: ".sc-example .btn--md", height: 40, padH: "14px", gap: "4px" },
    lg: { sel: ".sc-example .btn--lg", height: 44, padH: "16px", gap: "6px" },
    xl: { sel: ".sc-example .btn--xl", height: 48, padH: "18px", gap: "6px" },
  },
  component: {
    default:  { sel: ".card .pill", fill: "rgb(255, 255, 255)", text: "rgb(107, 124, 136)", weight: "500" },
    hover:    { sel: ".card .pill", fill: "rgb(231, 240, 243)" },
    selected: { sel: ".card .pill", fill: "rgb(87, 159, 255)" },
  },
  focusRingRgb: "182, 231, 160",
};
// ──────────────────────────────────────────────────────────────────────────

let failures = 0;
const mark = (good) => (good ? "✓" : "✗ DIFF");
const note = (good, ...msg) => {
  if (!good) failures++;
  console.log(" ", mark(good), ...msg);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 1600 } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const cs = (loc, prop) => loc.evaluate((el, p) => getComputedStyle(el)[p], prop);
const settle = () => page.waitForTimeout(250); // longer than the transition

console.log("=== colours: Figma vs code ===");
for (const [key, exp] of Object.entries(FIGMA.button)) {
  const el = page.locator(exp.sel).first();
  if (key.includes("hover")) {
    await el.hover();
  } else {
    await page.mouse.move(0, 0);
  }
  await settle();
  const fill = await cs(el, "backgroundColor");
  const text = await cs(el, "color");
  note(
    fill === exp.fill && text === exp.text,
    key.padEnd(22),
    fill.padEnd(22),
    text,
    fill === exp.fill && text === exp.text ? "" : `\n      expected ${exp.fill} / ${exp.text}`,
  );
}
await page.mouse.move(0, 0);

console.log("=== metrics: height / padding / gap ===");
for (const [key, exp] of Object.entries(FIGMA.sizes)) {
  const el = page.locator(exp.sel).first();
  const box = await el.boundingBox();
  const padH = await cs(el, "paddingLeft");
  const gap = await cs(el, "gap");
  const good =
    box.height === exp.height &&
    (!exp.padH || padH === exp.padH) &&
    (!exp.gap || gap === exp.gap);
  note(good, key.padEnd(6), `h=${box.height} pad=${padH} gap=${gap}`, good ? "" : `\n      expected h=${exp.height} pad=${exp.padH} gap=${exp.gap}`);
}

console.log("=== the new component: states ===");
{
  const c = FIGMA.component;
  if (c.default) {
    const el = page.locator(c.default.sel).first();
    await page.mouse.move(0, 0);
    await settle();
    note(
      (await cs(el, "backgroundColor")) === c.default.fill,
      "default ",
      await cs(el, "backgroundColor"),
    );
    if (c.hover) {
      await el.hover();
      await settle();
      note((await cs(el, "backgroundColor")) === c.hover.fill, "hover   ", await cs(el, "backgroundColor"));
    }
    if (c.selected) {
      await el.click();
      await page.mouse.move(0, 0);
      await settle();
      note((await cs(el, "backgroundColor")) === c.selected.fill, "selected", await cs(el, "backgroundColor"));
      note((await el.getAttribute("aria-pressed")) === "true", "aria-pressed=true after click");
      await el.click();
      await settle();
      note((await el.getAttribute("aria-pressed")) === "false", "toggles back OFF");
    }
  }
}

console.log("=== a11y: focus is keyboard-only, and actually visible ===");
if (FIGMA.focusRingRgb) {
  const el = page.locator(FIGMA.component.default?.sel ?? "button").first();
  // keyboard focus → ring MUST appear
  await el.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await settle();
  const kb = await cs(el, "boxShadow");
  note(kb.includes(FIGMA.focusRingRgb), "keyboard focus shows the ring");

  // mouse click → ring must NOT appear (:focus-visible, not :focus).
  //
  // The click must be a CLEAN one. If the element already has :focus-visible from
  // the keyboard, clicking it does NOT clear the ring — focus never left, and the
  // browser is right to keep it (a keyboard user who then clicks shouldn't lose
  // their focus indicator). An earlier version of this check clicked straight
  // after the keyboard step and reported a false failure. Reset the modality by
  // clicking elsewhere first.
  await page.mouse.click(2, 2);
  await el.click();
  await page.mouse.move(0, 0);
  await settle();
  const mouse = await cs(el, "boxShadow");
  note(!mouse.includes(FIGMA.focusRingRgb), "clean mouse click leaves NO ring (:focus-visible)");
}

console.log("=== a11y: every icon-only control has an accessible name ===");
{
  const bare = await page
    .locator("button")
    .evaluateAll((els) =>
      els
        .filter((e) => !e.textContent.trim() && !e.getAttribute("aria-label") && !e.getAttribute("aria-labelledby"))
        .map((e) => e.className),
    );
  note(bare.length === 0, `${bare.length} button(s) with no accessible name`, bare.join(" | "));
}

console.log("");
console.log(failures === 0 ? ">>> IN SYNC — 0 divergences" : `>>> ${failures} DIVERGENCE(S)`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
