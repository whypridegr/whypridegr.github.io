import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Term {
  letter: string;
  word: string;
  definition: string;
}

const terms: Term[] = [
  {
    letter: "Λ",
    word: "Λεσβίες",
    definition:
      "Γυναίκες που νιώθουν ρομαντική και/ή σεξουαλική έλξη προς άλλες γυναίκες.",
  },
  {
    letter: "Ο",
    word: "Ομοφυλόφιλοι",
    definition:
      "Άνδρες που νιώθουν ρομαντική και/ή σεξουαλική έλξη προς άλλους άντρες. Ο όρος χρησιμοποιείται και γενικά για όλους τους προσανατολισμούς προς το ίδιο φύλο.",
  },
  {
    letter: "Α",
    word: "Αμφιφυλόφιλοι",
    definition:
      "Άτομα που νιώθουν έλξη προς περισσότερα από ένα φύλα. Δεν σημαίνει '50-50'· η έλξη μπορεί να ποικίλλει.",
  },
  {
    letter: "Τ",
    word: "Τρανς",
    definition:
      "Άτομα των οποίων η ταυτότητα φύλου δεν ταιριάζει με το φύλο που τους δόθηκε κατά τη γέννηση. Δεν έχει σχέση με τον σεξουαλικό προσανατολισμό.",
  },
  {
    letter: "Κ",
    word: "Κουίρ",
    definition:
      "Ομπρέλα-όρος για όσους δεν ταυτίζονται με την ετεροκανονικότητα. Επανοικειοποιημένος όρος που κάποτε ήταν προσβολή, τώρα χρησιμοποιείται με περηφάνια.",
  },
  {
    letter: "Ι",
    word: "Ίντερσεξ",
    definition:
      "Άτομα που γεννιούνται με χαρακτηριστικά φύλου (χρωμοσώματα, όργανα, ορμόνες) που δεν ταιριάζουν με τους τυπικούς ορισμούς 'άντρας' ή 'γυναίκα'. Αφορά 1-2% του πληθυσμού.",
  },
];

// One pride colour per letter (literal class names so Tailwind detects them).
const prideBg = [
  "bg-pride-1",
  "bg-pride-2",
  "bg-pride-3",
  "bg-pride-4",
  "bg-pride-5",
  "bg-pride-6",
];

// Foreground per colour. The orange (pride-2) and yellow (pride-3) are too
// light for white text to clear WCAG AA, so those use dark ink instead.
const prideFg = [
  "text-white",
  "text-ink",
  "text-ink",
  "text-white",
  "text-white",
  "text-white",
];

export function GlossarySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4">Τι σημαίνει ΛΟΑΤΚΙ+;</h2>
          <p className="text-muted-foreground text-lg">
            Κάνε κλικ σε κάθε γράμμα
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {terms.map((term, index) => (
            <motion.button
              key={index}
              aria-label={`${term.word}: ${term.letter}`}
              aria-pressed={activeIndex === index}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              className={`size-16 md:size-20 rounded-xl text-2xl md:text-3xl font-medium transition-all ${
                prideBg[index % prideBg.length]
              } ${prideFg[index % prideFg.length]} ${
                activeIndex === index
                  ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-background"
                  : "hover:scale-105"
              }`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              {term.letter}
            </motion.button>
          ))}
          <motion.div
            className="pride-rule size-16 md:size-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-medium text-white"
            whileHover={{ y: -4 }}
          >
            +
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {activeIndex !== null && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${prideBg[activeIndex % prideBg.length]} ${prideFg[activeIndex % prideFg.length]} rounded-2xl p-8 md:p-10`}
            >
              <div className="text-5xl md:text-6xl mb-4 opacity-90">
                {terms[activeIndex].letter}
              </div>
              <h3 className="text-2xl md:text-3xl mb-4">
                {terms[activeIndex].word}
              </h3>
              <p className="text-lg leading-relaxed opacity-95">
                {terms[activeIndex].definition}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {activeIndex === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground"
          >
            Επίλεξε ένα γράμμα για να δεις τον ορισμό του
          </motion.div>
        )}
      </div>
    </section>
  );
}
