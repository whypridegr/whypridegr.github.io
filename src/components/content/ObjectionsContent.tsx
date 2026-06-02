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
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Συχνές αντιρρήσεις
          </p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl leading-tight reading-width">
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
      </div>
    </section>
  );
}
