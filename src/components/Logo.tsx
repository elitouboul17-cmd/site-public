/** Emblème original MARVEL HQ (aucun logo officiel Marvel n'est utilisé ni modifié). */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" aria-hidden>
        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="#0c0d10" stroke="#e62429" strokeWidth="2" />
        <circle cx="20" cy="20" r="9" fill="#7dd3fc" fillOpacity=".25" />
        <circle cx="20" cy="20" r="6" fill="#7dd3fc" fillOpacity=".55" />
        <circle cx="20" cy="20" r="3.2" fill="#e0f2fe" />
        <circle cx="20" cy="20" r="11.5" fill="none" stroke="#e62429" strokeOpacity=".55" strokeDasharray="3 2.2" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="display block text-[1.05rem] text-white">Marvel <span className="text-hq-red">HQ</span></span>
          <span className="block text-[0.6rem] tracking-[0.25em] text-steel-400 uppercase mt-0.5">Portail de fan</span>
        </span>
      )}
    </span>
  );
}
