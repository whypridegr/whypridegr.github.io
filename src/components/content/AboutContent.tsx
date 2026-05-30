export function AboutContent() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
      <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05] reading-width">
        Δεν θέλουμε να σε πείσουμε.
      </h1>

      <div className="mt-12 reading-width space-y-8 text-lg leading-relaxed">
        <p>
          Το WhyPride.gr δεν είναι καμπάνια. Δεν είναι ΜΚΟ. Είναι ένας
          τεκμηριωμένος οδηγός, για όποιον έχει αναρωτηθεί «καλά μα, γιατί τόση
          φασαρία;» και δεν βρήκε μια απάντηση που να μην του φωνάζει.
        </p>

        <p>
          Φτιάχτηκε με την υπόθεση ότι οι περισσότεροι άνθρωποι δεν είναι ούτε
          ομοφοβικοί ούτε ακτιβιστές. Είναι απλώς απληροφόρητοι, και βαριούνται
          τον ηθικολογικό τόνο.
        </p>

        <p>
          Όλα τα στοιχεία είναι τεκμηριωμένα και ελέγξιμα. Αν κάτι είναι λάθος,
          στείλε μας.
        </p>

        <p>
          Ο κώδικας είναι ανοιχτός. Αν ξέρεις λίγο προγραμματισμό ή απλώς έχεις
          μια ιδέα, μια διόρθωση ή μια πηγή, το repository είναι στο{" "}
          <a
            href="https://github.com/whypridegr/whypridegr.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline decoration-border underline-offset-4 hover:decoration-accent"
          >
            GitHub
          </a>
          . Άνοιξε ένα issue ή στείλε ένα pull request· κάθε συνεισφορά είναι
          ευπρόσδεκτη.
        </p>

        <hr className="border-border" />

        <p className="text-base text-muted-foreground">
          Φτιαγμένο στην Αθήνα. Αν θες να συμβάλεις (με διόρθωση, ή απλώς μια
          ιδέα), γράψε στο{" "}
          <span className="text-ink">whypridegr@gmail.com</span>.
        </p>
      </div>
    </div>
  );
}
