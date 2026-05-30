import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  pickQuestions,
  scoreAnswers,
  resultTier,
  type Answers,
  type Option,
} from "@/lib/quiz";
import { allyQuizPool } from "@/content/allyQuiz";
import { AllyBadge } from "./AllyBadge";

const QUESTION_COUNT = 6;

type Phase = "start" | "quiz" | "result" | "badge";

export function AllyQuiz() {
  const reduce = useReducedMotion();
  // Draw + shuffle once per mount.
  const [questions] = useState(() =>
    pickQuestions(allyQuizPool, QUESTION_COUNT),
  );
  const [phase, setPhase] = useState<Phase>("start");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const current = questions[index];
  const chosenId = current ? answers[current.id] : undefined;
  const chosen = current?.options.find((o) => o.id === chosenId);
  const isLast = index === questions.length - 1;

  function answer(option: Option) {
    if (!current || answers[current.id]) return; // lock once answered
    setAnswers((a) => ({ ...a, [current.id]: option.id }));
  }

  function next() {
    if (isLast) setPhase("result");
    else setIndex((i) => i + 1);
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setPhase("quiz");
  }

  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.3 },
      };

  if (phase === "start") {
    return (
      <div className="reading-width">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Έξι σύντομες ερωτήσεις. Στο τέλος κερδίζεις ένα badge, ό,τι κι αν
          απαντήσεις.
        </p>
        <button
          onClick={() => setPhase("quiz")}
          className="mt-8 rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
        >
          Ξεκίνα το τεστ
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const score = scoreAnswers(questions, answers);
    const tier = resultTier(score);
    return (
      <div className="reading-width">
        <div className="pride-rule h-1 w-12 rounded-full" />
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Το αποτέλεσμά σου
        </p>
        <h3 className="mt-3 font-display text-3xl md:text-4xl">{tier.label}</h3>
        <p className="mt-4 text-lg leading-relaxed">{tier.message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setPhase("badge")}
            className="rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
          >
            Φτιάξε το badge σου →
          </button>
          <button
            onClick={restart}
            className="rounded-md border border-ink px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper"
          >
            ↺ Ξανά
          </button>
        </div>
      </div>
    );
  }

  if (phase === "badge") {
    return <AllyBadge onRestart={restart} />;
  }

  // phase === "quiz"
  return (
    <div className="reading-width">
      {/* progress */}
      <ol className="mb-10 flex gap-2" aria-label="Πρόοδος">
        {questions.map((q, i) => (
          <li
            key={q.id}
            aria-current={i === index ? "step" : undefined}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < index || answers[q.id]
                ? "bg-accent"
                : i === index
                  ? "bg-ink"
                  : "bg-border",
            )}
          />
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={current.id} {...fade}>
          <h3 className="font-display text-2xl md:text-3xl leading-snug">
            {current.prompt}
          </h3>

          <div className="mt-8 space-y-3">
            {current.options.map((o) => {
              const picked = chosenId === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => answer(o)}
                  disabled={!!chosenId}
                  aria-pressed={picked}
                  className={cn(
                    "block w-full rounded-lg border px-5 py-4 text-left text-lg transition-colors",
                    picked
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-ink disabled:opacity-50",
                  )}
                >
                  {o.text}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="min-h-[3.5rem]">
            <AnimatePresence>
              {chosen && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border-l-2 border-accent pl-4 leading-relaxed text-muted-foreground"
                >
                  {chosen.feedback}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {chosen && (
            <button
              onClick={next}
              className="mt-6 rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
            >
              {isLast ? "Δες το αποτέλεσμα" : "Επόμενη ερώτηση"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
