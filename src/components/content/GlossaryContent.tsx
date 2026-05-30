import { glossary } from "@/content/glossary";
import { Reveal } from "@/components/primitives/Reveal";

export function GlossaryContent() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
      <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05] reading-width">
        Γλωσσάρι.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
        Δεν χρειάζεται να ξέρεις όλους τους όρους. Αλλά αν θες, εδώ είναι.
      </p>

      <div className="mt-16 divide-y divide-border border-y border-border">
        {glossary.map((g, i) => (
          <Reveal key={g.term} delay={i * 30}>
            <div className="grid md:grid-cols-[200px_1fr] gap-4 py-6">
              <div className="flex items-baseline gap-3">
                {g.letter && (
                  <span className="font-display text-3xl text-accent">
                    {g.letter}
                  </span>
                )}
                <p className="font-display text-2xl">{g.term}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {g.category}
                </p>
                <p className="mt-1 leading-relaxed">{g.short}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
