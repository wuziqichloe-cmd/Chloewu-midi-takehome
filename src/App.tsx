import { useState } from "react";
import { Button, type ButtonHierarchy, type ButtonSize } from "./components/Button/Button";
import { SelectablePill } from "./components/SelectablePill/SelectablePill";
import { SymptomCard } from "./components/SymptomCard/SymptomCard";
import {
  Column,
  Example,
  Flag,
  Layout,
  PropsTable,
  Section,
  Swatch,
  type NavItem,
} from "./showcase/Showcase";
import "./showcase/Showcase.css";

const NAV: NavItem[] = [
  { id: "tokens", label: "Tokens", group: "Foundations" },
  { id: "button", label: "Button", group: "Components" },
  { id: "pill", label: "Selectable Pill", group: "Components" },
  { id: "card", label: "Symptom card", group: "Patterns" },
  { id: "flags", label: "Flags in the source", group: "Notes" },
];

/** All six in the source. The brief says "3 variants"; the file ships 6. */
const HIERARCHIES: ButtonHierarchy[] = [
  "primary",
  "secondary",
  "tertiary",
  "secondary-on-brand",
  "link-color",
  "link-gray",
];
const SIZES: ButtonSize[] = ["sm", "md", "lg", "xl"];

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M7.5 5l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const STATES = [
  { key: "default", label: "default", cls: "", props: {} },
  { key: "hover", label: ":hover", cls: "is-hover", props: {} },
  { key: "focus", label: ":focus-visible", cls: "is-focus", props: {} },
  { key: "disabled", label: "disabled", cls: "", props: { disabled: true } },
  { key: "loading", label: "loading", cls: "", props: { loading: true } },
] as const;

