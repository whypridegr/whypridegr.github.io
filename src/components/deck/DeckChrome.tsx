import { useEffect, useRef, useState } from "react";
import { ShareEmbed } from "@/components/primitives/ShareEmbed";
import { cn } from "@/lib/utils";

type DeckEntry = { id: string; label: string; icon: string };

export type DeckChromeProps = {
  id: string;
  /** Used for share metadata only — not displayed in the chrome. */
  title: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  /** All challenges, for the "Δες τα όλα" dropdown. */
  challenges: DeckEntry[];
  activeIndex: number;
  /** Indices the visitor has already engaged with (shown with a ✓). */
  seen: ReadonlySet<number>;
  /** Jump straight to a challenge (scrolls it into view, no page change). */
  onJump: (i: number) => void;
};

// One compact control. The text label collapses on narrow screens so the
// island stays small; the icon always shows and stays legible.
const ctrl =
  "inline-flex items-center gap-1.5 rounded-full p-2 sm:px-3.5 sm:py-2 text-xs uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:pointer-events-none";

// Shared inline-SVG props — matches the repo's hand-rolled icon style.
const icon = {
  viewBox: "0 0 24 24",
  className: "size-4 sm:size-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function DeckChrome({
  id,
  title,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onRandom,
  challenges,
  activeIndex,
  seen,
  onJump,
}: DeckChromeProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close the "see all" dropdown on outside-click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Προηγούμενο"
        className={cn(ctrl, "border border-ink hover:bg-ink hover:text-paper")}
      >
        <svg {...icon}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="hidden sm:inline">Προηγ.</span>
      </button>

      <button
        type="button"
        onClick={onRandom}
        aria-label="Τυχαία πρόκληση"
        className={cn(ctrl, "text-muted-foreground hover:text-accent")}
      >
        <svg {...icon}>
          <path d="M16 3h5v5" />
          <path d="M4 20 21 3" />
          <path d="M21 16v5h-5" />
          <path d="M15 15l6 6" />
          <path d="M4 4l5 5" />
        </svg>
        <span className="hidden sm:inline">Τυχαίο</span>
      </button>

      {/* Share/embed is a desktop nicety — too fiddly on a phone, so it's
          hidden there to keep the island small. */}
      <span className="hidden items-center sm:inline-flex">
        <ShareEmbed id={id} title={title} />
      </span>

      {/* "See all" — a dropdown that jumps to any challenge in place, instead of
          a separate contents page. */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Δες τα όλα"
          className={cn(ctrl, "text-muted-foreground hover:text-accent")}
        >
          <svg {...icon}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="hidden sm:inline">Δες τα όλα</span>
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Όλες οι προκλήσεις"
            className="absolute left-1/2 top-full z-40 mt-2 max-h-[60vh] w-60 -translate-x-1/2 overflow-auto rounded-xl border border-border bg-card p-1.5 text-left shadow-xl"
          >
            <ul>
              {challenges.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onJump(i);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                      i === activeIndex && "bg-secondary",
                    )}
                  >
                    <span aria-hidden className="text-base leading-none">
                      {c.icon}
                    </span>
                    <span className="flex-1">{c.label}</span>
                    {seen.has(i) && (
                      <span className="text-accent" title="Ολοκληρωμένη">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Επόμενο"
        className={cn(ctrl, "bg-ink text-paper hover:bg-accent")}
      >
        <span className="hidden sm:inline">Επόμ.</span>
        <svg {...icon}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
