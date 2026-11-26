import type { MetadataRoute } from "next";

/** Manifeste d'application web : permet d'installer le QG des Héros sur l'écran d'accueil. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Le QG des Héros",
    short_name: "QG des Héros",
    description: "Portail de fan de l'univers Marvel : actualités, films, séries, personnages, chronologies et bibliothèque personnelle.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#07080a",
    theme_color: "#07080a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Actualités", url: "/actualites" },
      { name: "Univers MCU", url: "/mcu" },
      { name: "Ma bibliothèque", url: "/bibliotheque" },
    ],
  };
}
