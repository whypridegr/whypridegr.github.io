// PostHog analytics — thin, guarded wrapper.
//
// The project key (phc_…) is public by design: it ships in the browser bundle.
// We still read it from a PUBLIC_ env var so US↔EU or key rotation is a config
// change, never a code change. No session recordings, EU host by default.
import posthog from "posthog-js";

let started = false;

/** Reduce a URL to non-identifying parts: host + path, no query/hash. */
export function sanitizeHref(href: string): { host: string; path: string } | null {
  try {
    const u = new URL(href);
    return { host: u.host, path: u.pathname };
  } catch {
    return null;
  }
}

/** Trim and collapse link/button text, capped — never ship long DOM strings. */
export function cleanLabel(text: string | null | undefined, max = 80): string {
  return (text ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Initialise PostHog once. No-op on the server, or when no key is configured
 * (e.g. local dev without an .env) so the site never breaks without analytics.
 */
export function initAnalytics(): boolean {
  if (started) return true;
  if (typeof window === "undefined") return false;

  const key = import.meta.env.PUBLIC_POSTHOG_KEY;
  if (!key) return false;

  const host =
    import.meta.env.PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  posthog.init(key, {
    api_host: host,
    // Pin SDK defaults so a posthog-js bump can't silently change behaviour.
    defaults: "2025-05-24",
    // Anonymous-by-default: don't create person profiles until/unless we
    // identify someone (we don't). Lighter + friendlier for GDPR.
    person_profiles: "identified_only",
    // Consent-gated: initialise, but capture nothing until the visitor
    // accepts via the banner (grantConsent). Keeps us opt-in for GDPR.
    opt_out_capturing_by_default: true,
    // Events only — no replay.
    disable_session_recording: true,
    // Autocapture clicks (the "where do they tap" signal) + page views.
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
  });

  started = true;
  return true;
}

/** Capture a custom event. No-op (dropped) until initAnalytics() has succeeded. */
export function capture(
  event: string,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !started) return;
  posthog.capture(event, props);
}

/** Did PostHog actually boot? (No key / SSR → no banner needed.) */
export function analyticsActive(): boolean {
  return started;
}

/** Has the visitor already accepted or declined? (controls the banner.)
 *  We must read the *explicit* tri-state here: with opt_out_by_default,
 *  has_opted_out_capturing() is already true for an undecided visitor, so
 *  has_opted_in||has_opted_out is always true and would hide the banner from
 *  everyone. "pending" means no choice has been made yet. */
export function consentDecided(): boolean {
  if (typeof window === "undefined" || !started) return false;
  return posthog.get_explicit_consent_status() !== "pending";
}

/** Visitor accepted: start capturing (and remember the choice). */
export function grantConsent(): void {
  if (!started) return;
  posthog.opt_in_capturing();
}

/** Visitor declined: stay opted out (and remember the choice). */
export function denyConsent(): void {
  if (!started) return;
  posthog.opt_out_capturing();
}

export { posthog };
