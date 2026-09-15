import { lanzar, vigilarConsola } from './_navegador.mjs'
const ARTEFACTOS = new URL('../.artefactos/', import.meta.url).pathname

const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const errors = []
const results = []
function check(name, ok, extra = '') {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' :: ' + extra : ''}`)
  if (!ok) process.exitCode = 1
}

const browser = await lanzar()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
// Esta suite vigila también los warning, no solo los errores.
vigilarConsola(page, errors, { avisos: true })

await page.goto(BASE, { waitUntil: 'networkidle' })

// ---- 1. Navegación entre las 5 vistas
for (const [label, h1] of [['Inicio', 'Hola, Carlos'], ['Plan de estudios', 'Plan de estudios'], ['Agenda', 'Agenda'], ['Estudio', 'Estudio'], ['Ajustes', 'Ajustes']]) {
  await page.locator('.nav').getByRole('link', { name: label, exact: true }).click()
  await page.waitForTimeout(150)
  check(`nav → ${label}`, (await page.locator('.page-head h1').first().innerText()).trim() === h1)
}

// ---- 2. Plan de estudios: 3 años, bloques, precarga
await page.locator('.nav').getByRole('link', { name: 'Plan de estudios' }).click()
await page.waitForTimeout(200)
const years = await page.locator('.year-section').count()
check('plan: 3 años', years === 3, `got ${years}`)
const blockLabels = await page.locator('.year-section').first().locator('.block-label').allInnerTexts()
check('plan: bloques año 1', JSON.stringify(blockLabels.map(s => s.trim().toUpperCase())) === JSON.stringify(['SEPTIEMBRE','NOVIEMBRE','MARZO','MAYO']), blockLabels.join('|'))

async function statusOf(name) {
  const card = page.locator('.subject-card').filter({ hasText: name }).first()
  return (await card.locator('.chip').last().innerText()).trim()
}
for (const [name, expected] of [
  ['Álgebra y Matemática Discreta', 'Cursando'],
  ['Tecnología de Computadores', 'Cursando'],
  ['Fundamentos de Programación', 'Matriculada'],
  ['Interacción Persona-Ordenador', 'Matriculada'],
  ['Estructura de Datos (Java)', 'Matriculada'],
  ['Fundamentos de Empresa', 'Reconocida']
]) {
  const got = await statusOf(name)
  check(`precarga: ${name} = ${expected}`, got === expected, got)
}

// ---- 3. Detalle de asignatura: cambiar estado y nota, persistir
await page.locator('.subject-card').filter({ hasText: 'Álgebra y Matemática Discreta' }).first().click()
await page.waitForTimeout(200)
check('routing hash detalle', page.url().includes('#/asignatura/algebra'), page.url())
await page.locator('select').first().selectOption('aprobada')
await page.locator('#subject-grade').fill('8.5')
await page.waitForTimeout(300)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(300)
check('persiste estado', (await page.locator('select').first().inputValue()) === 'aprobada')
check('persiste nota', (await page.locator('#subject-grade').inputValue()) === '8.5')

// ---- 4a. Sesión: añadir / completar / borrar
await page.getByRole('tab', { name: 'Clases y sesiones' }).click()
await page.getByRole('button', { name: 'Añadir' }).click()
await page.locator('.modal input').first().fill('Tema 1 — Grupos')
await page.locator('.modal input[type="number"]').fill('90')
await page.getByRole('button', { name: 'Guardar' }).click()
await page.waitForTimeout(200)
check('sesión creada', await page.locator('.row-item').filter({ hasText: 'Tema 1 — Grupos' }).isVisible())
await page.locator('.row-item').filter({ hasText: 'Tema 1 — Grupos' }).locator('[role=checkbox]').click()
await page.waitForTimeout(150)
check('sesión completada', (await page.locator('.row-item.done').filter({ hasText: 'Tema 1 — Grupos' }).count()) === 1)

// ---- 4b. Evaluación con fecha → Agenda + Inicio
const d = new Date(Date.now() + 5 * 86400000)
const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
await page.getByRole('tab', { name: 'Evaluaciones' }).click()
await page.getByRole('button', { name: 'Añadir' }).click()
await page.locator('.modal input').first().fill('Examen parcial')
await page.locator('.modal input[type="date"]').fill(iso)
await page.getByRole('button', { name: 'Guardar' }).click()
await page.waitForTimeout(200)
check('evaluación creada', await page.locator('.row-item').filter({ hasText: 'Examen parcial' }).isVisible())
await page.locator('.nav').getByRole('link', { name: 'Agenda' }).click()
await page.waitForTimeout(200)
check('evaluación en Agenda', (await page.locator('.deadline-item').filter({ hasText: 'Examen parcial' }).count()) === 1)
await page.locator('.nav').getByRole('link', { name: 'Inicio' }).click()
await page.waitForTimeout(200)
check('evaluación en Inicio', (await page.locator('.deadline-item').filter({ hasText: 'Examen parcial' }).count()) === 1)

// ---- 4c. Recurso por enlace
await page.goto(BASE + '#/asignatura/algebra')
await page.waitForTimeout(250)
await page.getByRole('tab', { name: 'Recursos' }).click()
await page.getByRole('button', { name: 'Enlace' }).click()
await page.locator('.modal input').nth(0).fill('Apuntes de grupos')
await page.locator('.modal input').nth(1).fill('https://example.com/apuntes')
await page.getByRole('button', { name: 'Guardar' }).click()
await page.waitForTimeout(200)
check('recurso creado', await page.locator('.resource-item').filter({ hasText: 'Apuntes de grupos' }).isVisible())
await page.locator('.resource-item').filter({ hasText: 'Apuntes de grupos' }).locator('.icon-btn').click()
await page.waitForTimeout(200)
check('recurso borrado', (await page.locator('.resource-item').count()) === 0)

// ---- 5. Flashcards
await page.goto(BASE + '#/estudio/algebra')
await page.waitForTimeout(250)
await page.getByRole('tab', { name: /^Tarjetas/ }).click()
await page.getByRole('button', { name: 'Nueva tarjeta' }).click()
await page.locator('.modal textarea').nth(0).fill('¿Qué es un grupo?')
await page.locator('.modal textarea').nth(1).fill('Conjunto con operación asociativa, neutro e inversos')
await page.getByRole('button', { name: 'Guardar' }).click()
await page.waitForTimeout(200)
check('tarjeta creada', (await page.locator('.row-item').filter({ hasText: '¿Qué es un grupo?' }).count()) === 1)
const metaBefore = await page.locator('.row-item').first().locator('.meta').innerText()
await page.getByRole('tab', { name: /^Repasar/ }).click()
await page.waitForTimeout(150)
check('tarjeta pendiente hoy', await page.locator('.flashcard').isVisible())
await page.locator('.flashcard').click()
await page.waitForTimeout(150)
check('flip muestra respuesta', (await page.locator('.flashcard .content').innerText()).includes('asociativa'))
await page.getByRole('button', { name: 'Bien' }).click()
await page.waitForTimeout(200)
await page.getByRole('tab', { name: /^Tarjetas/ }).click()
await page.waitForTimeout(150)
const metaAfter = await page.locator('.row-item').first().locator('.meta').innerText()
const box = /caja (\d)/.exec(metaAfter)?.[1]
const next = /próx\. ([\d-]+)/.exec(metaAfter)?.[1]
const todayISO = new Date().toISOString().slice(0, 10)
check('leitner: sube de caja', box === '2', metaAfter)
check('leitner: próxima revisión futura', next > todayISO, `${next} vs ${todayISO}`)
check('leitner: meta cambió', metaBefore !== metaAfter)

// ---- 6. Pomodoro
await page.goto(BASE + '#/estudio')
await page.waitForTimeout(250)
const t0 = await page.locator('.pomodoro .time').innerText()
await page.getByRole('button', { name: 'Empezar' }).click()
await page.waitForTimeout(2500)
const t1 = await page.locator('.pomodoro .time').innerText()
check('pomodoro corre', t0 !== t1, `${t0} → ${t1}`)
await page.getByRole('button', { name: 'Pausa' }).click()
await page.waitForTimeout(1500)
const t2 = await page.locator('.pomodoro .time').innerText()
check('pomodoro pausa', t1 === t2 || Math.abs(Number(t1.slice(3)) - Number(t2.slice(3))) <= 1, `${t1} → ${t2}`)
// Registro de minutos: usamos localStorage directo tras un foco largo simulado
await page.getByRole('button', { name: 'Terminar' }).click()
await page.waitForTimeout(200)
check('pomodoro reset', (await page.locator('.pomodoro .time').innerText()) === '25:00')

// ---- 7. Export / import
await page.locator('.nav').getByRole('link', { name: 'Ajustes' }).click()
await page.waitForTimeout(200)
const dl = await Promise.all([
  page.waitForEvent('download', { timeout: 8000 }),
  page.getByRole('button', { name: 'Exportar JSON' }).click()
]).then(([d]) => d).catch(() => null)
check('export descarga un fichero', dl !== null, dl ? await dl.suggestedFilename() : 'sin evento download')
let exported = null
if (dl) {
  const p = await dl.path()
  exported = JSON.parse(await (await import('node:fs/promises')).readFile(p, 'utf8'))
  check('export contiene datos', exported.subjects?.algebra?.status === 'aprobada' && exported.tasks.length >= 1)
}
if (exported) {
  const tmp = ARTEFACTOS + 'import.json'
  exported.subjects.algebra.grade = '9.9'
  await (await import('node:fs/promises')).writeFile(tmp, JSON.stringify(exported))
  await page.getByRole('button', { name: 'Importar JSON' }).click().catch(() => {})
  await page.locator('input[type=file]').setInputFiles(tmp)
  await page.waitForTimeout(400)
  await page.goto(BASE + '#/asignatura/algebra')
  await page.waitForTimeout(300)
  check('import aplicado', (await page.locator('#subject-grade').inputValue()) === '9.9')
}

// ---- 8. Móvil 400px: sin scroll horizontal
const m = await ctx.newPage()
m.on('pageerror', (e) => errors.push(`[mobile pageerror] ${e.message}`))
await m.setViewportSize({ width: 400, height: 800 })
for (const hash of ['', '#/plan', '#/agenda', '#/estudio/algebra', '#/ajustes', '#/asignatura/algebra']) {
  await m.goto(BASE + hash, { waitUntil: 'networkidle' })
  await m.waitForTimeout(250)
  const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  check(`móvil sin overflow ${hash || '#/'}`, sw <= cw + 1, `${sw} > ${cw}`)
}
// menú móvil
await m.goto(BASE, { waitUntil: 'networkidle' })
await m.getByRole('button', { name: 'Abrir menú' }).click()
await m.waitForTimeout(350)
check('menú móvil abre', await m.locator('.sidebar.open').isVisible())
await m.locator('.nav').getByRole('link', { name: 'Agenda' }).click()
await m.waitForTimeout(350)
check('menú móvil navega y cierra', m.url().includes('#/agenda') && (await m.locator('.sidebar.open').count()) === 0)

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log(results.join('\n'))
console.log('\n--- CONSOLA (' + errors.length + ') ---')
console.log(errors.slice(0, 40).join('\n') || '(limpia)')
await browser.close()

// Resumen en el formato común: es lo que permite al lanzador saber que
// esta suite llegó al final y no se cortó a mitad.
const _pass = results.filter((x) => x.startsWith('PASS')).length
const _fail = results.filter((x) => x.startsWith('FAIL')).length
console.log(`\n${_pass} PASS · ${_fail} FAIL`)
