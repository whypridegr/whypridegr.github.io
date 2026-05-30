export function AboutContent() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
      <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05] reading-width">
        Δεν θέλουμε να σε πείσουμε.
      </h1>

      <div className="mt-12 reading-width space-y-8 text-lg leading-relaxed">
        <p>
          Το WhyPride.gr δεν είναι καμπάνια. Δεν είναι ΜΚΟ. Είναι ένας ήσυχος
          οδηγός, για όποιον έχει αναρωτηθεί «καλά μα, γιατί τόση φασαρία;» και
          δεν βρήκε μια απάντηση που να μην του φωνάζει.
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

        <hr className="border-border" />

        <p className="text-base text-muted-foreground">
          Φτιαγμένο στην Αθήνα. Αν θες να συμβάλεις (με διόρθωση, ιστορία, ή
          απλώς μια ιδέα), γράψε στο{" "}
          <span className="text-ink">hello@whypride.gr</span>.
        </p>
      </div>
    </div>
  );
}
