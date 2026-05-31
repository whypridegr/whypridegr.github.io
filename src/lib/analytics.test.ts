import { describe, it, expect, mock } from "bun:test";

// Keep posthog-js out of the test — we only verify our own wrapper logic.
const calls: { method: string; args: unknown[] }[] = [];
mock.module("posthog-js", () => ({
  default: {
    init: (...args: unknown[]) => calls.push({ method: "init", args }),
    capture: (...args: unknown[]) => calls.push({ method: "capture", args }),
  },
}));

const { sanitizeHref, cleanLabel, capture } = await import("./analytics");

describe("sanitizeHref", () => {
  it("keeps host + path, drops query and hash", () => {
    expect(sanitizeHref("https://x.com/a/b?email=me@x.com#frag")).toEqual({
      host: "x.com",
      path: "/a/b",
    });
  });

  it("returns null for non-URLs", () => {
    expect(sanitizeHref("#anchor")).toBeNull();
  });
});

describe("cleanLabel", () => {
  it("collapses whitespace and caps length", () => {
    expect(cleanLabel("  hello   world  ")).toBe("hello world");
    expect(cleanLabel("x".repeat(200)).length).toBe(80);
    expect(cleanLabel(null)).toBe("");
  });
});

describe("capture", () => {
  it("no-ops before init (does not throw, sends nothing)", () => {
    capture("test_event", { a: 1 });
    expect(calls.some((c) => c.method === "capture")).toBe(false);
  });
});
