import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DoubleStandard } from "@/content/doubleStandards";

export function ReframeToggle({ items }: { items: DoubleStandard[] }) {
  const [mode, setMode] = useState<"queer" | "straight">("queer");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Επιλογή προοπτικής"
        className="flex w-full flex-col gap-1 rounded-2xl border border-border bg-card p-1 sm:inline-flex sm:w-auto sm:flex-row"
      >
        <Tab active={mode === "queer"} onClick={() => setMode("queer")}>
          Όπως λέγεται σε queer άτομα
        </Tab>
        <Tab active={mode === "straight"} onClick={() => setMode("straight")}>
          Αν λεγόταν σε straight άτομα
        </Tab>
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
        "w-full rounded-full px-4 py-2 text-center text-xs uppercase tracking-[0.15em] transition-colors sm:w-auto md:text-sm",
        active ? "bg-ink text-paper" : "text-muted-foreground hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
