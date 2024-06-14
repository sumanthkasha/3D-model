var CACHE_STATIC_NAME = "static-v23";
var CACHE_DYNAMIC_NAME = "dynamic-v3";
var STATIC_FILES = [
  // "/",
  "/index.html",
  "/src/css/model.css",
  "/src/js/app.js",
  "/src/css/app.css",
  // "/src/models/",
  "/src/js/model.js",
  // "https://fonts.googleapis.com/css?family=Roboto:400,700",
  // "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
  // "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/",
];

/*
Install Event:
- Purpose: Caches static assets during the Service Worker installation.
- Opens the static cache and adds all files listed in STATIC_FILES.
*/

self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function(cache) {
      console.log("[Service Worker] Precaching App Shell");

      // return cache.addAll(STATIC_FILES).catch(function(error) {
      //   console.error("Failed to cache static files: ", error);
      // });

      return Promise.all(
        STATIC_FILES.map(function(file) {
          return cache.add(file).then(function() {
            console.log("Successfully cached: ", file);
          }).catch(function(error) {
            console.error("Failed to cache: ", file, error);
          });
        })
      ).then(function() {
        console.log("All static files attempted to be cached.");
      });
    })
  );
});

/*
Activate Event:
- Purpose: Cleans up old caches that are no longer needed.
- Retrieves all cache keys and deletes caches that do not match the current static or dynamic cache names.
*/

self.addEventListener("activate", function(event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache.", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

/*
- Purpose: Checks if a request URL is in the array of static files.
- Normalizes the URL and checks if it is included in the STATIC_FILES array.
*/

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

/*
Fetch Event:
Static Files: If the requested URL is in STATIC_FILES, it serves the file from the cache if available. If not, it fetches from the network.
Dynamic Caching: For other requests, it tries to fetch from the network and caches the response dynamically. If the network request fails, it attempts to serve the request from the dynamic cache.
*/

self.addEventListener("fetch", function(event) {
  console.log("Fetching: ", event.request.url);
  if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          console.log("Serving from cache: ", event.request.url);
          return response;
        }
        console.log("Fetching from network: ", event.request.url);
        return fetch(event.request).catch(function(error) {
          console.error("Fetch failed for:", event.request.url, error);
          throw error;
        });
      }).catch(function(error) {
        console.error("Error matching cache for:", event.request.url, error);
        throw error;
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request).then(function(res) {
          return caches.open(CACHE_DYNAMIC_NAME).then(function(cache) {
            cache.put(event.request.url, res.clone()).then(function() {
              console.log("Successfully cached dynamically: ", event.request.url);
            }).catch(function(error) {
              console.error("Dynamic cache put failed for:", event.request.url, error);
            })
            return res;
          });
        }).catch(function(error) {
          console.error("Fetch and cache put failed for:", event.request.url, error);
          // return caches.open(CACHE_STATIC_NAME).then(function(cache) {
          //   if (event.request.headers.get("accept").includes("text/html")) {
          //     return cache.match("/offline.html");
          //   }
          // });
        });
      }).catch(function(error) {
        console.error("Error matching cache in dynamic fetch for:", event.request.url, error);
        throw error;
      })
    );
  }
});
