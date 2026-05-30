import { useState } from "react";
import { cn } from "@/lib/utils";
import { privileges, privilegeMessage } from "@/content/privileges";

export function PrivilegeVisualizer() {
  const [checked, setChecked] = useState<boolean[]>(() =>
    privileges.map(() => false),
  );
  const count = checked.filter(Boolean).length;
  const pct =
    privileges.length > 0 ? Math.round((count / privileges.length) * 100) : 0;
  const toggle = (i: number) =>
    setChecked((c) => c.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-2">
        {privileges.map((p, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              aria-pressed={checked[i]}
              className="group flex w-full items-start gap-4 rounded-md py-2 text-left"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                  checked[i]
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border group-hover:border-accent",
                )}
                aria-hidden
              >
                {checked[i] && (
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="leading-relaxed">{p}</span>
            </button>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-24 h-fit border border-border bg-card rounded-lg p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Όσα θεωρείς δεδομένα
        </p>
        <p className="mt-2 font-display text-5xl text-accent">
          {count}
          <span className="text-2xl text-muted-foreground">/{privileges.length}</span>
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {privilegeMessage(count, privileges.length)}
        </p>
      </aside>
    </div>
  );
}
