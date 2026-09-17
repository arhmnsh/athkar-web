import { clientsClaim } from 'workbox-core';
import {
  addPlugins,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

self.skipWaiting();
clientsClaim();

addPlugins([new RangeRequestsPlugin()]);
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Audio URLs include a content hash from vite.config.js. CacheFirst therefore reuses unchanged
// recordings and fetches only a recording whose file content changed in a new build.
registerRoute(
  ({ request, url }) => request.destination === 'audio' || url.pathname.endsWith('.mp3'),
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new RangeRequestsPlugin(),
    ],
  }),
);

// Remove legacy unversioned audio entries created before content-hashed URLs were introduced.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open('audio-cache').then(async (cache) => {
      const requests = await cache.keys();
      await Promise.all(requests
        .filter((request) => {
          const url = new URL(request.url);
          return url.pathname.endsWith('.mp3') && !url.search;
        })
        .map((request) => cache.delete(request)));
    }),
  );
});

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
