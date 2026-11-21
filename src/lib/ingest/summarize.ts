/**
 * Résumé en français des articles anglophones — OPTIONNEL et PAYANT (API Claude).
 * Activé uniquement si ANTHROPIC_API_KEY est défini. Sinon, l'extrait original est affiché
 * avec la mention « VO ». Le modèle reçoit UNIQUEMENT le titre et l'extrait de la source
 * et a pour consigne de ne rien ajouter : le résultat est étiqueté « résumé IA » dans l'interface.
 */
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function summarizerEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM = `Tu traduis et résumes en français des extraits d'actualités sur l'univers Marvel.
Règles strictes :
- Utilise uniquement les informations présentes dans le titre et l'extrait fournis. N'ajoute aucun fait, date, nom, chiffre ou citation.
- Conserve les nuances de certitude de la source (« selon », « serait », « rumeur »…). Ne transforme jamais une rumeur en certitude.
- Garde les titres d'œuvres tels qu'écrits dans la source.
- 2 à 3 phrases, 450 caractères maximum, sans introduction ni commentaire.
- Si l'extrait est vide ou inexploitable, réponds exactement : AUCUN`;

export async function summarizeFr(title: string, excerpt: string): Promise<string | null> {
  if (!summarizerEnabled()) return null;
  client ??= new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: process.env.SUMMARY_MODEL || "claude-opus-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: `Titre : ${title}\n\nExtrait : ${excerpt}` }],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!text || text === "AUCUN") return null;
    return text.slice(0, 600);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) console.warn("[résumé] limite de débit atteinte, extrait original conservé");
    else if (error instanceof Anthropic.APIError) console.warn(`[résumé] erreur API ${error.status}`);
    else console.warn("[résumé] échec", (error as Error).message);
    return null;
  }
}
