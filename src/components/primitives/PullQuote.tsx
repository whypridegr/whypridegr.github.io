import { cn } from "@/lib/utils";

export function PullQuote({
  quote,
  attribution,
  className,
}: {
  quote: string;
  attribution: string;
  className?: string;
}) {
  return (
    <figure className={cn("border-l-2 border-accent pl-6 py-2", className)}>
      <blockquote className="font-display text-2xl md:text-3xl leading-tight text-ink">
        “{quote}”
      </blockquote>
      <figcaption className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        {attribution}
      </figcaption>
    </figure>
  );
}
