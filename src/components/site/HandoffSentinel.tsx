import { useEffect, useRef } from "react";

type Props = {
  /** Where to navigate when the reader scrolls past this point. */
  to: string;
  /** Faint hint text shown only once the handoff is armed. */
  label: string;
  /**
   * "sentinel": arm when this element scrolls up near the top of the viewport
   * (use it as the last thing in a content column, with content still below).
   * "bottom": arm only at the absolute bottom of the document — for when the
   * site footer sits below this element and must stay reachable first.
   */
  mode?: "sentinel" | "bottom";
  /** Render the faint armed-state hint. Off when a nearby element is the cue. */
  hint?: boolean;
  /**
   * If set and `localStorage[suppressKey]` is truthy, the handoff stays inert
   * (no listeners, collapsed spacer). Used to guide first-timers only.
   */
  suppressKey?: string;
};

// A deliberate-overscroll page handoff. Reaching the end of the preceding
// content "arms" it; a continued downward gesture (wheel / touch / PageDown)
// past a small intent threshold navigates to `to`. The site's CSS MPA
// `@view-transition` animates that navigation in Chrome; elsewhere it's instant.
//
// It is built to be hard to trigger by accident: it only fires while armed,
// needs accumulated *downward* intent, ignores keys while a form/control is
// focused, resets on touchend (so iOS/Android fling momentum can't push it
// over), and starts a cooldown on every load / bfcache restore so pressing
// Back doesn't immediately bounce you forward again.
export function HandoffSentinel({
  to,
  label,
  mode = "sentinel",
  hint: showHint = true,
  suppressKey,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    const hint = hintRef.current;
    if (!root) return;

    // Inert when already-guided: no listeners, and collapse the spacer so it
    // doesn't leave a gap for returning visitors.
    if (suppressKey) {
      try {
        if (localStorage.getItem(suppressKey)) {
          if (mode === "sentinel") root.style.minHeight = "0px";
          return;
        }
      } catch {
        /* private mode — treat as not-yet-seen, handoff stays active */
      }
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Without the view-transition the jump is more jarring, so make it harder.
    const THRESHOLD = reduced ? 700 : 260;
    const KEY_STEP = 150; // ~2 deliberate key presses to cross the threshold
    const CD_KEY = "wp-handoff-cd";

    let armed = false;
    let fired = false;
    let accum = 0;
    let cooldownUntil = 0;
    let lastY = window.scrollY;
    let dir: "up" | "down" = "down";
    let touchY: number | null = null;

    const cooldownOk = () => Date.now() > cooldownUntil;

    const showHint = () => {
      if (hint) hint.classList.toggle("is-armed", armed && cooldownOk());
    };
    const setArmed = (next: boolean) => {
      if (next === armed) return;
      armed = next;
      if (!armed) accum = 0;
      showHint();
    };

    const trigger = () => {
      if (fired || !cooldownOk()) return;
      fired = true;
      try {
        sessionStorage.setItem(CD_KEY, String(Date.now() + 1500));
      } catch {
        /* private mode — fine, the pageshow cooldown still applies */
      }
      window.location.href = to;
    };

    const addIntent = (dy: number) => {
      if (!armed || fired || !cooldownOk()) return;
      if (dy <= 0) {
        accum = Math.max(0, accum + dy); // upward gestures bleed it back down
        return;
      }
      accum += dy;
      showHint();
      if (accum >= THRESHOLD) trigger();
    };

    // --- arming -------------------------------------------------------------
    let io: IntersectionObserver | null = null;
    const onBottom = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      setArmed(atBottom);
    };

    if (mode === "bottom") {
      window.addEventListener("scroll", onBottom, { passive: true });
      window.addEventListener("resize", onBottom);
      onBottom();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const r = e.boundingClientRect;
            setArmed(
              e.isIntersecting &&
                dir === "down" &&
                r.top <= window.innerHeight * 0.6,
            );
          }
        },
        { threshold: [0, 0.5, 1] },
      );
      io.observe(root);
    }

    const onScroll = () => {
      const y = window.scrollY;
      dir = y > lastY ? "down" : y < lastY ? "up" : dir;
      // Scrolled up meaningfully — back out of the armed zone.
      if (mode === "sentinel" && y < lastY - 8) setArmed(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // --- intent -------------------------------------------------------------
    const onWheel = (e: WheelEvent) => addIntent(e.deltaY);
    window.addEventListener("wheel", onWheel, { passive: true });

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      addIntent(touchY - y); // swipe up = scroll down = positive intent
      touchY = y;
    };
    const onTouchEnd = () => {
      touchY = null;
      accum = 0; // require one deliberate pull; ignore post-lift momentum
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.repeat) return;
      const el = document.activeElement as HTMLElement | null;
      if (el) {
        const tag = el.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          el.isContentEditable ||
          el.closest?.(
            'button, a, [role="button"], details, summary, .deck-scene',
          )
        ) {
          return;
        }
      }
      if (
        e.key === "PageDown" ||
        e.key === "ArrowDown" ||
        e.key === "End" ||
        e.key === " " ||
        e.key === "Spacebar"
      ) {
        addIntent(KEY_STEP);
      }
    };
    window.addEventListener("keydown", onKey);

    // --- cooldown on (re)entry, incl. bfcache restore ----------------------
    const onPageShow = (e: PageTransitionEvent) => {
      fired = false;
      setArmed(false);
      accum = 0;
      let stored = 0;
      try {
        stored = parseInt(sessionStorage.getItem(CD_KEY) || "0", 10) || 0;
      } catch {
        /* ignore */
      }
      cooldownUntil = Math.max(
        Date.now() + (e.persisted ? 1000 : 400),
        stored,
      );
    };
    window.addEventListener("pageshow", onPageShow);
    // Cover the very first paint too (pageshow may have already fired).
    cooldownUntil = Math.max(cooldownUntil, Date.now() + 400);

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onBottom);
      window.removeEventListener("resize", onBottom);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [to, mode, suppressKey]);

  const hint = !showHint ? null : (
    <div
      ref={hintRef}
      aria-hidden="true"
      className={
        mode === "bottom"
          ? "wp-handoff-hint fixed bottom-5 left-1/2 z-30 -translate-x-1/2"
          : "wp-handoff-hint"
      }
    >
      <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span aria-hidden className="text-base leading-none text-muted-foreground">
        ↓
      </span>
    </div>
  );

  // In "sentinel" mode the hint lives in-flow inside the spacer (it's on-screen
  // exactly when armed). In "bottom" mode the spacer is above the footer, so the
  // hint is fixed to the viewport and only fades in at the very bottom.
  return (
    <div
      ref={ref}
      data-handoff-sentinel=""
      aria-hidden="true"
      className={
        mode === "bottom"
          ? "h-px w-full"
          : "flex min-h-[42vh] flex-col items-center justify-center gap-2"
      }
    >
      {hint}
    </div>
  );
}
