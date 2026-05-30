export type Reflection = {
  author: string;
  text: string;
  reflection: string;
  /** A believable "agree" tally. Fixed (not random) so SSR and the client
      render the same number; the UI adds +1 locally when you press Συμφωνώ. */
  likes: number;
};

// Fake "comment" cards. The ❤️ "Συμφωνώ" doesn't tally a like —
// it opens a soft reflection. Perspective shift, not gotcha.
export const reflections: Reflection[] = [
  {
    author: "Μαρία Τ.",
    text: "«Ας κάνουν ό,τι θέλουν, αλλά γιατί πρέπει να το βλέπω κι εγώ;»",
    reflection:
      "Το «δεν θέλω να το βλέπω» συχνά σημαίνει «θέλω να μην υπάρχει εκεί που είμαι εγώ». Ένα straight ζευγάρι που κρατιέται χέρι δεν σου ζητάει άδεια. Τι αλλάζει όταν το ζευγάρι είναι queer;",
    likes: 248,
  },
  {
    author: "Γιώργος Π.",
    text: "«Καλά όλα, αλλά γιατί να το λένε στα παιδιά;»",
    reflection:
      "Τα παιδιά ήδη ξέρουν ότι υπάρχουν διαφορετικές οικογένειες, τις βλέπουν στη γειτονιά. Το να υπάρχει μια λέξη γι' αυτό δεν τα μπερδεύει. Τα προστατεύει, αν τύχει να είναι τα ίδια queer.",
    likes: 173,
  },
  {
    author: "Ανώνυμος",
    text: "«Δεν έχω πρόβλημα, απλώς ας μην το κάνουν θέμα.»",
    reflection:
      "Όταν κάτι είναι ασφαλές, σταματά να είναι θέμα από μόνο του. Όσο χρειάζεται θάρρος να πεις ποιος είσαι, το «μην το κάνεις θέμα» ζητάει σιωπή, όχι διακριτικότητα.",
    likes: 91,
  },
];

// Shown when someone "submits" the fake comment composer.
export const composerReflection =
  "Πριν το δημοσιεύσεις, μια ερώτηση: σε ποιον μιλούσες, και τι ήλπιζες να αλλάξει; Τα περισσότερα σχόλια στο διαδίκτυο δεν γράφονται για να ακουστούν. Γράφονται για να νιώσουμε ότι έχουμε δίκιο.";
