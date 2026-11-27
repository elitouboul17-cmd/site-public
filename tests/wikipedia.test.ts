import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { cleanArticleHtml } from "@/lib/wikipedia";

describe("article Wikipédia nettoyé", () => {
  const raw = `<div class="mw-parser-output">
    <div class="bandeau-container homonymie">Page d'homonymie</div>
    <table class="infobox"><tr><td>Budget</td></tr></table>
    <p>Film de <a href="/wiki/Jon_Favreau">Jon Favreau</a>, suite : <a href="/wiki/Iron_Man_2">Iron Man 2</a>.<sup class="reference">[1]</sup></p>
    <p onclick="alert(1)">Texte <script>alert('xss')</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">piège</a> <a href="https://evil.example">externe</a></p>
    <h2>Production</h2><p>Tournage.</p>
    <h2>Notes et références</h2><p>À couper.</p>
  </div>`;
  const out = cleanArticleHtml(raw);
  it("retire scripts, attributs d'événements, images et liens dangereux", () => {
    expect(out).not.toMatch(/script|onclick|onerror|javascript:|<img|evil\.example/i);
  });
  it("retire infobox, bandeaux et notes", () => {
    expect(out).not.toMatch(/Budget|homonymie|\[1\]/);
  });
  it("transforme les liens vers des productions de l'appli en liens internes, et les autres en texte", () => {
    expect(out).toContain('<a href="/productions/iron-man-2">Iron Man 2</a>');
    expect(out).toContain("<span>Jon Favreau</span>");
  });
  it("coupe les sections de fin", () => {
    expect(out).toContain("Tournage.");
    expect(out).not.toContain("À couper");
  });
});
