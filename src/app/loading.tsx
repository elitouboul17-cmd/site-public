export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-white/5" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />)}
      </div>
    </div>
  );
}
