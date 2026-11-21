import type { Metadata } from "next";
import { QUIZ } from "@/lib/catalog";
import { PageHeader } from "@/components/ui";
import { QuizGame } from "./game";

export const metadata: Metadata = { title: "Quiz Marvel" };

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Défi" title="Quiz Marvel" intro={`${QUIZ.length} questions fondées sur des informations vérifiées : chaque réponse est accompagnée de sa source.`} />
      <QuizGame questions={QUIZ} />
    </div>
  );
}
