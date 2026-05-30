import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Myth } from "@/content/myths";

export function FlipCard({ item }: { item: Myth }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className="group relative block h-full w-full [perspective:1200px] text-left"
    >
      <div
        className={cn(
          // Faces stack in one grid cell, so the card grows to the taller
          // face instead of clipping. h-full lets every card in a row stretch
          // to the tallest one (equal heights); min-h sets the floor.
          "relative grid h-full min-h-72 w-full transition-transform duration-700 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        <Face flipped={flipped} className="bg-card border border-border">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Μύθος
          </span>
          <p className="mt-4 font-display text-2xl leading-snug">{item.myth}</p>
          <span className="mt-auto text-xs text-muted-foreground">
            Κάνε κλικ για την πραγματικότητα →
          </span>
        </Face>
        <Face
          flipped={flipped}
          className="bg-ink text-paper [transform:rotateY(180deg)]"
          back
        >
          <span className="text-xs uppercase tracking-[0.2em] opacity-60">
            Πραγματικότητα
          </span>
          <p className="mt-4 text-base leading-relaxed">{item.reality}</p>
          {item.source && (
            <span className="mt-auto text-xs opacity-60">{item.source}</span>
          )}
        </Face>
      </div>
    </button>
  );
}

function Face({
  children,
  className,
  back,
  flipped,
}: {
  children: React.ReactNode;
  className?: string;
  back?: boolean;
  flipped?: boolean;
}) {
  return (
    <div
      className={cn(
        "col-start-1 row-start-1 h-full flex flex-col p-6 [backface-visibility:hidden] rounded-lg",
        className,
      )}
      aria-hidden={back ? !flipped : flipped}
    >
      {children}
    </div>
  );
}
