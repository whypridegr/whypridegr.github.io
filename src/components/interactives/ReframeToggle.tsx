import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DoubleStandard } from "@/content/doubleStandards";

export function ReframeToggle({ items }: { items: DoubleStandard[] }) {
  const [mode, setMode] = useState<"queer" | "straight">("queer");
  // The lead carries the conditional ("as it's said to…" vs "if it were said
  // to…"); the switch toggles only the subject, so the device stays intact but
  // compact enough to read on a phone.
  const lead = mode === "queer" ? "Όπως λέγεται σε ένα" : "Αν λεγόταν σε ένα";

  return (
    <div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {lead}
        </span>
        <div
          role="tablist"
          aria-label="Επιλογή προοπτικής"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
        >
          <Tab active={mode === "queer"} onClick={() => setMode("queer")}>
            queer άτομο
          </Tab>
          <span aria-hidden className="text-sm text-muted-foreground">
            /
          </span>
          <Tab active={mode === "straight"} onClick={() => setMode("straight")}>
            straight άτομο
          </Tab>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {items.map((it, i) => (
          <li
            key={i}
            className="border-l-2 border-border pl-6 py-2 transition-colors hover:border-accent"
          >
            <p className="font-display text-xl md:text-2xl leading-snug transition-opacity duration-300">
              {mode === "queer" ? it.queer : it.straight}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-center text-sm transition-colors",
        active ? "bg-ink text-paper" : "text-muted-foreground hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
