import type { ButtonHTMLAttributes } from "react";
import "../Button/Button.css";
import "./SelectablePill.css";

export interface SelectablePillProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  label: string;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}

/**
 * SelectablePill — a toggle, built on the Button's foundation.
 *
 * ── What "built on the Button" means here ─────────────────────────────────
 * It shares the Button's *foundation*, not its identity. It reuses the `.btn`
 * base — type family, transition curve, focus-ring treatment, and the
 * inset-shadow border technique — and its colours **alias** the Button's tokens
 * wherever the two genuinely match (the unselected hover IS the Secondary
 * button's hover), so they cannot drift apart.
 *
 * But it is its own component, because Button and Pill are different things in
 * the accessibility tree:
 *
 *   Button — "do this"       → fires an action, holds no state
 *   Pill   — "this one is on" → holds state, announces it via aria-pressed
 *
 * A screen-reader user hears "Brain fog, toggle button, pressed" — but only if
 * the component knows it's a toggle. Adding a `selected` variant to Button would
 * give every CTA in the app a meaningless `selected` prop.
 *
 * ── Two places the Button's own rules decided the design ──────────────────
 * · **Focus** uses the FLAT ring. The Button establishes the rule: hierarchies
 *   with a resting shadow get the skeuomorphic ring; flat ones (Tertiary, Link)
 *   get the plain ring. The Pill is flat, so it takes the plain ring.
 * · **Hover** changes the fill — that's the Button's hover mechanism (Primary,
 *   Secondary and Tertiary all do it). It would have been easy to invent a
 *   border-only hover to dodge a contrast problem on the selected state; that
 *   would have broken the premise. Mirrored, and the contrast gap is flagged
 *   instead (see HANDOFF.md — the system has no blue darker than Primary 600).
 *
 * ── Selected is outlined, not filled ──────────────────────────────────────
 * One primary per screen, and the CTA owns it. A solid-brand pill would compete
 * with the CTA and flatten the hierarchy — and would inherit Primary 400's
 * 2.69:1 contrast failure. Outlined selected reads clearly (4.74:1) and leaves
 * the CTA as the only filled thing on the card.
 *
 * Content is label-only, per the spec. Selection is carried by the border and
 * label colour together, plus aria-pressed for assistive tech.
 */
export function SelectablePill({
  label,
  selected,
  onSelectedChange,
  className,
  ...rest
}: SelectablePillProps) {
  // `.btn` only — not `.btn--md`. The Pill inherits Button's *base*, but has
  // exactly one size and owns its own metrics; it isn't a size of Button.
  const classes = ["btn", "pill", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={selected}
      onClick={() => onSelectedChange(!selected)}
      {...rest}
    >
      <span className="btn__label">{label}</span>
    </button>
  );
}
