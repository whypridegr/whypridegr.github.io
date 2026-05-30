export type Scenario = {
  text: string;
  answer: "Ελλάδα" | "Αλλού";
  reveal: string;
  source?: string;
  url?: string;
};

export const scenarios: Scenario[] = [
  {
    text: "Μαθητές σκίζουν τα ΛΟΑΤ σημαιάκια συμμαθητών τους, τους βρίζουν και τους απειλούν.",
    answer: "Ελλάδα",
    reveal:
      "Γυμνάσιο στη Θεσσαλονίκη, Δεκέμβριος 2021. Ο εισαγγελέας διέταξε προκαταρκτική εξέταση για φθορά και παράνομη βία.",
    source: "Athens Voice, 2021",
    url: "https://www.athensvoice.gr/epikairotita/ellada/739739/eisaggeliki-paremvasi-gia-omofoviko-peristatiko-se-sholeio/",
  },
  {
    text: "Καθηγήτρια αρνείται να βαθμολογήσει την εργασία μαθήτριας, λέγοντας ότι «δεν υποστηρίζει λούγκρες».",
    answer: "Ελλάδα",
    reveal:
      "Γυμνάσιο στην Πάτρα, Απρίλιος 2023. Το περιστατικό καταγγέλθηκε από τη μητέρα της μαθήτριας.",
    source: "Το Ποντίκι, 2023",
    url: "https://www.topontiki.gr/2023/04/07/kathigitria-stin-patra-den-metrao-tin-ergasia-sou-giati-den-ipostirizo-lougkres/",
  },
  {
    text: "Τρανς άτομα αποκλείονται θεσμικά από μια δημόσια σχολή λόγω ταυτότητας φύλου.",
    answer: "Ελλάδα",
    reveal:
      "Αστυνομικές Σχολές, 2022. Ο Συνήγορος του Πολίτη παρενέβη ζητώντας άρση του αποκλεισμού των τρανς ατόμων.",
    source: "Συνήγορος του Πολίτη / News247, 2022",
    url: "https://www.news247.gr/ellada/sinigoros-tou-politi-arsi-tou-apokleismou-ton-trans-atomon-apo-tis-astinomikes-sxoles/",
  },
  {
    text: "Τα ΛΟΑΤΚΙ+ άτομα φτάνουν να είναι το 20–40% των άστεγων νέων.",
    answer: "Αλλού",
    reveal:
      "Σε όλη την Ευρώπη. Η οικογενειακή απόρριψη μετά το coming out παραμένει από τις βασικές αιτίες αστεγίας για νέους ΛΟΑΤΚΙ+.",
    source: "FRA LGBTI Survey II (2019) / FEANTSA, 2023",
    url: "https://www.feantsa.org/en/report/2023/11/10/",
  },
];
