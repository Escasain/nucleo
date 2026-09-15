// El precache del service worker: que la lista de ficheros del build
// llegue de verdad al fichero, que es donde este tipo de scripts falla
// en silencio y deja la app sin funcionar offline sin decir nada.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { precacheables, inyectar, sello } from '../scripts/precache.mjs'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

// ---------- qué entra y qué no
const muestra = [
  'index.html', 'manifest.webmanifest', 'sw.js',
  'assets/index-abc.js', 'assets/index-abc.js.map', 'assets/index-abc.css',
  'icons/icon-192.png', 'robots.txt'
]
const elegidos = precacheables(muestra)
check('el código entra', elegidos.includes('assets/index-abc.js'))
check('los estilos entran', elegidos.includes('assets/index-abc.css'))
check('los iconos entran', elegidos.includes('icons/icon-192.png'))
check('los mapas de fuentes no', !elegidos.includes('assets/index-abc.js.map'))
// index.html y el manifiesto ya están en SHELL dentro del propio
// service worker: duplicarlos solo duplicaría peticiones.
check('index.html no se duplica', !elegidos.includes('index.html'))
check('el manifiesto no se duplica', !elegidos.includes('manifest.webmanifest'))
// Si el service worker se cacheara a sí mismo, el navegador podría
// servir el viejo y no actualizarse nunca.
check('el service worker no se cachea a sí mismo', !elegidos.includes('sw.js'))
check('lo que no reconoce se queda fuera', !elegidos.includes('robots.txt'))
check('la lista va ordenada', JSON.stringify(elegidos) === JSON.stringify([...elegidos].sort()))

// ---------- la inyección
const swFalso = "const BUILD = 'dev'\nconst ASSETS = []\nconst CACHE = `nucleo-${BUILD}`\n"
const hecho = inyectar(swFalso, { build: 'xyz', assets: ['assets/a.js'] })
check('mete el sello del build', hecho.includes('const BUILD = "xyz"'))
check('mete la lista de ficheros', hecho.includes('const ASSETS = ["assets/a.js"]'))
check('no toca el resto del fichero', hecho.includes('const CACHE = `nucleo-${BUILD}`'))
check('es idempotente',
  inyectar(hecho, { build: 'xyz', assets: ['assets/a.js'] }) === hecho)

// Los dos fallos que importan: pasar de largo dejando el fichero como
// estaba, o dejar la lista vacía. Los dos dan una app que parece bien
// construida y no funciona sin red.
let salto = null
try { inyectar('no tengo esas constantes', { build: 'x', assets: ['a.js'] }) } catch (e) { salto = e.message }
check('avisa si el service worker no tiene las constantes', salto !== null, String(salto))
let vacio = null
try { inyectar(swFalso, { build: 'x', assets: [] }) } catch (e) { vacio = e.message }
check('avisa si la lista se queda vacía', vacio !== null, String(vacio))

// ---------- el sello
check('el sello no cambia con la misma lista', sello(['a', 'b']) === sello(['a', 'b']))
check('el sello cambia al cambiar un fichero', sello(['a', 'b']) !== sello(['a', 'c']))
check('el sello vale para un nombre de caché', /^[a-z0-9]+$/.test(sello(['a'])))

// ---------- contra el build de verdad
// La CI construye antes de ejecutar las pruebas, así que aquí dist/
// existe. En un clon sin construir se omite en voz alta en lugar de
// fallar por algo que no es culpa de nadie.
// Atado al fichero y no a process.cwd(): el lanzador ejecuta cada
// suite desde test/, así que con cwd esto buscaba test/dist y se
// omitía siempre, incluso con el build recién hecho.
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const sw = join(dist, 'sw.js')
if (!existsSync(sw)) {
  console.log('OMITIDA  la comprobación contra el build necesita dist/ y aquí no hay. Ejecuta npm run build.')
} else {
  const fuente = readFileSync(sw, 'utf8')
  const m = fuente.match(/^const ASSETS = (.*)$/m)
  check('el service publicado trae su lista', Boolean(m))
  const lista = m ? JSON.parse(m[1]) : []
  check('la lista no está vacía', lista.length > 0, String(lista.length))
  check('el sello se ha rellenado', /^const BUILD = "(?!dev")/m.test(fuente), 'sigue en dev')

  // Lo que de verdad se comprueba aquí: que no falte ni un fichero del
  // build. Si falta uno, esa pantalla no carga sin red.
  const enDisco = readdirSync(join(dist, 'assets')).filter((f) => !f.endsWith('.map'))
  const faltan = enDisco.filter((f) => !lista.includes(`assets/${f}`))
  check('no falta ningún fichero del build', faltan.length === 0, faltan.join(', '))

  // Y en concreto los que se cargan bajo demanda, que son el motivo:
  // son justo los que no se cachearían solos.
  const diferidos = enDisco.filter((f) => !f.startsWith('index-'))
  check('hay trozos que se cargan bajo demanda', diferidos.length >= 5, String(diferidos.length))
  check('todos los trozos diferidos están precacheados',
    diferidos.every((f) => lista.includes(`assets/${f}`)), diferidos.join(', '))
  check('el service worker no se precachea a sí mismo', !lista.includes('sw.js'))
}

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
