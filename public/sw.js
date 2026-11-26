// Service worker minimal du QG des Héros : rend l'appli installable et affiche une page
// de secours hors connexion. Aucune mise en cache des contenus (toujours à jour).
const OFFLINE_HTML = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hors connexion</title><body style="background:#07080a;color:#f4f5f7;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px">
<div><h1 style="letter-spacing:.05em">LE QG DES HÉROS</h1><p>Pas de connexion internet pour le moment.<br>Réessayez dès que le réseau revient.</p></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});
