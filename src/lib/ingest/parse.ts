import { XMLParser } from "fast-xml-parser";

/** Élément brut issu d'un flux RSS 2.0 ou Atom (dont flux YouTube). */
export interface RawItem {
  guid: string;
  url: string;
  title: string;
  description: string;
  published?: string;
  updated?: string;
  imageUrl?: string;
  categories: string[];
  youtubeId?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  processEntities: true,
  htmlEntities: true,
  removeNSPrefix: false,
  isArray: (name) => ["item", "entry", "category", "link", "media:content", "media:thumbnail", "enclosure"].includes(name),
});

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  ndash: "–", mdash: "—", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê", ocirc: "ô", icirc: "î", ucirc: "û", laquo: "«", raquo: "»", euro: "€",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

/** Texte brut à partir d'un fragment HTML (aucun HTML n'est conservé ni ré-affiché). */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|iframe|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>|<\/p>|<\/li>|<\/h\d>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return text(o["#cdata"] ?? o["#text"] ?? "");
  }
  return "";
}

function firstImageInHtml(html: string): string | undefined {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return m?.[1];
}

function httpsOnly(u?: string) {
  if (!u) return undefined;
  try {
    const url = new URL(u.trim());
    if (url.protocol === "http:") url.protocol = "https:";
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function mediaImage(node: Record<string, unknown>): string | undefined {
  const thumbs = (node["media:thumbnail"] as Record<string, string>[] | undefined) ?? [];
  if (thumbs[0]?.["@_url"]) return thumbs[0]["@_url"];
  const contents = (node["media:content"] as Record<string, string>[] | undefined) ?? [];
  const img = contents.find((c) => (c["@_medium"] === "image" || /^image\//.test(c["@_type"] ?? "") || /\.(jpe?g|png|webp)(\?|$)/i.test(c["@_url"] ?? "")) && c["@_url"]);
  if (img) return img["@_url"];
  const enclosures = (node.enclosure as Record<string, string>[] | undefined) ?? [];
  const enc = enclosures.find((e) => /^image\//.test(e["@_type"] ?? ""));
  return enc?.["@_url"];
}

export function parseFeed(xml: string): RawItem[] {
  const doc = parser.parse(xml) as Record<string, any>;

  // RSS 2.0
  const channel = doc.rss?.channel ?? doc["rdf:RDF"];
  if (channel) {
    const items: any[] = channel.item ?? doc["rdf:RDF"]?.item ?? [];
    return items.map((it) => {
      const contentHtml = text(it["content:encoded"]);
      const descHtml = text(it.description);
      const link = text(it.link);
      const guid = text(it.guid) || link;
      return {
        guid,
        url: link || guid,
        title: htmlToText(text(it.title)),
        description: htmlToText(descHtml || contentHtml),
        published: text(it.pubDate) || text(it["dc:date"]) || undefined,
        updated: text(it["atom:updated"]) || undefined,
        imageUrl: httpsOnly(mediaImage(it) ?? firstImageInHtml(contentHtml || descHtml)),
        categories: ((it.category as unknown[]) ?? []).map((c) => htmlToText(text(c))).filter(Boolean),
      } satisfies RawItem;
    });
  }

  // Atom (dont YouTube)
  const feed = doc.feed;
  if (feed) {
    const entries: any[] = feed.entry ?? [];
    return entries.map((e) => {
      const links: Record<string, string>[] = e.link ?? [];
      const alt = links.find((l) => !l["@_rel"] || l["@_rel"] === "alternate") ?? links[0];
      const group = e["media:group"] ?? {};
      const youtubeId = text(e["yt:videoId"]) || undefined;
      const description = text(group["media:description"]) || text(e.summary) || text(e.content);
      return {
        guid: text(e.id) || alt?.["@_href"] || "",
        url: alt?.["@_href"] ?? "",
        title: htmlToText(text(e.title)),
        description: htmlToText(description),
        published: text(e.published) || text(e.updated) || undefined,
        updated: text(e.updated) || undefined,
        imageUrl: httpsOnly(mediaImage(group) ?? (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined)),
        categories: ((e.category as Record<string, string>[]) ?? []).map((c) => c["@_term"] ?? "").filter(Boolean),
        youtubeId,
      } satisfies RawItem;
    });
  }
  throw new Error("Format de flux non reconnu (ni RSS ni Atom)");
}
