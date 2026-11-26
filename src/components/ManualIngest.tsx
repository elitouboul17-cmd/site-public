"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Déclenchement manuel de l'ingestion, protégé par le jeton d'administration (ADMIN_TOKEN). */
export function ManualIngest() {
  const router = useRouter();
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem("marvelhq:admin") ?? ""; } catch { return ""; }
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [diag, setDiag] = useState<{ ok: boolean; checks: { label: string; ok: boolean; detail?: string }[]; connection?: { ok: boolean; message?: string } } | null>(null);

  const diagnose = async () => {
    setBusy(true);
    setDiag(null);
    setMsg(null);
    try {
      try { sessionStorage.setItem("marvelhq:admin", token); } catch { /* ignoré */ }
      const res = await fetch("/api/diagnostic", { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) setMsg("Jeton refusé. Il doit correspondre à ADMIN_TOKEN (16 caractères minimum).");
      else setDiag(await res.json());
    } catch (e) {
      setMsg(`Erreur réseau : ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const run = async (force: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      try { sessionStorage.setItem("marvelhq:admin", token); } catch { /* ignoré */ }
      const res = await fetch(`/api/cron/ingest${force ? "?force=1" : ""}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "x-trigger": "manuel" } });
      const data = await res.json();
      if (res.status === 401) setMsg("Jeton refusé. Il doit correspondre à ADMIN_TOKEN (16 caractères minimum).");
      else if (!res.ok) setMsg(`Échec : ${data.message ?? res.status}`);
      else {
        setMsg(`Terminé (${data.status}) : ${data.stats.created} nouveaux, ${data.stats.updated} mis à jour, ${data.stats.errors} erreur(s).`);
        router.refresh();
      }
    } catch (e) {
      setMsg(`Erreur réseau : ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="admin-token" className="eyebrow block">Jeton d'administration</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="admin-token" type="password" autoComplete="off" className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" />
        <button className="btn btn-primary shrink-0" disabled={busy || !token} onClick={() => run(false)}>
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Récupérer maintenant
        </button>
        <button className="btn shrink-0" disabled={busy || !token} onClick={() => run(true)} title="Ignore les intervalles minimaux entre deux récupérations">Forcer</button>
        <button className="btn shrink-0" disabled={busy || !token} onClick={diagnose} title="Vérifie l'adresse de la base sans afficher le mot de passe">Diagnostic base</button>
      </div>
      {msg && <p className="text-xs text-steel-300" role="status">{msg}</p>}
      {diag && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs" role="status">
          <p className={`mb-2 font-semibold ${diag.ok ? "text-officiel" : "text-hq-red"}`}>{diag.ok ? "Base de données : tout est correct." : "Base de données : problème détecté."}</p>
          <ul className="space-y-1">
            {diag.checks.map((c) => (
              <li key={c.label} className={c.ok ? "text-steel-300" : "text-hq-red"}>{c.ok ? "✓" : "✗"} {c.label}{c.detail ? ` — ${c.detail}` : ""}</li>
            ))}
            {diag.connection && <li className={diag.connection.ok ? "text-officiel" : "text-hq-red"}>{diag.connection.ok ? "✓ Connexion réussie" : `✗ Connexion : ${diag.connection.message}`}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
