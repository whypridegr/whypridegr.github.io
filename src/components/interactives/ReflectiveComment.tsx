import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { reflections, composerReflection } from "@/content/reflections";

type ModalState = { text: string; advance: boolean };

function scrollToNext() {
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  document.getElementById("telos")?.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "start",
  });
}

export function ReflectiveComment() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [draft, setDraft] = useState("");
  const [anon, setAnon] = useState(false);

  return (
    <div className="reading-width">
      {/* "Comment" cards — ❤️ Συμφωνώ opens a reflection instead of liking */}
      <ul className="space-y-4">
        {reflections.map((r, i) => (
          <li key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-secondary font-display text-sm">
                {r.initial}
              </div>
              <span className="text-sm text-muted-foreground">{r.author}</span>
            </div>
            <p className="mt-3 font-display text-lg leading-snug">{r.text}</p>
            <button
              onClick={() => setModal({ text: r.reflection, advance: false })}
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
              Συμφωνώ
            </button>
          </li>
        ))}
      </ul>

      {/* Fake composer — "submit" opens a reflection, nothing is posted */}
      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div
            className="size-9 shrink-0 rounded-full bg-secondary"
            aria-hidden
          />
          <div className="flex-1">
            <label htmlFor="wp-comment" className="sr-only">
              Γράψε ένα σχόλιο
            </label>
            <textarea
              id="wp-comment"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Γράψε ένα σχόλιο…"
              className="w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground"
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={anon}
                onChange={(e) => setAnon(e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ανώνυμη δημοσίευση
            </label>
            {anon && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Η ανωνυμία μπορεί να σε βοηθήσει να μιλήσεις πιο ειλικρινά, αλλά
                συχνά κάνει και τον λόγο πιο επιθετικό.
              </p>
            )}
            <div className="mt-3 flex justify-end">
              <button
                onClick={() =>
                  setModal({ text: composerReflection, advance: true })
                }
                className="rounded-md bg-ink px-4 py-2 text-sm uppercase tracking-[0.15em] text-paper transition-colors hover:bg-accent"
              >
                Δημοσίευση
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReflectionModal
        open={modal !== null}
        text={modal?.text ?? ""}
        onConfirm={() => {
          const advance = modal?.advance ?? false;
          setModal(null);
          // Keep the flow going only after the deliberate "Το σκέφτηκα" on the
          // composer reflection — not on Escape / click-outside.
          if (advance) scrollToNext();
        }}
        onDismiss={() => setModal(null)}
      />
    </div>
  );
}

function ReflectionModal({
  open,
  text,
  onConfirm,
  onDismiss,
}: {
  open: boolean;
  text: string;
  /** Deliberate acknowledgement ("Το σκέφτηκα"). */
  onConfirm: () => void;
  /** Escape / click-outside — closes without advancing. */
  onDismiss: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onDismiss}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Μια σκέψη"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl"
            initial={{ scale: 0.96, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="pride-rule mb-6 h-1 w-12 rounded-full" />
            <p className="text-lg leading-relaxed">{text}</p>
            <div className="mt-8 flex justify-end">
              <button
                ref={closeRef}
                onClick={onConfirm}
                className="rounded-md border border-ink px-5 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
              >
                Το σκέφτηκα
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
