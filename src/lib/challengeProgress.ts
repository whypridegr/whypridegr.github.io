// Which challenges the visitor has engaged with, kept in localStorage so the
// counter and the "done" ticks survive navigation (each challenge is its own
// page now, so this is the only thread tying the set together).

const KEY = "wp-challenges-done";

export function getDone(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function isDone(id: string): boolean {
  return getDone().includes(id);
}

export function markDone(id: string): string[] {
  const done = getDone();
  if (!done.includes(id)) {
    done.push(id);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      // Private mode / quota — progress just won't persist this session.
    }
  }
  return done;
}

/** A random challenge id the visitor hasn't finished, preferring fresh ones.
 *  Returns null only when every id is done. `exclude` skips the current page. */
export function pickNext(allIds: string[], exclude?: string): string | null {
  const done = new Set(getDone());
  const fresh = allIds.filter((id) => id !== exclude && !done.has(id));
  const pool = fresh.length ? fresh : allIds.filter((id) => id !== exclude);
  if (!pool.length) return null;
  // Index-based pick; the caller varies enough that a time-free random is fine.
  return pool[Math.floor(Math.random() * pool.length)];
}
