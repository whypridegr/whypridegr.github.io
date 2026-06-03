import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FlipCard } from "@/components/primitives/FlipCard";
import { Popover } from "@/components/primitives/Popover";
import { CiteList } from "@/components/primitives/CiteList";
import { GuessGreece } from "@/components/interactives/GuessGreece";
import { ReframeToggle } from "@/components/interactives/ReframeToggle";
import { PrivilegeVisualizer } from "@/components/interactives/PrivilegeVisualizer";
import { ReflectiveComment } from "@/components/interactives/ReflectiveComment";
import { HistoricalParallels } from "@/components/interactives/HistoricalParallels";
import { RightResponse } from "@/components/interactives/RightResponse";
import { SegregationSandbox } from "@/components/interactives/SegregationSandbox";
import { myths } from "@/content/myths";
import { scenarios } from "@/content/scenarios";
import { doubleStandards } from "@/content/doubleStandards";

type Challenge = {
  /** Stable slug, also used as the URL hash for direct sharing. */
  id: string;
  /** Short label shown on the launcher card. */
  label: string;
  /** One-line description of what the visitor will do. */
  blurb: string;
  /** Heading shown once the challenge is open. */
  title: string;
  icon: string;
  render: () => ReactNode;
};

const challenges: Challenge[] = [
  {
    id: "mythoi",
    label: "Μύθοι",
    blurb: "Γύρισε την κάρτα και δες την άλλη πλευρά.",
    title: "Γύρισέ τες. Δες την άλλη πλευρά.",
    icon: "♻︎",
    render: () => (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {myths.map((m, i) => (
          <div key={i} className="flex flex-col gap-2">
            <FlipCard item={m} />
            <div className="min-h-5 text-xs">
              {m.cite && (
                <Popover
                  label="ⓘ πηγές"
                  ariaLabel="Πηγές και τεκμηρίωση"
                  align="start"
                  triggerClassName="no-underline text-muted-foreground hover:text-accent"
                >
                  <CiteList cite={m.cite} />
                </Popover>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "pronomio",
    label: "Προνόμιο",
    blurb: "Διάλεξε όσα σε αντιπροσωπεύουν.",
    title: "Διάλεξε όσα σε αντιπροσωπεύουν.",
    icon: "◔",
    render: () => <PrivilegeVisualizer />,
  },
  {
    id: "diplo-metro",
    label: "Δύο μέτρα",
    blurb: "Πάτα τον διακόπτη και διάβασέ το δύο φορές.",
    title: "Πάτα τον διακόπτη και διάβασέ το δύο φορές.",
    icon: "⇄",
    render: () => <ReframeToggle items={doubleStandards} />,
  },
  {
    id: "prokatalipsi",
    label: "Προκατάληψη",
    blurb: "Ένα μικρό πείραμα για το πώς χτίζεται.",
    title: "Πώς λειτουργεί η προκατάληψη με ένα πείραμα.",
    icon: "◎",
    render: () => <SegregationSandbox />,
  },
  {
    id: "elsada",
    label: "Πού συνέβη;",
    blurb: "Μάντεψε σε ποια χώρα συνέβη το καθένα.",
    title: "Μάντεψε πού συνέβη.",
    icon: "⌖",
    render: () => <GuessGreece items={scenarios} />,
  },
  {
    id: "apantisi",
    label: "Η σωστή απάντηση",
    blurb: "Ένα υποθετικό σενάριο. Μπορεί να σου έχει τύχει.",
    title: "Υποθετικό σενάριο. Μπορεί να σου έχει τύχει.",
    icon: "✦",
    render: () => <RightResponse />,
  },
  {
    id: "palia",
    label: "Ιστορικά παράλληλα",
    blurb: "Το ίδιο επιχείρημα, άλλος στόχος κάθε εποχή.",
    title: "Το ίδιο επιχείρημα. Διαφορετικός στόχος χρονικά.",
    icon: "⧖",
    render: () => <HistoricalParallels />,
  },
  {
    id: "sxolio",
    label: "Σχόλιο",
    blurb: "Γράψε ένα σχόλιο. Ή σκέψου το λίγο ακόμα.",
    title: "Γράψε ένα σχόλιο. Ή σκέψου το λίγο ακόμα.",
    icon: "✎",
    render: () => <ReflectiveComment />,
  },
];

export function ChallengeHub() {
  const [active, setActive] = useState<string | null>(null);
  // The card that opened the current challenge, so focus can return to it on
  // close. The heading takes focus when a challenge opens (keyboard users land
  // on the new content instead of a vanished card).
  const originRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Open directly from a shared hash (#mythoi …) and keep the URL in sync so a
  // single challenge is shareable. Falls back to the grid for any other hash.
  // No element carries the challenge slug as its id, so the browser can't jump
  // to it natively — we scroll the hub into view ourselves, on mount and on any
  // later hash change.
  useEffect(() => {
    const fromHash = () => {
      const id = location.hash.replace(/^#/, "");
      const match = challenges.some((c) => c.id === id);
      setActive(match ? id : null);
      if (match) {
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        document
          .getElementById("provokliseis")
          ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Move focus to the open challenge's heading; restore it to the originating
  // card when the grid comes back.
  useEffect(() => {
    if (active) {
      headingRef.current?.focus({ preventScroll: true });
    } else {
      originRef.current?.focus?.();
      originRef.current = null;
    }
  }, [active]);

  const open = (id: string) => {
    originRef.current = document.activeElement as HTMLElement | null;
    setActive(id);
    history.replaceState(null, "", "#" + id);
  };

  const back = () => {
    setActive(null);
    history.replaceState(null, "", location.pathname);
  };

  const current = challenges.find((c) => c.id === active) ?? null;

  if (current) {
    return (
      <div>
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> Όλες οι προκλήσεις
        </button>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 font-display text-2xl md:text-4xl leading-tight reading-width outline-none"
        >
          {current.title}
        </h3>
        <div className="mt-10 md:mt-12">{current.render()}</div>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {challenges.map((c, i) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => open(c.id)}
            className={cn(
              "group flex h-full w-full flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left",
              "transition-colors hover:border-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span aria-hidden className="text-2xl leading-none">
                {c.icon}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <span className="font-display text-xl leading-snug">{c.label}</span>
            <span className="text-sm text-muted-foreground leading-relaxed">
              {c.blurb}
            </span>
            <span className="mt-auto pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-accent">
              Άνοιξε →
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
