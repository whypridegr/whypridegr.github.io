import { useCallback, useEffect, useRef, useState } from "react";
import { challenges, challengeIds } from "@/components/sections/challengeRegistry";
import {
  idForIndex,
  indexForId,
  isLastIndex,
  nextIndex,
  prevIndex,
  parseDeckParam,
  pickRandomIndex,
  deckUrl,
} from "@/lib/deckState";
import { getDone, markDone } from "@/lib/challengeProgress";
import { DeckChrome } from "@/components/deck/DeckChrome";
import { DeckScroll } from "@/components/deck/DeckScroll";

const LEN = challengeIds.length;

export function Deck() {
  // Always start at 0 so SSR and first client render match; the deep-link is
  // resolved in an effect after mount (hydration safety).
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  // Scroll progress through the whole deck (0..1), used by the top bar. It's
  // deliberately scroll-based, not completion-based — it reads as "how far in
  // am I" and only tops out at the very end (the closing #telos), not at the
  // last challenge.
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollToRef = useRef<((i: number, instant?: boolean) => void) | null>(null);
  // Seed with the initial active id so the first (mount) URL-sync run is a no-op:
  // it must NOT rewrite location.search on load, or it would (a) clobber an
  // incoming ?c= deep-link before the deep-link effect reads it, and (b) dirty a
  // clean "/" with ?c= before the visitor has moved. The URL only starts
  // reflecting the active id once it changes from this initial one.
  const lastUrlId = useRef<string | null>(challengeIds[0] ?? null);

  // Seed `seen` from saved progress (indices of done challenges).
  useEffect(() => {
    const doneIds = new Set(getDone());
    setSeen(new Set(challengeIds.map((id, i) => (doneIds.has(id) ? i : -1)).filter((i) => i >= 0)));
  }, []);

  // Remember that this visitor has reached the deck, so the home page stops
  // auto-guiding them here (see HandoffSentinel suppressKey="wp-deck-seen").
  useEffect(() => {
    try {
      localStorage.setItem("wp-deck-seen", "1");
    } catch {
      /* private mode — fine */
    }
  }, []);

  // Track scroll progress to the bottom of the closing section (#telos, which
  // lives on the page just after this component). Tops out exactly at the end.
  useEffect(() => {
    const compute = () => {
      const closing = document.getElementById("telos");
      const end = closing
        ? closing.offsetTop + closing.offsetHeight
        : document.documentElement.scrollHeight;
      const max = Math.max(1, end - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // Reflect active id in the URL — replaceState (no history spam), deduped so
  // intermediate scenes during a scroll don't churn the URL, preserving any
  // other query params.
  useEffect(() => {
    const id = idForIndex(index, challengeIds);
    if (!id || id === lastUrlId.current) return;
    lastUrlId.current = id;
    history.replaceState(
      null,
      "",
      deckUrl(id, window.location.search, window.location.pathname),
    );
  }, [index]);

  // Scrolling drives `index` (via DeckScroll). The chrome buttons call `goTo`,
  // which scrolls the target scene into view on every viewport.
  const goTo = useCallback((i: number) => {
    // If the clicked control becomes disabled at the destination (Prev on the
    // first scene, Next on the last), keeping focus on it lets the browser
    // cancel the smooth scroll the moment React disables it — so the URL
    // changed but the page never moved. Blur first, then start the scroll on
    // the next frame, after the disable/focus change has settled.
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    setIndex(i);
    requestAnimationFrame(() => scrollToRef.current?.(i));
  }, []);

  const onEngage = useCallback((id: string) => {
    markDone(id);
    const i = indexForId(id, challengeIds);
    if (i >= 0) setSeen((s) => new Set(s).add(i));
  }, []);

  const onRandom = useCallback(() => {
    goTo(pickRandomIndex(index, seen, LEN));
  }, [goTo, index, seen]);

  // Keyboard arrows for prev/next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") goTo(nextIndex(index, LEN));
      if (e.key === "ArrowLeft") goTo(prevIndex(index, LEN));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  // Resolve a deep-link (?c=mythoi) once, after mount. Set the index immediately,
  // then jump INSTANTLY to the scene and re-assert after lazy-mounted scenes
  // settle their heights (a smooth scroll would chase a moving target as content
  // below mounts and grows). On mobile `scrollToRef` is null, so the no-op is fine.
  useEffect(() => {
    const i = indexForId(parseDeckParam(window.location.search, challengeIds), challengeIds);
    if (i <= 0) return;
    setIndex(i);
    const jump = () => scrollToRef.current?.(i, true);
    const raf = requestAnimationFrame(jump);
    const t1 = window.setTimeout(jump, 250);
    const t2 = window.setTimeout(jump, 600);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = challenges[index];
  const registerScrollTo = useCallback(
    (fn: (i: number, instant?: boolean) => void) => {
      scrollToRef.current = fn;
    },
    [],
  );

  return (
    <div className="relative">
      {/* A centered, always-on control island. Kept narrow (w-fit) and inset
          from the edges so it sits in the central gap and never falls under the
          floating header controls (menu/theme/info) tucked into the corners. */}
      <div className="sticky top-2 z-30 mx-auto w-fit max-w-[calc(100%-7rem)] rounded-full border border-border bg-paper/85 px-2 py-1.5 shadow-sm backdrop-blur relative">
        <DeckChrome
          id={current.id}
          title={current.title}
          canPrev={index > 0}
          canNext={!isLastIndex(index, LEN)}
          onPrev={() => goTo(prevIndex(index, LEN))}
          onNext={() => goTo(nextIndex(index, LEN))}
          onRandom={onRandom}
          challenges={challenges}
          activeIndex={index}
          seen={seen}
          onJump={goTo}
        />
        {/* Progress: fills along the bottom edge as challenges are engaged.
            Inset from the corners so it stays inside the rounded pill. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 bottom-[3px] h-[3px] overflow-hidden rounded-full bg-border/50"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      <DeckScroll
        challenges={challenges}
        activeIndex={index}
        onActiveChange={setIndex}
        onEngage={onEngage}
        registerScrollTo={registerScrollTo}
      />
    </div>
  );
}
