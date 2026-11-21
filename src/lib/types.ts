/**
 * Modèle de domaine de MARVEL HQ.
 *
 * Principe éditorial : toute donnée factuelle doit pouvoir être reliée à une source
 * et à une date de vérification. Les champs inconnus restent `undefined` — on
 * n'invente jamais une valeur pour « remplir » une fiche.
 */

/** Continuités / franchises. Ne jamais fusionner automatiquement deux continuités. */
export type ContinuityId =
  | "mcu" // Marvel Cinematic Universe (Marvel Studios, Terre-616 dans le MCU)
  | "marvel-television" // Marvel Television (ABC, Netflix, Hulu…) — canonicité MCU discutée
  | "fox-xmen" // Films X-Men de 20th Century Fox (2000-2020)
  | "fox-ff" // Fantastic Four de Fox (2005, 2007, 2015)
  | "sony-spider-man" // Spider-Man de Sony (Raimi, Webb) — avant l'accord MCU
  | "sony-ssu" // Sony's Spider-Man Universe (Venom, Morbius…)
  | "spider-verse" // Films d'animation Spider-Verse (Sony Pictures Animation)
  | "legacy-film" // Anciens films Marvel hors franchises ci-dessus
  | "animation" // Séries et films d'animation hors MCU
  | "comics" // Univers des comics (Terre-616 éditoriale, etc.)
  | "games"; // Jeux vidéo (continuités propres à chaque jeu ou série de jeux)

export type ProductionKind =
  | "film"
  | "serie"
  | "court-metrage"
  | "presentation-speciale"
  | "serie-animee"
  | "film-anime"
  | "jeu-video"
  | "comic";

export type ReleaseStatus = "sorti" | "annonce" | "en-production" | "date-estimee" | "annule";

/** Niveau de certitude d'une date. Une date estimée n'est jamais affichée comme officielle. */
export type DateCertainty = "officielle" | "estimee" | "inconnue";

export interface SourceRef {
  label: string;
  url: string;
  /** Date (ISO) à laquelle l'information a été vérifiée sur cette source. */
  verifiedAt?: string;
}

/** Crédit d'interprétation : [nom de la personne, rôle, id de personnage optionnel]. */
export type CastCredit = [person: string, role: string, characterId?: string];

export interface Production {
  id: string; // slug stable
  title: string; // titre français d'exploitation
  originalTitle: string;
  kind: ProductionKind;
  continuity: ContinuityId;
  /** Phase du MCU (1..6) lorsque pertinent. */
  phase?: number;
  /** « Saga de l'Infini », « Saga du Multivers »… */
  saga?: string;
  /** ISO yyyy-mm-dd, ou yyyy-mm / yyyy pour les comics (date de couverture). Sortie US initiale sauf mention. */
  releaseDate?: string;
  /** Fin de diffusion pour les séries terminées. */
  endDate?: string;
  releaseDateFr?: string;
  dateCertainty: DateCertainty;
  status: ReleaseStatus;
  /** Durée en minutes (films) ; pour les séries, voir `episodes`. */
  runtime?: number;
  seasons?: number;
  episodes?: number;
  synopsis?: string; // sans spoiler majeur
  /** Les crédits utilisent les noms des personnes ; l'index des personnes en est dérivé. */
  directors?: string[];
  writers?: string[];
  composers?: string[];
  producers?: string[];
  cinematographers?: string[];
  editors?: string[];
  vfxSupervisors?: string[];
  cast?: CastCredit[];
  characters?: string[]; // characterIds
  studios?: string[];
  vfxVendors?: string[];
  distributor?: string;
  platform?: string; // Disney+, Netflix…
  /** Position dans la chronologie narrative du MCU (ordre « officiel » Disney+). */
  narrativeOrder?: number;
  /** Époque narrative principale (texte, ex. « 1943-1945 »). */
  narrativeEra?: string;
  /** Liens éditoriaux confirmés vers d'autres productions. */
  connections?: { productionId: string; nature: string }[];
  trailerYoutubeId?: string;
  wikipedia?: { fr?: string; en?: string };
  sources?: SourceRef[];
  lastVerified?: string; // ISO — sinon voir src/data/verification.json
  tags?: string[];
}

export type CharacterKind = "heros" | "vilain" | "anti-heros" | "secondaire" | "equipe" | "organisation";

export interface Character {
  id: string;
  name: string;
  civilName?: string;
  aliases?: string[];
  kind: CharacterKind;
  firstAppearance?: { comic?: string; year?: number; mcuProductionId?: string };
  /** Interprètes par continuité. */
  portrayals?: { person: string; continuity: ContinuityId; note?: string }[];
  abilities?: string[];
  affiliations?: string[]; // ids d'équipes/organisations (characters de type équipe)
  allies?: string[];
  enemies?: string[];
  relations?: { characterId: string; nature: string }[];
  productions?: string[];
  continuities: ContinuityId[];
  description?: string;
  /** Mots-clés utilisés par le moteur d'association des actualités. */
  matchTerms?: string[];
  sources?: SourceRef[];
  lastVerified?: string;
}

