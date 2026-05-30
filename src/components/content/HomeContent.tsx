import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/components/site/Link";
import { Accordion } from "@/components/primitives/Accordion";
import { FlipCard } from "@/components/primitives/FlipCard";
import { Reveal } from "@/components/primitives/Reveal";
import { GuessGreece } from "@/components/interactives/GuessGreece";
import { ReframeToggle } from "@/components/interactives/ReframeToggle";
import { PrivilegeVisualizer } from "@/components/interactives/PrivilegeVisualizer";
import { ReflectiveComment } from "@/components/interactives/ReflectiveComment";
import { HistoricalParallels } from "@/components/interactives/HistoricalParallels";
import { RightResponse } from "@/components/interactives/RightResponse";
import { SegregationSandbox } from "@/components/interactives/SegregationSandbox";
import { GlossarySection } from "@/components/sections/GlossarySection";
import { Timeline } from "@/components/sections/Timeline";
import { faq } from "@/content/faq";
import { myths } from "@/content/myths";
import { scenarios } from "@/content/scenarios";
import { doubleStandards } from "@/content/doubleStandards";
import { sources } from "@/content/sources";

export function HomeContent() {
  useScrollHash();
  return (
    <>
      <Hero />

      {/* — Questions first: the thing people actually come with — */}
      <Section id="erotiseis" title="Δύσκολες ερωτήσεις και οι απαντήσεις τους.">
        <Accordion items={faq} initialVisible={4} />
      </Section>

      <Section id="mythoi" title="Γύρισέ τες. Δες την άλλη πλευρά.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {myths.map((m, i) => (
            <FlipCard key={i} item={m} />
          ))}
        </div>
      </Section>

      <Section id="pronomio" title="Διάλεξε όσα σε αντιπροσωπεύουν.">
        <PrivilegeVisualizer />
      </Section>

      <Section
        id="diplo-metro"
        title="Πάτα τον διακόπτη και διάβασέ το δύο φορές."
      >
        <ReframeToggle items={doubleStandards} />
      </Section>

      {/* Segregation sandbox — interactive only, no framing */}
      <Section
        id="prokatalipsi"
        title="Πώς λειτουργεί η προκατάληψη με ένα πείραμα."
      >
        <SegregationSandbox />
      </Section>

      <Section id="elsada" title="Μάντεψε πού συνέβη.">
        <GuessGreece items={scenarios} />
      </Section>

      <Section
        id="apantisi"
        title="Υποθετικό σενάριο. Μπορεί να σου έχει τύχει."
      >
        <RightResponse />
      </Section>

      <Section
        id="palia"
        title="Το ίδιο επιχείρημα. Διαφορετικός στόχος χρονικά."
      >
        <HistoricalParallels />
      </Section>

      {/* — Discussion, before the close — */}
      <Section id="sxolio" title="Γράψε ένα σχόλιο. Ή σκέψου το λίγο ακόμα.">
        <ReflectiveComment />
      </Section>

      {/* — Warm beat + nudge toward the reference material below — */}
      <section id="telos" data-spy className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
          <Reveal>
            <div className="pride-rule mx-auto h-1 w-16 rounded-full" />
            <p className="mx-auto mt-8 max-w-xl font-display text-2xl md:text-3xl leading-snug">
              Ελπίζουμε να σε κάναμε να προβληματιστείς, έστω και λίγο.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Αν θες, κάνε κάτι μικρό μ' αυτά. Φέτος γίνονται Pride σε πολλές
              πόλεις· πέρνα έστω από μακριά, χωρίς να συμμετέχεις, και δες μόνος
              σου αν είναι όντως αυτό που σου είχαν πει. Ή πιάσε κουβέντα με
              κάποιον γνωστό σου από την κοινότητα. Τις πιο πολλές φορές δεν
              υπάρχει κάτι να μας χωρίζει, ούτε κάτι να φοβηθείς.
            </p>
            <div className="mt-12 flex flex-col items-center gap-8">
              <a
                href="#glossari"
                className="inline-flex flex-col items-center gap-1 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
              >
                Μάθε περισσότερα
                <span aria-hidden className="text-xl leading-none">
                  ↓
                </span>
              </a>
              <a
                href="/quiz"
                className="rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
              >
                Ώρα να δούμε πόσο ally είσαι
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* — Reference material — */}
      <section id="glossari" data-spy className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <GlossarySection />
            <div className="mt-8 text-center">
              <Link
                to="/glossary"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink hover:text-accent"
              >
                Όλο το γλωσσάρι →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Section id="istoria" title="Πόσο πρόσφατα είναι όλα αυτά.">
        <Timeline />
      </Section>

      <Section
        id="piges"
        eyebrow="Πηγές"
        title="Όλα όσα διάβασες, με links."
        spy={false}
      >
        <ul className="reading-width divide-y divide-border border-y border-border">
          {sources.slice(0, 5).map((s) => (
            <li key={s.url} className="py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {s.org}
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-lg hover:text-accent underline-offset-4 hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link
            to="/sources"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink hover:text-accent"
          >
            Όλες οι πηγές →
          </Link>
        </div>
      </Section>

      <NextSectionButton />
    </>
  );
}

// Put each sentence of a title on its own line, so two-sentence titles read
// as two stacked lines instead of wrapping arbitrarily.
function splitSentences(text: string): string[] {
  const parts = text.match(/[^.;!?]+[.;!?]*/g);
  if (!parts) return [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

// Reflect the section currently in view into the URL hash (shareable, back-
// gesture friendly). Lives in the island so it runs after hydration and
// observes the live DOM nodes.
function useScrollHash() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-spy][id]"),
    );
    if (!sections.length) return;

    let suppressUntil = 0;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('a[href*="#"]')) suppressUntil = Date.now() + 700;
    };
    document.addEventListener("click", onClick, true);
    if (location.hash) suppressUntil = Date.now() + 700;

    const visible = new Map<string, boolean>();
    let current = "";
    const update = () => {
      if (Date.now() < suppressUntil) return;
      let best: HTMLElement | null = null;
      let bestTop = Infinity;
      for (const s of sections) {
        if (!visible.get(s.id)) continue;
        const top = s.getBoundingClientRect().top;
        if (top <= bestTop) {
          bestTop = top;
          best = s;
        }
      }
      if (best && best.id !== current) {
        current = best.id;
        history.replaceState(null, "", "#" + best.id);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting);
        }
        update();
      },
      // Top offset clears the sticky header; ignore the lower 55% so the
      // "active" section is the one in the reading zone.
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      io.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, []);
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 pt-24 md:pt-32 pb-20 md:pb-28">
        <div className="pride-rule h-1 w-16 rounded-full" />
        <h1 className="mt-8 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight reading-width">
          Γιατί υπάρχει Pride;
        </h1>
        <p className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Έλα να το δούμε ψύχραιμα και να προβληματιστούμε.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#erotiseis"
            className="px-6 py-3 text-sm uppercase tracking-[0.2em] bg-ink text-paper rounded-md hover:bg-accent transition-colors"
          >
            Πάμε
          </a>
          <a
            href="#glossari"
            className="px-6 py-3 text-sm uppercase tracking-[0.2em] border border-ink rounded-md hover:bg-ink hover:text-paper transition-colors"
          >
            Διάβασε περισσότερα
          </a>
          <a
            href="/quiz"
            className="px-6 py-3 text-sm uppercase tracking-[0.2em] border border-ink rounded-md hover:bg-ink hover:text-paper transition-colors"
          >
            Δες πόσο ally είσαι <b className="font-bold">όντως</b>
          </a>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  title,
  spy = true,
  children,
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  /** Whether scrolling past this section updates the URL hash. */
  spy?: boolean;
  children: React.ReactNode;
}) {
  const hasHeader = Boolean(eyebrow || title);
  return (
    <section
      id={id}
      className="border-t border-border"
      {...(spy ? { "data-spy": "" } : {})}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        {hasHeader && (
          <Reveal>
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight reading-width">
                {splitSentences(title).map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            )}
          </Reveal>
        )}
        <Reveal
          className={hasHeader ? "mt-12 md:mt-16" : ""}
          delay={hasHeader ? 80 : 0}
        >
          {children}
        </Reveal>
      </div>
    </section>
  );
}

// A single sticky overlay control: tap to glide to the next section, anytime —
// long section or not. Hides itself near the very bottom of the page.
function NextSectionButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 240;
      setHidden(nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goNext = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]"),
    );
    // First section whose top is meaningfully below the viewport top.
    const next = sections.find((s) => s.getBoundingClientRect().top > 80);
    next?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <button
      type="button"
      onClick={goNext}
      aria-label="Επόμενη ενότητα"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={cn(
        "fixed bottom-5 left-1/2 z-30 inline-flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-paper/70 text-muted-foreground shadow-lg backdrop-blur transition-all duration-300 hover:text-ink",
        hidden
          ? "pointer-events-none translate-y-6 opacity-0"
          : "opacity-100",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </button>
  );
}
