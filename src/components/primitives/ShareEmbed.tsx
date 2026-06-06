import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Coords = { top: number; left: number; width: number };

/**
 * Compact share + embed icons for a single challenge.
 *
 * Share hands the deep link (origin/challenge/id) to the native share sheet
 * when available, otherwise copies it. Embed reveals — and copies — an
 * <iframe> snippet pointing at the chrome-less /embed/[id] widget.
 */
export function ShareEmbed({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const embedBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The control can unmount on navigation; clear the pending reset so it never
  // fires setState on an unmounted component.
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  // Float the embed snippet in a fixed-position panel anchored to the button,
  // portaled to <body>, so it never grows the deck's sticky control pill.
  // Positioning mirrors Popover.tsx (viewport-clamped, repositions on scroll).
  useEffect(() => {
    if (!showEmbed) return;

    const place = () => {
      const el = embedBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 8;
      const width = Math.min(320, window.innerWidth - margin * 2);
      let left = r.left + r.width / 2 - width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
      // Flip above the button when there isn't room below it.
      const estHeight = 132;
      const below = r.bottom + 8;
      const top =
        below + estHeight > window.innerHeight - margin
          ? Math.max(margin, r.top - 8 - estHeight)
          : below;
      setCoords({ top, left, width });
    };
    place();

    const onScroll = () => place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!embedBtnRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setShowEmbed(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEmbed(false);
        embedBtnRef.current?.focus();
      }
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [showEmbed]);

  const origin = () =>
    typeof window === "undefined" ? "https://whypride.gr" : window.location.origin;
  const shareUrl = () => `${origin()}/challenge/${id}`;
  const embedCode = () =>
    `<iframe src="${origin()}/embed/${id}" width="100%" height="640" style="border:1px solid #e5e7eb;border-radius:12px" loading="lazy" title="${title} · whypride.gr"></iframe>`;

  const flash = (which: "link" | "embed") => {
    window.clearTimeout(flashTimer.current);
    setCopied(which);
    flashTimer.current = window.setTimeout(
      () => setCopied((c) => (c === which ? null : c)),
      2000,
    );
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const onShare = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} · whypride.gr`, url });
        return;
      } catch {
        // Cancelled or unsupported gesture — fall through to copy.
      }
    }
    if (await copy(url)) flash("link");
  };

  const onEmbed = async () => {
    const opening = !showEmbed;
    setShowEmbed(opening);
    // Only copy when revealing the snippet, not when collapsing it.
    if (opening && (await copy(embedCode()))) flash("embed");
  };

  const iconBtn =
    "relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onShare}
          className={iconBtn}
          aria-label="Μοιράσου αυτή την πρόκληση"
          title={copied === "link" ? "Αντιγράφηκε ✓" : "Μοιράσου"}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </button>
        <button
          ref={embedBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEmbed();
          }}
          aria-expanded={showEmbed}
          className={iconBtn}
          aria-label="Κώδικας ενσωμάτωσης"
          title={copied === "embed" ? "Αντιγράφηκε ✓" : "Ενσωμάτωσε"}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" />
          </svg>
        </button>
        {copied && (
          <span className="text-xs text-muted-foreground" role="status">
            Αντιγράφηκε ✓
          </span>
        )}
      </div>

      {showEmbed &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className="z-50 rounded-xl border border-border bg-popover p-3 text-left shadow-xl"
          >
            <label className="block">
              <span className="text-xs text-muted-foreground">
                Κώδικας ενσωμάτωσης (επικολλάται σε άρθρο ή ιστοσελίδα):
              </span>
              <textarea
                readOnly
                rows={3}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                value={embedCode()}
                className={cn(
                  "mt-2 w-full resize-none rounded-md border border-border bg-card p-3",
                  "font-mono text-xs leading-relaxed text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                )}
              />
            </label>
          </div>,
          document.body,
        )}
    </div>
  );
}
