import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Popover } from "@/components/primitives/Popover";
import { Modal } from "@/components/primitives/Modal";

const COLS = 16;
const ROWS = 16;
const SIZE = COLS * ROWS;
const EMPTY = 0;
const A = 1;
const B = 2;
const MAX_STEPS = 200;
const MAX_RUN_MS = 12000; // hard wall-clock cap so a high threshold can't run forever
const STAGNATION_STEPS = 12; // stop once the segregation metric stops moving
// Discrete, tap-to-select thresholds (no drag). Kept inside 30–60% so the demo
// always settles into a legible split rather than the extremes.
const THRESHOLDS = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];
const DEFAULT_THRESHOLD = 0.35;

function makeGrid(): number[] {
  return Array.from({ length: SIZE }, () => {
    const r = Math.random();
    return r < 0.1 ? EMPTY : r < 0.55 ? A : B;
  });
}

function buildNeighbors(): number[][] {
  const all: number[][] = [];
  for (let i = 0; i < SIZE; i++) {
    const x = i % COLS;
    const y = Math.floor(i / COLS);
    const list: number[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS)
          list.push(ny * COLS + nx);
      }
    }
    all.push(list);
  }
  return all;
}

function happy(
  grid: number[],
  i: number,
  nb: number[][],
  threshold: number,
): boolean {
  const t = grid[i];
  if (t === EMPTY) return true;
  let same = 0;
  let occ = 0;
  for (const n of nb[i]) {
    if (grid[n] === EMPTY) continue;
    occ++;
    if (grid[n] === t) same++;
  }
  if (occ === 0) return true;
  return same / occ >= threshold;
}

function segregation(grid: number[], nb: number[][]): number {
  let total = 0;
  let sum = 0;
  for (let i = 0; i < SIZE; i++) {
    if (grid[i] === EMPTY) continue;
    let same = 0;
    let occ = 0;
    for (const n of nb[i]) {
      if (grid[n] === EMPTY) continue;
      occ++;
      if (grid[n] === grid[i]) same++;
    }
    if (occ > 0) {
      total++;
      sum += same / occ;
    }
  }
  return total ? sum / total : 0;
}

function step(
  grid: number[],
  nb: number[][],
  threshold: number,
): { next: number[]; moved: number } {
  const next = grid.slice();
  const empties: number[] = [];
  for (let i = 0; i < SIZE; i++) if (next[i] === EMPTY) empties.push(i);

  const unhappy: number[] = [];
  for (let i = 0; i < SIZE; i++) {
    if (grid[i] !== EMPTY && !happy(grid, i, nb, threshold)) unhappy.push(i);
  }
  // shuffle unhappy (Fisher-Yates)
  for (let i = unhappy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unhappy[i], unhappy[j]] = [unhappy[j], unhappy[i]];
  }

  let moved = 0;
  for (const u of unhappy) {
    if (empties.length === 0) break;
    const eIdx = Math.floor(Math.random() * empties.length);
    const e = empties[eIdx];
    next[e] = next[u];
    next[u] = EMPTY;
    empties[eIdx] = u; // u is now empty, e is now filled
    moved++;
  }
  return { next, moved };
}

