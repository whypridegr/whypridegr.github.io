import type { Cite } from "./cite";

export type Milestone = {
  year: string;
  scope: "Κόσμος" | "Ελλάδα";
  title: string;
  text: string;
  cite?: Cite;
};

// Vertical, reveal-on-scroll. Dates are real, kept short and source-checkable.
export const milestones: Milestone[] = [
  {
    year: "1969",
    scope: "Κόσμος",
    title: "Stonewall",
    text: "Εξέγερση στη Νέα Υόρκη ύστερα από αστυνομική έφοδο. Θεωρείται η αρχή του σύγχρονου κινήματος.",
    cite: {
      note: "Η αστυνομία έκανε έφοδο στο Stonewall Inn τα ξημερώματα της 28ης Ιουνίου 1969. Η πρώτη πορεία Pride έγινε έναν χρόνο μετά, στην επέτειο.",
      links: [
        {
          label: "History.com: Stonewall",
          url: "https://www.history.com/articles/the-stonewall-riots",
        },
      ],
    },
  },
  {
    year: "1973",
    scope: "Κόσμος",
    title: "Φεύγει από τις «διαταραχές»",
    text: "Η Αμερικανική Ψυχιατρική Εταιρεία αφαιρεί την ομοφυλοφιλία από τον κατάλογο ψυχικών διαταραχών.",
    cite: {
      note: "Η Αμερικανική Ψυχιατρική Εταιρεία αφαίρεσε την ομοφυλοφιλία από το DSM το 1973. Ο ΠΟΥ ακολούθησε το 1990 (ICD-10).",
      links: [
        {
          label: "Lambda Legal: θέσεις ιατρικών φορέων",
          url: "https://lambdalegal.org/publication/health-and-med-orgs-stmts-on-sex-orientation-and-gender-identity/",
        },
      ],
    },
  },
  {
    year: "2001",
    scope: "Κόσμος",
    title: "Πρώτος γάμος ισότητας",
    text: "Η Ολλανδία γίνεται η πρώτη χώρα στον κόσμο που τον θεσμοθετεί.",
  },
  {
    year: "2008",
    scope: "Ελλάδα",
    title: "Οι γάμοι της Τήλου",
    text: "Στην Τήλο πραγματοποιήθηκαν οι πρώτοι γάμοι ομόφυλων ζευγαριών στην Ελλάδα από τον δήμαρχο Τάσο Αλιφέρη. Παρότι αμφισβητήθηκαν νομικά και ακυρώθηκαν αργότερα, άνοιξαν δημόσια τη συζήτηση για την ισότητα στον γάμο.",
  },
  {
    year: "2015",
    scope: "Ελλάδα",
    title: "Σύμφωνο συμβίωσης",
    text: "Επεκτείνεται και στα ομόφυλα ζευγάρια (Ν. 4356/2015), 7 χρόνια μετά την καταδίκη της Ελλάδας από το ΕΔΔΑ.",
    cite: {
      note: "Ν. 4356/2015. Το σύμφωνο συμβίωσης συνάπτεται ανεξάρτητα από το φύλο των προσώπων.",
      links: [
        {
          label: "Ν. 4356/2015 (e-nomothesia)",
          url: "https://www.e-nomothesia.gr/oikogeneia/n-4356-2015.html",
        },
      ],
    },
  },
  {
    year: "2017",
    scope: "Ελλάδα",
    title: "Νομική αναγνώριση ταυτότητας φύλου",
    text: "Επιτρέπεται η αλλαγή καταχωρισμένου φύλου χωρίς ιατρικές προϋποθέσεις (Ν. 4491/2017).",
    cite: {
      note: "Ν. 4491/2017 (ΦΕΚ Α' 152/13.10.2017).",
      links: [
        {
          label: "Ν. 4491/2017 (e-nomothesia)",
          url: "https://www.e-nomothesia.gr/kat-nomothesia-genikou-endiapherontos/nomos-4491-2017-fek-152a-13-10-2017.html",
        },
      ],
    },
  },
  {
    year: "2024",
    scope: "Ελλάδα",
    title: "Γάμος ισότητας",
    text: "Η Ελλάδα γίνεται η πρώτη ορθόδοξη χριστιανική χώρα που θεσμοθετεί τον πολιτικό γάμο ομόφυλων ζευγαριών.",
    cite: {
      note: "Ν. 5089/2024 (ΦΕΚ Α' 27/16.02.2024). Καθιερώνει τον πολιτικό γάμο και την τεκνοθεσία για ομόφυλα ζευγάρια.",
      links: [
        {
          label: "Ν. 5089/2024 (e-nomothesia)",
          url: "https://www.e-nomothesia.gr/oikogeneia/n-5089-2024.html",
        },
      ],
    },
  },
];