export default function App() {
  const [live, setLive] = useState(true);

  return (
    <Layout nav={NAV}>
      <header id="top" className="sc-head">
        <h1 className="sc-head__title">Button → code</h1>
        <p className="sc-head__sub">
          The Button from the Figma file, recreated in code. Every value here was{" "}
          <strong>read from the source</strong>, not eyeballed — and a script fails the
          build if any of them is hardcoded. Nothing in the source was silently "fixed".
        </p>
        <div className="sc-head__meta">
          <span className="sc-chip">6 hierarchies</span>
          <span className="sc-chip">4 sizes</span>
          <span className="sc-chip">hover · focus · disabled · loading</span>
          <span className="sc-chip">icon axes</span>
          <span className="sc-chip">0 divergences vs. Figma</span>
        </div>
      </header>

      {/* ── Tokens ─────────────────────────────────────────────────────── */}
      <Section
        id="tokens"
        title="Tokens"
        blurb={
          <>
            <p>
              Two layers. <strong>Primitives</strong> mirror Figma's variable names
              mechanically (<code>Colors/Brand/Primary 600</code> →{" "}
              <code>--colors-brand-primary-600</code>). <strong>Semantics</strong> are
              role-named aliases (<code>--button-primary-bg</code>). Components may only
              consume semantics — re-theming touches layer one, and components never
              change.
            </p>
            <p>
              <code>tokens.css</code> is the <em>only</em> file allowed to contain a raw
              value. <code>npm run lint:tokens</code> fails the build on any other — see{" "}
              <a href="#flags">Flags</a> for the handful the source has no token for.
            </p>
            <p>
              The swatches render the <em>live</em> token, not a copy of it. If the token
              layer changes, this page changes with it.
            </p>
          </>
        }
      >
        <Example
          label="Brand · the primary ramp"
          code={`/* primitives — mirror Figma 1:1 */
--colors-brand-primary-200: #88b8fb;  /* Figma: "Primaryt 200" (sic) */
--colors-brand-primary-400: #579fff;
--colors-brand-primary-600: #006af9;

/* semantics — the only layer components may read */
--button-primary-bg:       var(--colors-brand-primary-400);
--button-primary-bg-hover: var(--colors-brand-primary-200);
--button-primary-bg-focus: var(--colors-brand-primary-600);`}
          note={
            <>
              Note the ramp: <strong>hover is lighter than default</strong>. That's what
              the source says, so that's what the code does.
            </>
          }
        >
          <div className="sc-swatches">
            <Swatch token="--colors-brand-primary-200" />
            <Swatch token="--colors-brand-primary-400" />
            <Swatch token="--colors-brand-primary-600" />
            <Swatch token="--colors-text-secondary-700" />
            <Swatch token="--colors-background-bg-primary-hover" />
            <Swatch token="--colors-effects-focus-rings-focus-ring" />
          </div>
        </Example>
      </Section>

      {/* ── Button ─────────────────────────────────────────────────────── */}
      <Section
        id="button"
        title="Button"
        blurb={
          <>
            <p>
              All six hierarchies from the source — nothing skipped, including the three
              that are broken in it. The brief calls the file "3 variants"; it ships 6.
              <em> All variants</em> is the instruction, so all of them are here.
            </p>
            <p>
              <strong>One Figma axis becomes two code mechanisms.</strong> Figma models{" "}
              <code>State</code> as a single enum because it has no <code>:hover</code>.
              Code must not copy that shape:{" "}
              <strong>hover and focus are pseudo-classes</strong> (the browser owns them),
              while <strong>disabled and loading are props</strong> (they are genuinely
              application state). Collapsing the two is the mistranslation.
            </p>
          </>
        }
      >
        <Example
          label="Hierarchy × size"
          grid
          code={`<Button hierarchy="primary"   size="md">Button CTA</Button>
<Button hierarchy="secondary" size="md">Button CTA</Button>
<Button hierarchy="tertiary"  size="md">Button CTA</Button>
<Button hierarchy="secondary-on-brand">Button CTA</Button>
<Button hierarchy="link-color">Button CTA</Button>
<Button hierarchy="link-gray">Button CTA</Button>`}
          note={
            <>
              Heights resolve to <strong>36 / 40 / 44 / 48</strong> — the source frames
              exactly. <code>Link color</code> and <code>Link gray</code> are{" "}
              <strong>text links</strong>, not buttons: zero padding, no fill, no
              elevation; their height is just the line-height.
            </>
          }
        >
          {HIERARCHIES.map((h) => (
            <Column key={h} label={h}>
              {SIZES.map((s) => (
                <Button key={s} hierarchy={h} size={s}>
                  Button CTA
                </Button>
              ))}
            </Column>
          ))}
        </Example>

        <Example
          label="Every state · every hierarchy"
          grid
          code={`{/* hover + focus are PSEUDO-CLASSES — the browser owns them.
    They are not props, and cannot be rendered from JS. */}
<Button hierarchy="primary">Button CTA</Button>   {/* :hover         */}
<Button hierarchy="primary">Button CTA</Button>   {/* :focus-visible */}

{/* disabled + loading are APP state, so they ARE props */}
<Button hierarchy="primary" disabled>Button CTA</Button>
<Button hierarchy="primary" loading>Button CTA</Button>`}
          note={
            <>
              The <em>hover</em> and <em>focus</em> columns are <strong>forced</strong>{" "}
              with a docs-only class that is <em>appended to the real selector</em> (
              <code>.btn--primary:hover, .btn--primary.is-hover</code>) rather than
              re-declaring the styles. One declaration block per state, so this page{" "}
              <strong>cannot drift</strong> from the component. Mouse over the default
              column to see the genuine article.
              <br />
              <br />
              Focus uses <code>:focus-visible</code>, so a real mouse click leaves no ring
              — only keyboard navigation does.{" "}
              <strong>
                Loading is not <code>disabled</code>
              </strong>
              : the native attribute would rip the button out of the tab order the instant
              it starts, so a keyboard user loses their place mid-flow. It stays focusable,
              sets <code>aria-busy</code>, and refuses the activation.
            </>
          }
        >
          {STATES.map((state) => (
            <Column key={state.key} label={state.label}>
              {HIERARCHIES.map((h) => (
                <Button key={h} hierarchy={h} className={state.cls} {...state.props}>
                  Button CTA
                </Button>
              ))}
            </Column>
          ))}
        </Example>

        <Example
          label="Icons"
          code={`<Button iconLeading={<PlusIcon />}>Leading</Button>
<Button iconTrailing={<ChevronIcon />}>Trailing</Button>
<Button iconLeading={<PlusIcon />} iconTrailing={<ChevronIcon />}>Both</Button>

{/* icon-only: aria-label is a TYPE ERROR to omit */}
<Button iconOnly aria-label="Add"><PlusIcon /></Button>`}
          note={
            <>
              Icons are <strong>20px at every size</strong> — they don't scale with the
              button (read from the source; I'd have assumed they did). Icon-only buttons
              are square (36/40/44/48). With no visible label a screen reader would
              otherwise announce only "button", so the type system forces{" "}
              <code>aria-label</code>.
            </>
          }
        >
          <Button iconLeading={<PlusIcon />}>Leading</Button>
          <Button iconTrailing={<ChevronIcon />}>Trailing</Button>
          <Button iconLeading={<PlusIcon />} iconTrailing={<ChevronIcon />}>
            Both
          </Button>
          {SIZES.map((s) => (
            <Button key={s} size={s} iconOnly aria-label={`Add (${s})`}>
              <PlusIcon />
            </Button>
          ))}
        </Example>

        <PropsTable
          rows={[
            {
              name: "hierarchy",
              type: '"primary" | "secondary" | "tertiary" | "secondary-on-brand" | "link-color" | "link-gray"',
              default: '"primary"',
              desc: "Figma calls this axis Hierarchy. Keeping its word means a design review and a code review are talking about the same thing.",
            },
            {
              name: "size",
              type: '"sm" | "md" | "lg" | "xl"',
              default: '"md"',
              desc: "Heights 36 / 40 / 44 / 48 — matching the source frames.",
            },
            {
              name: "iconLeading",
              type: "ReactNode",
              desc: "Slot, not an enum — the source exposes icons as INSTANCE_SWAP, whose code equivalent is 'pass me any icon'.",
            },
            { name: "iconTrailing", type: "ReactNode", desc: "As above." },
            {
              name: "iconOnly",
              type: "boolean",
              default: "false",
              desc: "Square button. Requires aria-label — enforced by the type, not by code review.",
            },
            {
              name: "loading",
              type: "boolean",
              default: "false",
              desc: "Stays focusable, sets aria-busy, refuses activation. Deliberately NOT the native disabled attribute.",
            },
            {
              name: "disabled",
              type: "boolean",
              default: "false",
              desc: "Native. Differs per hierarchy in the source — Primary greys, Secondary stays white, Tertiary keeps no fill.",
            },
            { name: "fullWidth", type: "boolean", default: "false", desc: "Fills its container." },
          ]}
        />
      </Section>

      {/* ── Pill ───────────────────────────────────────────────────────── */}
      <Section
        id="pill"
        title="Selectable Pill"
        blurb={
          <>
            <p>
              <strong>Built on the Button's foundation</strong> — it reuses the{" "}
              <code>.btn</code> base (type family, transition, focus treatment, the
              inset-shadow border technique), and its colours <em>alias</em> the Button's
              tokens wherever the two genuinely match: the unselected hover{" "}
              <em>is</em> the Secondary button's hover. Where they don't match, it says so
              rather than forcing a false alias.
            </p>
            <p>
              But it's its own component, because the two are different things in the
              accessibility tree: a Button <em>fires an action</em> and holds no state; a
              Pill <em>holds state</em> and announces it via <code>aria-pressed</code>.
            </p>
            <p>
              <strong>Selected is outlined, not filled.</strong> One primary per screen and
              the CTA owns it — a solid-brand pill would compete with the CTA and flatten
              the hierarchy, and would inherit <code>Primary 400</code>'s 2.69:1 contrast
              failure. Outlined reads clearly at <strong>4.74:1</strong>.
            </p>
          </>
        }
      >
        <Example
          label="Every state"
          grid
          code={`const [selected, setSelected] = useState(false)

<SelectablePill
  label="Brain fog"
  selected={selected}
  onSelectedChange={setSelected}
/>

{/* selected drives BOTH the fill and aria-pressed, so the visual
    state physically cannot drift from the announced one. */}`}
          note={
            <>
              Exactly the three states in the spec — Default, Hover, Selected — plus the
              focus treatment the spec asks for under <em>Behavior</em>. There is no
              disabled pill; it isn't in the spec.
              <br />
              <br />
              <strong>Focus uses the flat ring, and that's the Button's own rule</strong>{" "}
              — hierarchies with a resting shadow (Primary, Secondary, Secondary-on brand)
              get the skeuomorphic ring; flat ones (Tertiary, Link color, Link gray) get
              the plain one. The Pill is flat, so it takes the plain one.
              <br />
              <br />
              <strong>⚠ Selected + hover is 4.10:1 — below AA.</strong> The fill darkens
              (that's the Button's hover mechanism), but the label can't darken with it:{" "}
              <code>Primary 600</code> is the darkest blue the system has. It would have
              been easy to invent a border-only hover to dodge this — that would have
              broken the "built on the Button" premise. <strong>Mirrored, and flagged</strong>{" "}
              instead. The fix is a <code>Primary 700</code> token.
            </>
          }
        >
          <Column label="unselected">
            <SelectablePill label="Default" selected={false} onSelectedChange={() => {}} />
            <SelectablePill className="is-hover" label="Hover" selected={false} onSelectedChange={() => {}} />
            <SelectablePill className="is-focus" label="Focus" selected={false} onSelectedChange={() => {}} />
          </Column>
          <Column label="selected">
            <SelectablePill label="Selected" selected onSelectedChange={() => {}} />
            <SelectablePill className="is-hover" label="Selected + hover" selected onSelectedChange={() => {}} />
            <SelectablePill className="is-focus" label="Selected + focus" selected onSelectedChange={() => {}} />
          </Column>
          <Column label="live — click me">
            <SelectablePill label="Brain fog" selected={live} onSelectedChange={setLive} />
          </Column>
        </Example>

        <PropsTable
          rows={[
            { name: "label", type: "string", desc: "Label only, per the spec. No icon slot." },
            { name: "selected", type: "boolean", desc: "Drives the fill AND aria-pressed, so the visual state cannot drift from the announced one." },
            { name: "onSelectedChange", type: "(selected: boolean) => void", desc: "Toggle handler. Space and Enter work — it's a real <button>." },
          ]}
        />
      </Section>

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <Section
        id="card"
        title="Symptom card"
        blurb={
          <>
            <p>
              Title, 4–6 pills, primary CTA. <strong>Hierarchy comes from spacing and
              weight, not from adding more colour</strong> — the card has exactly{" "}
              <em>one</em> filled element, the CTA, and the selected pills are outlined,
              so nothing competes with it.
            </p>
            <p>
              The rhythm is deliberately uneven: <strong>20px</strong> between the question
              and its answers (they travel together), <strong>48px</strong> before the CTA
              (a commitment gets room to breathe). A single even gap would flatten all
              three into one list.
            </p>
            <p>
              The Figma file also has a <code>Card / Symptom empty</code> frame with the CTA
              disabled. <strong>That isn't a second component</strong> — it's the same card
              at zero selections. In Figma an empty state must be drawn as its own frame; in
              code it's a state, not a variant: <code>disabled={"{count === 0}"}</code> is
              the whole of it.
            </p>
          </>
        }
      >
        <Example
          label="Live — click the pills"
          code={`<SymptomCard />

// inside:
<fieldset>
  <legend className="card__legend">Symptoms</legend>
  <div className="pill-group">
    {SYMPTOMS.map((s) => (
      <SelectablePill key={s} label={s} selected={...} onSelectedChange={...} />
    ))}
  </div>
</fieldset>

<Button hierarchy="primary" size="xl" fullWidth disabled={count === 0}>
  Continue
</Button>`}
          note={
            <>
              A <code>&lt;fieldset&gt;</code> with a visually-hidden{" "}
              <code>&lt;legend&gt;</code> gives the group an accessible name — a screen
              reader announces "Symptoms, group" before the six toggles, instead of six
              orphaned buttons.
              <br />
              <br />
              The selection count is <strong>announced but not drawn</strong>. A sighted
              user gets feedback from the pill inverting; without an{" "}
              <code>aria-live</code> region a screen-reader user would get none at all.
            </>
          }
        >
          <SymptomCard />
        </Example>
      </Section>

      {/* ── Flags ──────────────────────────────────────────────────────── */}
      <Section
        id="flags"
        title="Flags in the source"
        blurb={
          <p>
            Mirrored, <strong>never fixed</strong>. A component library that quietly
            disagrees with its design file is worse than one that visibly matches a flawed
            one. Full write-up, prioritised, in <code>HANDOFF.md</code>.
          </p>
        }
      >
        <Flag>
          <strong>40 raw whites — now bound.</strong> <code>Colors/Basics/white</code>{" "}
          already existed; 40 fills just weren't bound to it. Fixed in the Figma file, zero
          visual change. (Careful: <code>Colors/Basics/transparent</code> also resolves to{" "}
          <code>#ffffff</code>, at <code>a=0</code> — binding that one instead would have
          erased every Secondary button.)
        </Flag>
        <Flag>
          <strong>Padding 10 / 14 / 18 cannot be tokenised.</strong> They are simply not on
          the spacing scale (<code>2 · 4 · 6 · 8 · 12 · 16 · 20 · 24…</code>). Every padding
          that <em>is</em> on the scale is already bound — the designer didn't forget, there
          was nothing to bind to. Mirrored raw and declared; <strong>never rounded</strong>,
          because rounding to the nearest token is silently redesigning.
        </Flag>
        <Flag>
          <strong>Contrast fails, and gets worse on interaction.</strong> White on{" "}
          <code>Primary 400</code> is <strong>2.69:1</strong>; on hover (
          <code>Primary 200</code>) it drops to <strong>2.04:1</strong>. Both fail WCAG AA.
          The only Primary fill that passes is <code>Primary 600</code> (4.74:1) — currently
          reserved for focus. Making 600 the default and stepping <em>lighter</em> on hover
          fixes the contrast and the inverted ramp at once, with no new token.
        </Flag>
        <Flag>
          <strong>Two hierarchies all but vanish on hover.</strong> <code>Link color</code>
          's hover text is a raw, unbound <code>#e0e0e0</code> — <strong>1.32:1</strong>.{" "}
          <code>Link gray</code>'s is <strong>1.16:1</strong>. Hovering the control makes
          its own label disappear. <em>This one should not be tokenised</em> — naming it
          would formalise a broken value into the system. It isn't an un-tokenised colour,
          it's the wrong colour.
        </Flag>
        <Flag>
          <strong>
            <code>Secondary-on brand</code> reads as permanently disabled.
          </strong>{" "}
          Its text is <code>utility-brand-100</code> (<code>#bdc8cc</code>) in every state —
          the same grey as <code>fg-disabled</code> — so Default, Hover, Focused and
          Disabled are indistinguishable. Visible in the grid above.
        </Flag>
      </Section>
    </Layout>
  );
}
