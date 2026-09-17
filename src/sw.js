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

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
