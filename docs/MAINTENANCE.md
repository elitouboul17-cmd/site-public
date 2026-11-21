# Maintenance

## Routine

| Fréquence | Action |
|---|---|
| Automatique | Ingestion des actualités (cron). Vérifier de temps en temps `/sources` : une source avec des échecs consécutifs a peut-être changé d'adresse de flux. |
| Hebdomadaire | `npm run db:backup` (si non planifié). |
| Mensuelle | `npm run verify-data` puis consulter les écarts (fiches marquées « Écart signalé ») ; `npm run check-links`. |
| À chaque annonce majeure | Mettre à jour le corpus (nouvelle production, date confirmée, casting officiel). |

## Mettre à jour le corpus

Les données encyclopédiques sont dans `src/data/` :

- `productions-mcu.ts` / `productions-extended.ts` : productions. Une date n'est renseignée que si elle est **officielle ou constatée** ; sinon laisser `releaseDate` vide et `dateCertainty: "inconnue"`. Pour une date estimée par un média, utiliser `dateCertainty: "estimee"` (affichée « Estimée »).
- `characters.ts` : personnages, équipes, organisations. Les interprètes sont rangés **par continuité**.
- `timeline.ts` : époques, événements narratifs (`spoiler: true` si l'événement dévoile l'intrigue ; `disputed` si la datation est contestée), univers et **connexions confirmées uniquement**.
- `behind-the-scenes.ts` : fiches coulisses (faits documentés + sources).
- `quiz.ts`, `events.ts`, `sources.ts`.

Après modification :
```bash
npm test                 # intégrité des références, formats, sources présentes
npm run verify-data -- --only=<id>   # contrôle contre Wikipédia
npm run build
```

Règles éditoriales : ne jamais inventer une date, un casting, une citation ou une connexion ; toujours joindre une source ; signaler les désaccords plutôt que trancher.

## Corriger une erreur de classification d'actualité

Les règles sont dans `src/lib/ingest/classify.ts` (expressions explicites). Ajouter un cas dans `tests/classify.test.ts`, ajuster la règle, relancer `npm test`.

## Dépannage

| Symptôme | Piste |
|---|---|
| Plus aucune actualité | `/api/health` ; `npm run ingest -- --force` en local pour voir le journal. |
| Une source en erreur `HTTP 403/404` | Le flux a changé d'adresse ou bloque désormais les robots : mettre à jour ou désactiver (`enabled: false`). Ne pas contourner. |
| « robots.txt interdit l'accès » | Respecté volontairement. Chercher une API officielle. |
| `fetch failed` derrière un proxy | Lancer les scripts avec `NODE_USE_ENV_PROXY=1`. |
| Vérification Wikipédia très lente | Débit limité par Wikipédia (HTTP 429) : le script patiente ; utiliser `--only=` pour cibler. |
