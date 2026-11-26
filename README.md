# MARVEL HQ

Portail personnel consacré à l'univers Marvel : actualités récupérées automatiquement et classées par fiabilité, encyclopédie du MCU et de l'univers étendu, chronologies narrative et de sortie, multivers, coulisses de fabrication, casting et équipes, calendrier, bibliothèque personnelle et quiz.

> Portail de fan **indépendant**, non affilié à Marvel ni à Disney. Aucun logo officiel ni visuel protégé n'est utilisé : les affiches sont typographiques (ou issues de TMDB si vous l'activez, avec attribution).

- Application en français, responsive (smartphone, tablette, ordinateur).
- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4.
- Base de données : **SQLite intégré à Node** en local (aucune installation), **PostgreSQL / Supabase** en production (`DATABASE_URL`).

Documentation détaillée : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/SOURCES.md`](docs/SOURCES.md) · [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) · [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md)

---

## Démarrage rapide

Prérequis : **Node.js ≥ 22.13** (pour le module `node:sqlite`).

```bash
npm install
cp .env.example .env.local     # facultatif en local : tout fonctionne sans clé
npm run ingest                 # première récupération des actualités
npm run dev                    # http://localhost:3000
```

Production locale : `npm run build && npm start`.

> Derrière un proxy d'entreprise, le `fetch` natif de Node n'utilise pas `HTTPS_PROXY` par défaut : lancez les scripts avec `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Développement, build de production, serveur de production |
| `npm run ingest` | Récupère les actualités (respecte les intervalles des sources). `-- --force`, `-- --watch`, `-- --source=d23,deadline-marvel` |
| `npm run verify-data` | Confronte les fiches (dates, réalisation, musique, durées, saisons, titres FR) aux infobox Wikipédia ; résultat affiché sur chaque fiche |
| `npm run check-links` | Vérifie tous les liens de sources du corpus |
| `npm run sync:tmdb` | Affiches TMDB (optionnel, clé gratuite) |
| `npm run db:backup` | Sauvegarde de la base (`data/backups/`, rotation 14) |
| `npm test` | Tests unitaires et d'intégration (Vitest) — dont l'ingestion de bout en bout sur flux simulés |
| `npm run test:e2e` | Tests navigateur (Playwright) sur un serveur lancé : crawl de toutes les pages, mobile, favoris, spoilers, recherche, quiz |
| `npm run lint` | Vérification TypeScript |

---

## Bilan

### Fonctionnalités réalisées (et testées)

