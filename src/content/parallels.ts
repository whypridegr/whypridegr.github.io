import type { Cite } from "./cite";

export type Parallel = {
  era: string;
  against: string;
  quote: string;
  modern: string;
  /** Historical primary/secondary source for the "Τότε" argument. */
  source?: Cite;
  /** A Greek contemporary echo of the same argument structure. */
  greek?: Cite;
};

// "Things people said before" — same argument structure, different target.
// Dissociation: you read the old one first, then recognise the echo.
export const parallels: Parallel[] = [
  {
    era: "δεκαετία 1910",
    against: "Κατά της ψήφου των γυναικών",
    quote:
      "«Η θέση της γυναίκας είναι το σπίτι. Αν μπλέξει με την πολιτική, θα διαλυθεί η οικογένεια.»",
    modern:
      "«Αν τους αφήσουμε να παντρευτούν, θα διαλυθεί ο θεσμός της οικογένειας.»",
    source: {
      note: "Στη δεκαετία του 1910, φυλλάδια κατά της ψήφου των γυναικών προειδοποιούσαν ότι θα γινόταν «καταστροφέας της οικογένειας», χρησιμοποιώντας τον ρόλο της μητέρας ως επιχείρημα.",
      links: [
        {
          label: "Φυλλάδιο 1911 (SF Public Library)",
          url: "https://sfpl.org/pdf/libraries/main/sfhistory/suffrageagainst.pdf",
        },
        {
          label: "Library of Virginia",
          url: "https://www.lva.virginia.gov/collections/educator-resources/dbva/items/show/154",
        },
      ],
    },
    greek: {
      note: "Η ίδια δομή επιχειρήματος επανεμφανίζεται. Η Ιερά Σύνοδος της Εκκλησίας της Ελλάδος, σε ανακοινωθέν στις 23 Ιανουαρίου 2024, υποστήριξε ότι ο γάμος ισότητας ανατρέπει τους ρόλους των φύλων ως στοιχείων συνοχής της κοινωνίας.",
      links: [
        {
          label: "Ανακοινωθέν Ιεράς Συνόδου, 23.1.2024",
          url: "https://www.lifo.gr/now/greece/gamos-omofylon-zeygarion-omofono-ohi-tis-ieras-synodoy-sto-nomoshedio",
        },
      ],
    },
  },
  {
    era: "δεκαετία 1960",
    against: "Κατά των διαφυλετικών γάμων",
    quote:
      "«Είναι αφύσικο. Δεν είναι αυτό που όρισε η φύση. Και σκεφτείτε τι θα τραβήξουν τα παιδιά.»",
    modern: "«Είναι αφύσικο. Και σκεφτείτε τι θα τραβήξουν τα παιδιά.»",
    source: {
      note: "Πριν το 1967, οι διαφυλετικοί γάμοι χαρακτηρίζονταν «αφύσικοι» και απαγορεύονταν με νόμο. Στην υπόθεση Loving v. Virginia, ο δικαστής υποστήριξε ότι ο Θεός διαχώρισε τις φυλές και δεν προόριζε την ανάμειξή τους. Συνηθισμένο ήταν και το επιχείρημα ότι θα υπέφεραν τα παιδιά. Το Ανώτατο Δικαστήριο των ΗΠΑ το απέρριψε ομόφωνα το 1967.",
      links: [
        {
          label: "Loving v. Virginia, 388 U.S. 1",
          url: "https://www.law.cornell.edu/supremecourt/text/388/1",
        },
        {
          label: "Christian Science Monitor",
          url: "https://www.csmonitor.com/USA/Society/2009/1016/p02s16-ussc.html",
        },
      ],
    },
    greek: {
      note: "Η Ιερά Σύνοδος, στο ίδιο ανακοινωθέν (23.1.2024), ανέφερε ότι τα παιδιά θα είναι τα θύματα ενός αφύσικου μηχανισμού τεκνοθεσιών. Παρόμοια τοποθετήθηκε και ο Μητροπολίτης Πατρών.",
      links: [
        {
          label: "Ανακοινωθέν Ιεράς Συνόδου",
          url: "https://www.protothema.gr/greece/article/1458622/iera-sunodos-omofono-ohi-ston-gamo-kai-tin-teknothesia-ton-omofulon-zeugarion/",
        },
        {
          label: "Δηλώσεις Μητροπολίτη Πατρών",
          url: "https://www.orthodoxtimes.gr/mitropolitis-patron-dystychismenes-yparxeis-tha-einai-ta-paidia-mesa-apo-tin-teknothesia-omofylofilon/",
        },
      ],
    },
  },
  {
    era: "δεκαετία 1980",
    against: "Κατά της αποποινικοποίησης",
    quote:
      "«Ας κάνουν ό,τι θέλουν στο σπίτι τους, αρκεί να μην το διαφημίζουν δημόσια.»",
    modern: "«Ας κάνουν ό,τι θέλουν, αρκεί να μην το βγάζουν στους δρόμους.»",
    source: {
      note: "Η λογική «ιδιωτικά ναι, δημόσια όχι» έχει νομικό ανάλογο. Η βρετανική αποποινικοποίηση του 1967 ίσχυε μόνο κατ' ιδίαν, ενώ το 1988 το Section 28 απαγόρευσε στα σχολεία να «προωθούν» την ομοφυλοφιλία.",
      links: [
        {
          label: "Section 28 (UK National Archives)",
          url: "https://www.nationalarchives.gov.uk/explore-the-collection/stories/origins-section-28/",
        },
        {
          label: "Human Dignity Trust",
          url: "https://www.humandignitytrust.org/lgbt-the-law/a-history-of-criminalisation/",
        },
      ],
    },
    greek: {
      note: "Στη δημόσια συζήτηση για το Athens Pride 2024, η Ελληνική Λύση, κόμμα της εθνικιστικής δεξιάς, δήλωσε αντίθεση σε τέτοιου είδους εκδηλώσεις. Η αντίρρηση δεν αφορά την ύπαρξη αλλά τη δημόσια ορατότητα.",
      links: [
        {
          label: "Δήλωση για το Athens Pride 2024",
          url: "https://antenna.gr/eidiseis/article/4/916660/athens-pride-2024-elliniki-lysi-oi-dimosies-parelaseis-ofeiloyn-na-proagoyn-arxes-kai-axies",
        },
      ],
    },
  },
];
