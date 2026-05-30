// Pure quiz logic — no React, no DOM. The flow component owns state; this owns the math.

export type Category = "Ορολογία" | "Προνόμιο" | "Καθημερινότητα";

export type Option = {
  id: string;
  text: string;
  score: number;
  /** Shown after the user picks this option. */
  feedback: string;
};

export type Question = {
  id: string;
  category: Category;
  prompt: string;
  options: Option[];
};

/** questionId -> chosen optionId */
export type Answers = Record<string, string>;

export type TierKey = "high" | "mid" | "low";
export type Tier = { key: TierKey; label: string; message: string };

// Fisher-Yates over a copy, using an injectable rng for deterministic tests.
function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick `n` distinct questions and shuffle each question's options.
 * Non-mutating: the source pool and its option arrays are never touched.
 * Throws if `n` exceeds the pool size.
 */
export function pickQuestions(
  pool: Question[],
  n: number,
  rng: () => number = Math.random,
): Question[] {
  if (n > pool.length) {
    throw new Error(`pickQuestions: requested ${n} but pool has ${pool.length}`);
  }
  return shuffled(pool, rng)
    .slice(0, n)
    .map((q) => ({ ...q, options: shuffled(q.options, rng) }));
}

/**
 * Normalize the answers to 0–100 against the selected questions' own min/max
 * option scores — so a run is scored fairly regardless of which questions were
 * drawn or how each is weighted. Unanswered questions contribute their min.
 */
export function scoreAnswers(selected: Question[], answers: Answers): number {
  let raw = 0;
  let minPossible = 0;
  let maxPossible = 0;

  for (const q of selected) {
    const scores = q.options.map((o) => o.score);
    const lo = Math.min(...scores);
    const hi = Math.max(...scores);
    minPossible += lo;
    maxPossible += hi;

    const chosen = q.options.find((o) => o.id === answers[q.id]);
    raw += chosen ? chosen.score : lo;
  }

  const span = maxPossible - minPossible;
  if (span === 0) return 100;
  return Math.round(((raw - minPossible) / span) * 100);
}

const TIERS: Tier[] = [
  {
    key: "high",
    label: "Είσαι ήδη σύμμαχος",
    message:
      "Ακούς, σέβεσαι και δεν χρειάζεσαι χειροκρότημα γι' αυτό. Κράτα το έτσι — και πάρε το badge σου.",
  },
  {
    key: "mid",
    label: "Σχεδόν εκεί",
    message:
      "Τα βασικά τα έχεις. Μένουν μία-δυο αφορμές για σκέψη, και αυτό είναι εντελώς φυσιολογικό. Πάρε και το badge σου.",
  },
  {
    key: "low",
    label: "Αξίζει μια δεύτερη ματιά",
    message:
      "Κάποιες απαντήσεις πατάνε πάνω σε στερεότυπα που πονάνε. Καμία ντροπή — γι' αυτό υπάρχει αυτή η σελίδα. Το badge σου σε περιμένει έτσι κι αλλιώς.",
  },
];

/** Gentle thresholds: `low` only for genuinely harmful runs. */
export function resultTier(score: number): Tier {
  if (score >= 70) return TIERS[0];
  if (score >= 40) return TIERS[1];
  return TIERS[2];
}
