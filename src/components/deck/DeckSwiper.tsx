import { useRef } from "react";
import type { Challenge } from "@/components/sections/challengeRegistry";
import { DeckScene } from "@/components/deck/DeckScene";

export function DeckSwiper({
  challenges,
  activeIndex,
  onActiveChange,
  onEngage,
}: {
  challenges: Challenge[];
  activeIndex: number;
  onActiveChange: (i: number) => void;
  onEngage: (id: string) => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  // null = undecided, "h" = horizontal swipe locked, "v" = vertical scroll (bail)
  const intent = useRef<null | "h" | "v">(null);
  const last = challenges.length - 1;

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    intent.current = null;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current || intent.current === "v") return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (intent.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      intent.current = Math.abs(dx) > Math.abs(dy) * 1.2 ? "h" : "v";
    }
  };

  const commit = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!start.current || intent.current !== "h") {
      start.current = null;
      intent.current = null;
      return;
    }
    const dx = e.clientX - start.current.x;
    start.current = null;
    intent.current = null;
    const threshold = Math.max(48, e.currentTarget.clientWidth * 0.12);
    if (Math.abs(dx) < threshold) return;
    if (dx < 0 && activeIndex < last) onActiveChange(activeIndex + 1);
    if (dx > 0 && activeIndex > 0) onActiveChange(activeIndex - 1);
  };

  return (
    <div
      className="deck-swiper"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={commit}
      onPointerCancel={commit}
      aria-roledescription="carousel"
      aria-label="Προκλήσεις"
    >
      <div
        className="deck-swipe-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {challenges.map((c, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={c.id}
              className="deck-swipe-cell"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} από ${challenges.length}`}
              inert={!isActive}
            >
              <DeckScene
                challenge={c}
                variant="swipe"
                interactive={isActive}
                onEngage={onEngage}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
