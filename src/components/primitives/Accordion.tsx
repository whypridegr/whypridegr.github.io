import { useState, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/content/faq";

// Turn [label](target) markers in plain content strings into links. Targets
// are limited to in-page hash anchors (#foo) or local paths (/foo); anything
// else stays plain text.
const LINK_RE = /\[([^\]\n]+)\]\((#[A-Za-z0-9_-]+|\/[A-Za-z0-9_\-/]*)\)/g;

function renderRich(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <a
        key={`${keyPrefix}-${i}`}
        href={m[2]}
        className="text-ink underline decoration-dotted underline-offset-4 hover:text-accent"
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Accordion({
  items,
  initialVisible,
  secondaryAction,
}: {
  items: FaqItem[];
  /** When set (and < items.length), only the first N items show until the
   *  reader expands the rest. Clamped to a sane range; ignored otherwise. */
  initialVisible?: number;
  /** Optional navigational CTA shown below the list (and beside the "more"
   *  button when it's present). Stays visible after the list is expanded. */
  secondaryAction?: { label: string; href: string };
}) {
  const [open, setOpen] = useState<number | null>(0);
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const moreId = useId();

  const limit =
    typeof initialVisible === "number" && Number.isFinite(initialVisible)
      ? Math.max(1, Math.floor(initialVisible))
      : items.length;
  const collapsible = limit < items.length;
  const visibleCount = collapsible && !expanded ? limit : items.length;

  const reveal = () => {
    setExpanded(true);
    // Move focus to the first newly revealed trigger (the reveal button itself
    // is removed once expanded), so keyboard users aren't dropped silently.
    requestAnimationFrame(() => {
      const triggers = listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-acc-trigger]",
      );
      triggers?.[limit]?.focus();
    });
  };

  return (
    <div>
      <div
        ref={listRef}
        id={moreId}
        className="divide-y divide-border border-y border-border"
      >
        {items.slice(0, visibleCount).map((item, i) => (
          <Item
            key={i}
            item={item}
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </div>
      {((collapsible && !expanded) || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {collapsible && !expanded && (
            <button
              onClick={reveal}
              aria-expanded={false}
              aria-controls={moreId}
              className="inline-flex items-center gap-2 rounded-md border border-ink px-5 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
            >
              Περισσότερες ερωτήσεις
            </button>
          )}
          {secondaryAction && (
            <a
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 rounded-md border border-ink px-5 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
            >
              {secondaryAction.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Item({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  return (
    <div>
      <button
        data-acc-trigger
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-start gap-6 py-6 text-left transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent"
      >
        <span
          className={cn(
            "mt-2 inline-block h-px w-6 shrink-0 bg-current transition-transform duration-300",
            open && "rotate-90 origin-left",
          )}
          aria-hidden
        />
        <span className="flex-1 font-display text-2xl md:text-3xl leading-tight">
          {item.q}
        </span>
      </button>
      <div
        id={id}
        aria-hidden={!open}
        // Keep collapsed source links out of the tab order (and off AT) while
        // they're visually hidden but still in the DOM.
        inert={!open}
        className={cn(
          "grid transition-all duration-500 ease-out",
          open ? "grid-rows-[1fr] opacity-100 pb-8" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pl-12 pr-4 reading-width">
            <p className="text-lg leading-relaxed text-ink">
              {renderRich(item.short, `${id}-short`)}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {renderRich(item.long, `${id}-long`)}
            </p>
            {item.sources && item.sources.length > 0 && (
              <ul className="mt-6 space-y-1 text-sm text-muted-foreground">
                {item.sources.map((s) => (
                  <li key={s.url}>
                    <span className="text-ink-muted">Πηγή: </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted underline-offset-4 hover:text-accent"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
