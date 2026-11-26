"use client";
import { useEffect } from "react";

/** Enregistre le service worker (installation sur l'écran d'accueil). */
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
