import type { Cite } from "./cite";

export type Myth = { myth: string; reality: string; cite?: Cite };

export const myths: Myth[] = [
  {
    myth: "«Το Pride είναι ένα τσίρκο, ένα πανηγύρι.»",
    reality:
      "Ξεκίνησε ως πορεία διαμαρτυρίας και παραμένει ορατότητα και διεκδίκηση. Η γιορτή έρχεται μετά από χρόνια αποκλεισμού. Υπάρχουν οι επίσημες διοργανώσεις, με χαρακτήρα παρέλασης, και οι αυτοοργανωμένες πορείες και συλλογικότητες, με πιο πολιτικό τόνο και διαφορετικούς στόχους.",
    cite: {
      note: "Το Pride ξεκίνησε ως διαμαρτυρία. Στην πρώτη επέτειο του Stonewall, στις 28 Ιουνίου 1970, χιλιάδες άνθρωποι πορεύτηκαν στη Νέα Υόρκη (Christopher Street Liberation Day), στη σημερινή πορεία Pride.",
      links: [
        {
          label: "Smithsonian: η ιστορία του Pride",
          url: "https://www.si.edu/stories/marsha-johnson-sylvia-rivera-and-history-pride-month",
        },
        {
          label: "History.com: Stonewall",
          url: "https://www.history.com/articles/the-stonewall-riots",
        },
      ],
    },
  },
  {
    myth: "«Η σεξουαλικότητα είναι επιλογή.»",
    reality:
      "Καμία μεγάλη ιατρική ή ψυχολογική ένωση δεν υποστηρίζει ότι ο σεξουαλικός προσανατολισμός είναι επιλογή. Ο ΠΟΥ (Παγκόσμιος Οργανισμός Υγείας) και η Αμερικανική Ψυχολογική Εταιρεία συμφωνούν εδώ και δεκαετίες.",
    cite: {
      note: "Η Αμερικανική Ψυχολογική Εταιρεία δεν θεωρεί τον σεξουαλικό προσανατολισμό συνειδητή επιλογή. Η Αμερικανική Ψυχιατρική Εταιρεία τον αφαίρεσε από τα ψυχικά νοσήματα το 1973 και ο ΠΟΥ έπαψε να τον ταξινομεί ως διαταραχή το 1990 (ICD-10).",
      links: [
        {
          label: "APA: Sexual Orientation",
          url: "https://www.apa.org/topics/lgbtq/orientation",
        },
        {
          label: "WHO Europe",
          url: "https://www.who.int/europe/news/item/17-05-2019-moving-one-step-closer-to-better-health-and-rights-for-transgender-people",
        },
        {
          label: "Lambda Legal: θέσεις ιατρικών φορέων",
          url: "https://lambdalegal.org/publication/health-and-med-orgs-stmts-on-sex-orientation-and-gender-identity/",
        },
      ],
    },
  },
  {
    myth: "«Γίνεται μόδα στους νέους.»",
    reality:
      "Τα στοιχεία δείχνουν ότι αυξάνεται κυρίως ο αυτοπροσδιορισμός, ιδίως στις νεότερες γενιές που μεγάλωσαν σε πιο αποδεκτικό κλίμα. Πιο πολλοί το λένε επειδή νιώθουν πιο ασφαλείς, όχι επειδή αλλάζει η ίδια η συχνότητα.",
    cite: {
      note: "Κατά την Gallup, ο αυτοπροσδιορισμός ως ΛΟΑΤΚΙ+ στις ΗΠΑ πάνω από διπλασιάστηκε, από 3,5% το 2012 σε περίπου 9% το 2024-2025. Η αύξηση προέρχεται σχεδόν αποκλειστικά από τις νεότερες γενιές.",
      links: [
        {
          label: "Gallup: LGBTQ+ Identification",
          url: "https://news.gallup.com/poll/702206/lgbtq-identification-holds.aspx",
        },
      ],
    },
  },
  {
    myth: "«Η φυλομετάβαση είναι παρόρμηση.»",
    reality:
      "Η ιατρική φυλομετάβαση ακολουθεί μακρά, δομημένη αξιολόγηση. Η μεγαλύτερη μετα-ανάλυση βρίσκει ποσοστά μετάνοιας γύρω στο 1%, αν και τα δεδομένα έχουν περιορισμούς.",
    cite: {
      note: "Μετα-ανάλυση 27 μελετών (Bustos κ.ά., 2021) βρήκε ποσοστό μετάνοιας γύρω στο 1% μετά από επεμβάσεις επιβεβαίωσης φύλου. Η αξιολόγηση ακολουθεί τα κριτήρια WPATH (SOC-8).",
      links: [
        {
          label: "Bustos κ.ά., 2021",
          url: "https://pubmed.ncbi.nlm.nih.gov/33968550/",
        },
        {
          label: "WPATH Standards of Care (SOC-8)",
          url: "https://www.wpath.org/publications/soc",
        },
      ],
    },
  },
];
