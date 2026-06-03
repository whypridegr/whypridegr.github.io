import type { ReactNode } from "react";
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

export type Challenge = {
  /** Stable slug: the in-page hash (#mythoi) and the /embed/[id] route. */
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

export const challenges: Challenge[] = [
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

export const challengeIds = challenges.map((c) => c.id);
