import type { BtsCategory, CharacterKind, ContinuityId, NewsCategory, ProductionKind, Reliability, ReleaseStatus, PersonRole, QuizCategory, QuizLevel, CalendarKind } from "./types";

export const CONTINUITY_LABELS: Record<ContinuityId, { label: string; short: string; description: string }> = {
  mcu: { label: "Marvel Cinematic Universe", short: "MCU", description: "Continuité partagée des productions Marvel Studios depuis 2008." },
  "marvel-television": { label: "Marvel Television", short: "Marvel TV", description: "Séries ABC, Netflix, Hulu et Freeform (2013-2020). Leur rattachement au MCU est partiel et discuté." },
  "fox-xmen": { label: "X-Men (20th Century Fox)", short: "X-Men Fox", description: "Saga X-Men et Deadpool produite par la Fox (2000-2020). Désignée Terre-10005 dans Deadpool & Wolverine." },
  "fox-ff": { label: "Fantastic Four (Fox)", short: "FF Fox", description: "Films Fantastic Four de la Fox (2005, 2007, 2015)." },
  "sony-spider-man": { label: "Spider-Man (Sony, avant le MCU)", short: "Sony Spider-Man", description: "Trilogie de Sam Raimi (2002-2007) et films de Marc Webb (2012-2014)." },
  "sony-ssu": { label: "Sony's Spider-Man Universe", short: "SSU", description: "Venom, Morbius, Madame Web, Kraven (Sony Pictures)." },
  "spider-verse": { label: "Spider-Verse (animation Sony)", short: "Spider-Verse", description: "Films d'animation de Sony Pictures Animation." },
  "legacy-film": { label: "Anciens films Marvel", short: "Classiques", description: "Adaptations antérieures ou indépendantes (Blade, Hulk 2003, Daredevil 2003…)." },
  animation: { label: "Animation Marvel", short: "Animation", description: "Séries animées hors MCU, chacune dans sa continuité." },
  comics: { label: "Comics Marvel", short: "Comics", description: "Publications Marvel Comics (et Timely Comics avant 1961)." },
  games: { label: "Jeux vidéo Marvel", short: "Jeux", description: "Chaque jeu ou série de jeux possède sa propre continuité." },
};

export const KIND_LABELS: Record<ProductionKind, string> = {
  film: "Film", serie: "Série", "court-metrage": "Courts-métrages", "presentation-speciale": "Présentation spéciale",
  "serie-animee": "Série animée", "film-anime": "Film d'animation", "jeu-video": "Jeu vidéo", comic: "Comic",
};

export const STATUS_LABELS: Record<ReleaseStatus, string> = {
  sorti: "Sorti", annonce: "Annoncé", "en-production": "En production", "date-estimee": "Date estimée", annule: "Annulé",
};

export const RELIABILITY: Record<Reliability, { label: string; description: string; tone: string }> = {
  officiel: { label: "OFFICIEL", description: "Information publiée par une source officielle (Marvel, Disney, D23).", tone: "officiel" },
  reporte: { label: "REPORTÉ", description: "Information rapportée par un média identifiable, sans confirmation officielle.", tone: "reporte" },
  rumeur: { label: "RUMEUR", description: "Information non confirmée (fuite, « insider », bruit de couloir).", tone: "rumeur" },
  theorie: { label: "THÉORIE", description: "Hypothèse ou interprétation de fans. Jamais un fait.", tone: "theorie" },
};

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  "marvel-studios": "Marvel Studios", mcu: "MCU", films: "Films", series: "Séries", casting: "Casting",
  realisation: "Réalisation", production: "Production", comics: "Comics", animation: "Animation",
  "jeux-video": "Jeux vidéo", "disney-marvel": "Disney et Marvel", "bandes-annonces": "Bandes-annonces",
};

export const CHARACTER_KIND_LABELS: Record<CharacterKind, string> = {
  heros: "Héros", vilain: "Vilain", "anti-heros": "Anti-héros", secondaire: "Personnage secondaire", equipe: "Équipe", organisation: "Organisation / lieu",
};

export const ROLE_LABELS: Record<PersonRole, string> = {
  acteur: "Interprète", realisateur: "Réalisation", scenariste: "Scénario", producteur: "Production", compositeur: "Musique",
  "superviseur-vfx": "Supervision VFX", monteur: "Montage", "directeur-photo": "Direction de la photographie",
  "chef-decorateur": "Décors", costumier: "Costumes", cascadeur: "Cascades",
};

export const QUIZ_LEVEL_LABELS: Record<QuizLevel, string> = { debutant: "Débutant", intermediaire: "Intermédiaire", expert: "Expert" };
export const QUIZ_CATEGORY_LABELS: Record<QuizCategory, string> = {
  mcu: "MCU", personnages: "Personnages", chronologie: "Chronologie", "films-series": "Films et séries", coulisses: "Coulisses", comics: "Comics", multivers: "Multivers",
};

export const CALENDAR_KIND_LABELS: Record<CalendarKind, string> = {
  "sortie-film": "Sortie film", "sortie-serie": "Sortie série", episode: "Épisode", evenement: "Événement", convention: "Convention", "bande-annonce": "Bande-annonce",
};

export type { BtsCategory };
