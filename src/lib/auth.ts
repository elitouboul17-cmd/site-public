import "server-only";
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

/** Vérifie un jeton « Bearer » contre un secret d'environnement. Refuse si le secret est absent ou laissé par défaut. */
export function checkBearer(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret === "change-me" || secret.length < 16) return false;
  const token = header?.replace(/^Bearer\s+/i, "") ?? "";
  return !!token && safeEqual(token, secret);
}
