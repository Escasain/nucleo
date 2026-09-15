// ============================================================
// La app sin conexión, contra el build de verdad
// ------------------------------------------------------------
// Es la única prueba que ejecuta el service worker. Tiene que ir contra
// `vite preview` y no contra el servidor de desarrollo: en desarrollo
// el sw.js se sirve tal cual está en public/, con la lista de ficheros
// vacía, así que probar ahí no probaría nada.
//
// Lo que se comprueba es lo que se rompía: una pantalla que se carga
// bajo demanda y que NO has abierto antes de quedarte sin red. Su
// import dinámico pedía un fichero que nadie había cacheado, se
// rechazaba, y Suspense no recoge eso — es cosa de un error boundary,
// que no hay. La pantalla se quedaba a medias sin decir por qué.
//
// La red se corta MATANDO EL SERVIDOR, y no con setOffline. En
// Chromium, setOffline no alcanza a las peticiones que hace el propio
// service worker: con él, esta prueba pasaba en verde contra un build
// sin precache ninguno — o sea, daba por arreglado lo que no lo estaba.
// Con el servidor muerto no hay nada que alcanzar.
// ============================================================
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = join(aqui, '..')
const PUERTO = Number(process.env.PORT_OFFLINE || 5274)
const HOST = process.env.HOST || '127.0.0.1'
const BASE = `http://${HOST}:${PUERTO}/`

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
const resumen = () => {
  console.log(out.join('\n'))
  console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
}

if (!existsSync(join(raiz, 'dist', 'sw.js'))) {
  console.log('OMITIDA  esta prueba va contra el build y aquí no hay dist/. Ejecuta npm run build.')
  process.exit(0)
}
try {
  await import('playwright')
} catch {
  console.log('OMITIDA  hace falta Playwright: npm i -D playwright && npx playwright install chromium')
  process.exit(0)
}
const { lanzar, vigilarConsola } = await import('./pw/_navegador.mjs')

// ---------- servidor estático sobre dist/
let servidor = spawn(
  process.execPath,
  [join(raiz, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--host', HOST, '--port', String(PUERTO), '--strictPort'],
  { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'], detached: true }
)
const parar = () => {
  if (!servidor) return
  try { process.kill(-servidor.pid, 'SIGTERM') } catch { servidor.kill() }
  servidor = null
}
process.on('SIGINT', () => { parar(); process.exit(130) })

let log = ''
servidor.stdout.on('data', (d) => (log += d))
servidor.stderr.on('data', (d) => (log += d))
let murio = null
servidor.on('exit', (c, s) => (murio = `terminó con código ${c}${s ? ` (${s})` : ''}`))

const hasta = Date.now() + 30000
for (;;) {
  try { if ((await fetch(BASE)).ok) break } catch { /* todavía no */ }
  if (murio) { parar(); console.error(`El servidor ${murio}.\n${log.trim()}`); process.exit(1) }
  if (Date.now() > hasta) { parar(); console.error(`La vista previa no arrancó en 30 s.\n${log.trim()}`); process.exit(1) }
  await new Promise((r) => setTimeout(r, 300))
}

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
const p = await ctx.newPage()
const errores = []
vigilarConsola(p, errores)

try {
  // ---------- con red: se registra el service worker y precachea
  await p.goto(BASE, { waitUntil: 'networkidle' })
  const activo = await p.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false
    const reg = await navigator.serviceWorker.ready
    return Boolean(reg.active)
  })
  check('el service worker se activa', activo)

  // Esperar a que el precache termine de verdad: si se corta la red
  // antes, la prueba mediría la carrera y no el arreglo.
  const cacheado = await p.evaluate(async () => {
    for (let i = 0; i < 100; i++) {
      const nombres = await caches.keys()
      for (const n of nombres) {
        const claves = await (await caches.open(n)).keys()
        if (claves.length >= 10) return claves.map((r) => new URL(r.url).pathname)
      }
      await new Promise((r) => setTimeout(r, 100))
    }
    return []
  })
  check('precachea la app entera, no solo el index', cacheado.length >= 10, String(cacheado.length))
  const trozos = cacheado.filter((u) => /\/assets\/(?!index-)/.test(u))
  check('incluye los trozos que se cargan bajo demanda', trozos.length >= 5, String(trozos.length))

  // ---------- sin red: se mata el servidor, no hay a dónde ir
  parar()
  // Y se comprueba que de verdad no hay servidor, no sea que la prueba
  // esté midiendo otra cosa.
  let vivo = true
  try { await fetch(BASE) } catch { vivo = false }
  check('el servidor está muerto de verdad', !vivo)

  await p.reload({ waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1500)
  check('la app arranca sin red', (await p.locator('.sidebar').count()) > 0)

  // Conexiones es la pantalla nueva y no se ha abierto nunca con red:
  // es exactamente el caso que Codex señaló.
  await p.goto(BASE + '#/conexiones', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2500)
  const puentes = await p.locator('.bridge').count()
  check('Conexiones carga sin red sin haberla abierto antes', puentes > 0, `${puentes} puentes`)
  // Que el texto de carga no esté no basta: si no se pinta nada,
  // tampoco está, y la comprobación pasaría en vacío. Lo que se mira es
  // que la pantalla esté de verdad ahí.
  check('y la pantalla se pinta entera',
    (await p.locator('h1').count()) > 0 &&
    (await p.locator('h1').first().innerText()).includes('Conexiones'))

  // Y lo mismo para las que ya existían: el arreglo no es solo para la
  // pantalla de este PR.
  await p.goto(BASE + '#/asignatura/algebra/mapa', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2500)
  check('el mapa también carga sin red', (await p.locator('.smap-node').count()) > 0)

  await p.goto(BASE + '#/asignatura/algebra/practica', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2500)
  check('la práctica también carga sin red', (await p.locator('.prob-q, .tabs [role="tab"]').count()) > 0)

  check('sin errores de consola', errores.length === 0, errores.slice(0, 3).join(' | '))
} finally {
  await b.close()
  parar()
}

resumen()
