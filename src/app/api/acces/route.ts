import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, accessEnabled, accessToken, isValidPassword, safeNext } from "@/lib/access";

export const dynamic = "force-dynamic";

/** Connexion par mot de passe partagé (formulaire de /acces). */
export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("motdepasse") ?? "").slice(0, 200);
  const next = safeNext(form.get("suite"));
  const base = new URL(req.url);
  if (!accessEnabled()) return NextResponse.redirect(new URL(next, base), 303);
  if (!isValidPassword(password)) {
    await new Promise((r) => setTimeout(r, 1000)); // freine les essais en série
    return NextResponse.redirect(new URL(`/acces?erreur=1&suite=${encodeURIComponent(next)}`, base), 303);
  }
  const res = NextResponse.redirect(new URL(next, base), 303);
  res.cookies.set(ACCESS_COOKIE, accessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: base.protocol === "https:",
    maxAge: ACCESS_MAX_AGE,
    path: "/",
  });
  return res;
}
