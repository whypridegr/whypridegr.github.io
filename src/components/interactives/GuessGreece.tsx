import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/content/scenarios";

export function GuessGreece({ items }: { items: Scenario[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((s, i) => (
        <Card key={i} scenario={s} />
      ))}
    </div>
  );
}

function Card({ scenario }: { scenario: Scenario }) {
  const [guess, setGuess] = useState<"Ελλάδα" | "Αλλού" | null>(null);
  const answered = guess !== null;
  const correct = guess === scenario.answer;
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 md:p-8">
      <p className="text-xl leading-snug md:text-2xl">{scenario.text}</p>

      {!answered ? (
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
        <div className="mt-6 border-t border-border pt-5">
          <p
            className={cn(
              "text-sm uppercase tracking-[0.2em]",
              correct ? "text-accent" : "text-muted-foreground",
            )}
          >
            {correct ? "Σωστά." : "Όχι ακριβώς."}{" "}
            {scenario.answer === "Ελλάδα"
              ? "Συνέβη στην Ελλάδα."
              : "Συνέβη αλλού."}
          </p>
          <p className="mt-3 leading-relaxed">{scenario.reveal}</p>
          {scenario.source && (
            <p className="mt-3 text-xs text-muted-foreground">
              Πηγή:{" "}
              {scenario.url ? (
                <a
                  href={scenario.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-2 hover:text-accent hover:decoration-accent"
                >
                  {scenario.source}
                </a>
              ) : (
                scenario.source
              )}
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
      className="flex-1 rounded-md border border-ink px-5 py-2.5 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
    >
      {children}
    </button>
  );
}
