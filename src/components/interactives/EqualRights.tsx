import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A deliberately one-sided poll: the "Όχι" button can never be pressed.
 * It flees the pointer (mouse + touch) with a smooth, slightly comic dodge.
 * The "Ναι" button works and reveals a warm confirmation.
 */
export function EqualRights() {
  const areaRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);

  // Translate offset of the "No" button from its natural (in-flow) position.
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [moved, setMoved] = useState(false);
  const [answered, setAnswered] = useState(false);

  const FLEE_RADIUS = 96; // px — how close the pointer can get before it bolts

  // Pick a fresh offset that keeps the button inside the play area,
  // biased as far from the pointer as we can manage.
  const dodge = useCallback(
    (pointer?: { x: number; y: number }) => {
      const area = areaRef.current;
      const btn = noRef.current;
      if (!area || !btn) return;

      const ar = area.getBoundingClientRect();
      const br = btn.getBoundingClientRect();

      // Where the button would sit with no transform applied.
      const naturalLeft = br.left - pos.x;
      const naturalTop = br.top - pos.y;
      const bw = br.width;
      const bh = br.height;

      const minX = ar.left - naturalLeft;
      const maxX = ar.right - bw - naturalLeft;
      const minY = ar.top - naturalTop;
      const maxY = ar.bottom - bh - naturalTop;

      const rand = (lo: number, hi: number) =>
        lo + Math.random() * Math.max(0, hi - lo);

      let best = { x: rand(minX, maxX), y: rand(minY, maxY) };
      if (pointer) {
        let bestDist = -1;
        for (let i = 0; i < 8; i++) {
          const cand = { x: rand(minX, maxX), y: rand(minY, maxY) };
          const cx = naturalLeft + cand.x + bw / 2;
          const cy = naturalTop + cand.y + bh / 2;
          const d = Math.hypot(cx - pointer.x, cy - pointer.y);
          if (d > bestDist) {
            bestDist = d;
            best = cand;
          }
        }
      }

      setPos(best);
      setMoved(true);
    },
    [pos],
  );

  // Desktop: flee when the pointer gets near.
  const onAreaPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return; // touch handled on the button itself
      const btn = noRef.current;
      if (!btn) return;
      const br = btn.getBoundingClientRect();
      const cx = br.left + br.width / 2;
      const cy = br.top + br.height / 2;
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < FLEE_RADIUS) {
        dodge({ x: e.clientX, y: e.clientY });
      }
    },
    [dodge],
  );

  // Keyboard users can focus the button and press Enter/Space. Without a
  // pointer there's nothing to flee from, so make it hop to a fresh spot and
  // surface the "δεν θέλει να πατηθεί" hint — the joke still lands.
  const onNoKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        dodge();
      }
    },
    [dodge],
  );

  // Any attempt to actually hit it — bolt and swallow the event.
  const evade = useCallback(
    (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const p =
        "touches" in e && e.touches[0]
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : "clientX" in e
            ? {
                x: (e as React.MouseEvent).clientX,
                y: (e as React.MouseEvent).clientY,
              }
            : undefined;
      dodge(p);
    },
    [dodge],
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-ink">
        Πιστεύεις ότι τα άτομα της ΛΟΑΤΚΙ κοινότητας
        <br className="hidden md:block" /> πρέπει να έχουν ίσα δικαιώματα;
      </h1>

      <div ref={areaRef} onPointerMove={onAreaPointerMove} className="relative mt-12 h-[320px]">
        {answered ? (
          <Celebration onReset={() => setAnswered(false)} />
        ) : (
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-5">
            {/* "Ναι" — the only real button. */}
            <button
              onClick={() => setAnswered(true)}
              className="rounded-full bg-ink px-10 py-4 text-lg font-medium text-paper shadow-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Ναι
            </button>

            {/* "Όχι" — forever just out of reach. */}
            <button
              ref={noRef}
              type="button"
              aria-label="Όχι (το κουμπί αυτό αποφεύγει να πατηθεί)"
              onPointerEnter={evade}
              onPointerDown={evade}
              onMouseEnter={evade}
              onTouchStart={evade}
              onKeyDown={onNoKeyDown}
              onClick={(e) => e.preventDefault()}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                touchAction: "none",
              }}
              className={cn(
                "rounded-full border border-border bg-card px-10 py-4 text-lg font-medium text-muted-foreground",
                "transition-transform duration-300 ease-out will-change-transform",
              )}
            >
              Όχι
            </button>
          </div>
        )}
      </div>

      {!answered && (
        <p className="mt-4 text-sm text-muted-foreground">
          {moved
            ? "Περίεργο. Το «Όχι» δεν θέλει να πατηθεί."
            : "Διάλεξε μία απάντηση."}
        </p>
      )}
    </div>
  );
}

function Celebration({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <p className="font-display text-4xl md:text-5xl font-semibold text-ink">
          Ναι. ✨
        </p>
        <p className="mt-3 max-w-md text-pretty text-base text-muted-foreground">
          Ίσα δικαιώματα δεν είναι κάτι που δίνεται ή αφαιρείται με ένα κλικ.
          Αλλά η απάντηση είναι απλή.
        </p>
      </div>
      <button
        onClick={onReset}
        className="mt-2 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-ink"
      >
        Πάλι από την αρχή
      </button>
    </div>
  );
}
