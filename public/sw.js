// bestRead service worker: deliberately small.
// - pages always come from the network (your library is live data), with a doodle
//   offline note when there is no connection
// - hashed build files, icons and the font are cached after first use, so the app opens fast
// Bump VERSION to drop old caches.
const VERSION = 'v1';
const CACHE = `bestread-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/fonts/InspirationHand-Regular.woff2', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k.startsWith('bestread-') && k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim()),
	);
});

const isStatic = (url) =>
	url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/fonts/');

self.addEventListener('fetch', (event) => {
	const {request} = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	if (request.mode === 'navigate') {
		event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
		return;
	}

	if (isStatic(url)) {
		event.respondWith(
			caches.match(request).then(
				(hit) =>
					hit ||
					fetch(request).then((res) => {
						if (res.ok) {
							const copy = res.clone();
							caches.open(CACHE).then((cache) => cache.put(request, copy));
						}
						return res;
					}),
			),
		);
	}
});
