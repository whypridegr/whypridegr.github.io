import { useState } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/primitives/Modal";
import { reflections, composerReflection } from "@/content/reflections";

type ModalState = { text: string; advance: boolean };

function goToClosing() {
  // The closing thoughts (#telos) live at the end of the deck page. The sxolio
  // challenge usually runs there, so scroll if it's on the page; otherwise (the
  // standalone /challenge/sxolio) navigate to it.
  const here = document.getElementById("telos");
  if (here) {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    here.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    return;
  }
  window.location.href = "/prokliseis#telos";
}

export function ReflectiveComment() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [draft, setDraft] = useState("");
  const [anon, setAnon] = useState(false);
  // Which cards the visitor has pressed "Συμφωνώ" on (local, adds +1 to the tally).
  const [agreed, setAgreed] = useState<Record<number, boolean>>({});

  return (
    <div className="reading-width">
      {/* "Comment" cards — ❤️ Συμφωνώ opens a reflection instead of liking */}
      <ul className="space-y-4">
        {reflections.map((r, i) => (
          <li key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              {/* Illustrated avatar for the named cards (not photos of real
                  people); the anonymous card keeps a neutral silhouette. */}
              {r.avatar ? (
                <img
                  src={r.avatar}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  className="size-9 shrink-0 rounded-full bg-secondary object-cover"
                />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="currentColor"
                    aria-hidden
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5Z" />
                  </svg>
                </div>
              )}
              <span className="text-sm text-muted-foreground">{r.author}</span>
            </div>
            <p className="mt-3 font-display text-lg leading-snug">{r.text}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm tabular-nums text-muted-foreground">
                {r.likes + (agreed[i] ? 1 : 0)}
              </span>
              <button
                onClick={() => {
                  setAgreed((a) => ({ ...a, [i]: true }));
                  setModal({ text: r.reflection, advance: false });
                }}
                aria-pressed={!!agreed[i]}
                className={cn(
                  "inline-flex items-center gap-2 text-sm transition-colors",
                  agreed[i]
                    ? "text-accent"
                    : "text-muted-foreground hover:text-accent",
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill={agreed[i] ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
                Συμφωνώ
              </button>
            </div>
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

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        label="Μια σκέψη"
      >
        <div className="pride-rule mb-6 h-1 w-12 rounded-full" />
        <p className="text-lg leading-relaxed">{modal?.text}</p>
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              const advance = modal?.advance ?? false;
              setModal(null);
              // Advance only on the deliberate "Το σκέφτηκα" of the composer
              // reflection — not on Escape / click-outside (those just close).
              if (advance) goToClosing();
            }}
            className="rounded-md border border-ink px-5 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
          >
            Το σκέφτηκα
          </button>
        </div>
      </Modal>
    </div>
  );
}
