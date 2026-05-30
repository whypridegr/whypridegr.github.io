import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Small click-triggered popover (disclosure pattern). Good for an inline "ⓘ"
 * that reveals a short note + a source link. Closes on Escape / outside click.
 *
 *   <Popover label="ⓘ">Σύντομη εξήγηση. <a href="…">Πηγή</a></Popover>
 */
export function Popover({
  label,
  children,
  triggerClassName,
  align = "center",
}: {
  /** Content of the trigger button (text or icon). */
  label: React.ReactNode;
  /** Content shown inside the popover. */
  children: React.ReactNode;
  triggerClassName?: string;
  align?: "center" | "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pos =
    align === "start"
      ? "left-0"
      : align === "end"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "inline-flex items-center text-accent underline decoration-dotted underline-offset-2 transition-colors hover:text-ink",
          triggerClassName,
        )}
      >
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full z-40 mt-2 block w-64 rounded-xl border border-border bg-popover p-4 text-left text-sm font-normal normal-case leading-relaxed tracking-normal text-popover-foreground shadow-xl",
              pos,
            )}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
