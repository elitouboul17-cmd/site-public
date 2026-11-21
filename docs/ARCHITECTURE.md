# Architecture technique

## Vue d'ensemble

```
┌──────────────────────────── Next.js 16 (App Router, TypeScript) ────────────────────────────┐
│  Pages (src/app)            Composants (src/components)        API (src/app/api)           │
│  QG, actualités, MCU,       Shell, recherche, cartes,          /api/search   (lecture)     │
│  fiches, chronologies,      bibliothèque, quiz, spoilers…      /api/news     (lecture)     │
│  coulisses, calendrier…                                        /api/health   (lecture)     │
│                                                                /api/cron/ingest (Bearer)   │
└────────────┬──────────────────────────────┬─────────────────────────────┬──────────────────┘
             │                              │                             │
   Corpus éditorial versionné     Base de données (src/lib/db)     Ingestion (src/lib/ingest)
   src/data/*.ts                  SQLite (node:sqlite) en local    fetch RSS/Atom/API → parse →
   productions, personnages,      PostgreSQL/Supabase en prod      filtre → classe → associe →
   chronologie, multivers,        articles, exécutions, santé      dédoublonne → regroupe →
   coulisses, quiz, sources       des sources, médias TMDB         enregistre + journalise
             │
   Vérification : scripts/verify-data.ts → src/data/verification.json (affiché sur les fiches)
```

## Choix et justifications

| Besoin | Choix | Pourquoi |
|---|---|---|
| Interface | Next.js 16 + React 19 + Tailwind 4 | Rendu serveur (rapide, peu de JS), routes API intégrées, déploiement Vercel natif. |
| Données encyclopédiques | Fichiers TypeScript versionnés (`src/data`) | Contenu éditorial relu, typé, testé (`tests/data-integrity.test.ts`), historisé par Git. Une base n'apporterait rien ici et rendrait la relecture plus difficile. |
| Données dynamiques (actualités) | Base SQL avec deux pilotes | SQLite intégré à Node 22 : zéro installation en local. PostgreSQL (Supabase) en production via `DATABASE_URL`. Un seul jeu de requêtes (types communs, paramètres `$n`). |
| Bibliothèque personnelle | `localStorage` + export/import JSON | Pas de compte en V1 (facultatif selon le cahier des charges). Lecture/écriture protégées (navigation privée). |
| Planification | Route `/api/cron/ingest` protégée | Appelable par Vercel Cron, GitHub Actions, un cron système ou `npm run ingest -- --watch`. |
| Résumés FR | Optionnel, API Claude (SDK officiel) | Désactivé sans clé ; consigne stricte de ne rien ajouter ; résultat étiqueté « Résumé traduit (IA) ». |

## Modèle de données

Types : `src/lib/types.ts`. Tables (migrations versionnées dans `src/lib/db/schema.ts`, appliquées automatiquement au premier accès) :

- `articles` : un article par URL canonique (`id` = SHA-256 tronqué). Champs de fiabilité, catégories, productions/personnages liés (JSON), `cluster_id` (sujet), `revision`, `content_hash`, dates de publication/récupération/vérification/modification.
- `ingestion_runs` : chaque exécution, ses statistiques et son journal.
- `source_health` : dernier succès/échec par source, échecs consécutifs, `ETag`/`Last-Modified`.
- `production_media` : affiches TMDB (optionnel).
- `schema_migrations`.

Ajouter une migration : ajouter `{ id: 2, sql: "…" }` au tableau `MIGRATIONS` (SQL compatible SQLite et PostgreSQL).

## Pipeline d'ingestion (`src/lib/ingest`)

1. **Planification** : chaque source a un intervalle minimal ; après des échecs, recul exponentiel (×2 par échec, plafond 24 h). Une exécution « en cours » depuis plus de 30 min est marquée en échec (processus interrompu) ; deux exécutions ne se chevauchent pas.
2. **Récupération** (`run.ts`) : vérification de `robots.txt`, requête conditionnelle, délai de 15 s, taille maximale 5 Mo, User-Agent identifiable. YouTube passe par l'API officielle.
3. **Analyse** (`parse.ts`) : RSS 2.0 et Atom ; le HTML est réduit à du texte brut (aucun HTML de source n'est ré-affiché).
4. **Filtrage** (`classify.ts`) : pour les flux généralistes, seuls les articles liés à Marvel sont gardés.
5. **Classification** : fiabilité (règles explicites, testées), catégories, association aux productions (titres et variantes de ponctuation ; titres génériques exclus ; titres anciens hors MCU exigent l'année) et personnages.
6. **Doublons** (`dedupe.ts`) : URL canonique (sans paramètres de suivi) → doublon exact ; contenu modifié → mise à jour + révision ; sujet identique (similarité de titres ≥ 0,5, ou ≥ 0,3 avec une production/un personnage commun, fenêtre 4 jours) → même `cluster_id`.
7. **Journalisation** et santé des sources ; une source en erreur n'interrompt jamais les autres.

## Sécurité

- Secrets uniquement en variables d'environnement (`.env.example` sans valeur réelle) ; aucune clé côté navigateur.
- `/api/cron/ingest` : `Authorization: Bearer` comparé en temps constant à `CRON_SECRET` ou `ADMIN_TOKEN` (refus si absent, laissé à `change-me` ou < 16 caractères).
- Entrées validées (`zod` sur `/api/news`, expressions régulières sur les identifiants, longueur des recherches bornée) ; requêtes SQL paramétrées.
- En-têtes : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` ; `x-powered-by` retiré.
- Contenu externe affiché en texte brut ; images de flux chargées avec `referrerPolicy=no-referrer` ; vidéos YouTube via `youtube-nocookie.com`, chargées seulement au clic, iframe en bac à sable.
- Site non indexé (`robots: noindex`) jusqu'à décision de publication.

## Tests

- `tests/data-integrity.test.ts` : unicité des identifiants, références croisées valides, formats de dates, aucune date « officielle » sans date, sources présentes partout.
- `tests/classify.test.ts` : fiabilité, association, doublons, analyse des flux, `robots.txt`.
- `tests/ingest.test.ts` : ingestion complète sur flux simulés (base SQLite temporaire) : création, filtrage, statut, regroupement, source en panne, source interdite par `robots.txt`, doublons, correction de la source, intervalle minimal.
- `tests/e2e.cjs` (Playwright) : crawl de toutes les pages internes, erreurs JS, débordement mobile, favoris, mode sans spoilers, recherche, quiz, filtres persistants, sécurité de la route cron.

## Étendre l'application

- **Nouvelle rubrique** : un dossier dans `src/app/<rubrique>/page.tsx` + une entrée dans `src/components/nav.ts`.
- **Nouvelle source** : une entrée dans `src/data/sources.ts` (flux RSS/Atom public uniquement).
- **Nouveau module du QG** : ajouter l'identifiant dans `WidgetId`/`DEFAULT_WIDGETS` (`src/lib/library.ts`), son libellé dans `Dashboard.tsx` et son contenu dans `src/app/page.tsx`.
