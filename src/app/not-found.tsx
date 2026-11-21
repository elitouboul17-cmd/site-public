import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="eyebrow text-hq-red">Erreur 404</p>
      <h1 className="display mt-2 text-4xl text-white">Branche temporelle introuvable</h1>
      <p className="mt-3 text-steel-300">Cette page n'existe pas (ou plus) dans cette chronologie.</p>
      <Link href="/" className="btn btn-primary mt-6">Retour au QG</Link>
    </div>
  );
}