export type PersonRole =
  | "acteur"
  | "realisateur"
  | "scenariste"
  | "producteur"
  | "compositeur"
  | "superviseur-vfx"
  | "monteur"
  | "directeur-photo"
  | "chef-decorateur"
  | "costumier"
  | "cascadeur";

export interface Person {
  id: string;
  name: string;
  roles: PersonRole[];
  bio?: string;
  sources?: SourceRef[];
  lastVerified?: string;
}

export type BtsCategory =
  | "realisation"
  | "scenario"
  | "direction-artistique"
  | "cinematographie"
  | "cameras-eclairage"
  | "montage"
  | "effets-visuels"
  | "cgi-compositing"
  | "motion-capture"
  | "musique"
  | "design-sonore"
  | "costumes"
  | "decors"
  | "cascades"
  | "storyboards"
  | "concept-art"
  | "making-of"
  | "interviews"
  | "scenes-coupees";

export interface BehindTheScenes {
  id: string;
  title: string;
  category: BtsCategory;
  productionIds: string[];
  personIds?: string[];
  summary: string;
  /** Liens vers documentaires, vidéos ou articles d'origine. */
  sources?: SourceRef[];
  lastVerified?: string;
}

export interface TimelineEra {
  id: string;
  label: string;
  period: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  eraId: string;
  /** Année ou période narrative (texte libre ; certaines dates du MCU sont débattues). */
  when: string;
  title: string;
  description: string;
  productionIds: string[];
  spoiler: boolean;
  /** Si la datation est contestée ou incohérente entre productions. */
  disputed?: string;
  sources?: SourceRef[];
}

export interface Universe {
  id: string;
  designation: string; // ex. « Terre-616 », « Terre-199999 »
  name: string;
  description: string;
  continuity: ContinuityId;
  productionIds: string[];
  /** Connexions confirmées à l'écran ou par une source officielle uniquement. */
  confirmedLinks?: { universeId: string; via: string; productionId: string }[];
  notes?: string;
  sources?: SourceRef[];
}

export type QuizLevel = "debutant" | "intermediaire" | "expert";
export type QuizCategory = "mcu" | "personnages" | "chronologie" | "films-series" | "coulisses" | "comics" | "multivers";

export interface QuizQuestion {
  id: string;
  level: QuizLevel;
  category: QuizCategory;
  question: string;
  choices: string[];
  answer: number; // index dans choices
  explanation: string;
  source: SourceRef;
}

export type CalendarKind = "sortie-film" | "sortie-serie" | "episode" | "evenement" | "convention" | "bande-annonce";

export interface CalendarEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  endDate?: string;
  kind: CalendarKind;
  title: string;
  productionId?: string;
  certainty: DateCertainty;
  location?: string;
  sources?: SourceRef[];
  lastVerified?: string;
}

/* ───────────── Actualités ───────────── */

export type Reliability = "officiel" | "reporte" | "rumeur" | "theorie";

export type NewsCategory =
  | "marvel-studios"
  | "mcu"
  | "films"
  | "series"
  | "casting"
  | "realisation"
  | "production"
  | "comics"
  | "animation"
  | "jeux-video"
  | "disney-marvel"
  | "bandes-annonces";

export type SourceTier = "officielle" | "media" | "fan";

export interface NewsSource {
  id: string;
  name: string;
  homepage: string;
  feedUrl: string;
  format: "rss" | "atom" | "youtube-api";
  tier: SourceTier;
  language: "fr" | "en";
  /** true : flux généraliste → on ne garde que les articles liés à Marvel. */
  requiresMarvelFilter: boolean;
  /** Fréquence minimale entre deux récupérations (minutes). */
  minIntervalMinutes: number;
  enabled: boolean;
  notes?: string;
}

export interface Article {
  id: string; // hash stable de l'URL canonique
  sourceId: string;
  sourceName: string;
  sourceTier: SourceTier;
  url: string;
  title: string;
  /** Résumé affiché (français si disponible). */
  summary: string;
  summaryLang: "fr" | "en";
  summaryKind: "extrait-source" | "resume-ia" | "aucun";
  originalExcerpt?: string;
  imageUrl?: string;
  publishedAt: string;
  fetchedAt: string;
  lastCheckedAt: string;
  updatedAt?: string;
  revision: number;
  reliability: Reliability;
  reliabilityReason: string;
  categories: NewsCategory[];
  productionIds: string[];
  characterIds: string[];
  /** Regroupement des articles traitant du même sujet (détection de doublons). */
  clusterId: string;
  isTrailer: boolean;
  contentHash: string;
  youtubeId?: string;
}

export interface IngestionRun {
  id: string;
  startedAt: string;
  finishedAt?: string;
  trigger: "cron" | "manuel" | "cli";
  status: "en-cours" | "succes" | "partiel" | "echec";
  stats: { fetched: number; created: number; updated: number; skipped: number; duplicates: number; errors: number };
  log: { level: "info" | "warn" | "error"; sourceId?: string; message: string; at: string }[];
}

export interface SourceHealth {
  sourceId: string;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  consecutiveFailures: number;
  etag?: string;
  lastModified?: string;
  lastItemCount?: number;
}
