import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/components/site/Link";
import { Accordion } from "@/components/primitives/Accordion";
import { Reveal } from "@/components/primitives/Reveal";
import { GlossarySection } from "@/components/sections/GlossarySection";
import { Timeline } from "@/components/sections/Timeline";
import { HandoffSentinel } from "@/components/site/HandoffSentinel";
import { faq } from "@/content/faq";
import { sources } from "@/content/sources";

export function HomeContent() {
  useScrollHash();
  return (
    <>
      <Hero />

      {/* — Questions first: the thing people actually come with. Right after
          them, the deck takes over (for visitors who scroll instead of tapping
          "Πάμε"). — */}
      <Section
        id="erotiseis"
        title="Δύσκολες ερωτήσεις και οι απαντήσεις τους."
      >
        <Accordion
          items={faq}
          initialVisible={4}
          secondaryAction={{
            label: "Συχνές αντιρρήσεις",
            href: "/objections",
          }}
        />
      </Section>

      {/* Keep scrolling past the questions and the deck takes over — no button,
          just a guided handoff (animated by the global view transition). Only
          for first-timers: once someone has seen the challenges it stays out of
          the way, so the reference material below is freely scrollable. */}
      <HandoffSentinel
        to="/prokliseis"
        label="Συνέχισε στις προκλήσεις"
        suppressKey="wp-deck-seen"
      />

      {/* The scroll-handoff is unreliable on touch, so phones get an explicit
          tap target. Mirrors the sentinel's suppressKey: once the deck's been
          seen, the reference material below is meant to scroll freely. */}
      <MobileHandoffCta suppressKey="wp-deck-seen" />

      {/* — Reference material: the calm, informative side of the home. Sits
          below the handoff, reachable once you're no longer being guided. — */}
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

      <Section id="piges" title="Όλα όσα διάβασες, με links.">
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

// A visible, mobile-only handoff to the challenges. The swipe-based
// HandoffSentinel rarely fires on touch, so phones get a plain link. Hidden on
// sm+ (the guided scroll handles desktop) and once the deck has been seen.
function MobileHandoffCta({ suppressKey }: { suppressKey: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(suppressKey)) setShow(true);
    } catch {
      setShow(true); // private mode — treat as not-yet-seen
    }
  }, [suppressKey]);

  if (!show) return null;
  return (
    <div className="flex justify-center px-6 pb-16 sm:hidden">
      <a
        href="/prokliseis"
        className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-sm uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Συνέχισε στις προκλήσεις
        <span aria-hidden className="text-base leading-none">
          →
        </span>
      </a>
    </div>
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
        <h1 className="mt-8 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight reading-width">
          Γιατί υπάρχει Pride;
        </h1>
        <p className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Έλα να το δούμε ψύχραιμα.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/prokliseis"
            className="px-6 py-3 text-sm uppercase tracking-[0.2em] bg-ink text-paper rounded-md hover:bg-accent transition-colors"
          >
            Πάμε
          </a>
          <a
            href="/quiz"
            className="px-6 py-3 text-sm uppercase tracking-[0.2em] border border-ink rounded-md hover:bg-ink hover:text-paper transition-colors"
          >
            Δες πόσο σύμμαχος είσαι
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
              <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight reading-width text-balance">
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
  // Show only once the visitor has engaged with the section they're currently
  // reading — and only if there's a next one. Sticky, but never pushy.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const interacted = new Set<string>();
    const sections = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>("section[id]"),
      ).filter((s) => !s.id.startsWith("deck-"));

    const currentSection = () => {
      let cur: HTMLElement | null = null;
      for (const s of sections()) {
        if (s.getBoundingClientRect().top <= 140) cur = s;
      }
      return cur;
    };

    const hasNext = (cur: HTMLElement | null) => {
      if (!cur) return false;
      const list = sections();
      const idx = list.indexOf(cur);
      return idx >= 0 && idx < list.length - 1;
    };

    const evaluate = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 240;
      const cur = currentSection();
      setVisible(
        !!cur && interacted.has(cur.id) && hasNext(cur) && !nearBottom,
      );
    };

    const onClick = (e: MouseEvent) => {
      const id = (e.target as HTMLElement)?.closest?.("section[id]")?.id;
      if (id) {
        interacted.add(id);
        evaluate();
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    evaluate();
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, []);

  const goNext = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]"),
    ).filter((s) => !s.id.startsWith("deck-"));
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
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-5 left-1/2 z-30 inline-flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-paper/70 text-muted-foreground shadow-lg backdrop-blur transition-all duration-300 hover:text-ink",
        visible ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0",
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
