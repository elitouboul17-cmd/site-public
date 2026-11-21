"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="eyebrow text-hq-red">Incident</p>
      <h1 className="display mt-2 text-3xl text-white">Une erreur est survenue</h1>
      <p className="mt-3 text-sm text-steel-300">L'incident a été journalisé{error.digest ? ` (réf. ${error.digest})` : ""}. Vous pouvez réessayer.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Réessayer</button>
    </div>
  );
}
