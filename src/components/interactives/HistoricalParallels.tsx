import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import type { Parallel } from "@/content/parallels";
import { parallels } from "@/content/parallels";
import { TelegraphSheet } from "@/components/interactives/TelegraphSheet";

if (typeof window !== "undefined") gsap.registerPlugin(Flip, useGSAP);

const TILTS = [-0.7, 0.5, -0.4];

// The newspaper fonts only matter once someone opens a clipping, so we fetch
// them on first open rather than on every page load (lighter, fewer 3rd-party
// requests for visitors who never open one).
let fontsRequested = false;
function ensureTelegraphFonts() {
  if (fontsRequested || typeof document === "undefined") return;
  fontsRequested = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Courier+Prime:wght@400;700&display=swap";
  document.head.appendChild(link);
}

export function HistoricalParallels() {
  const container = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const closing = useRef(false);

  const [expanded, setExpanded] = useState<number | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // OPEN: once the sheet has rendered, grow it from the clicked card to centre.
  useGSAP(
    () => {
      if (expanded === null) return;
      const sheet = sheetRef.current;
      const card = cardRefs.current[expanded];
      if (!sheet || !card) return;

      gsap.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduced ? 0 : 0.35, ease: "power1.out" },
      );

      if (reduced) {
        closeRef.current?.focus();
        return;
      }

      // Snap the (final, centred) sheet onto the clicked card, capture that as
      // the START, restore the sheet to its final layout, then animate START to
      // final: the sheet grows from the card to the centre of the screen.
      Flip.fit(sheet, card, { absolute: true, scale: true });
      const startState = Flip.getState(sheet);
      gsap.set(sheet, { clearProps: "all" });
      Flip.from(startState, {
        duration: 0.65,
        ease: "power3.inOut",
        absolute: true,
        scale: true,
        onComplete: () => closeRef.current?.focus(),
      });
    },
    { dependencies: [expanded], scope: container },
  );

  const { contextSafe } = useGSAP({ scope: container });

  const open = (i: number) => {
    if (expanded !== null || closing.current) return;
    ensureTelegraphFonts();
    lastTrigger.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    setExpanded(i);
  };

  const finishClose = () => {
    document.body.style.overflow = "";
    closing.current = false;
    setExpanded(null);
    if (lastTrigger.current?.isConnected) lastTrigger.current.focus();
  };

  const close = contextSafe(() => {
    if (closing.current) return;
    closing.current = true;
    const sheet = sheetRef.current;
    const card = expanded !== null ? cardRefs.current[expanded] : null;
    gsap.to(backdropRef.current, {
      autoAlpha: 0,
      duration: reduced ? 0 : 0.3,
      ease: "power1.in",
    });
    if (reduced || !sheet || !card) {
      finishClose();
      return;
    }
    // Cancel any in-flight open tween, then shrink the sheet back onto the card.
    gsap.killTweensOf(sheet);
    Flip.fit(sheet, card, {
      duration: 0.5,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onComplete: finishClose,
    });
  });

  // Safety net: never leave the page scroll-locked if we unmount mid-open.
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape closes; basic Tab trap inside the open sheet.
  useEffect(() => {
    if (expanded === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = sheet.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !sheet.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !sheet.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // `close` is stable enough for this lifecycle; re-bind only on open/close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const current = expanded !== null ? parallels[expanded] : null;

  return (
    <div ref={container} className="newsprint mx-auto max-w-2xl space-y-16">
      {parallels.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{
            transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
            filter: "drop-shadow(0 12px 16px rgba(40,30,15,0.22))",
          }}
        >
          {/* The whole clipping is the trigger, so a tap anywhere opens it. */}
          <article
            role="button"
            tabIndex={0}
            aria-label={`Άνοιξε την εφημερίδα: ${p.against}`}
            onClick={() => open(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(i);
              }
            }}
            className="paper torn-bottom block w-full cursor-pointer px-6 pb-10 pt-6 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b3520] md:px-10 md:pb-12 md:pt-8"
          >
            <div className="flex items-center justify-between border-b border-[#c3b79b] pb-2 font-sans text-[0.66rem] uppercase tracking-[0.22em] text-[#7d7257]">
              <span>Τότε</span>
              <span>{p.era}</span>
            </div>
            <h4 className="mt-4 text-xl font-bold uppercase leading-tight tracking-tight">
              {p.against}
            </h4>
            <blockquote className="mt-3 text-2xl leading-snug md:text-[1.7rem]">
              {p.quote}
            </blockquote>
            <span className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-[#9b3520]">
              Άνοιξε την εφημερίδα
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              </svg>
            </span>
          </article>
        </div>
      ))}

      {/* Expanded reading view, portaled to <body> so the fixed backdrop is
          truly viewport-sized and never trapped by a transformed ancestor. */}
      {current &&
        createPortal(
          <>
          <div
            ref={backdropRef}
            onClick={close}
            className="fixed inset-0 z-[60] bg-ink/85 backdrop-blur-md"
            aria-hidden
          />
          <button
            ref={closeRef}
            onClick={close}
            aria-label="Κλείσιμο"
            className="fixed right-4 top-4 z-[62] flex size-10 items-center justify-center rounded-full bg-ink/80 text-paper shadow-lg backdrop-blur transition-colors hover:bg-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Τότε και σήμερα: ${current.against}`}
            className="fixed left-1/2 top-1/2 z-[61] max-h-[92vh] w-[min(94vw,812px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
          >
            <TelegraphSheet parallel={current} />
          </div>
        </>,
          document.body,
        )}
    </div>
  );
}
