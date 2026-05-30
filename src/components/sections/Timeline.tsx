import { Reveal } from "@/components/primitives/Reveal";
import { milestones } from "@/content/timeline";

export function Timeline() {
  return (
    <ol className="relative ml-3 space-y-10 border-l border-border">
      {milestones.map((m, i) => (
        <Reveal key={i} delay={i * 60}>
          <li className="relative pl-8">
            <span
              className="absolute -left-[6.5px] top-3 size-3 rounded-full bg-accent ring-4 ring-background"
              aria-hidden
            />
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl md:text-4xl text-accent">
                {m.year}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {m.scope}
              </span>
            </div>
            <p className="mt-1 font-display text-xl">{m.title}</p>
            <p className="mt-2 leading-relaxed text-muted-foreground reading-width">
              {m.text}
            </p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}
