import { useEffect, useRef } from "react";
import type { Challenge } from "@/components/sections/challengeRegistry";
import { DeckScene } from "@/components/deck/DeckScene";

export function DeckScroll({
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
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      pendingTarget.current = i;
      window.clearTimeout(pendingTimer.current);
      // Fallback: release the lock even if the target is never reached.
      pendingTimer.current = window.setTimeout(() => {
        pendingTarget.current = null;
      }, 1000);
      sceneRefs.current[i]?.scrollIntoView({
        behavior: instant || reduced ? "auto" : "smooth",
        block: "center",
      });
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
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n) continue;
        const r = n.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      // Respect an in-flight programmatic target: only commit it once reached.
      if (pendingTarget.current !== null) {
        if (best === pendingTarget.current) {
          pendingTarget.current = null;
          window.clearTimeout(pendingTimer.current);
          onActiveChange(best);
        }
        return;
      }
      onActiveChange(best);
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
          <div className="deck-stage">
            <div className="deck-scaler">
              <DeckScene
                challenge={c}
                variant="scroll"
                interactive={i === activeIndex}
                onEngage={onEngage}
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
