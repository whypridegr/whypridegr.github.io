import { test, expect } from "bun:test";
import {
  DECK_PARAM,
  indexForId,
  idForIndex,
  clampIndex,
  nextIndex,
  prevIndex,
  isLastIndex,
  pickRandomIndex,
  parseDeckParam,
  deckUrl,
} from "@/lib/deckState";

const IDS = ["a", "b", "c", "d"];
const LEN = IDS.length;

test("indexForId / idForIndex round-trip", () => {
  expect(indexForId("c", IDS)).toBe(2);
  expect(indexForId("zzz", IDS)).toBe(-1);
  expect(indexForId(null, IDS)).toBe(-1);
  expect(idForIndex(2, IDS)).toBe("c");
  expect(idForIndex(99, IDS)).toBeNull();
});

test("clampIndex stays in range", () => {
  expect(clampIndex(-3, LEN)).toBe(0);
  expect(clampIndex(0, LEN)).toBe(0);
  expect(clampIndex(2, LEN)).toBe(2);
  expect(clampIndex(99, LEN)).toBe(LEN - 1);
});

test("next/prev clamp at the ends (no wrap)", () => {
  expect(nextIndex(0, LEN)).toBe(1);
  expect(nextIndex(LEN - 1, LEN)).toBe(LEN - 1);
  expect(prevIndex(2, LEN)).toBe(1);
  expect(prevIndex(0, LEN)).toBe(0);
});

test("isLastIndex", () => {
  expect(isLastIndex(LEN - 1, LEN)).toBe(true);
  expect(isLastIndex(0, LEN)).toBe(false);
});

test("pickRandomIndex never returns current and prefers unseen", () => {
  const seen = new Set([1]);
  expect(pickRandomIndex(0, seen, LEN, () => 0)).toBe(2);
  const allSeen = new Set([0, 2, 3]);
  expect(pickRandomIndex(1, allSeen, LEN, () => 0)).toBe(0);
  expect(pickRandomIndex(0, new Set(), 1, () => 0)).toBe(0);
});

test("parseDeckParam only accepts known ids", () => {
  expect(parseDeckParam("?c=c", IDS)).toBe("c");
  expect(parseDeckParam("?c=nope", IDS)).toBeNull();
  expect(parseDeckParam("", IDS)).toBeNull();
  expect(DECK_PARAM).toBe("c");
});

test("deckUrl reflects id and preserves other query params", () => {
  expect(deckUrl("c")).toBe("/?c=c");
  expect(deckUrl("c", "?x=1", "/foo")).toBe("/foo?x=1&c=c");
  expect(deckUrl("d", "?c=a&x=1")).toBe("/?c=d&x=1");
});
