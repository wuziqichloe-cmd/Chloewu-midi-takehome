import { useState } from "react";
import { Button } from "../Button/Button";
import { SelectablePill } from "../SelectablePill/SelectablePill";
import "./SymptomCard.css";

const SYMPTOMS = [
  "Hot flashes",
  "Brain fog",
  "Sleep trouble",
  "Mood changes",
  "Joint pain",
  "Low energy",
] as const;

/**
 * SymptomCard — mirrors `Card / Symptom select` in Figma.
 *
 * Hierarchy comes from spacing and weight, not from adding more colour. The card
 * has exactly one filled element — the CTA — and the selected pills are outlined,
 * so nothing competes with it. (That's the reasoning behind the Pill's outlined
 * selected state: one primary per screen, and the CTA owns it.)
 *
 * The Figma file also has a `Card / Symptom empty` frame with the CTA disabled.
 * That isn't a second component — it's the same card at zero selections, so in
 * code it's a state, not a variant. `disabled={count === 0}` is the whole of it.
 */
export function SymptomCard() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const toggle = (symptom: string, isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.add(symptom);
      else next.delete(symptom);
      return next;
    });
  };

  const count = selected.size;

  return (
    <section className="card">
      <div className="card__question">
        <header className="card__header">
          <h2 className="card__title">Select the symptoms you're experiencing</h2>
          <p className="card__helper">Choose all that apply.</p>
        </header>

        <fieldset className="card__fieldset">
          <legend className="card__legend">Symptoms</legend>
          <div className="pill-group">
            {SYMPTOMS.map((symptom) => (
              <SelectablePill
                key={symptom}
                label={symptom}
                selected={selected.has(symptom)}
                onSelectedChange={(isSelected) => toggle(symptom, isSelected)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Announced, not drawn — see SymptomCard.css. */}
      <p className="visually-hidden" aria-live="polite">
        {count === 0
          ? "No symptoms selected"
          : `${count} symptom${count === 1 ? "" : "s"} selected`}
      </p>

      {/* xl + fullWidth: the one commitment on the screen, so it gets the largest
          step in the ramp. Disabled at zero — the card is a question, and you
          can't continue without answering it. That's the `Symptom empty` frame. */}
      <Button hierarchy="primary" size="xl" fullWidth disabled={count === 0}>
        Continue
      </Button>
    </section>
  );
}
