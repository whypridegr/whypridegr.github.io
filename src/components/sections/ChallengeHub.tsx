import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { challenges, challengeIds } from "@/components/sections/challengeRegistry";
import { getDone, pickNext } from "@/lib/challengeProgress";

const TOTAL = challengeIds.length;

export function ChallengeHub() {
  // `null` until we've read localStorage, so the first paint doesn't flash the
  // "first visit" subtitle for a returning visitor (or hide it for a new one).
  const [done, setDone] = useState<string[] | null>(null);

  useEffect(() => {
    setDone(getDone());
  }, []);

  const doneSet = new Set(done ?? []);
  const doneCount = doneSet.size;
  // Show by default (covers SSR + first-timers); hide only once we know the
  // visitor has progress, so it never pops in for the common case.
  const firstVisit = done === null || doneCount === 0;

  const goRandom = () => {
    const next = pickNext(challengeIds);
    window.location.href = next ? `/?c=${next}` : "/#telos";
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Προκλήσεις
      </p>
      {/* Only the first time — once you've opened one, you know the drill and
          the line just eats space. */}
      {firstVisit && (
        <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight reading-width">
          Διάλεξε μια πρόκληση και δοκίμασέ τη.
        </h2>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={goRandom}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
        >
          <DiceIcon /> Τυχαία πρόκληση
        </button>
        {done !== null && doneCount > 0 && (
          <span className="text-sm text-muted-foreground" role="status">
            {doneCount === TOTAL
              ? "Τις δοκίμασες όλες."
              : `${doneCount} / ${TOTAL} ολοκληρωμένες`}
          </span>
        )}
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {challenges.map((c, i) => {
          const isDone = doneSet.has(c.id);
          return (
            <li key={c.id}>
              <a
                href={`/challenge/${c.id}`}
                className={cn(
                  "group flex h-full w-full flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left",
                  "transition-colors hover:border-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span aria-hidden className="text-2xl leading-none">
                    {c.icon}
                  </span>
                  {isDone ? (
                    <span
                      className="text-sm text-accent"
                      title="Την έχεις δοκιμάσει"
                    >
                      ✓
                    </span>
                  ) : (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <span className="font-display text-xl leading-snug">
                  {c.label}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {c.blurb}
                </span>
                <span className="mt-auto pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-accent">
                  {isDone ? "Ξανά →" : "Άνοιξε →"}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DiceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" />
    </svg>
  );
}
