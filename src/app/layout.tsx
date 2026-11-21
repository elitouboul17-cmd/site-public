import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: { default: "MARVEL HQ — Le QG des fans de l'univers Marvel", template: "%s · MARVEL HQ" },
  description: "Portail de fan indépendant : actualités sourcées, encyclopédie du MCU et de l'univers Marvel, chronologies, coulisses, calendrier et bibliothèque personnelle.",
  applicationName: "MARVEL HQ",
  robots: { index: false, follow: false }, // portail personnel : non indexé tant que la publication n'est pas décidée
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-hq-red focus:px-3 focus:py-2">Aller au contenu</a>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
