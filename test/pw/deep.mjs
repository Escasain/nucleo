process.on('exit', () => console.log(results.join('\n')))
import { lanzar, vigilarConsola } from './_navegador.mjs'
const ARTEFACTOS = new URL('../.artefactos/', import.meta.url).pathname
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const results = [], errors = []
const check = (n, ok, x = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const browser = await lanzar()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
vigilarConsola(page, errors)

// ---- Pomodoro completo con reloj simulado: 1 registro de 25 min, no 2
await page.clock.install()
await page.goto(BASE + '#/estudio', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'Empezar' }).click()
await page.clock.runFor('25:01')
await page.waitForTimeout(400)
const pom = await page.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).pomodoro)
check('pomodoro registra 1 sola entrada', pom.length === 1, JSON.stringify(pom))
check('pomodoro registra 25 min', pom[0]?.minutes === 25, String(pom[0]?.minutes))
check('pasa a descanso', (await page.locator('.pomodoro .phase').innerText()).trim().toUpperCase() === 'DESCANSO')
check('reloj de descanso arranca en 5 min', (await page.locator('.pomodoro .time').innerText()).startsWith('04:5'), await page.locator('.pomodoro .time').innerText())

// ---- Parada a mitad: minutos completos, sin duplicar (StrictMode)
const ctxP = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const pP = await ctxP.newPage()
await pP.clock.install()
await pP.goto(BASE + '#/estudio', { waitUntil: 'domcontentloaded' })
await pP.waitForTimeout(400)
await pP.getByRole('button', { name: 'Empezar' }).click()
await pP.clock.runFor('03:10')
await pP.getByRole('button', { name: 'Terminar' }).click()
await pP.waitForTimeout(300)
const pom2 = await pP.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).pomodoro)
check('parada a mitad: 3 min exactos', pom2.length === 1 && pom2[0].minutes === 3, JSON.stringify(pom2))

// ---- Leitner: «Otra vez» no repite la misma tarjeta en bucle
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const p2 = await ctx2.newPage()
await p2.goto(BASE + '#/estudio/algebra', { waitUntil: 'networkidle' })
await p2.waitForTimeout(300)
for (const [f, b] of [['P1', 'R1'], ['P2', 'R2']]) {
  await p2.getByRole('tab', { name: /^Tarjetas/ }).click()
  await p2.getByRole('button', { name: 'Nueva tarjeta' }).click()
  await p2.locator('.modal textarea').nth(0).fill(f)
  await p2.locator('.modal textarea').nth(1).fill(b)
  await p2.getByRole('button', { name: 'Guardar' }).click()
  await p2.waitForTimeout(150)
}
await p2.getByRole('tab', { name: /^Repasar/ }).click()
await p2.waitForTimeout(200)
const c1 = await p2.locator('.flashcard .content').innerText()
await p2.locator('.flashcard').click()
await p2.getByRole('button', { name: 'Otra vez' }).click()
await p2.waitForTimeout(250)
const c2 = await p2.locator('.flashcard .content').innerText()
check('«Otra vez» pasa a la siguiente tarjeta', c1 !== c2, `${c1} → ${c2}`)
check('«Otra vez» mantiene la tarjeta para hoy', (await p2.getByRole('tab', { name: /^Repasar/ }).innerText()).includes('(2)'))

// ---- Flashcard con teclado
await p2.locator('.flashcard').focus()
await p2.keyboard.press('Enter')
await p2.waitForTimeout(150)
check('flashcard gira con Enter', (await p2.locator('.flashcard.back').count()) === 1)

// ---- Modal: Escape, foco inicial y trampa de tabulación
await p2.getByRole('tab', { name: /^Tarjetas/ }).click()
await p2.getByRole('button', { name: 'Nueva tarjeta' }).click()
await p2.waitForTimeout(200)
check('foco inicial en el modal', (await p2.evaluate(() => document.activeElement?.closest('.modal') !== null)))
for (let i = 0; i < 8; i++) await p2.keyboard.press('Tab')
check('el foco no sale del modal', (await p2.evaluate(() => document.activeElement?.closest('.modal') !== null)))
await p2.keyboard.press('Escape')
await p2.waitForTimeout(200)
check('Escape cierra el modal', (await p2.locator('.modal').count()) === 0)
check('el foco vuelve al disparador', (await p2.evaluate(() => document.activeElement?.textContent?.includes('Nueva tarjeta'))))

// ---- Teclado en el plan de estudios
await p2.goto(BASE + '#/plan', { waitUntil: 'networkidle' })
await p2.waitForTimeout(250)
await p2.locator('.subject-card').first().focus()
await p2.keyboard.press('Enter')
await p2.waitForTimeout(250)
check('plan: se abre asignatura con Enter', p2.url().includes('#/asignatura/'), p2.url())

// ---- Copia de seguridad corrupta o incompleta: no debe romper la app
const fs = await import('node:fs/promises')
const badFiles = {
  'parcial.json': JSON.stringify({ subjects: { algebra: { status: 'cursando' } } }),
  'tipos-raros.json': JSON.stringify({ subjects: { algebra: { status: 'inventado' } }, tasks: null, decks: { algebra: 'no soy una lista' }, sessions: [{ id: 'x', title: 'sin fecha' }], pomodoro: [{ id: 'p', minutes: 'diez' }] })
}
for (const [name, body] of Object.entries(badFiles)) {
  const fp = ARTEFACTOS + `${name}`
  await fs.writeFile(fp, body)
  await p2.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
  await p2.waitForTimeout(250)
  await p2.locator('input[type=file]').setInputFiles(fp)
  await p2.waitForTimeout(400)
  const before = errors.length
  for (const h of ['', '#/plan', '#/agenda', '#/estudio/algebra', '#/asignatura/algebra']) {
    await p2.goto(BASE + h, { waitUntil: 'networkidle' })
    await p2.waitForTimeout(200)
  }
  check(`copia «${name}»: la app no revienta`, errors.length === before && (await p2.locator('.page-head h1').count()) > 0, errors.slice(before).join(' | '))
}

// ---- Modo local sin Client ID
await p2.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
await p2.waitForTimeout(250)
check('indicador «Modo local»', (await p2.locator('.sync-state').innerText()).includes('Modo local'))
check('Conectar con Drive desactivado', await p2.getByRole('button', { name: 'Conectar con Drive' }).isDisabled())
check('aviso de SETUP.md visible', await p2.locator('.banner').isVisible())
await p2.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p2.getByRole('tab', { name: 'Recursos' }).click()
await p2.waitForTimeout(200)
check('«Desde Drive» desactivado sin App ID', await p2.getByRole('button', { name: 'Desde Drive' }).isDisabled())
check('no se carga ningún script de Google', (await p2.evaluate(() => document.querySelectorAll('script[src*="google"]').length)) === 0)


check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log('\n--- CONSOLA (' + errors.length + ') ---')
console.log(errors.slice(0, 20).join('\n') || '(limpia)')
await browser.close()

// Resumen en el formato común: es lo que permite al lanzador saber que
// esta suite llegó al final y no se cortó a mitad.
const _pass = results.filter((x) => x.startsWith('PASS')).length
const _fail = results.filter((x) => x.startsWith('FAIL')).length
console.log(`\n${_pass} PASS · ${_fail} FAIL`)
