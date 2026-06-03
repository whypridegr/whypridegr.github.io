import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Share + embed controls for a single challenge.
 *
 * "Μοιράσου" hands the deep link (origin/#id) to the native share sheet when
 * available, otherwise copies it. "Ενσωμάτωσε" reveals — and copies — an
 * <iframe> snippet pointing at the standalone /embed/[id] widget, so the
 * challenge can drop straight into an article.
 */
export function ShareEmbed({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  // The control unmounts on "back" / switching challenges; clear the pending
  // reset so it never fires setState on an unmounted component.
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  // Resolved at click time: SSR has no window, and we want the live origin.
  const origin = () =>
    typeof window === "undefined" ? "https://whypride.gr" : window.location.origin;
  const shareUrl = () => `${origin()}/#${id}`;
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
    setShowEmbed(true);
    if (await copy(embedCode())) flash("embed");
  };

  const btn =
    "inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <div className="mt-10 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onShare} className={btn}>
          {copied === "link" ? "Αντιγράφηκε ✓" : "Μοιράσου"}
        </button>
        <button
          type="button"
          onClick={onEmbed}
          aria-expanded={showEmbed}
          className={btn}
        >
          {copied === "embed" ? "Αντιγράφηκε ✓" : "Ενσωμάτωσε"}
        </button>
      </div>

      {showEmbed && (
        <label className="mt-4 block">
          <span className="text-xs text-muted-foreground">
            Κώδικας ενσωμάτωσης (επικολλάται σε άρθρο ή ιστοσελίδα):
          </span>
          <textarea
            readOnly
            rows={3}
            onFocus={(e) => e.currentTarget.select()}
            value={embedCode()}
            className={cn(
              "mt-2 w-full resize-none rounded-md border border-border bg-card p-3",
              "font-mono text-xs leading-relaxed text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            )}
          />
        </label>
      )}
    </div>
  );
}
