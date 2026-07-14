# Handoff — the shared Figma file

Everything below was **read from the file**, not eyeballed. Contrast is measured (WCAG 2.2); every raw value was found by walking the variant tree and checking `boundVariables`,
not by looking at hexes.

**Nothing was silently "fixed."** The code mirrors the file exactly, flaws included — a
component library that quietly disagrees with its design file is worse than one that
visibly matches a flawed one. The one change made *to the file* is §1, and it has zero
visual effect.

---

## 1. Done — 40 raw whites bound to a token *(zero visual change)*

`Colors/Basics/white` already existed. 40 fills just weren't bound to it:

| Where | Was | Now |
|---|---|---|
| `Secondary` — Default / Hover / Focused / Disabled | raw `#ffffff` | `Colors/Basics/white` |
| `Tertiary` — Focused | raw `#ffffff` | `Colors/Basics/white` |
| `Link color` — Default / Focused / Loading | raw `#ffffff` | `Colors/Basics/white` |
| `Link gray` — Focused | raw `#ffffff` | `Colors/Basics/white` |

All four sizes plus the icon-only variants. **Raw whites remaining: 0.**

Also bound, on both card frames (`Card / Symptom select`, `Card / Symptom empty`):

| Where | Was | Now |
|---|---|---|
| card corner radius | raw `12px` | `radius-xl` |
| card padding | raw `24px` | `spacing-3xl` |

Both tokens already existed. The only raw value left anywhere in the cards is the CTA's
`18px` horizontal padding — see §2, the source has no token for it.

> ⚠️ **A trap worth knowing:** `Colors/Basics/transparent` *also* resolves to `#ffffff` — at
> `a=0`. Binding by resolved hex alone would have picked it and **erased every Secondary
> button**. The bind is guarded on alpha.

> 🔍 **A hack worth knowing:** 8 of those fills sit on the `Link color` / `Link gray`
> **Focused** variants at **`opacity: 0.001`** — a near-invisible fill so the focus ring's
> drop-shadow (which is `show shadow behind node: off`) has a shape to knock out of. Links
> have no fill of their own. The colour is now tokenised; **the hack itself is still
> there**, and is worth replacing with something less fragile.

---

## 2. Decide — padding `10` / `14` / `18` cannot be tokenised as-is

This is **not** someone forgetting to bind. There is nothing to bind to:

```
spacing scale:  0 · 1 · 2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 …
                                    ↑          ↑
                            10, 14, 18 are not on it
```

Every padding that **is** on the scale **is already bound** (`8 → spacing-md`,
`12 → spacing-lg`, `16 → spacing-xl`). `gap` and `radius` are **100% bound**. The designer
bound everything they could.

| Size | Padding (V/H) | Bound? |
|---|---|---|
| `sm` | 8 / 12 | ✅ both |
| `md` | **10** / **14** | ❌ neither |
| `lg` | **10** / 16 | ⚠️ H only |
| `xl` | 12 / **18** | ⚠️ V only |
| icon-only `md` / `xl` | **10** / **14** | ❌ |

**Two options, and they are not equivalent:**

**A — Add `spacing-10` / `-14` / `-18`.** 100% tokenised, zero visual change. But the scale
becomes `2 4 6 8 10 12 14 16 18 20…` — essentially every even number, so it no longer
*constrains* anything. It also breaks the naming convention (the scale is semantic —
`xs`/`sm`/`md` — not numeric).

**B — Re-spec onto the existing scale** (`10→12`, `14→16`, `18→20`). Genuinely tokenised
*and* the scale keeps its meaning. But **this changes the design**: `md` height goes 40 →
44, and every button gets wider. That's a redesign, not a tokenisation.

**My read:** B is the right destination; A is a rubber stamp. But B changes shipped
dimensions, so it's a designer's call. **Flagged, not decided.**

In code these are mirrored raw and *declared* (`/* source-raw: … */`) — never rounded to
the nearest token, because rounding is silently redesigning. `npm run report:tokens` prints
the list; it is generated, not remembered.

---

## 3. Decide — `#e0e0e0` should be **fixed**, not tokenised

`Link color` · Hover · label = raw **`#e0e0e0`**, the only colour in the component with no
near-token.

**Do not give it a name.** That would formalise a broken value into the system. It isn't an
un-tokenised colour — it's *the wrong colour*:

