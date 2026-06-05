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
import { DeckSwiper } from "@/components/deck/DeckSwiper";

const LEN = challengeIds.length;

export function Deck() {
  // Always start at 0 so SSR and first client render match; the deep-link is
  // resolved in an effect after mount (hydration safety).
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const scrollToRef = useRef<((i: number) => void) | null>(null);
  const lastUrlId = useRef<string | null>(null);

  // Variant detection + keep in sync on resize.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Seed `seen` from saved progress (indices of done challenges).
  useEffect(() => {
    const doneIds = new Set(getDone());
    setSeen(new Set(challengeIds.map((id, i) => (doneIds.has(id) ? i : -1)).filter((i) => i >= 0)));
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

  // On desktop, scrolling drives `index` (via DeckScroll). The chrome buttons
  // call `goTo`, which scrolls on desktop and just sets state on mobile.
  const goTo = useCallback(
    (i: number) => {
      setIndex(i);
      if (!isMobile) scrollToRef.current?.(i);
    },
    [isMobile],
  );

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

  // Resolve a deep-link (?c=mythoi) once, after mount. Child effects (which
  // register `scrollToRef`) run before this parent effect, so goTo can scroll.
  useEffect(() => {
    const i = indexForId(parseDeckParam(window.location.search, challengeIds), challengeIds);
    if (i > 0) goTo(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = challenges[index];
  const registerScrollTo = useCallback((fn: (i: number) => void) => {
    scrollToRef.current = fn;
  }, []);

  return (
    <div className="relative">
      {/* Sticky chrome over the deck. */}
      <div className="sticky top-0 z-30 mx-auto max-w-4xl px-6 py-4 bg-paper/80 backdrop-blur border-b border-border">
        <DeckChrome
          index={index}
          total={LEN}
          id={current.id}
          title={current.title}
          canPrev={index > 0}
          canNext={!isLastIndex(index, LEN)}
          onPrev={() => goTo(prevIndex(index, LEN))}
          onNext={() => goTo(nextIndex(index, LEN))}
          onRandom={onRandom}
          onExit={isMobile ? () => (window.location.href = "/contents") : undefined}
        />
      </div>

      {isMobile ? (
        <DeckSwiper
          challenges={challenges}
          activeIndex={index}
          onActiveChange={goTo}
          onEngage={onEngage}
        />
      ) : (
        <DeckScroll
          challenges={challenges}
          activeIndex={index}
          onActiveChange={setIndex}
          onEngage={onEngage}
          registerScrollTo={registerScrollTo}
        />
      )}
    </div>
  );
}
