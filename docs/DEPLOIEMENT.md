# Déploiement

> Ne publiez pas le site sans l'avoir décidé : par défaut il est **non indexé** (`robots: noindex`). Toutes les offres citées ont un niveau gratuit ; aucune n'est souscrite automatiquement.

## Option recommandée : Vercel + Supabase (gratuit)

### 1. Base de données Supabase
1. Créer un projet sur supabase.com (offre Free).
2. *Project Settings → Database → Connection string → URI* : copier l'URL (mode « Transaction pooler », port 6543, adapté au serverless).
3. Rien d'autre à faire : les tables sont créées automatiquement au premier accès (migrations dans `src/lib/db/schema.ts`).

### 2. Application sur Vercel
1. Importer le dépôt GitHub sur vercel.com.
2. Variables d'environnement :
   - `DATABASE_URL` = URL Supabase
   - `CRON_SECRET` et `ADMIN_TOKEN` = deux valeurs différentes générées par `openssl rand -hex 32`
   - `SITE_PASSWORD` = le mot de passe à donner à vos amis (le site entier est alors privé ; changer ce mot de passe déconnecte tout le monde)
   - optionnelles : `YOUTUBE_API_KEY`, `TMDB_READ_TOKEN`, `ANTHROPIC_API_KEY` (payant), `SUMMARY_MODEL`
3. Déployer. Node 22 est requis (paramètre du projet ou `engines` du `package.json`).
4. Première ingestion : depuis `/sources`, saisir `ADMIN_TOKEN` puis « Récupérer maintenant ».

### 3. Planification
- `vercel.json` déclare un cron **quotidien** (limite de l'offre Hobby). Vercel envoie automatiquement `Authorization: Bearer $CRON_SECRET`.
- Pour une fréquence **horaire** gratuite : dans GitHub → *Settings → Secrets and variables → Actions*, créer `QGDESHEROS_URL` (ex. `https://votre-app.vercel.app`) et `CRON_SECRET`. Le workflow `.github/workflows/ingest.yml` s'exécute alors chaque heure (il ne fait rien tant que ces secrets sont absents).
- La durée d'une ingestion (8 sources) est d'environ 10 à 30 s ; la route autorise 60 s.

### 4. Affiches (optionnel)
Depuis votre poste, avec `DATABASE_URL` et `TMDB_READ_TOKEN` dans `.env.local` : `npm run sync:tmdb`.

## Option auto-hébergée (VPS, Raspberry Pi…)

```bash
npm ci && npm run build
# Base SQLite locale par défaut (data/marvelhq.db) — ou DATABASE_URL vers un PostgreSQL
npm start                                   # port 3000
npm run ingest -- --watch                   # dans un second processus (systemd, pm2…)
```
Cron système alternatif : `17 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ingest`.

## Installer l'appli sur un téléphone
- **iPhone (Safari)** : ouvrir le lien → bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : ouvrir le lien → menu ⋮ → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).
L'appli s'ouvre alors en plein écran avec son icône. Une page « hors connexion » s'affiche si le réseau manque.

## Sauvegardes
- Supabase Free : sauvegardes quotidiennes gérées par Supabase (rétention limitée) + `npm run db:backup` (export JSON) à planifier.
- SQLite : `npm run db:backup` (copie cohérente `VACUUM INTO`, rotation des 14 dernières) — à planifier quotidiennement.

## Supervision
- `/api/health` : état de la base, dernière exécution, sources en échec (HTTP 503 si la base est indisponible) — utilisable par un service de surveillance.
- `/sources` : état détaillé de chaque source et journal des exécutions.
