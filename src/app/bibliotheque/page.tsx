import type { Metadata } from "next";
import { PRODUCTIONS, CHARACTERS } from "@/lib/catalog";
import { PageHeader } from "@/components/ui";
import { LibraryView } from "./view";

export const metadata: Metadata = { title: "Ma bibliothèque" };

export default function LibraryPage() {
  const productions = PRODUCTIONS.filter((p) => p.kind !== "comic").map((p) => ({
    id: p.id, title: p.title, kind: p.kind, continuity: p.continuity, releaseDate: p.releaseDate, episodes: p.episodes, phase: p.phase, status: p.status,
  }));
  const characters = CHARACTERS.map((c) => ({ id: c.id, name: c.name }));
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Personnel" title="Ma bibliothèque" intro="Favoris, productions vues, progression des séries, notes, liste « à regarder », articles sauvegardés, personnages suivis et historique. Tout est enregistré dans ce navigateur ; exportez une sauvegarde pour la conserver ou changer d'appareil." />
      <LibraryView productions={productions} characters={characters} />
    </div>
  );
}
