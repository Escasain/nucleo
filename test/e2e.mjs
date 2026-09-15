// ============================================================
// Pruebas de navegador
// ------------------------------------------------------------
// Levanta la app, lanza las suites de Playwright contra ella y la para.
// Playwright NO es una dependencia del proyecto: la app no se instala
// con ella y `npm install` sigue trayendo solo lo de siempre. Si no está,
// esto lo dice y cómo ponerla, en vez de fallar con un error críptico.
// ============================================================
import { readdirSync, mkdirSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { correrSuites, informe } from './run.mjs'

const aqui = dirname(fileURLToPath(import.meta.url))
const PUERTO = Number(process.env.PORT || 5273)
const BASE = process.env.BASE || `http://${process.env.HOST || '127.0.0.1'}:${PUERTO}/`

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
  // Vite directamente, no a través de npx: en la CI npx no lo encontró y
  // el arranque falló sin decir por qué. Llamar al binario evita esa
  // capa entera.
  const vite = join(aqui, '..', 'node_modules', 'vite', 'bin', 'vite.js')
  if (!existsSync(vite)) {
    console.error('No encuentro Vite en node_modules. ¿Has hecho `npm install`?')
    process.exit(1)
  }
  // detached: para poder matar el árbol entero al terminar, y no dejar
  // el servidor vivo ocupando el puerto.
  // --host explícito: por defecto Vite escucha en «localhost», que en
  // algunas máquinas resuelve solo a ::1 mientras nosotros preguntamos
  // por 127.0.0.1. El servidor arranca bien y la conexión se rechaza
  // igual, sin un solo mensaje de error. Atarlo donde preguntamos quita
  // ese modo de fallo.
  const HOST = process.env.HOST || '127.0.0.1'
  servidor = spawn(process.execPath, [vite, '--host', HOST, '--port', String(PUERTO), '--strictPort'], {
    cwd: join(aqui, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  })

  // Su salida se guarda para poder enseñarla si no arranca. Silenciarla
  // convertía cualquier fallo en treinta segundos de espera muda.
  let log = ''
  servidor.stdout.on('data', (d) => (log += d))
  servidor.stderr.on('data', (d) => (log += d))
  let murio = null
  servidor.on('exit', (code, sig) => (murio = `terminó con código ${code}${sig ? ` (${sig})` : ''}`))

  const falla = (motivo) => {
    parar()
    console.error(`${motivo}\n`)
    console.error(log.trim() || '(el servidor no dijo nada)')
    process.exit(1)
  }

  const hasta = Date.now() + 30000
  for (;;) {
    try {
      const r = await fetch(BASE)
      if (r.ok) break
    } catch {
      /* todavía no */
    }
    // Si el proceso ya murió no tiene sentido esperar los 30 s enteros.
    if (murio) falla(`El servidor ${murio} en lugar de escuchar en ${BASE}.`)
    if (Date.now() > hasta) falla(`La app no arrancó en ${BASE} en 30 s.`)
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
