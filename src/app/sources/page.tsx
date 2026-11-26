import type { Metadata } from "next";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { NEWS_SOURCES } from "@/data/sources";
import { newsStatus } from "@/lib/news";
import { RELIABILITY } from "@/lib/labels";
import { formatDateTime, relativeTime } from "@/lib/text";
import { VERIFICATION_META, PRODUCTIONS, verificationFor } from "@/lib/catalog";
import type { Reliability } from "@/lib/types";
import { PageHeader, ReliabilityBadge, SectionTitle } from "@/components/ui";
import { ManualIngest } from "@/components/ManualIngest";

export const metadata: Metadata = { title: "Sources et fiabilité" };
export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const s = await newsStatus();
  const health = new Map(s.health.map((h) => [h.sourceId, h]));
  const verified = PRODUCTIONS.map((p) => verificationFor(p.id)).filter(Boolean);
  const vOk = verified.filter((v) => v!.status === "ok").length;
  const vGap = verified.filter((v) => v!.status === "ecart").length;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader eyebrow="Transparence" title="Sources et fiabilité" intro="Comment le QG des Héros récupère, classe et vérifie l'information. Aucune information n'est inventée : chaque contenu renvoie à sa source." />

      <section>
        <SectionTitle title="Classification des actualités" />
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(RELIABILITY) as Reliability[]).map((r) => (
            <div key={r} className="panel p-4">
              <ReliabilityBadge value={r} />
              <p className="mt-2 text-sm text-steel-200">{RELIABILITY[r].description}</p>
              <p className="mt-1 text-xs text-steel-400">{s.counts[r] ?? 0} article(s) enregistrés</p>
            </div>
          ))}
        </div>
        <ul className="panel mt-3 list-inside list-disc space-y-1.5 p-4 text-sm text-steel-300">
          <li><strong className="text-white">OFFICIEL</strong> n'est attribué qu'aux contenus publiés directement par une source officielle (Disney, D23, chaîne YouTube Marvel).</li>
          <li>Un média professionnel produit au mieux <strong className="text-white">REPORTÉ</strong>, même s'il cite un communiqué : nous ne pouvons pas vérifier automatiquement la citation.</li>
          <li><strong className="text-white">RUMEUR</strong> : le titre ou la première phrase présente l'information comme non confirmée (rumeur, fuite, « insider », « unconfirmed »…).</li>
          <li><strong className="text-white">THÉORIE</strong> : le titre présente une théorie ou une spéculation.</li>
          <li>Les articles traitant du même sujet sont regroupés (similarité des titres, productions citées). Plusieurs reprises d'une même information ne sont pas comptées comme des confirmations indépendantes.</li>
          <li>Si la source modifie son article, la nouvelle version remplace l'ancienne et la date de modification est affichée.</li>
        </ul>
      </section>

      <section>
        <SectionTitle title="Sources connectées" />
        <div className="space-y-2">
          {NEWS_SOURCES.map((src) => {
            const h = health.get(src.id);
            const state = !h ? "jamais" : h.consecutiveFailures > 0 ? "erreur" : h.lastError ? "inactive" : "ok";
            return (
              <div key={src.id} className="panel flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center gap-2 sm:w-56">
                  {state === "ok" ? <CheckCircle2 className="h-4 w-4 text-officiel" /> : state === "erreur" ? <XCircle className="h-4 w-4 text-hq-red" /> : <MinusCircle className="h-4 w-4 text-steel-400" />}
                  <a href={src.homepage} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:underline">{src.name}</a>
                </div>
                <div className="min-w-0 flex-1 text-xs text-steel-400">
                  <p><span className="chip mr-1">{src.tier === "officielle" ? "Officielle" : "Média"}</span><span className="chip mr-1">{src.language.toUpperCase()}</span><span className="chip">toutes les {src.minIntervalMinutes} min min.</span></p>
                  {src.notes && <p className="mt-1.5">{src.notes}</p>}
                  <p className="mt-1.5">
                    {h?.lastSuccessAt ? <>Dernier succès {relativeTime(h.lastSuccessAt)} ({h.lastItemCount ?? "?"} éléments).</> : "Jamais récupérée avec succès."}
                    {h?.lastError && <span className={h.consecutiveFailures ? "text-hq-red" : "text-rumeur"}> {h.consecutiveFailures ? `Erreur (${h.consecutiveFailures} échec(s) consécutif(s))` : "Inactive"} : {h.lastError}</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="panel mt-3 p-4 text-xs leading-relaxed text-steel-400">
          <p className="mb-1 font-semibold text-steel-200">Sources étudiées mais non connectées</p>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>marvel.com</strong> : aucun flux public ; le site refuse les clients automatisés (HTTP 403). Non contourné.</li>
            <li><strong>API Marvel Comics (developer.marvel.com)</strong> : le portail redirige vers marvel.com et l'API répond « Internal server error » (test du 21/11/2026). Non exploitable actuellement.</li>
            <li><strong>IMDb</strong> : pas d'API publique gratuite ; l'extraction automatisée de pages est interdite par ses conditions d'utilisation.</li>
            <li><strong>Flux RSS YouTube</strong> : interdit aux robots par youtube.com/robots.txt ; remplacé par l'API officielle YouTube Data v3 (clé gratuite).</li>
          </ul>
        </div>
      </section>

      <section>
        <SectionTitle title="Dernières exécutions" />
        {s.error ? <p className="text-sm text-hq-red">Base de données indisponible : {s.error}</p> : (
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-steel-400"><tr><th className="p-3">Début</th><th>Déclencheur</th><th>Statut</th><th>Nouveaux</th><th>Mis à jour</th><th>Connus</th><th>Erreurs</th></tr></thead>
              <tbody className="divide-y divide-white/5 text-steel-200">
                {s.runs.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3">{formatDateTime(r.startedAt)}</td><td>{r.trigger}</td>
                    <td className={r.status === "succes" ? "text-officiel" : r.status === "partiel" ? "text-rumeur" : r.status === "echec" ? "text-hq-red" : ""}>{r.status}</td>
                    <td>{r.stats.created}</td><td>{r.stats.updated}</td><td>{r.stats.duplicates}</td><td>{r.stats.errors}</td>
                  </tr>
                ))}
                {!s.runs.length && <tr><td className="p-3" colSpan={7}>Aucune exécution enregistrée.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="panel mt-3 p-4"><ManualIngest /></div>
      </section>

      <section>
        <SectionTitle title="Vérification du corpus encyclopédique" />
        <div className="panel p-4 text-sm text-steel-300">
          <p>Les fiches de productions (dates, réalisation, musique, durées, saisons) sont confrontées automatiquement aux infobox de Wikipédia par <code>npm run verify-data</code>. Les écarts sont signalés sur chaque fiche, jamais corrigés automatiquement.</p>
          <p className="mt-2 text-xs text-steel-400">
            {VERIFICATION_META.generatedAt ? <>Dernière vérification : {formatDateTime(VERIFICATION_META.generatedAt)} — {verified.length} fiches contrôlées, {vOk} conformes, {vGap} avec écart signalé.</> : "Aucune vérification enregistrée."}
          </p>
        </div>
      </section>
    </div>
  );
}
