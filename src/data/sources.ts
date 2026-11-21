import type { NewsSource } from "@/lib/types";

/**
 * Sources d'actualités. Uniquement des flux publics (RSS/Atom) proposés par les éditeurs
 * eux-mêmes : aucune extraction de pages HTML, aucun contournement de protection.
 *
 * Accessibilité testée le 2026-11-21 depuis l'environnement de développement :
 * - youtube.com/feeds/videos.xml : interdit par robots.txt → API YouTube Data v3 à la place.
 * - www.marvel.com : répond 403 aux clients automatisés → NON utilisé (pas de flux public).
 *   Alternative légale : la chaîne YouTube officielle @marvel (flux Atom public).
 * - developer.marvel.com redirige vers marvel.com et gateway.marvel.com répond « Internal server error » :
 *   l'API Comics officielle n'est pas exploitable actuellement (voir docs/SOURCES.md).
 * - IMDb : pas d'API publique gratuite ; l'extraction de pages est interdite par ses conditions → NON utilisé.
 *
 * `tier` :
 *  - officielle : émetteur officiel (Disney, D23, Marvel) → peut produire le statut OFFICIEL.
 *  - media      : média identifiable → statut REPORTÉ (ou RUMEUR selon le contenu).
 */
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "youtube-marvel",
    name: "Marvel Entertainment (YouTube)",
    homepage: "https://www.youtube.com/@marvel",
    feedUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCvC4D8onUfXzvjTOM-dBfEA",
    format: "youtube-api",
    tier: "officielle",
    language: "en",
    requiresMarvelFilter: false,
    minIntervalMinutes: 60,
    enabled: true,
    notes:
      "Chaîne officielle @marvel. Le flux RSS YouTube est interdit aux robots (robots.txt : Disallow /feeds/videos.xml) : on passe par l'API officielle YouTube Data v3 (clé gratuite YOUTUBE_API_KEY requise).",
  },
  {
    id: "disney-company",
    name: "The Walt Disney Company",
    homepage: "https://thewaltdisneycompany.com/",
    feedUrl: "https://thewaltdisneycompany.com/feed/",
    format: "rss",
    tier: "officielle",
    language: "en",
    requiresMarvelFilter: true,
    minIntervalMinutes: 60,
    enabled: true,
    notes: "Communiqués du groupe Disney (maison mère de Marvel). Filtré sur les sujets Marvel.",
  },
  {
    id: "d23",
    name: "D23",
    homepage: "https://d23.com/",
    feedUrl: "https://d23.com/feed/",
    format: "rss",
    tier: "officielle",
    language: "en",
    requiresMarvelFilter: true,
    minIntervalMinutes: 60,
    enabled: true,
    notes: "Club officiel des fans Disney. Filtré sur les sujets Marvel.",
  },
  {
    id: "deadline-marvel",
    name: "Deadline",
    homepage: "https://deadline.com/",
    feedUrl: "https://deadline.com/tag/marvel-studios/feed/",
    format: "rss",
    tier: "media",
    language: "en",
    requiresMarvelFilter: false,
    minIntervalMinutes: 60,
    enabled: true,
    notes: "Média professionnel (industrie). Flux du tag Marvel Studios.",
  },
  {
    id: "variety-marvel",
    name: "Variety",
    homepage: "https://variety.com/",
    feedUrl: "https://variety.com/t/marvel/feed/",
    format: "rss",
    tier: "media",
    language: "en",
    requiresMarvelFilter: true,
    minIntervalMinutes: 60,
    enabled: true,
    notes: "Flux du tag Marvel ; filtre appliqué car le tag inclut parfois des sujets connexes.",
  },
  {
    id: "thr-marvel",
    name: "The Hollywood Reporter",
    homepage: "https://www.hollywoodreporter.com/",
    feedUrl: "https://www.hollywoodreporter.com/t/marvel/feed/",
    format: "rss",
    tier: "media",
    language: "en",
    requiresMarvelFilter: true,
    minIntervalMinutes: 60,
    enabled: true,
  },
  {
    id: "allocine",
    name: "AlloCiné",
    homepage: "https://www.allocine.fr/",
    feedUrl: "https://www.allocine.fr/rss/news.xml",
    format: "rss",
    tier: "media",
    language: "fr",
    requiresMarvelFilter: true,
    minIntervalMinutes: 60,
    enabled: true,
    notes: "Média français généraliste ; seuls les articles liés à Marvel sont conservés.",
  },
  {
    id: "ecranlarge",
    name: "Écran Large",
    homepage: "https://www.ecranlarge.com/",
    feedUrl: "https://www.ecranlarge.com/feed/",
    format: "rss",
    tier: "media",
    language: "fr",
    requiresMarvelFilter: true,
    minIntervalMinutes: 60,
    enabled: true,
    notes: "Média français généraliste ; seuls les articles liés à Marvel sont conservés.",
  },
];

export const USER_AGENT =
  "MarvelHQ/0.1 (portail de fan personnel, non commercial; lecture de flux RSS publics)";
