import Link from "next/link";
import type { Production } from "@/lib/types";
import { KIND_LABELS, STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/text";
import { Poster } from "./Poster";
import { WatchedDot } from "./LibraryControls";
import { themeVars } from "@/lib/theme";

export function ProductionCard({ p, posterUrl, showOrder }: { p: Production; posterUrl?: string; showOrder?: number }) {
  return (
    <Link href={`/productions/${p.id}`} className="group panel panel-hover themed-card block overflow-hidden p-2" style={themeVars(p)}>
      <div className="relative">
        <Poster p={p} src={posterUrl} size="sm" className="transition duration-300 group-hover:brightness-110" />
        {showOrder != null && (
          <span className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">#{showOrder}</span>
        )}
        {p.status !== "sorti" && (
          <span className="absolute top-8 left-2 rounded-md bg-hq-red px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow">{STATUS_LABELS[p.status]}</span>
        )}
        <WatchedDot id={p.id} />
      </div>
      <div className="px-1 pt-2 pb-1">
        <p className="line-clamp-2 text-sm leading-snug font-semibold text-white">{p.title}</p>
        <p className="mt-0.5 text-[11px] text-steel-400">
          {KIND_LABELS[p.kind]} · {p.releaseDate ? formatDate(p.releaseDate) : "Date non confirmée"}
        </p>
      </div>
    </Link>
  );
}
