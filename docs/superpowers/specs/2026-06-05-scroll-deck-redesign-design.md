# Scroll-deck redesign — design spec

**Date:** 2026-06-05
**Status:** Approved (brainstorming), pending plan
**Goal:** Make whypride more mobile-friendly and more engaging by dropping the visitor straight into a scroll/swipe-driven "deck" of the 9 challenges, evolving (not replacing) the existing editorial identity.

## Summary

Today the homepage is a long scroll of distinct sections (hero, FAQ, challenge hub grid, timeline, glossary, sources) and each challenge also lives at `/challenge/[id]`. The redesign keeps all existing pages but adds a new primary experience: after the hero, scrolling pulls the visitor into a fullscreen "deck" that presents the 9 challenges one at a time, presentation-style, with next / previous / "surprise me" navigation and per-challenge share.

The 9 interactive challenge components are **reused as-is**. New work is the deck shell, the motion engine, the chrome (progress/nav/share), and URL state.

## Decisions (locked during brainstorming)

1. **Deck scope:** the 9 challenges only. Timeline, glossary, FAQ, sources stay as their own pages/sections.
2. **Interaction model — hybrid:**
   - **Desktop:** scroll-driven. Below the hero, the active challenge scales up to fullscreen as it enters the viewport and scales back down as it exits (sticky element, scroll-scrubbed). Continuing to scroll moves through the challenges; scrolling past the end exits to the closing/contents area.
   - **Mobile:** no scroll-jacking. A fullscreen stage with left/right **swipe** between challenges; buttons for random/share/contents.
3. **Navigation semantics:** sequential **prev/next** plus a separate **"έκπληξέ με"** (random) button. A discreet progress indicator (e.g. `3/9`).
4. **Entry:** visitor is dropped **directly** into the flow from the hero — no upfront hub/grid.
5. **`/contents`:** the existing ChallengeHub grid becomes the "see / revisit everything" page, reachable anytime and at the end of the deck.
6. **`/challenge/[id]` and `/embed/[id]`:** unchanged. They remain the permanent URLs for SEO, sharing, embedding, and deep links.
7. **Aesthetic:** "Editorial evolved," restrained. Keep the newsprint/serif identity, big serif headlines, generous whitespace, torn-paper transitions. **Drop** the rainbow rule banner and reduce label/number clutter (no stacked "category · No.03 · 3/9"). Pride spectrum survives only as a small accent. Borrow cinematic fullscreen reveals from direction C.

## Flow architecture

```
/  (home)
  ├─ hero (existing masthead + CTA, cleaned up)
  └─ scroll-down ─▶ DECK
        challenge 1 … challenge 9   (zoom in/out per slide on desktop; swipe on mobile)
        prev / next / random / share / progress
        scroll past end ─▶ closing beat + link to /contents
/contents        ← ChallengeHub grid (jump to / revisit any challenge)
/challenge/[id]  ← unchanged static page (deep-link / share / SEO)
/embed/[id]      ← unchanged embed widget
(timeline, glossary, FAQ, sources, quiz, about, objections — unchanged)
```

URL state: the active challenge is reflected in the URL (query param or hash, e.g. `/?c=mythoi`) so refresh, back/forward, and direct links into the deck work. Opening `/challenge/[id]` still loads the static page (decision 6); it does not redirect into the deck.

## Components

**Reused unchanged (no rewrite):**
- All interactives in `src/components/interactives/` (FlipCard/Myth, PrivilegeVisualizer, ReframeToggle, SegregationSandbox, GuessGreece, RightResponse, HistoricalParallels, ReflectiveComment).
- `challengeRegistry.tsx` as the source of truth for the 9 challenges (id, title, category, render fn).
- `ShareEmbed.tsx` for sharing.
- The `/challenge/[id]`, `/embed/[id]` pages and `ChallengeHub` grid (the grid moves to power `/contents`).

**New:**
- `DeckStage` — the fullscreen shell that frames one challenge: title, the interactive (rendered via the registry), and the chrome.
- `DeckChrome` — progress indicator, prev/next, "έκπληξέ με" (random), share, exit/contents controls. Always visible & keyboard-operable.
- **Motion engine** — desktop scroll-scrubbed scale/pin (GSAP ScrollTrigger, already a dependency) vs mobile swipe controller. Single component with a capability/viewport switch.
- Deck **state/routing** hook — tracks active index, syncs URL, implements next/prev/random (shuffle-bag for random so it doesn't repeat the current one).
- `/contents` page wrapping the existing grid + a closing beat.

## Motion & rendering details

- Desktop zoom uses `transform: scale()` + `opacity` only (GPU-friendly); the active slide is `position: sticky`. Reuse the existing GSAP setup pattern from `HistoricalParallels.tsx`.
- Transitions between slides: torn-paper / fade in keeping with the editorial identity.
- Mobile swipe: pointer/touch handler with spring-ish easing; left/right = next/prev. No vertical scroll-jacking.

## Accessibility & fallbacks (must-have)

- `prefers-reduced-motion: reduce`: **no** zoom or scroll-scrubbing — static slides with fade and explicit buttons.
- Keyboard: `←`/`→` = prev/next; all controls reachable and labelled; deck is fully usable without scrolling.
- Screen readers: each slide is a labelled region; progress announced; controls have accessible names.
- No-JS / crawlers: the static `/challenge/[id]` pages and `/contents` carry content and SEO; the deck is a progressive enhancement on the homepage.
- Honor existing light/dark theme and OKLch tokens; do not introduce a new palette.

## Out of scope

- Merging timeline/glossary/FAQ/stories into the deck (explicitly rejected — challenges only).
- Rewriting any interactive challenge's internals.
- Changing the share/embed mechanism or OG image pipeline.
- Framework or styling-library changes (stays Astro + React + Tailwind v4).

## Success criteria

1. From the homepage, a visitor scrolls and is carried into the fullscreen deck; on desktop the active challenge zooms to fullscreen and back; on mobile swiping moves between challenges with no scroll-jacking.
2. prev / next / random / share / progress all work; active challenge is reflected in the URL and survives refresh and back/forward.
3. `/contents` lets a visitor jump to or revisit any challenge; reachable anytime and at the end of the deck.
4. `/challenge/[id]` and `/embed/[id]` are unchanged and still work.
5. With `prefers-reduced-motion`, the experience degrades to static, button-driven slides; keyboard navigation works throughout.
6. No regression to existing pages (timeline, glossary, FAQ, sources, quiz, about, objections); build passes (`bun run build`, `bun run check`).
