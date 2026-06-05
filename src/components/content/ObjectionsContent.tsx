import { Accordion } from "@/components/primitives/Accordion";
import { Reveal } from "@/components/primitives/Reveal";
import { objections } from "@/content/faq";

// Standalone page for the bluntest, skeptic-phrased questions. All items show
// at once (no "see more"): a doubter who lands here from a search came for
// exactly these answers.
export function ObjectionsContent() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal>
          <a
            href="/#erotiseis"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
          >
            <span aria-hidden>←</span> Πίσω στις ερωτήσεις
          </a>
          <h1 className="mt-8 font-display text-3xl md:text-5xl leading-tight reading-width text-balance">
            Είναι αμαρτία; Επιλογή; Αρρώστια;
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Οι πιο σκληρές απορίες για την ομοφυλοφιλία και το Pride, ψύχραιμα και
            με πηγές. Χωρίς κήρυγμα.
          </p>
        </Reveal>
        <Reveal className="mt-12 md:mt-16" delay={80}>
          <Accordion items={objections} />
        </Reveal>
        <Reveal className="mt-16 border-t border-border pt-10" delay={80}>
          <p className="text-sm text-muted-foreground">
            Συνέχισε με κάτι πιο διαδραστικό:
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/prokliseis"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
            >
              Δοκίμασε κάποιες μικρές προκλήσεις
            </a>
            <a
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-md border border-ink px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper"
            >
              Δοκίμασε πόσο σύμμαχος είσαι
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
