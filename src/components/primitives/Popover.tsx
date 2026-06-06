import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Coords = { top: number; left: number; width: number };

/**
 * Small click-triggered popover (disclosure pattern). Good for an inline "ⓘ"
 * that reveals a short note + a source link. Closes on Escape / outside click.
 *
 * Positioned with fixed coordinates clamped to the viewport, so it never spills
 * off the edge on small screens.
 *
 *   <Popover label="ⓘ">Σύντομη εξήγηση. <a href="…">Πηγή</a></Popover>
 */
// Broadcast when one popover opens so any other open popover closes itself.
// Keeps adjacent citations (e.g. a row of myth cards) from stacking open.
const OPEN_EVENT = "wp-popover-open";

export function Popover({
  label,
  children,
  triggerClassName,
  align = "center",
  ariaLabel,
}: {
  /** Content of the trigger button (text or icon). */
  label: React.ReactNode;
  /** Content shown inside the popover. */
  children: React.ReactNode;
  triggerClassName?: string;
  /** Preferred horizontal anchor before viewport clamping. */
  align?: "center" | "start" | "end";
  /** Accessible name for an icon-only trigger (e.g. "ⓘ"). */
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  // Portal the panel to <body> so a transformed ancestor (e.g. the deck's
  // scaler) can't become the containing block and shove the fixed panel off.
  // Resolved in an effect so it stays null during SSR.
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalEl(document.body), []);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 8;
      const width = Math.min(288, window.innerWidth - margin * 2);
      let left =
        align === "start"
          ? r.left
          : align === "end"
            ? r.right - width
            : r.left + r.width / 2 - width / 2;
      left = Math.max(
        margin,
        Math.min(left, window.innerWidth - width - margin),
      );
      setCoords({ top: r.bottom + 8, left, width });
    };
    place();

    const onScroll = () => place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    // Close when another popover announces it just opened.
    const onOtherOpen = (e: Event) => {
      if ((e as CustomEvent).detail !== id) setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOtherOpen);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOtherOpen);
    };
  }, [open, align, id]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => {
            const next = !o;
            if (next)
              window.dispatchEvent(
                new CustomEvent(OPEN_EVENT, { detail: id }),
              );
            return next;
          });
        }}
        className={cn(
          "inline-flex items-center text-accent underline decoration-dotted underline-offset-2 transition-colors hover:text-ink",
          triggerClassName,
        )}
      >
        {label}
      </button>
      {portalEl &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.div
                ref={popRef}
                id={id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                }}
                className="z-50 block max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-popover p-4 text-left text-sm font-normal normal-case leading-relaxed tracking-normal text-popover-foreground shadow-xl"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          portalEl,
        )}
    </>
  );
}
