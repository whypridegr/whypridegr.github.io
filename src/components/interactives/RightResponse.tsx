import { useState } from "react";
import { cn } from "@/lib/utils";
import { options, swapWords } from "@/content/rightResponse";

export function RightResponse() {
  const [picked, setPicked] = useState<number | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [showBetter, setShowBetter] = useState(false);

  const words = ["γκέι", ...swapWords];
  const word = words[wordIdx];
  const answered = picked !== null;
  const pickedCalm = answered && options[picked].calm;
  // The "good" answer only gets revealed once the user asks for it (or picked it).
  const revealCalm = pickedCalm || showBetter;

  const reset = () => {
    setPicked(null);
    setWordIdx(0);
    setShowBetter(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr] lg:items-start">
      {/* Left rail: the scene + controls, sticky so they never fall below the fold */}
      <div className="space-y-5 lg:sticky lg:top-24">
        <div className="rounded-lg border border-border bg-card p-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Κάποιος σου λέει
          </span>
          <p className="mt-3 font-display text-2xl md:text-3xl leading-snug">
            «Είμαι <span className="text-accent">{word}</span>.»
          </p>
        </div>

        {answered && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Διάβασέ το ξανά με άλλη λέξη:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setWordIdx((w) => (w + 1) % words.length)}
                className="rounded-md border border-ink px-4 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
              >
                Άλλαξε τη λέξη →
              </button>
              <button
                onClick={reset}
                className="rounded-md px-3 py-2 text-sm uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-accent"
              >
                ↺ Ξανά
              </button>
            </div>
            {wordIdx !== 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Σε «{word}» καμία «φορτωμένη» απάντηση δεν στέκει. Η μόνη φυσική
                είναι το «Α, ωραία». Ισχύει ακριβώς το ίδιο και για το «γκέι».
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: the prompt + options */}
      <div>
        <p className="text-muted-foreground">Τι θα απαντούσες;</p>
        <ul className="mt-4 space-y-3">
          {options.map((o, i) => {
            const chosen = picked === i;
            return (
              <li key={i}>
                <button
                  onClick={() => !answered && setPicked(i)}
                  disabled={answered}
                  aria-pressed={chosen}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition-colors",
                    !answered && "border-border hover:border-accent",
                    answered && o.calm && revealCalm && "border-accent bg-accent/10",
                    answered && o.calm && !revealCalm && "border-border opacity-60",
                    answered &&
                      !o.calm &&
                      chosen &&
                      "border-border bg-secondary",
                    answered &&
                      !o.calm &&
                      !chosen &&
                      "border-border opacity-60",
                  )}
                >
                  <span className="leading-relaxed">{o.text}</span>
                  {answered && o.calm && revealCalm && (
                    <span className="ml-2 text-accent" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
                {answered && (chosen || (o.calm && revealCalm)) && (
                  <p className="mt-2 px-4 text-sm leading-relaxed text-muted-foreground">
                    {o.feedback}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {answered && !pickedCalm && !showBetter && (
          <button
            onClick={() => setShowBetter(true)}
            className="mt-5 text-sm underline decoration-dotted underline-offset-4 text-accent transition-colors hover:text-ink"
          >
            Δες τι θα μπορούσες να πεις καλύτερα
          </button>
        )}
      </div>
    </div>
  );
}
