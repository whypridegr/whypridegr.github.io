import { describe, it, expect } from "bun:test";
import {
  pickQuestions,
  scoreAnswers,
  resultTier,
  type Question,
} from "./quiz";

// Fixed fixture with known IDs and score ranges.
const POOL: Question[] = [
  {
    id: "q1",
    category: "Ορολογία",
    prompt: "p1",
    options: [
      { id: "q1a", text: "a", score: 2, feedback: "" }, // max
      { id: "q1b", text: "b", score: 1, feedback: "" },
      { id: "q1c", text: "c", score: -2, feedback: "" }, // min (harmful)
    ],
  },
  {
    id: "q2",
    category: "Προνόμιο",
    prompt: "p2",
    options: [
      { id: "q2a", text: "a", score: 2, feedback: "" }, // max
      { id: "q2b", text: "b", score: -2, feedback: "" }, // min
    ],
  },
  {
    id: "q3",
    category: "Καθημερινότητα",
    prompt: "p3",
    options: [
      { id: "q3a", text: "a", score: 2, feedback: "" },
      { id: "q3b", text: "b", score: -2, feedback: "" },
    ],
  },
];

// Deterministic rng: cycles through a fixed sequence in [0,1).
function seededRng(seq: number[]): () => number {
  let i = 0;
  return () => seq[i++ % seq.length];
}

describe("pickQuestions", () => {
  it("returns n distinct questions without mutating the pool", () => {
    const snapshot = structuredClone(POOL);
    const picked = pickQuestions(POOL, 2, seededRng([0.1, 0.6, 0.3, 0.9]));
    expect(picked).toHaveLength(2);
    const ids = picked.map((q) => q.id);
    expect(new Set(ids).size).toBe(2);
    // pool untouched (no in-place shuffle of questions or options)
    expect(POOL).toEqual(snapshot);
  });

  it("throws when n exceeds the pool size", () => {
    expect(() => pickQuestions(POOL, POOL.length + 1)).toThrow();
  });
});

describe("scoreAnswers (normalized against the selected questions' range)", () => {
  it("returns 100 when every answer is the max-score option", () => {
    const answers = { q1: "q1a", q2: "q2a", q3: "q3a" };
    expect(scoreAnswers(POOL, answers)).toBe(100);
  });

  it("returns 0 when every answer is the min-score option", () => {
    const answers = { q1: "q1c", q2: "q2b", q3: "q3b" };
    expect(scoreAnswers(POOL, answers)).toBe(0);
  });

  it("returns a middle score for mixed answers", () => {
    // raw: q1a(2) + q2a(2) + q3b(-2) = 2 ; min=-6, max=6 -> (2--6)/12*100 = 66.67
    const answers = { q1: "q1a", q2: "q2a", q3: "q3b" };
    const s = scoreAnswers(POOL, answers);
    expect(s).toBeGreaterThan(60);
    expect(s).toBeLessThan(75);
  });
});

describe("resultTier", () => {
  it("maps high/mid/low and low is only reached by very low scores", () => {
    expect(resultTier(100).key).toBe("high");
    expect(resultTier(0).key).toBe("low");
    // a single sub-optimal answer should not drop a user to 'low'
    expect(resultTier(66).key).not.toBe("low");
  });

  it("returns Greek copy, not bare keys", () => {
    const t = resultTier(100);
    expect(t.label.length).toBeGreaterThan(0);
    expect(t.message.length).toBeGreaterThan(0);
  });
});
