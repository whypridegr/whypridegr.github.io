import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/content/scenarios";

export function GuessGreece({ items }: { items: Scenario[] }) {
  return (
    <div className="space-y-6">
      {items.map((s, i) => (
        <Card key={i} scenario={s} />
      ))}
    </div>
  );
}

function Card({ scenario }: { scenario: Scenario }) {
  const [guess, setGuess] = useState<"Ελλάδα" | "Αλλού" | null>(null);
  const correct = guess === scenario.answer;
  return (
    <div className="border border-border bg-card p-6 md:p-8 rounded-lg">
      <p className="font-display text-xl md:text-2xl leading-snug">
        {scenario.text}
      </p>

      {guess === null ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            Πού νομίζεις ότι συνέβη;
          </p>
          <div className="mt-3 flex gap-3">
            <Choice onClick={() => setGuess("Ελλάδα")}>Ελλάδα</Choice>
            <Choice onClick={() => setGuess("Αλλού")}>Αλλού</Choice>
          </div>
        </>
      ) : (
        <div className="mt-6 border-t border-border pt-6">
          <p
            className={cn(
              "text-sm uppercase tracking-[0.2em]",
              correct ? "text-accent" : "text-muted-foreground",
            )}
          >
            {correct ? "Σωστά." : "Όχι ακριβώς."} Συνέβη στην {scenario.answer}.
          </p>
          <p className="mt-3 leading-relaxed">{scenario.reveal}</p>
          {scenario.source && (
            <p className="mt-3 text-xs text-muted-foreground">
              Πηγή: {scenario.source}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Choice({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 text-sm uppercase tracking-[0.15em] border border-ink hover:bg-ink hover:text-paper transition-colors rounded-md"
    >
      {children}
    </button>
  );
}
