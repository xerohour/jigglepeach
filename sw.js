// Bump on a release that has to drop everything the browser is holding; hashed asset names cover the rest.
const CACHE = "peachy-keen-v8";

const PAGE = self.registration.scope;

const SHELL = [
  PAGE,
  "/jigglepeach/peachy-keen/manifest.webmanifest",
  "/jigglepeach/peachy-keen/icon-192.png",
  "/jigglepeach/peachy-keen/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Hashed files stay cached until a new build no longer lists them.
async function dropOldAssets(cache) {
  const res = await fetch("/jigglepeach/asset-list.json", { cache: "no-store" });
  if (!res.ok) return;
  const current = new Set(await res.json());
  const keys = await cache.keys();
  await Promise.all(
    keys
      .map((request) => new URL(request.url))
      .filter(
        (url) =>
          url.origin !== self.location.origin ||
          (url.pathname.startsWith("/jigglepeach/assets/") &&
            !current.has(url.pathname.slice(1))),
      )
      .map((url) => cache.delete(url.href)),
  );
}

// The page is served from the network, so it names the current build and anything older can go.
async function storePage(cache, request, res) {
  await cache.put(request, res);
  await dropOldAssets(cache);
}

// On a slow network the saved page starts the game; it still has its own build's files, and the new page waits for the next launch.
const PAGE_WAIT_MS = 1000;

async function freshFirst(e) {
  const { request } = e;
  const cache = await caches.open(CACHE);
  const saved = (await cache.match(request)) || (await cache.match(PAGE));
  const fresh = fetch(request);
  const waited = saved
    ? new Promise((resolve) => {
        setTimeout(resolve, PAGE_WAIT_MS);
      })
    : fresh;
  const first = await Promise.race([fresh, waited]).catch(() => null);
  if (first?.ok) {
    e.waitUntil(storePage(cache, request, first.clone()).catch(() => {}));
    return first;
  }
  if (first) return first;
  if (!saved) return Response.error();
  e.waitUntil(
    fresh
      .then((res) => (res.ok ? cache.put(request, res) : null))
      .catch(() => {}),
  );
  return saved;
}

// Files that keep their name across builds show the saved copy at once and are fetched again for the next visit.
async function freshLater(e) {
  const { request } = e;
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const update = fetch(request).then(async (res) => {
    if (res.ok) await cache.put(request, res.clone());
    return res;
  });
  if (!hit) return update;
  e.waitUntil(update.catch(() => {}));
  return hit;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // A peach link page carries the owner's look, so it never comes from the cache.
  if (
    url.origin !== self.location.origin ||
    url.pathname === "/jigglepeach/asset-list.json" ||
    url.pathname.startsWith("/jigglepeach/slap/")
  )
    return;
  // The page names the hashed bundle, so a stale cached page would pin an old build.
  if (request.mode === "navigate") e.respondWith(freshFirst(e));
  else if (url.pathname.startsWith("/jigglepeach/assets/"))
    e.respondWith(cacheFirst(request));
  else e.respondWith(freshLater(e));
});
