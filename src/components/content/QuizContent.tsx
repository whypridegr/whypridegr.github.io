import { AllyQuiz } from "@/components/interactives/AllyQuiz";

export function QuizContent() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-28">
      <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05] reading-width">
        Πόσο σύμμαχος είσαι;
      </h1>
      {/*<p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
        Ώρα να δοκιμαστείς, και να κερδίσεις ένα δωράκι στο τέλος.
      </p>*/}

      <div className="mt-16">
        <AllyQuiz />
      </div>
    </div>
  );
}
