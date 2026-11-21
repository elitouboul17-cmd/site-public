import Link from "next/link";
import { ExternalLink, ShieldCheck, AlertTriangle, HelpCircle, ChevronRight } from "lucide-react";
import type { DateCertainty, Reliability, SourceRef } from "@/lib/types";
import { RELIABILITY } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/text";
import type { VerificationRecord } from "@/lib/catalog";

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-6 md:mb-8">
      {eyebrow && <p className="eyebrow mb-2 text-hq-red">{eyebrow}</p>}
      <h1 className="display text-3xl leading-none text-white md:text-5xl">{title}</h1>
      {intro && <div className="mt-3 max-w-3xl text-sm leading-relaxed text-steel-300 md:text-base">{intro}</div>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}

export function SectionTitle({ title, href, linkLabel = "Tout voir", children }: { title: string; href?: string; linkLabel?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="display flex items-center gap-2 text-lg text-white md:text-xl">
        <span className="inline-block h-4 w-1 rounded-sm bg-[var(--accent,#e62429)]" aria-hidden />
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {children}
        {href && (
          <Link href={href} className="flex items-center gap-0.5 text-xs font-semibold text-steel-300 hover:text-white">
            {linkLabel} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

const TONES: Record<Reliability, string> = {
  officiel: "border-officiel/50 bg-officiel/10 text-officiel",
  reporte: "border-reporte/50 bg-reporte/10 text-reporte",
  rumeur: "border-rumeur/50 bg-rumeur/10 text-rumeur",
  theorie: "border-theorie/50 bg-theorie/10 text-theorie",
};

export function ReliabilityBadge({ value, withHelp = false }: { value: Reliability; withHelp?: boolean }) {
  const r = RELIABILITY[value];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${TONES[value]}`} title={r.description}>
      {value === "officiel" ? <ShieldCheck className="h-3 w-3" aria-hidden /> : value === "rumeur" ? <AlertTriangle className="h-3 w-3" aria-hidden /> : value === "theorie" ? <HelpCircle className="h-3 w-3" aria-hidden /> : null}
      {r.label}
      {withHelp && <span className="sr-only"> — {r.description}</span>}
    </span>
  );
}

export function CertaintyBadge({ certainty, date }: { certainty: DateCertainty; date?: string }) {
  if (!date || certainty === "inconnue") return <span className="chip border-dashed text-steel-400">Date non confirmée</span>;
  if (certainty === "estimee") return <span className="chip border-rumeur/40 text-rumeur" title="Date estimée, non annoncée officiellement">Estimée : {formatDate(date)}</span>;
  return <span className="chip" title="Date officielle">{formatDate(date)}</span>;
}

export function SourceList({ sources, title = "Sources" }: { sources?: SourceRef[]; title?: string }) {
  if (!sources?.length) return <p className="text-xs text-rumeur">Aucune source enregistrée : information non vérifiée.</p>;
  return (
    <div>
      <p className="eyebrow mb-1.5">{title}</p>
      <ul className="space-y-1">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-steel-300 underline decoration-white/20 underline-offset-2 hover:text-white">
              {s.label} <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            {s.verifiedAt && <span className="ml-2 text-[11px] text-steel-500">vérifié le {formatDate(s.verifiedAt)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VerificationBadge({ record }: { record?: VerificationRecord }) {
  if (!record) return <span className="chip border-dashed text-steel-400" title="Cette fiche n'a pas encore été confrontée automatiquement à une source de référence.">Non vérifiée automatiquement</span>;
  const date = formatDateTime(record.checkedAt);
  if (record.status === "ok") return <span className="chip border-officiel/40 text-officiel" title={`Dates et crédits conformes à la référence (${date})`}><ShieldCheck className="h-3 w-3" /> Vérifiée le {date}</span>;
  if (record.status === "ecart") return <span className="chip border-rumeur/40 text-rumeur" title="Au moins un champ diffère de la source de référence ; voir le détail en bas de fiche."><AlertTriangle className="h-3 w-3" /> Écart signalé ({date})</span>;
  return <span className="chip text-steel-400">Vérification partielle ({date})</span>;
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="panel hud-grid flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <p className="display text-base text-steel-200">{title}</p>
      {children && <div className="max-w-md text-sm text-steel-400">{children}</div>}
    </div>
  );
}

export function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} scroll={false} className={`chip transition hover:border-white/30 ${active ? "chip-active" : ""}`} aria-current={active ? "true" : undefined}>
      {children}
    </Link>
  );
}
