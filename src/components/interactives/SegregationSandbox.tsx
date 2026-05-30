import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Popover } from "@/components/primitives/Popover";

const COLS = 16;
const ROWS = 16;
const SIZE = COLS * ROWS;
const EMPTY = 0;
const A = 1;
const B = 2;
const MAX_STEPS = 200;
const MAX_RUN_MS = 12000; // hard wall-clock cap so a high threshold can't run forever
const STAGNATION_STEPS = 12; // stop once the segregation metric stops moving

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
  const [threshold, setThreshold] = useState(0.35);
  const [grid, setGrid] = useState<number[]>(makeGrid);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [done, setDone] = useState(false);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const rootRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);

  const seg = useMemo(() => segregation(grid, nb), [grid, nb]);

  // Kick the simulation off on its own the first time it scrolls into view,
  // after a short beat so the section settles first.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !autoStarted.current) {
            autoStarted.current = true;
            io.disconnect();
            timer = window.setTimeout(() => {
              setDone(false);
              setRunning(true);
            }, 300);
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!running) return;

    if (reduced) {
      let g = gridRef.current;
      for (let s = 0; s < 200; s++) {
        const r = step(g, nb, threshold);
        g = r.next;
        if (r.moved === 0) break;
      }
      setGrid(g);
      setRunning(false);
      setDone(true);
      return;
    }

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
  }, [running, reduced, threshold, nb]);

  const toggleRun = () => {
    if (running) {
      setRunning(false);
    } else {
      setDone(false);
      setRunning(true);
    }
  };

  const reshuffle = () => {
    setRunning(false);
    setDone(false);
    setGrid(makeGrid());
  };

  return (
    <div
      ref={rootRef}
      className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-start"
    >
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
          <label
            htmlFor="seg-threshold"
            className="block text-sm leading-relaxed"
          >
            Πόσο «όμοιους» γείτονες θέλει το κάθε ανθρωπάκι;
          </label>
          <div className="mt-1 font-display text-3xl text-accent">
            {Math.round(threshold * 100)}%
          </div>
          <input
            id="seg-threshold"
            type="range"
            min={0}
            max={0.8}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleRun}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm uppercase tracking-[0.15em] text-paper transition-colors hover:bg-accent"
          >
            {running ? (
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="currentColor"
                aria-hidden
              >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {running ? "Παύση" : "Τρέξε"}
          </button>
          <button
            onClick={reshuffle}
            className="inline-flex items-center gap-2 rounded-md border border-ink px-4 py-2 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Ανακάτεψε
          </button>
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

      {/* Punchline — appears only after the simulation has settled */}
      {done && (
        <p className="lg:col-span-2 reading-width leading-relaxed text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
          Κανένας δεν «μισεί» τον διπλανό του. Ζητούν απλώς να μην είναι
          υπερβολικά μειοψηφία στη γειτονιά τους. Κι όμως, ακόμα και μια{" "}
          <span className="text-ink">μικρή</span> προτίμηση έφτιαξε έναν κόσμο
          σχεδόν εντελώς χωρισμένο, χωρίς να το αποφάσισε ποτέ κανείς. Έτσι
          λειτουργεί και η προκατάληψη: όχι ως μίσος, αλλά ως άθροισμα μικρών,
          «λογικών» επιλογών.
        </p>
      )}
    </div>
  );
}
