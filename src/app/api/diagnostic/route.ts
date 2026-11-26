import { NextResponse } from "next/server";
import { checkBearer } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Diagnostic de la configuration de la base (réservé à ADMIN_TOKEN).
 * N'affiche JAMAIS le mot de passe : seulement sa longueur et des contrôles de forme.
 */
export async function GET(req: Request) {
  if (!checkBearer(req.headers.get("authorization"), process.env.ADMIN_TOKEN)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const raw = process.env.DATABASE_URL;
  if (!raw) return NextResponse.json({ ok: false, checks: [{ label: "DATABASE_URL définie", ok: false, detail: "Variable absente : base SQLite locale utilisée." }] });

  const checks: { label: string; ok: boolean; detail?: string }[] = [];
  checks.push({ label: "Pas d'espace ni de retour à la ligne autour", ok: raw === raw.trim(), detail: raw === raw.trim() ? undefined : "Il y a un espace ou un saut de ligne au début ou à la fin." });
  checks.push({ label: "Pas de crochets [ ]", ok: !/[[\]]/.test(raw), detail: /[[\]]/.test(raw) ? "Les crochets de [YOUR-PASSWORD] sont encore présents : il faut les supprimer." : undefined });
  checks.push({ label: "Pas de texte YOUR-PASSWORD", ok: !/YOUR-PASSWORD/i.test(raw) });

  let url: URL | null = null;
  try {
    url = new URL(raw.trim());
  } catch {
    checks.push({ label: "Adresse lisible", ok: false, detail: "Format invalide (souvent un caractère spécial non encodé dans le mot de passe : @ # / ? %)." });
  }
  let connection: { ok: boolean; message?: string } | undefined;
  if (url) {
    const password = decodeURIComponent(url.password);
    checks.push({ label: "Protocole postgresql://", ok: /^postgres(ql)?:$/.test(url.protocol), detail: url.protocol });
    checks.push({ label: "Utilisateur", ok: /^postgres\.[a-z0-9]{20}$/.test(decodeURIComponent(url.username)), detail: decodeURIComponent(url.username) });
    checks.push({ label: "Serveur", ok: /\.pooler\.supabase\.com$/.test(url.hostname), detail: url.hostname });
    checks.push({ label: "Port 6543 (pooler de transactions)", ok: url.port === "6543", detail: url.port || "(aucun)" });
    checks.push({ label: "Base « postgres »", ok: url.pathname === "/postgres", detail: url.pathname });
    checks.push({ label: "Mot de passe présent", ok: password.length > 0, detail: `${password.length} caractères (non affiché)` });
    checks.push({ label: "Pas d'espace dans le mot de passe", ok: !/\s/.test(password) });
    checks.push({ label: "Pas de caractère @ # / ? % non encodé", ok: !/[@#/?]/.test(url.password) && !/%(?![0-9A-Fa-f]{2})/.test(url.password) });

    try {
      const { default: postgres } = await import("postgres");
      const sql = postgres(raw.trim(), { max: 1, prepare: false, connect_timeout: 8, idle_timeout: 1, onnotice: () => {} });
      await sql`select 1`;
      await sql.end({ timeout: 2 });
      connection = { ok: true };
    } catch (e) {
      connection = { ok: false, message: (e as Error).message };
    }
  }
  return NextResponse.json({ ok: checks.every((c) => c.ok) && connection?.ok !== false, checks, connection });
}
