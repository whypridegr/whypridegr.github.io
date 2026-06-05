# Scroll-deck redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop the visitor straight into a scroll/swipe-driven "deck" of the 9 challenges after the hero, evolving the existing editorial look without rewriting the interactives.

**Architecture:** A new `Deck` React island replaces the `#prokliseis` ChallengeHub section on the homepage. On desktop it renders 9 stacked full-height scenes whose content scales up to fullscreen and back via **pure CSS scroll-driven animation** (`animation-timeline: view()`), guarded by `@supports` and `prefers-reduced-motion`. On mobile it renders a single fullscreen stage with **swipe** between challenges. Both share one dependency-free logic module (`deckState`), the existing `challengeRegistry`, and `ShareEmbed`. The grid moves to a new `/contents` page. `/challenge/[id]` and `/embed/[id]` are untouched.

**Tech Stack:** Astro 6, React 19, Tailwind v4 (CSS-vars theme in `src/styles/global.css`), GSAP (already present, not needed for the scroll scrub — CSS handles it), Bun test.

---

## Spec reference

`docs/superpowers/specs/2026-06-05-scroll-deck-redesign-design.md`. Locked decisions: deck = 9 challenges only; hybrid interaction (desktop CSS-scroll zoom / mobile swipe); sequential prev/next + separate random; enter directly from hero; `/contents` = grid; `/challenge/[id]` & `/embed/[id]` unchanged; editorial-evolved aesthetic, restrained (no rainbow banner, minimal labels); Home IA = Hero → deck → reference sections (FAQ/glossary/timeline/sources) below.

## File structure

**Create:**
- `src/lib/deckState.ts` — pure, dependency-free deck logic (index↔id, next/prev clamp, shuffle-bag random, URL parse/build). TESTED.
- `src/lib/deckState.test.ts` — bun tests for the above.
- `src/components/deck/DeckChrome.tsx` — presentational controls: progress, prev/next, random, share, contents/exit. Props-driven, no logic.
- `src/components/deck/DeckScene.tsx` — one challenge frame; lazy-mounts its interactive when near the viewport.
- `src/components/deck/DeckScroll.tsx` — desktop variant: 9 scaling scenes + IntersectionObserver active tracking.
- `src/components/deck/DeckSwiper.tsx` — mobile variant: one fullscreen scene, swipe between.
- `src/components/deck/Deck.tsx` — top island: picks variant via `matchMedia`, owns active index, URL sync, keyboard, `markDone`.
- `src/pages/contents.astro` — grid page (`ChallengeHub`) + closing beat.

**Modify:**
- `src/styles/global.css` — add the `.deck-*` scene/scale CSS (scroll-driven, guarded).
- `src/components/content/HomeContent.tsx` — replace `#prokliseis` ChallengeHub block with `<Deck>`; move the closing beat + reference sections after it.
- `src/components/sections/ChallengeHub.tsx` — extract the random launcher target so it routes through `deckState` (small change; keep the grid as-is for `/contents`).

**Untouched (verify no regression):** `src/pages/challenge/[id].astro`, `src/pages/embed/[id].astro`, `ChallengePage.tsx`, `EmbedChallenge.tsx`, all `interactives/*`, `index.astro` (FAQ schema stays).

---

## Task 1: Deck logic module (`deckState`)

**Files:**
- Create: `src/lib/deckState.ts`
- Test: `src/lib/deckState.test.ts`

Pure functions only — **no imports from the registry or React**, so tests are fast and isolated. The app passes `challengeIds`/lengths in; tests pass literals.

- [ ] **Step 1: Write the failing tests**

