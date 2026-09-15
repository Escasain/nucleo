/* NÚCLEO service worker — caché básica para funcionar offline.
   Estrategia: network-first para la app, cache-first para fuentes.
   Nunca intercepta las llamadas a Google (auth, Drive, Picker). */
// Las dos constantes siguientes las rellena scripts/precache.mjs al
// construir. En desarrollo se quedan como están, que es lo correcto:
// ahí no hay ficheros con hash que precachear.
const BUILD = 'dev'
const ASSETS = []

// El nombre lleva el sello del build, así que al desplegar una versión
// nueva la de antes se borra entera en 'activate' y no se acumulan
// ficheros con hash viejo para siempre.
const CACHE = `nucleo-${BUILD}`

// Base real de la instalación (/nucleo/ en GitHub Pages, / en local),
// deducida de la ruta del propio fichero en lugar de escribirla a mano.
const BASE = new URL('./', self.location).pathname
const SHELL = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`]

// Todo lo que hace falta para funcionar sin red, incluidos los trozos
// que se cargan bajo demanda. Sin esto, una pantalla que no hubieras
// abierto nunca antes de quedarte sin cobertura no cargaba: el import
// dinámico se rechazaba y Suspense no lo recoge (eso es cosa de un
// error boundary), así que se quedaba a medias sin decir por qué.
const PRECACHE = [...SHELL, ...ASSETS.map((f) => BASE + f)]

// ignoreVary es imprescindible, y costó encontrarlo. Los servidores que
// sirven esto —vite preview y Vercel— mandan «Vary: Origin» en cada
// fichero, y Vite marca el <script> y el <link> con crossorigin. O sea:
// la petición de verdad lleva cabecera Origin y la que hace cache.add()
// al precachear no la lleva, así que sin esto la entrada guardada NO
// casa nunca y la caché no sirve para nada. El fallo es silencioso: la
// caché se ve llena y la app no arranca igual.
//
// Aquí es seguro: son ficheros nuestros, con hash en el nombre, y no
// cambian según quién los pida.
const MATCH = { ignoreVary: true }

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Uno a uno y no con addAll: addAll es todo o nada, así que un
      // solo fichero que fallara dejaba la caché entera vacía y la app
      // sin funcionar offline, en silencio.
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {}))))
      .catch(() => {})
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Todo lo de Google se deja pasar al navegador tal cual: el token, la
// API de Drive y el Picker no deben pasar por la caché ni por fetch().
function isGoogleService(url) {
  const h = url.hostname
  if (h === 'fonts.googleapis.com' || h === 'fonts.gstatic.com') return false
  return (
    h === 'googleapis.com' ||
    h.endsWith('.googleapis.com') ||
    h === 'google.com' ||
    h.endsWith('.google.com') ||
    h === 'gstatic.com' ||
    h.endsWith('.gstatic.com')
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return
  if (isGoogleService(url)) return

  // Fuentes: cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request, MATCH).then(
        (hit) =>
          hit ||
          fetch(request)
            .then((res) => {
              if (res.ok || res.type === 'opaque') {
                const copy = res.clone()
                caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
              }
              return res
            })
            .catch(() => hit)
      )
    )
    return
  }

  // Otros orígenes (enlaces externos): sin tocar
  if (url.origin !== self.location.origin) return

  // App propia: network-first con vuelta a la caché si no hay red
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        }
        return res
      })
      .catch(async () => {
        const hit = await caches.match(request, MATCH)
        if (hit) return hit
        // Una navegación sin red cae siempre en el index de la app
        if (request.mode === 'navigate') {
          const shell =
            (await caches.match(`${BASE}index.html`, MATCH)) || (await caches.match(BASE, MATCH))
          if (shell) return shell
        }
        return Response.error()
      })
  )
})
