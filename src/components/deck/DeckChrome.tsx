import { ShareEmbed } from "@/components/primitives/ShareEmbed";
import { cn } from "@/lib/utils";

export type DeckChromeProps = {
  index: number;
  total: number;
  id: string;
  title: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  /** Mobile shows a top exit (✕). Desktop scrolls out, so it's optional. */
  onExit?: () => void;
};

const ctrl =
  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:pointer-events-none";

export function DeckChrome({
  index,
  total,
  id,
  title,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onRandom,
  onExit,
}: DeckChromeProps) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs tabular-nums tracking-[0.2em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div
          className="h-px flex-1 bg-border"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Πρόοδος προκλήσεων"
        >
          <div className="h-px bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        {onExit && (
          <button type="button" onClick={onExit} aria-label="Έξοδος" className={cn(ctrl, "px-2")}>
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onPrev} disabled={!canPrev} className={cn(ctrl, "border border-ink hover:bg-ink hover:text-paper")}>
          <span aria-hidden>←</span> Προηγ.
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onRandom} className={cn(ctrl, "text-muted-foreground hover:text-accent")}>
            ↻ Έκπληξέ με
          </button>
          <ShareEmbed id={id} title={title} />
          <a href="/contents" className={cn(ctrl, "text-muted-foreground hover:text-accent")}>
            ⤢ Δες τα όλα
          </a>
        </div>
        <button type="button" onClick={onNext} disabled={!canNext} className={cn(ctrl, "bg-ink text-paper hover:bg-accent")}>
          Επόμ. <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
