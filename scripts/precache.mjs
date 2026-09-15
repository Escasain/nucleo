// Rellena el service worker con la lista real de ficheros del build.
//
// Vite pone un hash en el nombre de cada trozo, así que la lista no se
// puede escribir a mano: hay que leerla de dist/ después de construir.
// Sin ella, todo lo que se carga bajo demanda —el mapa, el simulacro,
// la ficha de repaso, la práctica, la guía, el plan y las conexiones—
// solo funciona sin red si lo habías abierto antes con cobertura.
//
// Se hace con Node a secas y a propósito: meter workbox por esto sería
// traer un árbol de dependencias entero para generar una lista.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

// Lo que merece la pena precachear: el código y los estilos, los
// iconos y el manifiesto. Fuera se quedan los mapas de fuentes, que
// solo pesan, y cualquier cosa que no sepamos qué es.
const PRECACHEABLE = /\.(js|css|woff2?|png|svg|webmanifest|ico|json)$/i
const FUERA = /\.map$/i

/** Todos los ficheros de un directorio, en rutas relativas con «/». */
export function listar(dir, raiz = dir) {
  const out = []
  for (const nombre of readdirSync(dir).sort()) {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) out.push(...listar(ruta, raiz))
    else out.push(relative(raiz, ruta).split(sep).join('/'))
  }
  return out
}

/** Los que van al precache, ya filtrados y ordenados. */
export function precacheables(ficheros) {
  return ficheros
    .filter((f) => PRECACHEABLE.test(f) && !FUERA.test(f))
    // index.html y el manifiesto ya están en SHELL dentro del propio
    // service worker: repetirlos aquí solo duplicaría peticiones.
    .filter((f) => f !== 'index.html' && f !== 'manifest.webmanifest')
    // El service worker no se cachea a sí mismo: si lo hiciera, el
    // navegador podría servir el viejo y no actualizarse nunca.
    .filter((f) => f !== 'sw.js')
    .sort()
}

/**
 * Sustituye las dos constantes del service worker.
 *
 * Es una función aparte, y pura, para poder probarla sin construir: lo
 * que importa es que reemplace de verdad y no pase de largo dejando el
 * fichero como estaba, que es el fallo silencioso de este tipo de
 * scripts.
 */
export function inyectar(fuente, { build, assets }) {
  // Se comprueba que las dos constantes estén ANTES de sustituir, y no
  // que el resultado haya cambiado: reinyectar los mismos valores no
  // cambia nada y eso es correcto, no un error.
  const puntos = [/^const BUILD = .*$/m, /^const ASSETS = .*$/m]
  for (const re of puntos) {
    if (!re.test(fuente)) throw new Error('el service worker no tiene las constantes BUILD y ASSETS')
  }
  if (!assets.length) throw new Error('la lista de assets está vacía: el build no ha dejado nada que cachear')
  return fuente
    .replace(puntos[0], `const BUILD = ${JSON.stringify(build)}`)
    .replace(puntos[1], `const ASSETS = ${JSON.stringify(assets)}`)
}

/** Un sello corto y estable para el nombre de la caché. */
export function sello(assets) {
  let h = 2166136261
  for (const a of assets) {
    for (let i = 0; i < a.length; i++) {
      h ^= a.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
  }
  return (h >>> 0).toString(36)
}

// ---------- ejecución
if (import.meta.url === `file://${process.argv[1]}`) {
  const dist = join(process.cwd(), 'dist')
  const sw = join(dist, 'sw.js')
  if (!existsSync(sw)) {
    console.error('precache: no hay dist/sw.js. ¿Se ha ejecutado vite build?')
    process.exit(1)
  }
  const assets = precacheables(listar(dist))
  const build = sello(assets)
  writeFileSync(sw, inyectar(readFileSync(sw, 'utf8'), { build, assets }))
  console.log(`precache: ${assets.length} ficheros en la caché «nucleo-${build}»`)
}
