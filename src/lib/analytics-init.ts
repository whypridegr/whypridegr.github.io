// Runs once per page load (wired from Layout.astro). Boots PostHog, then
// installs three lightweight, framework-agnostic trackers so we don't have to
// touch every component:
//   - section_viewed     which sections people actually reach
//   - widget_interacted  which sections they engage with (not just scroll past)
//   - outbound_click     which external links / sources they follow
import { initAnalytics, capture, sanitizeHref, cleanLabel } from "./analytics";

if (initAnalytics()) {
  installSectionTracking();
  installInteractionTracking();
  installOutboundTracking();
}

// Fire once when a section scrolls meaningfully into view.
function installSectionTracking(): void {
  const sections = document.querySelectorAll<HTMLElement>("main section[id]");
  if (!sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        capture("section_viewed", { section: entry.target.id });
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );
  sections.forEach((s) => io.observe(s));
}

// Fire once per section when the visitor first operates a control inside it.
function installInteractionTracking(): void {
  const engaged = new Set<string>();
  const isControl = (el: Element | null) =>
    el?.closest("button, a, input, select, summary, [role='button']");

  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element | null;
      if (!isControl(target)) return;
      const section = target?.closest<HTMLElement>("section[id]");
      if (!section || engaged.has(section.id)) return;
      engaged.add(section.id);
      capture("widget_interacted", { section: section.id });
    },
    true,
  );
}

// Fire on clicks to links that leave the site (external sources, citations).
function installOutboundTracking(): void {
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!a) return;
      const href = a.href;
      if (!/^https?:/i.test(href)) return; // skip mailto:, #anchors, etc.
      if (a.host === window.location.host) return; // internal navigation

      const parts = sanitizeHref(href);
      capture("outbound_click", {
        host: parts?.host,
        path: parts?.path,
        text: cleanLabel(a.textContent),
      });
    },
    true,
  );
}
