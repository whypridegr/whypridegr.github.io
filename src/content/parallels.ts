export type Parallel = {
  era: string;
  against: string;
  quote: string;
  modern: string;
};

// "Things people said before" — same argument structure, different target.
// Dissociation: you read the old one first, then recognise the echo.
export const parallels: Parallel[] = [
  {
    era: "δεκαετία 1910",
    against: "Κατά της ψήφου των γυναικών",
    quote:
      "«Η θέση της γυναίκας είναι το σπίτι. Αν μπλέξει με την πολιτική, θα διαλυθεί η οικογένεια.»",
    modern: "«Αν τους αφήσουμε να παντρευτούν, θα διαλυθεί ο θεσμός της οικογένειας.»",
  },
  {
    era: "δεκαετία 1960",
    against: "Κατά των διαφυλετικών γάμων",
    quote:
      "«Είναι αφύσικο. Δεν είναι αυτό που όρισε η φύση. Και σκεφτείτε τι θα τραβήξουν τα παιδιά.»",
    modern: "«Είναι αφύσικο. Και σκεφτείτε τι θα τραβήξουν τα παιδιά.»",
  },
  {
    era: "δεκαετία 1980",
    against: "Κατά της αποποινικοποίησης",
    quote:
      "«Ας κάνουν ό,τι θέλουν στο σπίτι τους, αρκεί να μην το διαφημίζουν δημόσια.»",
    modern: "«Ας κάνουν ό,τι θέλουν, αρκεί να μην το βγάζουν στους δρόμους.»",
  },
];