| Hierarchy · State | Text | On | Contrast | AA |
|---|---|---|---|---|
| **`Link color` · Hover** | `#e0e0e0` | white | **1.32 : 1** | ✗ |
| **`Link gray` · Hover** | `#e7f0f3` | white | **1.16 : 1** | ✗ |

**Hovering the control makes its own label almost disappear.** Not token drift — a broken
interaction, in the shipped component.

(`Link gray`'s hover *is* bound — to `text-secondary_on-brand`. **Bound to the wrong token
is not better than unbound**; it's harder to spot, because the code reads as correct.)

---

## 4. Mirrored, not fixed

### 4.1 Primary fails AA — and gets **worse** when you interact with it

| Fill | Hex | vs. white text | AA (4.5:1) |
|---|---|---|---|
| `Primary 400` — **default** | `#579fff` | **2.69 : 1** | ✗ |
| `Primary 200` — **hover** | `#88b8fb` | **2.04 : 1** | ✗ *worse* |
| `Primary 600` — focused | `#006af9` | **4.74 : 1** | ✓ |

The default CTA already fails. And the ramp is **inverted** — hover *lightens*, focus is
darkest — so contrast degrades the moment a user touches the control. The only Primary fill
that passes is the one reserved for focus.

**One change fixes both:** make `Primary 600` the default and step *lighter* on hover.
Contrast passes, the ramp runs the conventional direction, **and no new token is needed.**

For a menopause-care product with an older-skewing user base, I'd push for this.

### 4.2 `Secondary-on brand` reads as permanently disabled

Its text is `utility-brand-100` (`#bdc8cc`) in **every** state — the same grey as
`fg-disabled` (**1.55 : 1**). Default, Hover, Focused and Disabled are indistinguishable.

### 4.3 `Link color` and `Link gray` are the same component

Both use `text-secondary (700)` (`#6b7c88`). "Link **color**" isn't coloured.

### 4.4 `bg-primary` is not a primary surface

It resolves to `#eef5f7` — a page tint. Meanwhile the actual white surfaces were raw hex
(§1). The system has a semantic token no surface uses, and hardcoded the colour one should
own. Suggest renaming to `bg-canvas` and adding a real `bg-surface` bound to white.

### 4.5 `Link color` / `Link gray` fail WCAG 2.2 · 2.5.8 (Target Size)

New at **AA** in WCAG 2.2: every target must be at least **24 × 24 CSS px**.

| Variant | Size | 24×24? |
|---|---|---|
| `Link color` / `Link gray` — **sm**, **md** | 122 × **20** | ✗ **fail** |
| `Link color` / `Link gray` — lg, xl | 137 × **24** | ⚠️ exactly on the line |
| Everything else (38 variants) | ≥ 36 × 36 | ✓ |

2.5.8 exempts links **inline in a sentence** (constrained by line-height). These aren't
that — they're standalone controls in a component library, with their own `Loading` and
`Disabled` states. A link inside a paragraph doesn't have a loading spinner. **Used as
standalone controls, they fail AA.**

Fix: give the link hierarchies vertical padding so the *target* reaches 24px, without
changing the visual text size. (Or document them as inline-only and remove the
`Loading` / `Disabled` states, which is arguably the more honest option.)

> Note on 44/48: `44pt` (Apple HIG) and `48dp` (Material) are **platform guidance, not
> WCAG**. WCAG 2.2 AA is **24 × 24**. Meeting 44 is good practice; meeting 24 is the
> conformance floor.

### 4.6 `Colors/Brand/Primaryt 200` — typo in the variable name.

---

## Priority

| | Issue | Why |
|---|---|---|
| **P0** | §3 — Link hover labels vanish (1.32 / 1.16 : 1) | broken interaction, shipped |
| **P0** | §4.1 — Primary fails AA and degrades on hover | every CTA in the product |
| **P1** | §4.2 — `Secondary-on brand` reads as disabled | the control looks dead |
| **P2** | §2 — padding off-scale | needs a designer's call |
| **P2** | §4.4 — `bg-primary` misnamed | rename + add `bg-surface` |
| **P3** | §1 — the `opacity: 0.001` focus-ring hack | fragile |
| **P1** | §4.5 — Link hierarchies fail 2.5.8 (20px target, AA needs 24) | WCAG 2.2 AA |
| **P3** | §4.3, §4.6 — Link duplication, typo | tidy-up |
