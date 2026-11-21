import Link from "next/link";

export function ChronoTabs({ active }: { active: "narratif" | "sorties" }) {
  const tab = (id: typeof active, href: string, label: string) => (
    <Link href={href} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${active === id ? "bg-hq-red text-white" : "text-steel-300 hover:bg-white/5 hover:text-white"}`} aria-current={active === id ? "page" : undefined}>
      {label}
    </Link>
  );
  return (
    <div className="inline-flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist">
      {tab("narratif", "/chronologie", "Chronologie des événements")}
      {tab("sorties", "/chronologie/sorties", "Chronologie des sorties")}
    </div>
  );
}
