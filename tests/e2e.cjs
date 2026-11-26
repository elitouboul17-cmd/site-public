/**
 * Test de bout en bout (Playwright) sur une instance démarrée (npm run build && npm start).
 *   BASE_URL=http://localhost:3000 node tests/e2e.cjs
 * Prérequis : Playwright installé (npm i -D playwright && npx playwright install chromium).
 * Vérifie : toutes les pages internes répondent (crawl), pas d'erreur JS, pas de débordement
 * horizontal sur mobile, favoris persistants, mode sans spoilers, recherche, quiz, filtres.
 */
const { chromium, devices } = require("playwright");

(async () => {

const BASE = process.env.BASE_URL || "http://localhost:3000";
const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? "✓" : "✗"} ${msg}`); };

const browser = await chromium.launch();

// 1. Crawl : toutes les URL internes doivent répondre 200.
{
  const seen = new Set(["/"]);
  const queue = ["/"];
  const bad = [];
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(`${page.url()} : ${e.message}`));
  while (queue.length) {
    const path = queue.shift();
    const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    if (!res || res.status() !== 200) { bad.push(`${path} → ${res?.status()}`); continue; }
    const links = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
    for (const l of links) {
      const clean = l.split("#")[0];
      // On limite l'exploration des combinaisons de filtres.
      if (!clean || seen.has(clean) || (clean.includes("?") && seen.size > 150)) continue;
      seen.add(clean);
      queue.push(clean);
    }
  }
  ok(bad.length === 0, `crawl : ${seen.size} URL internes, ${bad.length} en erreur ${bad.slice(0, 10).join(", ")}`);
  ok(jsErrors.length === 0, `aucune erreur JavaScript (${jsErrors.slice(0, 3).join(" | ")})`);
  await ctx.close();
}

// 2. Mobile : pas de défilement horizontal sur les pages principales.
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const pages = ["/", "/actualites", "/mcu", "/univers", "/personnages", "/personnages/spider-man", "/chronologie", "/chronologie/sorties", "/multivers", "/coulisses", "/equipes", "/calendrier", "/calendrier?vue=mois", "/bibliotheque", "/quiz", "/sources", "/productions/avengers-endgame", "/recherche?q=stark", "/musique", "/musique?vue=films"];
  const overflowing = [];
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(150);
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) overflowing.push(p);
  }
  ok(overflowing.length === 0, `mobile sans débordement horizontal (${overflowing.join(", ")})`);
  await ctx.close();
  // Même contrôle sur ordinateur (le halo coloré des fiches ne doit pas élargir la page).
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desk.newPage();
  const wide = [];
  for (const p of [...pages, "/productions/loki", "/musique", "/musique?vue=chansons"]) {
    await dp.goto(BASE + p, { waitUntil: "domcontentloaded" });
    await dp.waitForTimeout(150);
    if (await dp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) wide.push(p);
  }
  ok(wide.length === 0, `ordinateur sans débordement horizontal (${wide.join(", ")})`);
  await desk.close();
}

// 3. Interactions.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Favoris + vu + persistance
  await page.goto(BASE + "/productions/iron-man", { waitUntil: "networkidle" }).catch(() => {});
  await page.getByRole("button", { name: "Ajouter aux favoris" }).click();
  await page.getByRole("button", { name: "Marquer comme vu" }).click();
  await page.reload({ waitUntil: "domcontentloaded" });
  ok(await page.getByRole("button", { name: "Favori", exact: true }).waitFor({ timeout: 5000 }).then(() => true, () => false), "favori persistant après rechargement");
  await page.goto(BASE + "/bibliotheque", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "Favoris" }).click();
  ok(await page.getByRole("link", { name: "Iron Man", exact: true }).isVisible(), "favori visible dans la bibliothèque");
  ok((await page.textContent("body")).includes("1 / "), "progression MCU comptée");

  // Mode sans spoilers
  await page.goto(BASE + "/chronologie", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Spoilers visibles/ }).click();
  ok(await page.getByText("Contenu masqué (mode sans spoilers) — afficher").first().isVisible(), "mode sans spoilers masque les événements");
  await page.getByRole("button", { name: /Sans spoilers/ }).click();

  // Recherche instantanée
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("wakanda");
  await page.waitForSelector("[role=option]");
  const options = await page.$$eval("[role=option]", (o) => o.map((x) => x.textContent));
  ok(options.some((t) => t.includes("Black Panther")), `suggestions de recherche (${options.length})`);
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/(productions|personnages|actualites)\//);
  ok(true, `navigation depuis la recherche → ${new URL(page.url()).pathname}`);

  // Quiz
  await page.goto(BASE + "/quiz", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Commencer/ }).click();
  for (let n = 0; n < 10; n++) {
    const choice = page.locator("button[disabled], .panel button").filter({ hasNotText: /Commencer|Question suivante|Voir le résultat/ });
    await page.locator(".panel .grid button").first().click();
    const next = page.getByRole("button", { name: /Question suivante|Voir le résultat/ });
    await next.click();
    if (await page.getByText("Résultat").isVisible()) break;
    void choice;
  }
  ok(await page.getByRole("button", { name: "Rejouer" }).isVisible(), "quiz jouable jusqu'au résultat");

  // Filtres persistants
  await page.goto(BASE + "/mcu?type=serie&tri=phase", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  await page.goto(BASE + "/mcu", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/type=serie/, { timeout: 5000 }).catch(() => {});
  ok(page.url().includes("type=serie"), "filtres restaurés au retour sur la page");

  // Sécurité : route cron protégée
  const r = await page.request.get(BASE + "/api/cron/ingest");
  ok(r.status() === 401, "route d'ingestion refusée sans jeton");
  const h = await page.request.get(BASE + "/");
  ok(h.headers()["x-frame-options"] === "DENY" && !h.headers()["x-powered-by"], "en-têtes de sécurité présents");
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : "\nTous les tests de bout en bout sont passés.");
process.exit(failures.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