`src/lib/deckState.test.ts`:
```ts
import { test, expect } from "bun:test";
import {
  DECK_PARAM,
  indexForId,
  idForIndex,
  clampIndex,
  nextIndex,
  prevIndex,
  isLastIndex,
  pickRandomIndex,
  parseDeckParam,
  deckUrl,
} from "@/lib/deckState";

const IDS = ["a", "b", "c", "d"];
const LEN = IDS.length;

test("indexForId / idForIndex round-trip", () => {
  expect(indexForId("c", IDS)).toBe(2);
  expect(indexForId("zzz", IDS)).toBe(-1);
  expect(indexForId(null, IDS)).toBe(-1);
  expect(idForIndex(2, IDS)).toBe("c");
  expect(idForIndex(99, IDS)).toBeNull();
});

test("clampIndex stays in range", () => {
  expect(clampIndex(-3, LEN)).toBe(0);
  expect(clampIndex(0, LEN)).toBe(0);
  expect(clampIndex(2, LEN)).toBe(2);
  expect(clampIndex(99, LEN)).toBe(LEN - 1);
});

test("next/prev clamp at the ends (no wrap)", () => {
  expect(nextIndex(0, LEN)).toBe(1);
  expect(nextIndex(LEN - 1, LEN)).toBe(LEN - 1);
  expect(prevIndex(2, LEN)).toBe(1);
  expect(prevIndex(0, LEN)).toBe(0);
});

test("isLastIndex", () => {
  expect(isLastIndex(LEN - 1, LEN)).toBe(true);
  expect(isLastIndex(0, LEN)).toBe(false);
});

test("pickRandomIndex never returns current and prefers unseen", () => {
  // randomFn -> 0 picks the first of the pool.
  const seen = new Set([1]); // b seen
  // current = 0 (a). pool of unseen excluding current = [c(2), d(3)] -> first = 2
  expect(pickRandomIndex(0, seen, LEN, () => 0)).toBe(2);
  // when all-but-current are seen, fall back to any non-current
  const allSeen = new Set([0, 2, 3]);
  expect(pickRandomIndex(1, allSeen, LEN, () => 0)).toBe(0);
  // single item: returns current
  expect(pickRandomIndex(0, new Set(), 1, () => 0)).toBe(0);
});

test("parseDeckParam only accepts known ids", () => {
  expect(parseDeckParam("?c=c", IDS)).toBe("c");
  expect(parseDeckParam("?c=nope", IDS)).toBeNull();
  expect(parseDeckParam("", IDS)).toBeNull();
  expect(DECK_PARAM).toBe("c");
});

test("deckUrl reflects id and preserves other query params", () => {
  expect(deckUrl("c")).toBe("/?c=c");
  expect(deckUrl("c", "?x=1", "/foo")).toBe("/foo?x=1&c=c");
  expect(deckUrl("d", "?c=a&x=1")).toBe("/?c=d&x=1");
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `bun test src/lib/deckState.test.ts`
Expected: FAIL — `Cannot find module "@/lib/deckState"` / functions undefined.

- [ ] **Step 3: Implement the module**

`src/lib/deckState.ts`:
```ts
// Pure deck navigation logic. No React, no registry imports — callers pass the
// id list / length so this stays trivially testable and dependency-free.

export const DECK_PARAM = "c";

export function indexForId(id: string | null, ids: string[]): number {
  if (!id) return -1;
  return ids.indexOf(id);
}

export function idForIndex(index: number, ids: string[]): string | null {
  return ids[index] ?? null;
}

export function clampIndex(index: number, len: number): number {
  if (len <= 0) return 0;
  return Math.max(0, Math.min(index, len - 1));
}

export function nextIndex(index: number, len: number): number {
  return clampIndex(index + 1, len);
}

export function prevIndex(index: number, len: number): number {
  return clampIndex(index - 1, len);
}

export function isLastIndex(index: number, len: number): boolean {
  return index >= len - 1;
}

/**
 * A random index != current, preferring ones not in `seen`. Falls back to any
 * non-current index when everything else is seen. Returns `current` only when
 * there is nothing else to pick (len <= 1). `randomFn` is injectable for tests.
 */
export function pickRandomIndex(
  current: number,
  seen: ReadonlySet<number>,
  len: number,
  randomFn: () => number = Math.random,
): number {
  if (len <= 1) return current;
  const all = Array.from({ length: len }, (_, i) => i).filter((i) => i !== current);
  const fresh = all.filter((i) => !seen.has(i));
  const pool = fresh.length ? fresh : all;
  return pool[Math.floor(randomFn() * pool.length)];
}

/** Active id from a URL search string ("?c=mythoi"), or null if absent/unknown. */
export function parseDeckParam(search: string, ids: string[]): string | null {
  const id = new URLSearchParams(search).get(DECK_PARAM);
  return id && ids.includes(id) ? id : null;
}

/** Relative URL reflecting the active id, preserving any other query params. */
export function deckUrl(id: string, search = "", pathname = "/"): string {
  const params = new URLSearchParams(search);
  params.set(DECK_PARAM, id);
  return `${pathname}?${params.toString()}`;
}
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `bun test src/lib/deckState.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/deckState.ts src/lib/deckState.test.ts
git commit -m "feat(deck): add pure deck-navigation logic with tests"
```