| Rubrique | État |
|---|---|
| **Le QG** (accueil) | Tableau de bord personnalisable (ordre et visibilité des modules mémorisés) : prochaines sorties, annonces officielles, dernières actualités, bandes-annonces, rumeurs/théories séparées, favoris, événements, sorties récentes, productions les plus citées dans l'actualité (popularité mesurée). |
| **Actualités** | Ingestion automatique de 7 flux publics + YouTube (via API). Classement **OFFICIEL / REPORTÉ / RUMEUR / THÉORIE**, catégories, association aux productions et personnages, détection des doublons (URL canonique) et regroupement par sujet (un sujet repris par plusieurs médias = une seule entrée, jamais compté comme confirmations multiples), corrections des sources appliquées (révision + date), filtres par fiabilité, catégorie, date, production, personnage, source et mot-clé, pagination. Chaque article : titre, image du flux, résumé, date de publication, de récupération, de dernière vérification, source, lien original, statut et justification. |
| **Univers MCU** | 61 productions (films, séries, animation, courts, présentations spéciales) + 11 séries Marvel Television présentées séparément. Tri par sortie, ordre narratif officiel (Saga de l'Infini), phase. |
| **Univers étendu** | Fox (X-Men, 4 Fantastiques), Sony (Raimi, Webb, SSU), Spider-Verse, anciens films, animation, jeux vidéo, comics fondateurs — chacun dans **sa propre continuité**. |
| **Identité colorée** | Chaque production (131) a sa propre palette de 3 couleurs et son ambiance (ex. *Loki* : vert et or ; *Captain America* : bleu, blanc, rouge ; *Avengers: Doomsday* : vert de Fatalis), appliquée à l'affiche, au halo de la fiche, aux accents et aux boutons. Palettes dans `src/data/themes.ts` ; lisibilité du texte contrôlée automatiquement (WCAG AA). |
| **Musique** | Section « Musique » sur chaque fiche (compositeur de la bande originale + chansons emblématiques documentées) et page « Bandes originales » (par compositeur, par film, chansons). Boutons d'écoute vers Spotify, YouTube Music, Deezer et Apple Music : ce sont des **liens de recherche**, jamais des adresses devinées ; la musique reste chez ses ayants droit. Chansons trouvables dans la recherche globale. |
| **Fiches productions** | Synopsis, dates (US, France), durée, saisons/épisodes, réalisation, scénario, musique, photo, distribution avec liens personnes ↔ personnages, studios, VFX, connexions confirmées, bande-annonce (lecteur sans cookie avant clic), coulisses, chronologie, actualités liées, sources, **badge de vérification automatique** et détail des écarts. |
| **Personnages** | 88 fiches (héros, vilains, anti-héros, secondaires, équipes, organisations) : identité civile, alias, première apparition (comic + MCU), interprètes **par continuité**, capacités, affiliations, alliés, adversaires, relations (et relations inverses), productions, actualités. |
| **Chronologie** | Deux systèmes distincts : événements narratifs par époques (datations contestées signalées) et sorties par phase (aucune date inventée pour les projets annoncés). |
| **Multivers** | Univers et désignations, carte des **seules connexions confirmées à l'écran**. |
| **Coulisses** | 19 catégories (réalisation… scènes coupées), 22 fiches factuelles sourcées + articles de fabrication détectés automatiquement dans l'actualité. |
| **Casting et équipes** | ≈ 380 professionnels dérivés des crédits (acteurs, réalisateurs, scénaristes, compositeurs, monteurs, chefs opérateurs, costumiers, chefs décorateurs). |
| **Calendrier** | Vue liste (à venir / passé) et vue mois ; dates officielles distinguées des estimées. |
| **Bibliothèque** | Favoris, vus, progression des séries et du MCU par phase, notes personnelles et notes sur 10, liste « à regarder », articles sauvegardés, personnages suivis, historique ; export/import JSON. |
| **Quiz** | 32 questions sourcées, 3 niveaux, 7 catégories, explication + source après chaque réponse. |
| **Recherche globale** | Palette instantanée (Ctrl K ou `/`) avec suggestions pendant la saisie, page de résultats par catégorie (films, séries, personnages, acteurs, réalisateurs, compositeurs, articles, événements, comics, jeux, coulisses), classement par pertinence. |
| **Mode sans spoilers** | Masque événements de chronologie, connexions et actualités des productions non vues. |
| **Filtres persistants**, **historique**, **chargement progressif**, pages d'erreur, en-têtes de sécurité. |

### Fonctionnalités incomplètes ou limitées

- **Résumés en français** : les sources francophones (AlloCiné, Écran Large) fournissent un extrait français ; pour les sources anglophones, l'extrait original est affiché avec la mention « Extrait VO », sauf si vous activez la traduction par l'API Claude (payante, voir Coûts). Aucun résumé n'est fabriqué.
- **Chaîne YouTube officielle** : inactive tant que `YOUTUBE_API_KEY` n'est pas fournie (le flux RSS YouTube est interdit aux robots).
- **Images** : pas d'affiches officielles sans TMDB ; images d'articles affichées uniquement si le flux les fournit.
- **Ordre narratif post-Endgame** : Marvel n'a pas publié d'ordre officiel unique ; ces productions sont rangées par date de sortie (signalé).
- **Comics** : l'API officielle Marvel n'est pas exploitable actuellement (voir sources) ; seuls des numéros fondateurs sont référencés manuellement.
- **Comptes utilisateurs** : non implémentés (facultatifs en V1) ; la bibliothèque vit dans le navigateur (export/import pour la sauvegarder).
- **Épisodes annoncés / dates de bandes-annonces** : aucune source fiable structurée ; seules les sorties et événements confirmés sont au calendrier.
- **Vérification Wikipédia** : limitée par le débit de l'API (une page/minute depuis certaines IP partagées) ; les écarts sont signalés, pas corrigés automatiquement.

---

## Sources de données connectées

| Source | Type | Statut |
|---|---|---|
| The Walt Disney Company — `thewaltdisneycompany.com/feed/` | RSS officiel | ✅ connecté (filtré sur Marvel) |
| D23 — `d23.com/feed/` | RSS officiel | ✅ connecté (filtré sur Marvel) |
| Marvel Entertainment (YouTube @marvel) | API YouTube Data v3 | ⏸ clé gratuite requise |
| Deadline (tag Marvel Studios) | RSS média | ✅ connecté |
| Variety (tag Marvel) | RSS média | ✅ connecté |
| The Hollywood Reporter (tag Marvel) | RSS média | ✅ connecté |
| AlloCiné, Écran Large | RSS média (FR) | ✅ connectés (filtrés sur Marvel) |
| Wikipédia (API MediaWiki) | Vérification du corpus | ✅ script `verify-data` |
| TMDB | Affiches, contrôle des dates | ⏸ clé gratuite optionnelle |
| marvel.com, API Marvel Comics, IMDb | — | ❌ non exploitables légalement / techniquement (détails dans `docs/SOURCES.md`) |

## Clés API à obtenir (toutes facultatives)

| Variable | Où | Coût |
|---|---|---|
| `YOUTUBE_API_KEY` | Google Cloud Console → activer « YouTube Data API v3 » → Identifiants → Clé API | Gratuit (10 000 unités/jour ; ~24 utilisées/jour) |
| `TMDB_READ_TOKEN` | themoviedb.org → Paramètres → API → « API Read Access Token » | Gratuit (usage non commercial, attribution affichée) |
| `ANTHROPIC_API_KEY` | console.anthropic.com | **Payant** à l'usage (voir ci-dessous) |
| `DATABASE_URL` | Supabase → Project Settings → Database | Gratuit (offre Free) |
| `CRON_SECRET`, `ADMIN_TOKEN` | à générer : `openssl rand -hex 32` | — |

## Coûts

- **0 €** dans la configuration par défaut (SQLite local, flux RSS, Vercel Hobby, Supabase Free, GitHub Actions).
- **Optionnel et payant : traduction FR par l'API Claude.** Modèle par défaut `claude-opus-5-5` (4 $ / 20 $ par million de jetons entrée/sortie) ; environ 300 jetons en entrée et 150 en sortie par article → ≈ 0,005 $ par article, soit ≈ 1 à 2 $ par mois pour ~15 articles/jour. `SUMMARY_MODEL=claude-haiku-5-5` divise ce coût par ~40. Plafond par exécution : `MAX_AI_SUMMARIES_PER_RUN` (25 par défaut). **Rien n'est activé sans votre clé.**
- Limites des offres gratuites : Vercel Hobby (cron **quotidien** uniquement → utiliser le workflow GitHub Actions fourni pour une fréquence horaire), Supabase Free (500 Mo, mise en pause après 7 jours d'inactivité).

## Déploiement (résumé)

Voir [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md). En bref : créer une base Supabase, importer le dépôt sur Vercel, définir `DATABASE_URL`, `CRON_SECRET`, `ADMIN_TOKEN` (+ clés optionnelles), déployer, puis activer le workflow GitHub Actions d'ingestion horaire. **Le site n'est pas indexé par les moteurs de recherche** (`robots: noindex`) tant que vous ne décidez pas de le publier.

## Maintenance (résumé)

Voir [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) : ajouter une production ou un personnage (fichiers `src/data/*.ts`), relancer `npm run verify-data`, ajouter une source RSS (`src/data/sources.ts`), surveiller `/sources` et `/api/health`, sauvegarder la base.
