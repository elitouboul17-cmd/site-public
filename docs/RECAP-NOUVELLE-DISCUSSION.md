# Récap complet — « Le QG des Héros » (prompt à coller dans une nouvelle discussion)

Copie tout le bloc ci-dessous dans une nouvelle discussion Claude Code (même dépôt).

---

Tu reprends mon projet **« Le QG des Héros »** (ex-« MARVEL HQ »). Tutoie-moi et réponds en français.

## Le projet
Appli web (PWA) française, responsive, sur tout l'univers Marvel : MCU en priorité, séries Marvel TV, films Fox et Sony, animation, comics, jeux, personnages, actualités, coulisses, chronologie et multivers, calendrier des sorties, bibliothèque perso (vu / à voir / favoris / notes), quiz, recherche globale et mode sans spoilers.
Les actualités sont récupérées automatiquement (flux RSS et API autorisés) et classées par fiabilité : **OFFICIEL / REPORTÉ / RUMEUR / THÉORIE**, jamais mélangées. Les doublons sont regroupés, et les reprises d'un même article ne comptent pas comme des confirmations indépendantes.

- Dépôt : `elitouboul17-cmd/site-public`, branche **`claude/marvel-hq-portal-gjr719`**. C'est la branche de production de Vercel : chaque push redéploie le site.
- Site privé, protégé par mot de passe : https://qg-des-heros.vercel.app (projet Vercel `qg-des-heros`)
- Base de données : Supabase Postgres (région eu-west-1, pooler `aws-1-eu-west-1.pooler.supabase.com:6543`). En local : SQLite (`node:sqlite`).
- Stack : Next.js 16 (App Router, `src/proxy.ts`), React 19, TypeScript, Tailwind 4 (classes perso dans `@layer components`), Vitest (44 tests), test de bout en bout Playwright `tests/e2e.cjs` (15/15).
- Documentation : `README.md`, `docs/ARCHITECTURE.md`, `docs/SOURCES.md`, `docs/DEPLOIEMENT.md`, `docs/MAINTENANCE.md`, captures dans `docs/captures/`.

## Ce qui est fait et testé
- 131 productions, 88 personnages, environ 385 personnes, chronologie, multivers, coulisses, calendrier, quiz (32 questions), recherche, bibliothèque locale, filtres mémorisés, mode sans spoilers.
- Ingestion des actualités : 8 sources, respect de robots.txt, détection des doublons, gestion des corrections, santé des sources. Tâche planifiée Vercel une fois par jour (`/api/cron/ingest`), plus une GitHub Action horaire (`.github/workflows/ingest.yml`).
- Une identité de couleurs par production (`src/data/themes.ts`).
- Images : affiches et fonds TMDB, photos libres Wikimedia Commons (303 personnes).
- Musique : lecteurs Deezer et Apple Music intégrés, page « Bandes originales ».
- Vidéos : environ 1 000 bandes-annonces, teasers et coulisses YouTube officiels (via TMDB), galerie sur chaque fiche, lecture youtube-nocookie au clic.
- Box-office : budget et recettes de 73 films, page `/box-office`.
- « Où regarder en France » (données JustWatch via TMDB).
- Article Wikipédia complet dans l'appli (`/productions/[id]/wikipedia`) : texte nettoyé, licence CC BY-SA citée, aucun lien vers l'extérieur.
- Version privée : mot de passe (`SITE_PASSWORD`) et installation sur téléphone (PWA).
- **Dernière passe mobile** : la galerie vidéo élargissait chaque fiche à 2 216 px (d'où le dézoom). Corrigé avec `min-w-0` et `overflow-x: clip` sur html et body. Effets lourds allégés sur téléphone (flou, ombres), tap instantané, pas d'effet de survol « collant ». Les 25 pages vérifiées à 360 px de large ne débordent plus.

## Ce qui reste à faire
1. **Optimisation téléphone** : je vais envoyer des captures d'écran de mon téléphone. Corrige ce qui gêne encore (tailles, menus, fluidité). Vérifie toujours à 360 px et 390 px de large, sans aucun défilement horizontal.
2. **Base de données** : erreur `password authentication failed for user "postgres"`, donc pas d'actualités sur le site en ligne. Je dois cliquer sur « Diagnostic base » (page Sources et fiabilité, avec l'`ADMIN_TOKEN`) et t'envoyer le résultat. Ensuite : corriger `DATABASE_URL` dans Vercel, faire un Redeploy, puis cliquer « Récupérer maintenant ».
3. Ajouter les secrets GitHub `QGDESHEROS_URL` et `CRON_SECRET` pour l'ingestion horaire.
4. **APK pour un copain** (téléphone Android filtré par ses parents, sans navigateur) : je le fais moi-même avec PWABuilder (Package ID `app.qgdesheros`, garder la clé de signature). Il faudra aussi un « mode restreint » (pas de liens externes, et éventuellement sans musique ni vidéos) selon la réponse des parents, plus la liste des domaines à autoriser dans leur filtre.
4 bis. **« Mode famille »** voulu par les parents, qui veulent voir ce que leur fils regarde et refusent un navigateur ou des réseaux sociaux ouverts :
   - aucun lien vers l'extérieur : liens externes désactivés ;
   - vidéos limitées aux vidéos officielles de l'appli, sans suggestions ni logo cliquable vers YouTube : bloquer la navigation sortante de l'iframe ou passer par une page de lecture interne ;
   - un **historique consultable par les parents**, protégé par un code PIN parent : pages, vidéos et musiques vues, avec la date ;
   - réglages verrouillés par le PIN : musique oui/non, vidéos oui/non ;
   - livré dans l'APK PWABuilder, avec la liste des domaines à autoriser dans le filtre parental.
4 ter. **Accès partagé** : l'appli a été montrée à 2 copains et 2 créateurs de contenu, en leur précisant qu'elle est privée. Piste à faire : un code d'accès par personne, révocable un par un, à la place du mot de passe unique.
5. Optionnel : Spotify et clé YouTube Data API (gratuites, à demander via le formulaire sécurisé, jamais dans le chat), galerie d'images TMDB, articles Wikipédia pour les personnages, mode hors ligne.

## Règles à respecter absolument
- Aucune dépense ni aucun abonnement sans mon accord. Signale toute dépendance payante et les limites des API avant de les utiliser.
- Pas de publication publique sans mon accord : le site reste privé et non indexé.
- Ne supprime aucun fichier ni projet, ne remplace rien sans sauvegarde, ne supprime aucune branche.
- Aucun secret dans le dépôt : les clés vont dans Vercel, les secrets GitHub ou les secrets réseau de l'environnement.
- N'invente jamais de dates, de casting ou de citations. Garde toujours les sources. Ne contourne pas les protections ni les conditions d'utilisation des sites.
- Ne dis jamais qu'une fonctionnalité marche sans l'avoir testée (`npm test`, `npm run build`, `node tests/e2e.cjs`).
- Push : `git push origin claude/marvel-hq-portal-gjr719`. En cas d'échec, rien de destructif : explique le problème.
- Astuce pour cet environnement : les scripts qui appellent Internet se lancent avec `NODE_USE_ENV_PROXY=1`.
