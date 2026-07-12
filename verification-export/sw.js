const CACHE_NAME="plantoguide-export-1783790715754";
const PRECACHE_URLS=[
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./TRIP-PLAN.md",
  "./TRIP-DATA.json",
  "./AGENT-INSTRUCTIONS.md",
  "./README.md",
  "./plan-x-guide-centered-compass-morph-clean-x.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./sw.js"
];
const NETWORK_ONLY_HOSTS=new Set(["api.open-meteo.com","geocoding-api.open-meteo.com","en.wikipedia.org","www.google.com","maps.google.com"]);
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(PRECACHE_URLS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{const{request}=event;if(request.method!=="GET")return;const url=new URL(request.url);if(NETWORK_ONLY_HOSTS.has(url.hostname))return;if(request.mode==="navigate"){event.respondWith(networkFirst(request,"index.html"));return}if(url.origin===self.location.origin)event.respondWith(cacheFirst(request))});
async function cacheFirst(request){const cached=await caches.match(request);if(cached)return cached;const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone())}return response}
async function networkFirst(request,fallbackUrl){try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone())}return response}catch(_){const cached=await caches.match(request);return cached||caches.match(fallbackUrl)}}
