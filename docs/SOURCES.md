# Sources de données — étude et décisions

Tests réalisés le 21 novembre 2026 depuis l'environnement de développement. Principe : **n'utiliser que des flux ou API publiés à cet effet, respecter `robots.txt` et les conditions d'utilisation, ne rien contourner.**

## Sources demandées

| Source | Constat | Décision |
|---|---|---|
| **marvel.com** | Aucun flux RSS public. Le site répond HTTP 403 aux clients automatisés (y compris `robots.txt`). | Non utilisé. Pas de contournement. Les annonces Marvel sont couvertes par la chaîne YouTube officielle, Disney, D23 et les médias professionnels. |
| **thewaltdisneycompany.com** | Flux RSS WordPress public (`/feed/`). | ✅ Source **officielle**, filtrée sur les sujets Marvel. |
| **d23.com** | Flux RSS public (`/feed/`). | ✅ Source **officielle**, filtrée sur les sujets Marvel. |
| **YouTube @marvel** | Flux `feeds/videos.xml` existant mais **interdit aux robots** (`robots.txt` : `Disallow: /feeds/videos.xml`). | Remplacé par l'**API YouTube Data v3** officielle (`playlistItems.list` sur la playlist des mises en ligne, 1 unité de quota par appel). Clé gratuite requise. |
| **imdb.com** | Pas d'API publique gratuite (l'API officielle est commerciale via AWS Data Exchange). Les conditions d'utilisation interdisent l'extraction automatisée. Les jeux de données « non commerciaux » existent mais sont volumineux et sans affiches. | Non utilisé. Les crédits proviennent du corpus éditorial vérifié contre Wikipédia. |
| **marvel.com/corporate/developer** (API Marvel Comics) | `developer.marvel.com` redirige vers marvel.com ; `gateway.marvel.com/v1/public/characters` répond `{"message": "Internal server error"}`. Le portail développeur semble fermé. | Non exploitable actuellement. Le module comics repose sur des numéros fondateurs saisis et sourcés. À réévaluer si Marvel rouvre l'API (clé publique + privée, attribution « Data provided by Marvel » obligatoire, 3 000 appels/jour selon ses anciennes conditions). |

## Sources ajoutées

| Source | Type | Fiabilité attribuée | Remarques |
|---|---|---|---|
| Deadline — tag Marvel Studios | RSS | REPORTÉ (ou RUMEUR selon le texte) | Presse professionnelle de l'industrie. |
| Variety — tag Marvel | RSS | idem | Filtré (le tag inclut des sujets connexes). |
| The Hollywood Reporter — tag Marvel | RSS | idem | Filtré. |
| AlloCiné — actualités | RSS (FR) | idem | Généraliste, filtré ; fournit des extraits en français. |
| Écran Large | RSS (FR) | idem | Généraliste, filtré ; extraits en français. |

Aucune source « fan » n'est connectée par défaut. Le type `fan` existe (statut maximal RUMEUR/THÉORIE) si vous souhaitez en ajouter.

## Données de référence

| Source | Usage | Licence / limites |
|---|---|---|
| **Wikipédia** (API MediaWiki) | Vérification automatique des fiches (`npm run verify-data`) : dates, réalisation, musique, durées, saisons, épisodes, titres d'articles FR. Liens « Sources » des fiches. | CC BY-SA ; débit limité (HTTP 429 fréquents depuis des IP partagées : le script attend et reprend). |
| **Wikidata** | Envisagé en premier (données CC0, structurées). | API très limitée depuis des IP partagées (429 systématiques) : abandonné au profit de Wikipédia. |
| **TMDB** | Affiches et contrôle croisé des dates (optionnel). | Gratuit, non commercial, attribution obligatoire (affichée). Correspondance retenue seulement si l'année concorde. |

## Règles de fiabilité

| Statut | Attribution automatique |
|---|---|
| OFFICIEL | Uniquement si l'émetteur est officiel (Disney, D23, YouTube Marvel). |
| REPORTÉ | Média identifiable, information présentée comme un fait rapporté. |
| RUMEUR | Titre ou première phrase signalant une rumeur, une fuite, un « insider », une information non confirmée. |
| THÉORIE | Titre présentant une théorie, une hypothèse, une spéculation. |

Un sujet repris par plusieurs médias forme un seul regroupement : l'interface affiche « N sources » et rappelle qu'il ne s'agit pas de confirmations indépendantes. Si une source officielle traite le même sujet, la fiche de l'article le signale, sans modifier le statut des autres articles.

## Ajouter une source

1. Vérifier qu'elle publie un flux RSS/Atom public, que `robots.txt` ne l'interdit pas et que ses conditions le permettent.
2. Ajouter une entrée dans `src/data/sources.ts` (`tier`, `language`, `requiresMarvelFilter`, `minIntervalMinutes`).
3. `npm run ingest -- --source=<id> --force` puis vérifier le résultat sur `/sources`.
