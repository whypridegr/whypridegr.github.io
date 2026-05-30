# WhyPride.gr

Μια διαδραστική σελίδα που προσπαθεί να φέρει πιο κοντά τη ΛΟΑΤΚΙ+ κοινότητα και
τους ανθρώπους που δεν την ξέρουν από μέσα. Όχι ανθρώπους που μισούν απαραίτητα,
αλλά που απλώς δεν έχουν βρεθεί ποτέ στη θέση να καταλάβουν γιατί υπάρχει το Pride.

Αντί για κείμενα και επιχειρήματα, η σελίδα έχει μικρές διαδραστικές δοκιμασίες:
γυρνάς μια κάρτα, απαντάς σε ένα σενάριο, παίζεις με έναν διακόπτη. Άλλες βάζουν σε
σκέψη κάποιον που δεν ξέρει, άλλες λένε κάτι καινούριο σε όποιον ήδη ξέρει. Στην
πορεία απαντάει και κάποιες απορίες που οι περισσότεροι δεν τολμάνε να πουν δυνατά.

Ζωντανά: [whypride.gr](https://whypride.gr)

## Τεχνολογίες

- **Astro 6** για static site με React islands
- **React 19** στα διαδραστικά κομμάτια
- **Tailwind CSS v4** για styling, με OKLCH tokens και dark mode
- **motion** για τα animations
- **TypeScript** και **bun**

## Τοπική ανάπτυξη

```bash
bun install
bun dev          # dev server (localhost:4321)
bun run build    # production build στο dist/
bun run preview  # preview του build
bun run check    # astro check (types)
bun test         # unit tests (λογική του quiz)
```

## Δομή

```
src/
  pages/                Astro routes: / · /quiz · /glossary · /sources · /about · /equal-rights
  components/
    content/            περιεχόμενο ανά σελίδα (HomeContent, QuizContent, ...)
    interactives/       τα διαδραστικά: μύθοι, προνόμιο, διπλό μέτρο, σενάρια Ελλάδας,
                        ιστορικά παράλληλα, ally quiz, badge generator κ.ά.
    primitives/         επαναχρησιμοποιήσιμα: Accordion, FlipCard, Reveal, PullQuote
    sections/           GlossarySection, Timeline
    site/               Header, Footer, ThemeToggle
  content/              κείμενα και δεδομένα (faq, myths, scenarios, allyQuiz, sources, ...)
  lib/                  βοηθητικά (π.χ. quiz scoring)
  styles/               global.css (design tokens, utilities, dark mode)
```

Η αρχική (`/`) ακολουθεί τη ροή: ερωτήσεις, μύθοι, διαδραστικά προβληματισμού,
σενάρια, σχόλια, κλείσιμο, και στο τέλος το υλικό αναφοράς (γλωσσάρι, χρονολόγιο,
πηγές). Το `/quiz` δίνει ένα σύντομο τεστ με badge generator στο τέλος.

Τα σενάρια στο «Μάντεψε πού συνέβη» παραπέμπουν σε δημοσιευμένα περιστατικά (ΜΜΕ,
FRA, Συνήγορος του Πολίτη). Αν βρεις κάτι λάθος ή αστήρικτο, πες μας.

## Συνεισφορά

Ο κώδικας είναι ανοιχτός. Διορθώσεις, νέες πηγές ή ιδέες είναι ευπρόσδεκτες:
άνοιξε ένα [issue](https://github.com/whypridegr/whypridegr.github.io/issues/new)
ή στείλε pull request. Για οτιδήποτε άλλο, στείλε mail στο whypridegr@gmail.com.

## Deploy

Auto-deploy μέσω GitHub Actions σε κάθε push στο `main`, με δημοσίευση στο GitHub
Pages και custom domain [whypride.gr](https://whypride.gr).
