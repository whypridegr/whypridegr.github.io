import { challenges } from "@/components/sections/challengeRegistry";

/**
 * A single challenge rendered standalone for the /embed/[id] iframe widget:
 * the interactive plus a quiet attribution link back to the site.
 */
export function EmbedChallenge({ id }: { id: string }) {
  const c = challenges.find((x) => x.id === id);
  if (!c) return null;
  return (
    <article>
      <h1 className="font-display text-2xl md:text-3xl leading-tight">
        {c.title}
      </h1>
      <div className="mt-8">{c.render()}</div>
      <p className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">
        <a
          href={`https://whypride.gr/#${c.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent"
        >
          Γιατί υπάρχει Pride; · whypride.gr →
        </a>
      </p>
    </article>
  );
}
