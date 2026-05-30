export type Source = {
  org: string;
  title: string;
  url: string;
  note?: string;
};

export const sources: Source[] = [
  {
    org: "FRA",
    title: "EU LGBTIQ Survey III (2024)",
    url: "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2024/eu-lgbtiq-survey-iii",
    note: "Στοιχεία για ορατότητα, διακρίσεις και φόβο σε 30 χώρες.",
  },
  {
    org: "ILGA-Europe",
    title: "Rainbow Map & Index: Greece",
    url: "https://rainbow-europe.org",
    note: "Ετήσια κατάταξη νομικού πλαισίου ΛΟΑΤΚΙ+ δικαιωμάτων.",
  },
  {
    org: "WHO",
    title: "ICD-11: αφαίρεση transgender από ψυχικές διαταραχές",
    url: "https://www.who.int/standards/classifications/classification-of-diseases",
  },
  {
    org: "APA",
    title: "Sexual Orientation & Gender Diversity",
    url: "https://www.apa.org/topics/lgbtq",
  },
  {
    org: "Colour Youth",
    title: "Παρατηρητήριο Ομοφοβικής & Τρανσφοβικής Βίας",
    url: "https://www.colouryouth.gr",
    note: "Ετήσιες αναφορές περιστατικών στην Ελλάδα.",
  },
  {
    org: "Bustos et al. (2021)",
    title: "Regret after Gender-Affirmation Surgery: A Systematic Review",
    url: "https://pubmed.ncbi.nlm.nih.gov/33779860/",
  },
];
