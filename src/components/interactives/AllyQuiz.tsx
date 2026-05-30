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
import { Popover } from "@/components/primitives/Popover";
import { CiteList } from "@/components/primitives/CiteList";
import { AllyBadge } from "./AllyBadge";

const QUESTION_COUNT = 6;

type Phase = "quiz" | "result" | "badge";

export function AllyQuiz() {
  const reduce = useReducedMotion();
  // Draw + shuffle once per mount.
  const [questions] = useState(() =>
    pickQuestions(allyQuizPool, QUESTION_COUNT),
  );
  const [phase, setPhase] = useState<Phase>("quiz");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const current = questions[index];
  const chosenId = current ? answers[current.id] : undefined;
  const chosen = current?.options.find((o) => o.id === chosenId);
  const isLast = index === questions.length - 1;

  // You can change your mind on the current question: re-clicking overwrites the
  // answer (last pick wins) and refreshes the feedback. No going back, though.
  function answer(option: Option) {
    if (!current) return;
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
              "h-1.5 flex-1 overflow-hidden rounded-full transition-colors",
              i === index
                ? "pride-rule"
                : i < index || answers[q.id]
                  ? "bg-accent"
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
                  aria-pressed={picked}
                  className={cn(
                    "block w-full rounded-lg border px-5 py-4 text-left text-lg transition-colors",
                    picked
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-ink",
                  )}
                >
                  {o.text}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="min-h-[3.5rem]">
            <AnimatePresence mode="wait">
              {chosen && (
                <motion.div
                  key={chosen.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  className="mt-6 border-l-2 border-accent pl-4 leading-relaxed text-muted-foreground"
                >
                  {chosen.feedback}
                  {chosen.cite && (
                    <Popover
                      label="ⓘ"
                      ariaLabel="Πηγή"
                      align="start"
                      triggerClassName="ml-2 no-underline text-muted-foreground"
                    >
                      <CiteList cite={chosen.cite} />
                    </Popover>
                  )}
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
