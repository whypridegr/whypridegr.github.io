import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ShareEmbed } from "@/components/primitives/ShareEmbed";
import { challenges, challengeIds } from "@/components/sections/challengeRegistry";
import { getDone, markDone, pickNext } from "@/lib/challengeProgress";

const TOTAL = challengeIds.length;

export function ChallengePage({ id }: { id: string }) {
  const challenge = challenges.find((c) => c.id === id) ?? null;
  const [doneCount, setDoneCount] = useState(0);
  // Bottom controls stay hidden until the visitor actually touches the
  // interactive — a challenge has a beginning and an end, not a wall of buttons
  // up front.
  const [engaged, setEngaged] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDoneCount(getDone().length);
  }, []);

  // First real interaction inside the challenge marks it done and reveals the
  // next/stop controls.
  useEffect(() => {
    const node = contentRef.current;
    if (!node || engaged) return;
    const events = ["pointerdown", "keydown", "change"] as const;
    const onInteract = (e: Event) => {
      // Ignore plain keyboard navigation (Tab, arrows, modifiers) — only a real
      // activation (Enter/Space) or a pointer/change counts as engagement.
      if (e.type === "keydown") {
        const k = (e as KeyboardEvent).key;
        if (k !== "Enter" && k !== " " && k !== "Spacebar") return;
      }
      setEngaged(true);
      setDoneCount(markDone(id).length);
      events.forEach((ev) => node.removeEventListener(ev, onInteract));
    };
    events.forEach((ev) => node.addEventListener(ev, onInteract));
    return () => events.forEach((ev) => node.removeEventListener(ev, onInteract));
  }, [id, engaged]);

  if (!challenge) return null;

  const allDone = doneCount >= TOTAL;
  const goNext = () => {
    const next = pickNext(challengeIds, id);
    window.location.href = next ? `/challenge/${next}` : "/#telos";
  };
  const goDone = () => {
    window.location.href = "/#telos";
  };

  return (
    <article className="mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-28">
      <div className="flex items-start justify-between gap-4">
        <a
          href="/#prokliseis"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> Όλες οι προκλήσεις
        </a>
        <ShareEmbed id={challenge.id} title={challenge.title} />
      </div>

      <h1 className="mt-8 font-display text-3xl md:text-5xl leading-tight reading-width">
        {challenge.title}
      </h1>

      <div ref={contentRef} className="mt-10 md:mt-14">
        {challenge.render()}
      </div>

      {engaged && (
        <div className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground" role="status">
            {allDone
              ? "Τις δοκίμασες όλες."
              : `Ολοκλήρωσες ${doneCount} από ${TOTAL}.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {!allDone && (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
              >
                <DiceIcon /> Άλλη πρόκληση
              </button>
            )}
            <button
              type="button"
              onClick={goDone}
              className={cn(
                "inline-flex items-center rounded-md px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors",
                allDone
                  ? "bg-ink text-paper hover:bg-accent"
                  : "border border-ink hover:bg-ink hover:text-paper",
              )}
            >
              {allDone ? "Δες την κατακλείδα" : "Φτάνει για τώρα"}
            </button>
          </div>
        </div>
      )}
    </article>
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
