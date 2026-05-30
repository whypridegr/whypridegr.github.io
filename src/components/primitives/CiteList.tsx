import type { Cite } from "@/content/cite";

/**
 * Renders a {@link Cite} as the body of a Popover: the note paragraph followed
 * by any source links. Keeps the link markup in one place so every section
 * (myths, parallels, timeline) cites the same way.
 */
export function CiteList({ cite }: { cite: Cite }) {
  return (
    <>
      <p className="leading-relaxed">{cite.note}</p>
      {cite.links && cite.links.length > 0 && (
        <ul className="mt-3 space-y-1">
          {cite.links.map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
