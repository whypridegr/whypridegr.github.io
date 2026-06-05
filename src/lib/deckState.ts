// Pure deck navigation logic. No React, no registry imports — callers pass the
// id list / length so this stays trivially testable and dependency-free.

export const DECK_PARAM = "c";

export function indexForId(id: string | null, ids: string[]): number {
  if (!id) return -1;
  return ids.indexOf(id);
}

export function idForIndex(index: number, ids: string[]): string | null {
  return ids[index] ?? null;
}

export function clampIndex(index: number, len: number): number {
  if (len <= 0) return 0;
  return Math.max(0, Math.min(index, len - 1));
}

export function nextIndex(index: number, len: number): number {
  return clampIndex(index + 1, len);
}

export function prevIndex(index: number, len: number): number {
  return clampIndex(index - 1, len);
}

export function isLastIndex(index: number, len: number): boolean {
  return index >= len - 1;
}

/**
 * A random index != current, preferring ones not in `seen`. Falls back to any
 * non-current index when everything else is seen. Returns `current` only when
 * there is nothing else to pick (len <= 1). `randomFn` is injectable for tests.
 */
export function pickRandomIndex(
  current: number,
  seen: ReadonlySet<number>,
  len: number,
  randomFn: () => number = Math.random,
): number {
  if (len <= 1) return current;
  const all = Array.from({ length: len }, (_, i) => i).filter((i) => i !== current);
  const fresh = all.filter((i) => !seen.has(i));
  const pool = fresh.length ? fresh : all;
  return pool[Math.floor(randomFn() * pool.length)];
}

/** Active id from a URL search string ("?c=mythoi"), or null if absent/unknown. */
export function parseDeckParam(search: string, ids: string[]): string | null {
  const id = new URLSearchParams(search).get(DECK_PARAM);
  return id && ids.includes(id) ? id : null;
}

/** Relative URL reflecting the active id, preserving any other query params. */
export function deckUrl(id: string, search = "", pathname = "/"): string {
  const params = new URLSearchParams(search);
  params.set(DECK_PARAM, id);
  return `${pathname}?${params.toString()}`;
}
