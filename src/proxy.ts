import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessEnabled, isValidToken } from "@/lib/access";

/** Protège tout le site par le mot de passe partagé, si SITE_PASSWORD est défini. */
export function proxy(request: NextRequest) {
  if (!accessEnabled()) return NextResponse.next();
  if (isValidToken(request.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Accès réservé" }, { status: 401 });
  const url = request.nextUrl.clone();
  url.pathname = "/acces";
  url.search = `?suite=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Exclus : page et route de connexion, cron et santé (protégés autrement), fichiers statiques et PWA.
  matcher: ["/((?!acces|api/acces|api/cron|api/health|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js|icons/).*)"],
};
