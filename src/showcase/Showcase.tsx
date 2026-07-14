import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./Showcase.css";

/* ── Layout ──────────────────────────────────────────────────────────────── */

export type NavItem = { id: string; label: string; group: string };

export function Layout({ nav, children }: { nav: NavItem[]; children: ReactNode }) {
  const [active, setActive] = useState(nav[0]?.id);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    for (const item of nav) {
      const el = document.getElementById(item.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [nav]);

  const groups = [...new Set(nav.map((n) => n.group))];

  return (
    <div className="sc-shell">
      <aside className="sc-nav">
        <a className="sc-nav__brand" href="#top">
          Midi <span>Design System</span>
        </a>
        {groups.map((g) => (
          <div key={g} className="sc-nav__group">
            <span className="sc-nav__grouplabel">{g}</span>
            {nav
              .filter((n) => n.group === g)
              .map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className={
                    "sc-nav__link" + (active === n.id ? " sc-nav__link--active" : "")
                  }
                  aria-current={active === n.id ? "true" : undefined}
                >
                  {n.label}
                </a>
              ))}
          </div>
        ))}
      </aside>
      <main className="sc-main">{children}</main>
    </div>
  );
}

/* ── Content blocks ──────────────────────────────────────────────────────── */

export function Section({
  id,
  title,
  blurb,
  children,
}: {
  id: string;
  title: string;
  blurb?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="sc-section">
      <h2 className="sc-section__title">{title}</h2>
      {blurb && <div className="sc-section__blurb">{blurb}</div>}
      <div className="sc-section__body">{children}</div>
    </section>
  );
}

/** Live example + the JSX that produced it. */
export function Example({
  label,
  code,
  note,
  grid = false,
  children,
}: {
  label?: string;
  code: string;
  note?: ReactNode;
  grid?: boolean;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="sc-example">
      {label && <span className="sc-example__label">{label}</span>}
      <div className={"sc-preview" + (grid ? " sc-preview--grid" : "")}>{children}</div>
      <div className="sc-code">
        <button className="sc-code__copy" onClick={copy} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
      {note && <p className="sc-example__note">{note}</p>}
    </div>
  );
}

/** One variant across the size ramp — mirrors the Figma variant grid. */
export function Column({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sc-column">
      <span className="sc-column__label">{label}</span>
      {children}
    </div>
  );
}

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  desc: ReactNode;
};

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="sc-tablewrap">
      <table className="sc-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <code className="sc-table__prop">{r.name}</code>
              </td>
              <td>
                <code className="sc-table__type">{r.type}</code>
              </td>
              <td>{r.default ? <code>{r.default}</code> : <span aria-hidden>—</span>}</td>
              <td>{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders the token's REAL resolved value — not a hardcoded copy of it.
 *  If the token layer changes, this page changes with it. That's the point. */
export function Swatch({ token }: { token: string }) {
  return (
    <div className="sc-swatch">
      <span className="sc-swatch__chip" style={{ background: `var(${token})` }} />
      <code className="sc-swatch__name">{token}</code>
    </div>
  );
}

export function Flag({ children }: { children: ReactNode }) {
  return (
    <div className="sc-flag">
      <p className="sc-flag__body">{children}</p>
    </div>
  );
}
