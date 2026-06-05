import { sources } from "@/content/sources";

export function SourcesContent() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
      <h1 className="font-display text-5xl md:text-7xl leading-[1.05] reading-width text-balance">
        Πού βασιζόμαστε.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
        Κάθε στοιχείο σε αυτή τη σελίδα μπορεί να επαληθευτεί. Αν βρεις κάτι
        λάθος, στείλε μας και θα το διορθώσουμε.
      </p>

      <ul className="mt-16 divide-y divide-border border-y border-border">
        {sources.map((s) => (
          <li key={s.url} className="py-8 grid md:grid-cols-[200px_1fr] gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {s.org}
            </p>
            <div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl hover:text-accent underline-offset-4 hover:underline"
              >
                {s.title}
              </a>
              {s.note && (
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {s.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