---

## Task 2: Deck chrome (presentational controls)

**Files:**
- Create: `src/components/deck/DeckChrome.tsx`

Pure presentational component. No navigation logic — receives callbacks + state via props. Reuses `ShareEmbed`. Minimal labels per the aesthetic decision: a single small `N/9` + thin progress bar, prev/next, "έκπληξέ με", share, "δες τα όλα" (contents). No rainbow banner.

- [ ] **Step 1: Implement**

`src/components/deck/DeckChrome.tsx`:
```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `bun run check`
Expected: no new TypeScript errors referencing `DeckChrome`.

- [ ] **Step 3: Commit**

```bash
git add src/components/deck/DeckChrome.tsx
git commit -m "feat(deck): add presentational deck chrome controls"
```

---

## Task 3: Deck scene (lazy-mounted challenge frame)

**Files:**
- Create: `src/components/deck/DeckScene.tsx`

One challenge's frame: category eyebrow (small), title, and the interactive. The interactive mounts only when the scene is within ~1.5 viewports (IntersectionObserver) and unmounts when far away, so the homepage never runs all 9 interactives at once. When `active` it marks the challenge done (engagement). When not near-fullscreen, the interactive is `pointer-events: none` to avoid stray taps on a shrunk scene (desktop).

- [ ] **Step 1: Implement**

`src/components/deck/DeckScene.tsx`:
```tsx
import { useEffect, useRef, useState } from "react";
import type { Challenge } from "@/components/sections/challengeRegistry";
import { cn } from "@/lib/utils";

