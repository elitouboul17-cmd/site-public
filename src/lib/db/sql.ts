/**
 * Adaptateur SQL minimal, commun à SQLite (développement local, zéro installation)
 * et PostgreSQL (Supabase ou tout Postgres en production).
 *
 * Les requêtes utilisent des paramètres positionnels `$1, $2…` (syntaxe Postgres).
 * Pour SQLite, ils sont convertis en `?1, ?2…` (syntaxe SQLite équivalente).
 * Le schéma n'emploie que des types communs (TEXT, INTEGER) : dates en ISO-8601,
 * listes en JSON texte. Cela garde un seul jeu de requêtes pour les deux moteurs.
 */

export interface Sql {
  dialect: "sqlite" | "postgres";
  all<T = Record<string, unknown>>(query: string, params?: unknown[]): Promise<T[]>;
  run(query: string, params?: unknown[]): Promise<void>;
  exec(script: string): Promise<void>;
}

type SqliteDb = {
  prepare(q: string): { all(...p: unknown[]): unknown[]; run(...p: unknown[]): unknown };
  exec(q: string): void;
};

let instance: Promise<Sql> | null = null;

function toSqliteParams(query: string) {
  return query.replace(/\$(\d+)/g, "?$1");
}

function normalizeParam(v: unknown) {
  if (v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  return v;
}

async function createSqlite(): Promise<Sql> {
  // Import dynamique : le module n'est chargé que côté serveur et seulement si nécessaire.
  const { DatabaseSync } = (await import("node:sqlite")) as unknown as {
    DatabaseSync: new (path: string) => SqliteDb;
  };
  const fs = await import("node:fs");
  const path = await import("node:path");
  const file = process.env.SQLITE_PATH || "./data/marvelhq.db";
  fs.mkdirSync(path.dirname(path.resolve(/*turbopackIgnore: true*/ file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  return {
    dialect: "sqlite",
    async all<T>(query: string, params: unknown[] = []) {
      return db.prepare(toSqliteParams(query)).all(...params.map(normalizeParam)) as T[];
    },
    async run(query: string, params: unknown[] = []) {
      db.prepare(toSqliteParams(query)).run(...params.map(normalizeParam));
    },
    async exec(script: string) {
      db.exec(script);
    },
  };
}

async function createPostgres(url: string): Promise<Sql> {
  const { default: postgres } = await import("postgres");
  const client = postgres(url, {
    max: Number(process.env.PG_POOL_MAX || 5),
    idle_timeout: 20,
    prepare: false, // compatible avec le pooler Supabase (mode transaction)
    onnotice: () => {},
  });
  return {
    dialect: "postgres",
    async all<T>(query: string, params: unknown[] = []) {
      return (await client.unsafe(query, params.map(normalizeParam) as never[])) as unknown as T[];
    },
    async run(query: string, params: unknown[] = []) {
      await client.unsafe(query, params.map(normalizeParam) as never[]);
    },
    async exec(script: string) {
      await client.unsafe(script);
    },
  };
}

export function getSql(): Promise<Sql> {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    instance = (url ? createPostgres(url) : createSqlite()).then(async (sql) => {
      const { migrate } = await import("./schema");
      await migrate(sql);
      return sql;
    });
    instance.catch(() => {
      instance = null; // nouvel essai au prochain appel
    });
  }
  return instance;
}
