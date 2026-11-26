import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Accès privé par mot de passe partagé (variable SITE_PASSWORD).
 * Sans SITE_PASSWORD, le site est ouvert (usage local). Le cookie contient une empreinte
 * HMAC du mot de passe : changer le mot de passe déconnecte tout le monde.
 */
export const ACCESS_COOKIE = "qg_acces";
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 180; // 180 jours

export function accessEnabled() {
  return !!process.env.SITE_PASSWORD;
}

export function accessToken(password = process.env.SITE_PASSWORD ?? "") {
  return createHmac("sha256", password).update("qg-des-heros:acces:v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export function isValidToken(token?: string) {
  return !!token && accessEnabled() && safeEqual(token, accessToken());
}

export function isValidPassword(candidate: string) {
  return accessEnabled() && safeEqual(accessToken(candidate), accessToken());
}

/** N'autorise qu'une redirection interne (évite les redirections ouvertes). */
export function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
