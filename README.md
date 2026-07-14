# Midi — Design Engineer take-home

**Step 1 — Button → code.** *(Steps 2 and 3 to follow.)*

```bash
npm install
npm run dev      # a design-system docs page: live examples + the code that made them
npm run verify   # token-lint + typecheck + build
```

**[→ HANDOFF.md](./HANDOFF.md)** — what I found in the Figma file, prioritised for the
team: 40 raw whites now bound to a token (zero visual change), a padding scale that
*cannot* be tokenised as-is, and two P0 contrast bugs.

---

## What's here

```
src/
  styles/tokens.css     # Figma variables, transcribed 1:1.
                        # The ONLY file allowed to contain a raw value.
  components/Button/    # 6 hierarchies × 4 sizes × every state × both icon axes
  showcase/             # the docs page. NOT part of the system — demo furniture.
tools/
  token-lint.mjs        # fails the build on any undeclared hardcoded value
  sync-check.mjs        # diffs the running page against the Figma source
```

## Three ideas the code is built on

**Tokens are two layers.** Primitives mirror Figma's variable names mechanically
(`Colors/Brand/Primary 600` → `--colors-brand-primary-600`). Semantics are role-named
aliases (`--button-primary-bg`). Components consume *only* semantics — re-theming touches
layer one, and components never change.

**One Figma axis becomes two code mechanisms.** Figma models `State` as a single enum
because it has no `:hover`. Code must not copy that shape:

- **hover / focus → pseudo-classes.** The browser owns them. A `state="hover"` prop would
  let you render a button that looks hovered while the cursor is elsewhere, and would
  strand keyboard focus.
- **disabled / loading → props.** These are genuinely *application* state.

Collapsing the two into one mechanism is the mistranslation. (Loading in particular must
**not** use the native `disabled` attribute — that rips the button out of the tab order the
instant it starts, so a keyboard user loses their place mid-flow. It stays focusable, sets
`aria-busy`, and refuses the activation.)

**Borders are `inset` box-shadows, not `border`.** Figma strokes are `strokeAlign: INSIDE`;
CSS borders sit *outside* the content box and add 2px to an auto-height element. Using a
real border makes every bordered component 2px taller than its source. Heights land on
Figma's numbers exactly — **36 / 40 / 44 / 48** — measured in the browser, not assumed.

## Hardcoding is a *declared* act, not an accident

Prose rules don't prevent hardcoded values — I've broken my own while believing I was being
careful. So `tokens.css` is the only file allowed a raw value, and **`npm run lint:tokens`
fails the build on any other.**

The escape hatch is the interesting part. Real design files *do* contain values with no
token, and those must be **mirrored, never rounded** — rounding to the nearest token is
silently redesigning. So a raw value is legal only if the line declares itself:

```css
padding: var(--spacing-lg) 18px;  /* source-raw: 18 is not on the spacing scale */
```

Three categories, kept deliberately apart:

| Marker | Meaning | Reported to the designer? |
|---|---|---|
| *(none)* | must be a token | ✗ **build fails** |
| `source-raw:` | source uses it; **system has no token** | ✅ **yes — this is the gap list** |
| `layout:` | my composition choice | ✗ not a system value |
| `demo-only:` | docs furniture | ✗ |

`npm run report:tokens` prints only the `source-raw` lines. **That output is the
missing-token report — generated, not remembered.**

## Scope

**Complete against the source — nothing skipped.** All **6 hierarchies** (Primary,
Secondary, Tertiary, Secondary-on brand, Link color, Link gray) × 4 sizes × every state
(incl. **Loading**) × both icon axes.

The brief calls the file "3 variants"; it ships **6 hierarchies** and a Loading state.
*"All variants"* is the instruction, so all of them are built — **including the three that
are broken in the source.** Mirroring a flawed component faithfully and saying so is the
job; quietly declining to build it is not.

Verified against Figma: 18 hierarchy × state colour pairs, 4 size ramps, 4 loading fills.
**0 divergences.**
