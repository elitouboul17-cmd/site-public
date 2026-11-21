import type { CalendarEntry } from "@/lib/types";

/**
 * Événements Marvel (conventions, présentations). Les sorties de films et séries
 * sont générées automatiquement depuis les fiches de productions (lib/catalog.ts).
 * Ajouter ici uniquement des dates confirmées par l'organisateur, avec la source.
 */
export const EVENTS: CalendarEntry[] = [
  {
    id: "sdcc-2024-hall-h", date: "2024-07-27", kind: "convention", title: "Comic-Con de San Diego : panel Marvel Studios (Hall H)",
    certainty: "officielle", location: "San Diego, États-Unis",
    sources: [{ label: "Wikipédia (EN) — Avengers: Doomsday", url: "https://en.wikipedia.org/wiki/Avengers:_Doomsday" }],
  },
  {
    id: "d23-2024", date: "2024-08-09", endDate: "2024-08-11", kind: "evenement", title: "D23 : The Ultimate Disney Fan Event",
    certainty: "officielle", location: "Anaheim, États-Unis",
    sources: [{ label: "Wikipédia (EN) — D23", url: "https://en.wikipedia.org/wiki/D23_(Disney)" }],
  },
];
