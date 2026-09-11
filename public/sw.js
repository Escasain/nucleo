/* NÚCLEO service worker — caché básica para funcionar offline.
   Estrategia: network-first para la app, cache-first para fuentes.
   Nunca intercepta las llamadas a Google (auth, Drive, Picker). */
const CACHE = 'nucleo-v2'

// Base real de la instalación (/nucleo/ en GitHub Pages, / en local),
// deducida de la ruta del propio fichero en lugar de escribirla a mano.
const BASE = new URL('./', self.location).pathname
const SHELL = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
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
      caches.match(request).then(
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
        const hit = await caches.match(request)
        if (hit) return hit
        // Una navegación sin red cae siempre en el index de la app
        if (request.mode === 'navigate') {
          const shell = (await caches.match(`${BASE}index.html`)) || (await caches.match(BASE))
          if (shell) return shell
        }
        return Response.error()
      })
  )
})
