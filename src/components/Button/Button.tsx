import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import "./Button.css";

/**
 * All six hierarchies in the source — nothing skipped.
 *
 * Figma calls this axis "Hierarchy". Keeping the designer's word for it means a
 * design review and a code review are talking about the same thing.
 */
export type ButtonHierarchy =
  | "primary"
  | "secondary"
  | "tertiary"
  | "secondary-on-brand"
  | "link-color"
  | "link-gray";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

type BaseProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  hierarchy?: ButtonHierarchy;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
  /** Loading, like `disabled`, is APP state — not a browser state — so it is a
   *  prop, not a pseudo-class. Sets aria-busy and blocks interaction. */
  loading?: boolean;
};

/** A loading button stays focusable but refuses activation — mouse and keyboard. */
const swallowClick = (e: MouseEvent<HTMLButtonElement>) => e.preventDefault();

const Spinner = () => (
  <svg className="btn__spinner" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    <path
      d="M18 10a8 8 0 0 0-8-8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * `iconOnly` is a discriminated union, not a loose boolean.
 *
 * An icon-only button has no visible label, so it MUST carry an accessible name
 * — otherwise a screen reader announces "button" and nothing else. Typing it
 * this way makes `aria-label` a compile error to omit, rather than a code-review
 * comment someone forgets to leave.
 */
export type ButtonProps =
  | (BaseProps & { iconOnly: true; "aria-label": string; children: ReactNode })
  | (BaseProps & { iconOnly?: false; children: ReactNode });

/**
 * Button — mirrors Figma `Buttons/Button` (node 3287:427074).
 *
 * COMPLETE against the source — all 6 hierarchies, 4 sizes, every state, both
 * icon axes. Nothing skipped.
 *
 * Figma axes → code:
 *   Hierarchy  (6 values)      → `hierarchy` prop
 *   Size       (sm|md|lg|xl)   → `size` prop
 *   Icon only  (True|False)    → `iconOnly` prop
 *   Icon leading / trailing    → `iconLeading` / `iconTrailing` (ReactNode slots)
 *   State · Hover / Focused    → CSS pseudo-classes, NOT props
 *   State · Disabled / Loading → props (they are real app state)
 *
 * That split is the important one. Hover and Focused have to be variants in
 * Figma, because Figma has no `:hover`. In code they must NOT be, because the
 * browser already owns them — a `state="hover"` prop would let you render a
 * button that looks hovered while the cursor is elsewhere, and would strand
 * keyboard focus. But Disabled and Loading are genuinely application state, not
 * browser state, so those DO stay props. The Figma axis is one enum; the correct
 * code translation is two different mechanisms.
 *
 * Icons are slots (`ReactNode`), not a name/enum: the source exposes them as
 * INSTANCE_SWAP, whose code equivalent is "pass me any icon", not "pick from a
 * list I hardcoded".
 *
 * ⚠ Three hierarchies are BROKEN in the source and are mirrored, not fixed:
 * `Link color`/`Link gray` hover text drops to 1.32:1 / 1.16:1 (the label nearly
 * vanishes), and `Secondary-on brand` uses fg-disabled grey as its text in every
 * state, so it reads as permanently disabled. See NOTES.md.
 */
export function Button({
  hierarchy = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  loading = false,
  iconLeading,
  iconTrailing,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${hierarchy}`,
    `btn--${size}`,
    iconOnly && "btn--icon-only",
    loading && "btn--loading",
    fullWidth && "btn--full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      {...rest}
      // Loading is NOT `disabled`. The native attribute would rip the button out
      // of the tab order the instant it starts loading — if that's where focus
      // is, it falls back to <body> and a keyboard or screen-reader user loses
      // their place mid-flow. So: stay focusable, announce busy, and refuse the
      // activation. Declared AFTER {...rest} so a caller's onClick can't override
      // the guard.
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      disabled={disabled}
      onClick={loading ? swallowClick : rest.onClick}
    >
      {iconOnly ? (
        // The children ARE the icon. aria-hidden: the accessible name comes from
        // the aria-label the type system forced the caller to provide.
        <span className="btn__icon" aria-hidden="true">
          {loading ? <Spinner /> : children}
        </span>
      ) : (
        <>
          {loading ? (
            <Spinner />
          ) : (
            iconLeading && (
              <span className="btn__icon" aria-hidden="true">
                {iconLeading}
              </span>
            )
          )}
          <span className="btn__label">{children}</span>
          {iconTrailing && !loading && (
            <span className="btn__icon" aria-hidden="true">
              {iconTrailing}
            </span>
          )}
        </>
      )}
    </button>
  );
}