export function SegregationSandbox() {
  const nb = useMemo(buildNeighbors, []);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [grid, setGrid] = useState<number[]>(makeGrid);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  // Bumped on every threshold pick so the run effect restarts cleanly on a fresh
  // grid — even when the same percentage is tapped twice.
  const [runId, setRunId] = useState(0);
  // The conclusion shows as a modal once the simulation settles. Tied to `done`
  // so it pops once per completed run (the first auto-run, then any deliberate
  // re-run) rather than nagging on every state change.
  const [showConclusion, setShowConclusion] = useState(false);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const seg = useMemo(() => segregation(grid, nb), [grid, nb]);

  // Surface the conclusion modal whenever a run settles. A run only starts on a
  // deliberate action (picking a percentage or pressing "Τρέξε") — never on
  // scroll-into-view, so the modal never pops uninvited.
  useEffect(() => {
    if (done) setShowConclusion(true);
  }, [done]);

  useEffect(() => {
    if (!running) return;

    // Always animate the run at a readable cadence — even under
    // prefers-reduced-motion. This is an opt-in, user-triggered educational
    // simulation (it only starts on "Τρέξε"), so watching the split form IS the
    // content; collapsing it to an instant jump defeats the point. The bounds
    // below still guarantee it terminates.
    let steps = 0;
    let stagnant = 0;
    let prevSeg = segregation(gridRef.current, nb);
    const startedAt = performance.now();
    const id = setInterval(() => {
      const { next, moved } = step(gridRef.current, nb, threshold);
      gridRef.current = next;
      setGrid(next);
      steps++;

      // At a high threshold the system can oscillate forever (unhappy agents
      // keep swapping without ever all settling). Stop once the segregation
      // metric plateaus, or after a hard time/step cap, so it always finishes.
      const segNow = segregation(next, nb);
      stagnant = Math.abs(segNow - prevSeg) < 0.005 ? stagnant + 1 : 0;
      prevSeg = segNow;

      if (
        moved === 0 ||
        steps >= MAX_STEPS ||
        stagnant >= STAGNATION_STEPS ||
        performance.now() - startedAt > MAX_RUN_MS
      ) {
        setRunning(false);
        setDone(true);
      }
    }, 220);
    return () => clearInterval(id);
  }, [running, threshold, runId, nb]);

  // Picking a percentage does the whole thing in one tap: fresh grid + run. Many
  // visitors didn't realise they had to press "Τρέξε" after choosing, so the
  // choice itself now starts the simulation.
  const pickThreshold = (v: number) => {
    setThreshold(v);
    setDone(false);
    setGrid(makeGrid());
    setRunId((n) => n + 1);
    setRunning(true);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-start">
      {/* The grid */}

      <div
        role="img"
        aria-label={`Πλέγμα προσομοίωσης δύο ομάδων. Διαχωρισμός ${Math.round(
          seg * 100,
        )}%.`}
        className="mx-auto grid w-full max-w-[28rem] gap-px overflow-hidden rounded-md bg-border p-px"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {grid.map((c, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center bg-muted"
          >
            {c !== EMPTY && (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className={cn(
                  "h-[78%] w-[78%] transition-colors duration-200",
                  c === A ? "text-pride-1" : "text-pride-5",
                )}
              >
                <circle cx="12" cy="7" r="4.2" />
                <path d="M3.6 21c0-4.6 3.8-7.6 8.4-7.6s8.4 3 8.4 7.6Z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-6 lg:sticky lg:top-24">
        <div>
          <span id="seg-threshold-label" className="block text-sm leading-relaxed">
            Πόσο «όμοιους» γείτονες θέλει το κάθε ανθρωπάκι;
          </span>
          <div className="mt-1 font-display text-3xl text-accent">
            {Math.round(threshold * 100)}%
          </div>
          <div
            role="group"
            aria-labelledby="seg-threshold-label"
            className="mt-2 flex flex-wrap gap-2"
          >
            {THRESHOLDS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => pickThreshold(v)}
                aria-pressed={threshold === v}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  threshold === v
                    ? "border-accent bg-accent text-paper"
                    : "border-border hover:border-ink",
                )}
              >
                {Math.round(v * 100)}%
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Διάλεξε ένα ποσοστό και η προσομοίωση ξεκινά αμέσως.
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Διαχωρισμός
            <Popover
              label="ⓘ"
              ariaLabel="Πηγή και επεξήγηση"
              align="end"
              triggerClassName="no-underline text-muted-foreground"
            >
              Δείχνει πόσοι γείτονες, κατά μέσο όρο, ανήκουν στην ίδια ομάδα. Το
              πείραμα βασίζεται στο μοντέλο διαχωρισμού του Thomas Schelling
              (1971).{" "}
              <a
                href="https://www.tandfonline.com/doi/abs/10.1080/0022250X.1971.9989794"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                Η αρχική μελέτη
              </a>
              .
            </Popover>
          </div>
          <p className="mt-1 font-display text-4xl">{Math.round(seg * 100)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            γείτονες ίδιας ομάδας, κατά μέσο όρο
          </p>
        </div>
      </div>

      {/* Conclusion — appears as a modal once the simulation has settled, so a
          first-time visitor understands what they just watched. */}
      <Modal
        open={showConclusion}
        onClose={() => setShowConclusion(false)}
        label="Τι μόλις είδες"
      >
        <div className="pride-rule mb-6 h-1 w-12 rounded-full" />
        <p className="text-lg leading-relaxed">
          Κανένας από τους κατοίκους δεν «μισούσε» τον διπλανό του. Ήθελαν απλώς
          να μην είναι υπερβολικά μειοψηφία στη γειτονιά τους. Κι όμως, μια{" "}
          <span className="text-ink">μικρή</span> προτίμηση αρκεί για να χωρίσει
          τον κόσμο στα δύο, χωρίς να το αποφασίσει ποτέ κανείς.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Αυτό είναι το μοντέλο διαχωρισμού του Thomas Schelling (1971): η
          προκατάληψη δεν χρειάζεται μίσος, μόνο πολλές μικρές «λογικές» επιλογές.
        </p>
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowConclusion(false)}
            className="rounded-md border border-ink px-5 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
          >
            Το σκέφτηκα
          </button>
        </div>
      </Modal>
    </div>
  );
}
