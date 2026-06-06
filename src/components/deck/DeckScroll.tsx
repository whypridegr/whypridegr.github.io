import { memo, useEffect, useRef } from "react";
import type { Challenge } from "@/components/sections/challengeRegistry";
import { DeckScene } from "@/components/deck/DeckScene";

// Memoised: the parent (Deck) re-renders on every scroll frame to advance the
// progress bar, but its props here are referentially stable, so the 8-scene
// list (and each challenge.render()) only reconciles when activeIndex changes.
export const DeckScroll = memo(DeckScrollImpl);

function DeckScrollImpl({
  challenges,
  activeIndex,
  onActiveChange,
  onEngage,
  registerScrollTo,
}: {
  challenges: Challenge[];
  activeIndex: number;
  onActiveChange: (i: number) => void;
  onEngage: (id: string) => void;
  /** Parent calls the registered fn to scroll a given index to centre.
   *  `instant` jumps without smooth animation (used for initial deep-links). */
  registerScrollTo: (fn: (i: number, instant?: boolean) => void) => void;
}) {
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  // While a button/random scroll is in flight, ignore intermediate scenes the
  // smooth-scroll passes through; only commit once the target is centred.
  const pendingTarget = useRef<number | null>(null);
  const pendingTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    registerScrollTo((i: number, instant = false) => {
      const el = sceneRefs.current[i];
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      pendingTarget.current = i;
      window.clearTimeout(pendingTimer.current);
      // Fallback: release the lock even if the target is never reached.
      pendingTimer.current = window.setTimeout(() => {
        pendingTarget.current = null;
      }, 1000);
      // Explicit scroll math (not scrollIntoView, which is browser-dependent
      // near the document edges).
      const V = window.innerHeight;
      const pageTop = el.getBoundingClientRect().top + window.scrollY;
      const max = document.documentElement.scrollHeight - V;
      // Short scenes: centre them, so they sit at the zoom's full-scale peak.
      // Tall scenes (content past one viewport): align the top just under the
      // sticky chrome so the title shows first and you read top-to-bottom.
      const HEADER = 72;
      const raw =
        el.offsetHeight <= V * 1.05
          ? pageTop - (V - el.offsetHeight) / 2
          : pageTop - HEADER;
      const top = Math.max(0, Math.min(raw, max));
      window.scrollTo({ top, behavior: instant || reduced ? "auto" : "smooth" });
    });
  }, [registerScrollTo]);

  // Active = scene whose centre is nearest the viewport centre. Computed on a
  // passive, rAF-throttled scroll listener (not IO) so it stays accurate during
  // fast/momentum scroll — IO only fires on threshold crossings.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const nodes = sceneRefs.current;
      const mid = window.innerHeight / 2;
      // Active = the scene the viewport's midline falls inside. This tracks
      // "what you're reading" even on tall scenes that run past one screen —
      // unlike nearest-centre, which flipped to the next scene while you were
      // still on the current one's lower half. Nearest-centre is only the
      // fallback for any gap the midline isn't inside.
      let chosen = -1;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n) continue;
        const r = n.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          chosen = i;
          break;
        }
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      const idx = chosen >= 0 ? chosen : best;
      // Respect an in-flight programmatic target: only commit it once reached.
      if (pendingTarget.current !== null) {
        if (idx === pendingTarget.current) {
          pendingTarget.current = null;
          window.clearTimeout(pendingTimer.current);
          onActiveChange(idx);
        }
        return;
      }
      onActiveChange(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(pendingTimer.current);
    };
  }, [onActiveChange]);

  return (
    <div>
      {challenges.map((c, i) => (
        <section
          key={c.id}
          id={`deck-${c.id}`}
          ref={(el) => {
            sceneRefs.current[i] = el;
          }}
          className="deck-scene"
          aria-label={c.title}
        >
          {/* The scaler carries the scroll-driven zoom. The transform lives on
              this inner element, never the <section> we measure for active-
              scene/scroll math — a transform would distort getBoundingClientRect. */}
          <div className="deck-scaler">
            <DeckScene
              challenge={c}
              variant="scroll"
              interactive={i === activeIndex}
              onEngage={onEngage}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
