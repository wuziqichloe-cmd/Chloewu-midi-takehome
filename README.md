# Midi — Design Engineer take-home

Button → code, extended into a **Selectable Pill**, applied in a symptom-select card.

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
  components/
    Button/             # 6 hierarchies × 4 sizes × every state × both icon axes
    SelectablePill/     # the toggle, built on the Button's foundation
    SymptomCard/        # the mini UI
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

**Focus adds a ring and preserves the control's elevation.** The system documents its two
focus styles — `focus-ring` *"for toggles and checkboxes"*, and
`focus-ring-shadow-xs-skeuomorphic` *"for components that ALSO require a shadow"*. Read that
way, the rule isn't "pills use ring X"; it's resolved **per state**: the unselected pill is
flat so it takes the plain ring, the selected pill is raised so it takes the ring that keeps
the shadow. Same rule the Button follows (Tertiary and the Links are flat → plain ring;
Primary and Secondary are raised → skeuomorphic). Getting it wrong in either direction is
the same bug: **focusing a control must never change what the control is.**

**Borders are `inset` box-shadows, not `border`.** Figma strokes are `strokeAlign: INSIDE`;
CSS borders sit *outside* the content box and add 2px to an auto-height element. Using a
real border makes every bordered component 2px taller than its source. Heights land on
Figma's numbers exactly — **36 / 40 / 44 / 48** — measured in the browser, not assumed.

## Every value is a token — or a gap reported to the team

Two jobs, and they're different:

1. **Bind everything the system already has a token for.** In the Figma file, 40 fills were
   raw `#ffffff` while `Colors/Basics/white` sat right there unused. Those are now bound —
   zero visual change. `gap` and `radius` were already 100% bound.
2. **Find what the system has *no* token for, and hand that list to the team.** Those values
   still have to render, so they're mirrored exactly — **never rounded to the nearest
   token**, because rounding is silently redesigning.

`tokens.css` is the only file allowed to hold a raw value; `npm run lint:tokens` fails the
build on any other. A value with no token is legal only when the line says so and says why:

```css
padding: var(--spacing-lg) 18px;  /* source-raw: 18 is not on the spacing scale */
```

Three markers, kept apart so the report stays clean:

| Marker | Meaning | Goes to the team? |
|---|---|---|
| *(none)* | a token exists — bind it | ✗ **build fails** |
| `source-raw:` | the source uses it; **the system has no token** | ✅ **yes — this is the gap list** |
| `layout:` | a composition choice, not a system value | ✗ |
| `demo-only:` | docs furniture | ✗ |

**`npm run report:tokens` prints exactly the `source-raw` lines — that output *is* the
missing-token list**, generated rather than remembered, ready to hand over. Right now it
returns the spacing gaps (`10 / 14 / 18`) and the unbound icon size, all written up in
[HANDOFF.md](./HANDOFF.md).

## Scope

**Complete against the source — nothing skipped.** All **6 hierarchies** (Primary,
Secondary, Tertiary, Secondary-on brand, Link color, Link gray) × 4 sizes × every state
(incl. **Loading**) × both icon axes.

The brief calls the file "3 variants"; it ships **6 hierarchies** and a Loading state.
*"All variants"* is the instruction, so all of them are built — **including the three that
are broken in the source.** Mirroring a flawed component faithfully and saying so is the
job; quietly declining to build it is not.

Verified against Figma at every step — 18 hierarchy × state colour pairs, 4 size ramps, 4
loading fills, all 6 pill variants (fill / text / border / elevation / focus ring), and the
card's container, spacing rhythm, type styles and CTA states. **0 divergences.**

## What the Figma file couldn't say, and the code had to

Three places where copying Figma's *shape* would have been the mistranslation:

- **`State` is one enum in Figma; it's two mechanisms in code.** Hover and focus are
  pseudo-classes (the browser owns them); disabled and loading are props (real app state).
- **`Card / Symptom empty` is a separate frame in Figma; it's a *state* in code.** Figma has
  no conditional rendering, so an empty state must be drawn. `disabled={count === 0}` is the
  whole of it — not a second component.
- **Figma variants are mutually exclusive; CSS pseudo-classes compose.** A pill can be
  focused *and* hovered at once in the browser; Figma can't express that, so it isn't a gap
  in the design file.
