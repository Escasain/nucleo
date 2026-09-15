// ============================================================
// Pruebas de navegador
// ------------------------------------------------------------
// Levanta la app, lanza las suites de Playwright contra ella y la para.
// Playwright NO es una dependencia del proyecto: la app no se instala
// con ella y `npm install` sigue trayendo solo lo de siempre. Si no está,
// esto lo dice y cómo ponerla, en vez de fallar con un error críptico.
// ============================================================
import { readdirSync, mkdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { correrSuites, informe } from './run.mjs'

const aqui = dirname(fileURLToPath(import.meta.url))
const PUERTO = Number(process.env.PORT || 5273)
const BASE = process.env.BASE || `http://127.0.0.1:${PUERTO}/`

try {
  await import('playwright')
} catch {
  console.log('Playwright no está instalado, y no es una dependencia del proyecto a propósito.')
  console.log('Para estas pruebas:\n')
  console.log('    npm i -D playwright && npx playwright install chromium\n')
  console.log('Las pruebas que no necesitan navegador se lanzan con `npm test`.')
  process.exit(1)
}

// Si BASE apunta fuera, no levantamos nada: se prueba contra eso.
const propio = !process.env.BASE
let servidor = null

function parar() {
  if (!servidor) return
  try {
    process.kill(-servidor.pid, 'SIGTERM')
  } catch {
    servidor.kill()
  }
  servidor = null
}
// Si esto se corta con Ctrl-C, el servidor no puede quedarse vivo.
process.on('SIGINT', () => {
  parar()
  process.exit(130)
})
if (propio) {
  // detached: npx puede lanzar vite como hijo suyo, y matar solo a npx
  // dejaría el servidor vivo ocupando el puerto. Con su propio grupo se
  // mata el árbol entero al terminar.
  servidor = spawn('npx', ['vite', '--port', String(PUERTO), '--strictPort'], {
    cwd: join(aqui, '..'),
    stdio: 'ignore',
    detached: true
  })
  const hasta = Date.now() + 30000
  for (;;) {
    try {
      const r = await fetch(BASE)
      if (r.ok) break
    } catch {
      /* todavía no */
    }
    if (Date.now() > hasta) {
      parar()
      console.error(`La app no arrancó en ${BASE} en 30 s. ¿Está el puerto ${PUERTO} ocupado?`)
      process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 300))
  }
}

// Algunas suites guardan capturas o un JSON de ida y vuelta; el
// directorio tiene que existir antes de que escriban en él.
mkdirSync(join(aqui, '.artefactos'), { recursive: true })

const dir = join(aqui, 'pw')
const ficheros = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()
const filas = correrSuites(ficheros, { cwd: dir, env: { ...process.env, BASE }, etiqueta: 'pw/' })
const bien = informe(filas)

parar()
process.exit(bien ? 0 : 1)
