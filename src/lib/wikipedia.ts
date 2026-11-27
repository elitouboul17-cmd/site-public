import "server-only";

import sanitizeHtml from "sanitize-html";
import { PRODUCTIONS } from "./catalog";
import { normalize } from "./text";
import { USER_AGENT } from "@/data/sources";

/**
 * Article Wikipédia complet, affiché dans l'appli (licence CC BY-SA 4.0 : attribution
 * et lien vers l'article et son historique affichés sur la page).
 * - Texte uniquement (tableaux, infobox, notes, images et bandeaux retirés) ;
 * - liens vers des productions présentes dans l'appli → liens internes ;
 * - autres liens → texte simple (aucune navigation hors de l'appli depuis l'article) ;
 * - mis en cache 24 h.
 */
export interface WikiArticle {
  title: string;
  revid: number;
  html: string;
  url: string;
  historyUrl: string;
  fetchedAt: string;
}

const internalByTitle = new Map<string, string>();
for (const p of PRODUCTIONS) if (p.wikipedia?.fr) internalByTitle.set(normalize(decodeURIComponent(p.wikipedia.fr).replace(/_/g, " ")), `/productions/${p.id}`);

const CUT_SECTIONS = /^(notes et références|notes|références|liens externes|voir aussi|bibliographie|annexes|articles connexes)$/i;

const UNWANTED_CLASSES = /\b(bandeau[\w-]*|metadata|navbox|infobox|reference|references|mw-references-wrap|noprint|thumb|homonymie|hatnote|mw-empty-elt|printfooter|catlinks|portail|mw-editsection|gallery|toc)\b/;

export function cleanArticleHtml(raw: string): string {
  // 1er passage : retire les blocs indésirables (bandeaux, infobox, notes…) avec leur contenu.
  const stripped = sanitizeHtml(raw, {
    allowedTags: false,
    allowedAttributes: false,
    // Passage intermédiaire uniquement : scripts et styles sont retirés par le 2e passage.
    allowVulnerableTags: true,
    exclusiveFilter: (frame) => UNWANTED_CLASSES.test(frame.attribs?.class ?? ""),
  });
  // 2e passage : liste stricte de balises et d'attributs.
  let html = sanitizeHtml(stripped, {
    allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "b", "i", "strong", "em", "a", "blockquote", "br", "dl", "dt", "dd", "span"],
    allowedAttributes: { a: ["href"] },
    // Éléments supprimés AVEC leur contenu.
    nonTextTags: ["style", "script", "textarea", "option", "noscript", "table", "sup", "figure", "math", "annotation", "img", "figcaption", "audio", "video"],
    transformTags: {
      a: (_tagName, attribs): sanitizeHtml.Tag => {
        const href = attribs.href ?? "";
        const m = /^\/wiki\/([^#?]+)/.exec(href);
        if (m) {
          const title = normalize(decodeURIComponent(m[1]).replace(/_/g, " "));
          const internal = internalByTitle.get(title);
          if (internal) return { tagName: "a", attribs: { href: internal } };
        }
        return { tagName: "span", attribs: {} as sanitizeHtml.Attributes };
      },
    },
  });
  // Coupe les sections de fin (notes, liens externes…).
  const headings = [...html.matchAll(/<h2>([\s\S]*?)<\/h2>/g)];
  const cut = headings.find((h) => CUT_SECTIONS.test(sanitizeHtml(h[1], { allowedTags: [] }).trim()));
  if (cut?.index != null) html = html.slice(0, cut.index);
  return html
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<(ul|ol)>\s*<\/\1>/g, "")
    .replace(/<span>\s*<\/span>/g, "")
    .trim();
}

export async function fetchArticle(frTitle: string): Promise<WikiArticle | null> {
  const page = decodeURIComponent(frTitle).replace(/ /g, "_");
  const url = `https://fr.wikipedia.org/w/api.php?${new URLSearchParams({
    action: "parse", format: "json", formatversion: "2", prop: "text|revid", disableeditsection: "1", disabletoc: "1", redirects: "1", page,
  })}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT }, next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.parse?.text) return null;
    const title: string = data.parse.title;
    const slug = encodeURIComponent(title.replace(/ /g, "_"));
    return {
      title,
      revid: data.parse.revid,
      html: cleanArticleHtml(data.parse.text),
      url: `https://fr.wikipedia.org/wiki/${slug}`,
      historyUrl: `https://fr.wikipedia.org/w/index.php?title=${slug}&action=history`,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
