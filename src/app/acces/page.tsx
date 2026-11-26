import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { safeNext } from "@/lib/access";

export const metadata: Metadata = { title: "Accès privé" };

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ suite?: string; erreur?: string }> }) {
  const { suite, erreur } = await searchParams;
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <form action="/api/acces" method="post" className="panel hud-corners w-full max-w-sm space-y-4 p-6">
        <div className="flex justify-center"><Logo /></div>
        <div className="text-center">
          <p className="display flex items-center justify-center gap-2 text-lg text-white"><Lock className="h-4 w-4 text-hq-red" /> Accès privé</p>
          <p className="mt-1 text-sm text-steel-400">Entrez le mot de passe partagé par la personne qui vous a invité.</p>
        </div>
        <input type="hidden" name="suite" value={safeNext(suite)} />
        <label htmlFor="motdepasse" className="sr-only">Mot de passe</label>
        <input id="motdepasse" name="motdepasse" type="password" required autoFocus autoComplete="current-password" className="input" placeholder="Mot de passe" />
        {erreur && <p className="text-sm text-hq-red" role="alert">Mot de passe incorrect.</p>}
        <button type="submit" className="btn btn-primary w-full">Entrer au QG</button>
        <p className="text-center text-[11px] text-steel-500">Vous resterez connecté sur cet appareil pendant 6 mois.</p>
      </form>
    </div>
  );
}