export function DeckScene({
  challenge,
  /** desktop scaling scene vs mobile single-stage (affects layout only). */
  variant,
  /** whether the interactive should be interactive (near-fullscreen / active). */
  interactive,
  onEngage,
}: {
  challenge: Challenge;
  variant: "scroll" | "swipe";
  interactive: boolean;
  onEngage: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(variant === "swipe");

  // Mount the heavy interactive the first time it nears the viewport, then keep
  // it mounted — unmounting would reset the challenge's local state and can
  // flash on remount (Codex review #5). IO here is a one-shot mount trigger.
  useEffect(() => {
    if (variant !== "scroll" || mounted) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "75% 0px 75% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [variant, mounted]);

  // First real interaction marks the challenge done.
  useEffect(() => {
    const node = ref.current;
    if (!node || !interactive) return;
    const onInteract = (e: Event) => {
      if (e.type === "keydown") {
        const k = (e as KeyboardEvent).key;
        if (k !== "Enter" && k !== " " && k !== "Spacebar") return;
      }
      onEngage(challenge.id);
      node.removeEventListener("pointerdown", onInteract);
      node.removeEventListener("keydown", onInteract);
      node.removeEventListener("change", onInteract);
    };
    node.addEventListener("pointerdown", onInteract);
    node.addEventListener("keydown", onInteract);
    node.addEventListener("change", onInteract);
    return () => {
      node.removeEventListener("pointerdown", onInteract);
      node.removeEventListener("keydown", onInteract);
      node.removeEventListener("change", onInteract);
    };
  }, [interactive, challenge.id, onEngage]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col items-center text-center",
        !interactive && "pointer-events-none select-none",
      )}
    >
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
        {challenge.label}
      </p>
      <h2 className="mt-3 font-display text-3xl md:text-5xl leading-tight reading-width">
        {challenge.title}
      </h2>
      <div className="mt-8 w-full text-left">
        {mounted ? challenge.render() : <div aria-hidden className="min-h-[40vh]" />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `bun run check`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/deck/DeckScene.tsx
git commit -m "feat(deck): add lazy-mounting challenge scene"
```

---

## Task 4: Scroll-driven zoom CSS

**Files:**
- Modify: `src/styles/global.css` (append a new block near the end, after the existing utilities)

The desktop zoom is **pure CSS** using `animation-timeline: view()`, the same technique as the inspiration codepen — GPU-cheap, no JS, and it simply no-ops where unsupported (scene stays full-size and usable). Disabled under `prefers-reduced-motion`.

- [ ] **Step 1: Add the CSS**

Append to `src/styles/global.css`:
```css
/* ---- Deck (scroll-driven challenge zoom) -------------------------------- */
/* Each desktop scene is a tall scroll region with a sticky stage. The stage
   scales up to full size as the scene crosses the viewport centre and back,
   driven entirely by the scroll position. No-ops (stays full-size) where
   view-timeline is unsupported or motion is reduced. */

.deck-scene {
  position: relative;
  /* Fallback (no scroll-linked animation): each scene is one viewport tall, so
     scrollIntoView({block:"center"}) lands cleanly and there's no scale scrub.
     Overridden to 180vh only where view() is supported (below). */
  min-height: 100dvh;
}

.deck-stage {
  position: sticky;
  top: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6vh 1.5rem;
}

/* The scaling wrapper around the scene content. */
.deck-scaler {
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .deck-scene {
      /* extra scroll length gives the scrub room to scale up and back */
      min-height: 180vh;
      view-timeline-name: --deck-scene;
    }
    .deck-scaler {
      animation: deck-zoom both linear;
      animation-timeline: --deck-scene;
      animation-range: entry 0% exit 100%;
      transform-origin: 50% 50%;
    }
    @keyframes deck-zoom {
      0%   { scale: 0.72; opacity: 0.35; }
      35%, 65% { scale: 1; opacity: 1; }
      100% { scale: 0.72; opacity: 0.35; }
    }
  }
}

/* Mobile / swipe stage: one fullscreen card, transform-driven slide. */
.deck-swiper {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  touch-action: pan-y;
}
.deck-swipe-track {
  display: flex;
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .deck-swipe-track { transition: none; }
}
.deck-swipe-cell {
  flex: 0 0 100%;
  min-width: 100%;
  padding: 8vh 1.25rem 12vh;
}
```

- [ ] **Step 2: Verify build still compiles the CSS**

Run: `bun run build`
Expected: build succeeds (Tailwind v4 + custom CSS compiles; no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(deck): add scroll-driven zoom + swipe CSS"
```

---

## Task 5: Desktop scroll variant (`DeckScroll`)

**Files:**
- Create: `src/components/deck/DeckScroll.tsx`

Renders all 9 scenes stacked. An IntersectionObserver reports which scene is centred → drives `onActiveChange` (for chrome + URL). `activeIndex` controls which scene's interactive is "interactive". `scrollToIndex` (exposed via ref-less imperative prop pattern: parent passes a `registerScrollTo` callback) lets the chrome's prev/next/random move the page.

- [ ] **Step 1: Implement**

`src/components/deck/DeckScroll.tsx`:
```tsx
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
  /** Parent calls the registered fn to scroll a given index to centre. */
  registerScrollTo: (fn: (i: number) => void) => void;
}) {
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  // While a button/random scroll is in flight, ignore intermediate scenes the
  // smooth-scroll passes through; only commit once the target is centred
  // (Codex review #1 and #3).
  const pendingTarget = useRef<number | null>(null);
  const pendingTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    registerScrollTo((i: number) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      pendingTarget.current = i;
      window.clearTimeout(pendingTimer.current);
      // Fallback: release the lock even if scrollend never fires.
      pendingTimer.current = window.setTimeout(() => {
        pendingTarget.current = null;
      }, 1000);
      sceneRefs.current[i]?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
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
```

- [ ] **Step 2: Type-check**

Run: `bun run check`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/deck/DeckScroll.tsx
git commit -m "feat(deck): add desktop scroll variant"
```

---

## Task 6: Mobile swipe variant (`DeckSwiper`)

**Files:**
- Create: `src/components/deck/DeckSwiper.tsx`

One fullscreen scene at a time; horizontal swipe changes the active index. Uses pointer events with a drag threshold; no scroll-jacking (vertical scroll stays native via `touch-action: pan-y`). Calls `onActiveChange` when a swipe commits.

- [ ] **Step 1: Implement**

`src/components/deck/DeckSwiper.tsx`:
```tsx
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
    // Keep receiving move/up even if the finger leaves the element.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current || intent.current === "v") return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (intent.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      // Horizontal only when clearly more horizontal than vertical; otherwise
      // let the page scroll vertically (touch-action: pan-y handles the rest).
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
            // `inert` (React 19 supports the prop) removes inactive cells from
            // tab order AND the a11y tree — aria-hidden alone leaves their
            // buttons focusable (Codex review #7).
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
```

- [ ] **Step 2: Type-check**

Run: `bun run check`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/deck/DeckSwiper.tsx
git commit -m "feat(deck): add mobile swipe variant"
```

---

## Task 7: Deck island (state, routing, keyboard)

**Files:**
- Create: `src/components/deck/Deck.tsx`

Owns the active index, picks the variant via `matchMedia("(max-width: 767px)")` after hydration, syncs the active id to the URL (`?c=`), reads a deep-link `?c=` on first load, wires keyboard ←/→, and marks challenges done via the existing `markDone`. Random uses `pickRandomIndex` with the set of seen indices. Includes a top closing/exit affordance.

- [ ] **Step 1: Implement**

`src/components/deck/Deck.tsx`:
```tsx
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
  // resolved in an effect after mount (Codex review #2 — hydration safety).
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
  // intermediate scenes during a scroll don't churn the URL (Codex review #4),
  // and preserving any other query params.
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
```

- [ ] **Step 2: Type-check**

Run: `bun run check`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/deck/Deck.tsx
git commit -m "feat(deck): add deck island (state, routing, keyboard)"
```

---

## Task 8: `/contents` page (grid + closing)

**Files:**
- Create: `src/pages/contents.astro`

A standalone page wrapping the existing `ChallengeHub` grid (unchanged) plus a short closing beat linking to the quiz. This is the "δες/ξαναδές τα όλα" destination the deck chrome links to.

- [ ] **Step 1: Implement**

`src/pages/contents.astro`:
```astro
---
import Layout from "../layouts/Layout.astro";
import { ChallengeHub } from "../components/sections/ChallengeHub";
---

<Layout
  title="Όλες οι προκλήσεις | WhyPride.gr"
  description="Δες ή ξαναδές οποιαδήποτε από τις προκλήσεις του WhyPride."
>
  <section class="border-t border-border">
    <div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <a
        href="/"
        class="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
      >
        <span aria-hidden>←</span> Πίσω στην αρχή
      </a>
      <div class="mt-10">
        <ChallengeHub client:idle />
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Build to confirm the route generates**

Run: `bun run build`
Expected: build succeeds; `dist/contents/index.html` exists.
Verify: `ls dist/contents/index.html`

- [ ] **Step 3: Update ChallengeHub's random target to use the deck**

In `src/components/sections/ChallengeHub.tsx`, change `goRandom` so the launcher opens the deck at a random challenge instead of a per-challenge page (keeps `/contents` and the deck consistent). Replace lines 23-26:
```tsx
  const goRandom = () => {
    const next = pickNext(challengeIds);
    window.location.href = next ? `/?c=${next}` : "/#telos";
  };
```
(Only the URL changes: `/challenge/${next}` → `/?c=${next}`.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/contents.astro src/components/sections/ChallengeHub.tsx
git commit -m "feat(deck): add /contents page; route random launcher into the deck"
```

---

## Task 9: Wire the deck into the homepage

**Files:**
- Modify: `src/components/content/HomeContent.tsx`

Replace the `#prokliseis` `<Section><ChallengeHub /></Section>` block with the `<Deck />`. Keep the hero, and keep the reference sections (FAQ `#erotiseis`, closing `#telos`, glossary `#glossari`, timeline `#istoria`, sources `#piges`) below the deck. New order: Hero → **Deck** → FAQ → closing → glossary → timeline → sources. The FAQ schema lives in `index.astro` and is untouched.

- [ ] **Step 1: Edit imports**

In `src/components/content/HomeContent.tsx`, replace the `ChallengeHub` import (line 6) with:
```tsx
import { Deck } from "@/components/deck/Deck";
```

- [ ] **Step 2: Replace the challenges section with the deck and reorder**

Replace the `#prokliseis` block (lines 36-38):
```tsx
      <Section id="prokliseis">
        <ChallengeHub />
      </Section>
```
with a full-bleed deck right after the hero (move it directly under `<Hero />`, before the FAQ `#erotiseis` section):
```tsx
      <section id="prokliseis" aria-label="Οι προκλήσεις" className="border-t border-border">
        <Deck />
      </section>
```
Concretely: cut the new `#prokliseis` section and paste it immediately after `<Hero />` (line 16), so the JSX order becomes: `<Hero />`, the deck section, then the existing `#erotiseis` FAQ section, then `#telos`, `#glossari`, `#istoria`, `#piges`, `<NextSectionButton />`.

- [ ] **Step 3: Update the hero CTA to enter the deck**

In the `Hero` function, change the primary CTA (line 213) `href="#erotiseis"` → `href="#prokliseis"` and its label from "Πάμε" to keep "Πάμε" (the CTA now drops you into the deck). Leave the secondary quiz CTA as-is.

- [ ] **Step 4: Build + type-check**

Run: `bun run check && bun run build`
Expected: both succeed; no unused-import error for `ChallengeHub` (it's no longer imported here — confirm it was removed in Step 1).

- [ ] **Step 5: Commit**

```bash
git add src/components/content/HomeContent.tsx
git commit -m "feat(deck): put the deck right after the hero on the homepage"
```

---

## Task 10: Verification (build, a11y, manual)

**Files:** none (verification only).

- [ ] **Step 1: Full build + tests + check**

Run: `bun test && bun run check && bun run build`
Expected: tests pass, no type errors, build succeeds. Routes present:
`ls dist/index.html dist/contents/index.html dist/challenge/mythoi/index.html dist/embed/mythoi/index.html`

- [ ] **Step 2: Manual — desktop deck**

Run: `bun run preview` and open the printed localhost URL.
Verify:
- Hero → click "Πάμε" → page moves into the first challenge scene.
- Scrolling scales each scene up to ~fullscreen and back (in a Chromium-based browser where `view()` is supported).
- Progress `01/09 …` and the active id in the URL (`?c=…`) update as you scroll.
- prev / next / "έκπληξέ με" move the page; share + "Δες τα όλα" work.
- ←/→ keys move prev/next (when focus isn't in an input).
- Reload on `/?c=palia` lands on that challenge.

- [ ] **Step 3: Manual — mobile**

In DevTools device emulation (or `mcp__chrome-devtools__resize_page` to 390×844):
Verify:
- Single fullscreen challenge; swipe left/right changes challenge; no scroll-jacking.
- ✕ exits to `/contents`; chrome controls work.

- [ ] **Step 4: Manual — reduced motion**

Emulate `prefers-reduced-motion: reduce` (DevTools Rendering, or `mcp__chrome-devtools__emulate`).
Verify: scenes are static full-size (no zoom scrub), navigation buttons still work, deck fully usable.

- [ ] **Step 5: Manual — untouched routes**

Verify `/challenge/mythoi`, `/embed/mythoi`, `/contents`, `/glossary`, `/quiz` all still render and the per-challenge share/embed still works.

- [ ] **Step 6: Commit any fixes found during verification**

```bash
git add -A
git commit -m "fix(deck): address issues found in verification"
```

---

## Self-review notes

- **Spec coverage:** deck=9 challenges (Tasks 5/6 render `challenges`), hybrid desktop/mobile (Tasks 4/5/6), sequential prev/next + random (Tasks 1/2/7), enter from hero (Task 9), `/contents` grid (Task 7), `/challenge`+`/embed` untouched (verified Task 10), editorial-restrained chrome (Task 2, no rainbow banner), reduced-motion + keyboard + a11y (Tasks 4/6/7/10), URL state survives reload (Tasks 1/7, verified 10). IA Hero→deck→reference (Task 9).
- **Type consistency:** `deckState` signatures (`ids`/`len` args, injectable `randomFn`) are used identically in `Deck.tsx`. `Challenge` type imported from the registry everywhere. `registerScrollTo`/`scrollToRef` contract matches between `DeckScroll` and `Deck`.
- **Known risk to validate during execution:** the CSS `view()` zoom and the rAF "active scene" math are the only parts that can't be unit-tested — Task 10 covers them manually. If `view()` proves too aggressive/janky, the fallback (no scrub, static scenes) is already wired via `@supports`/reduced-motion and the deck remains fully functional.
- **Codex plan review incorporated:** active index uses a passive rAF scroll listener, not IO (IO is one-shot lazy-mount only); deep-link resolved post-mount to avoid hydration mismatch; scenes mount-once (no state-losing unmount); programmatic scroll uses a pending-target lock to avoid intermediate-scene churn; URL sync is deduped and preserves other query params; swipe uses pointer capture + horizontal-intent lock + width-relative threshold; inactive swipe cells use `inert` (not just `aria-hidden`); explicit non-`view()` fallback geometry (`100dvh` scenes). The canonical index lives in `Deck` above both variants, so rotating across the mobile/desktop breakpoint preserves the active challenge.
```
