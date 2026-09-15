import { lanzar, vigilarConsola } from './_navegador.mjs'
import { CURRICULUM } from '../../src/data/curriculum.js'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA (' + errors.length + ') ---\n' + (errors.join('\n') || '(limpia)')) })

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)

// ---- Las 30 asignaturas: la guía carga con todas sus secciones
let totalRes = 0, badLinks = 0
for (const s of CURRICULUM) {
  await p.goto(BASE + '#/asignatura/' + s.id, { waitUntil: 'networkidle' })
  await p.locator('.guide').waitFor({ timeout: 10000 }).catch(() => {})
  const ok = await p.locator('.guide').count()
  const heads = await p.locator('.guide h3').allInnerTexts()
  const nRes = await p.locator('.guide .guide-res').count()
  const topics = await p.locator('.guide-topics li').count()
  const steps = await p.locator('.guide-steps li').count()
  const links = await p.locator('.guide a[href]').evaluateAll((as) => as.map((a) => ({ h: a.href, t: a.target, r: a.rel })))
  const bad = links.filter((l) => !l.h.startsWith('https://') || l.t !== '_blank' || !/noopener/.test(l.r))
  badLinks += bad.length; totalRes += nRes
  const expectedHeads = ['Guía de estudio', 'Temario orientativo', 'Para aprender', 'Para practicar', 'Laboratorio y entorno de prácticas']
  const headsOk = expectedHeads.every((h) => heads.some((x) => x.startsWith(h)))
  check(`guía ${s.id}`, ok === 1 && headsOk && nRes >= 8 && topics >= 6 && steps >= 3 && bad.length === 0,
    `secciones=${heads.length} recursos=${nRes} temas=${topics} pasos=${steps} enlaces-mal=${bad.length}`)
}
check('todos los enlaces https + nueva pestaña + noopener', badLinks === 0, String(badLinks))
check('volumen total de recursos+herramientas', totalRes >= 300, String(totalRes))

// ---- Pestaña por defecto y navegación de pestañas
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
check('pestaña por defecto = Guía', (await p.getByRole('tab', { name: 'Guía de estudio' }).getAttribute('aria-selected')) === 'true')
check('ECTS visibles', (await p.locator('.guide-head .chip').innerText()).includes('6 ECTS'))

// ---- Temario plegable
await p.locator('.guide-toggle').first().click()
await p.waitForTimeout(150)
check('temario se pliega', (await p.locator('.guide-topics').count()) === 0)
await p.locator('.guide-toggle').first().click()
await p.waitForTimeout(150)
check('temario se despliega', (await p.locator('.guide-topics').count()) === 1)

// ---- Guardar recurso → aparece en «Mis recursos» y persiste
const first = p.locator('.guide-res').filter({ has: p.locator('.guide-save:not([disabled])') }).first()
const title = (await first.locator('.guide-res-title').innerText()).trim()
await first.locator('.guide-save').click()
await p.waitForTimeout(250)
// Tras guardar, el filtro «sin deshabilitar» ya no casa con esa fila: se relocaliza por título.
const savedRow = p.locator('.guide-res').filter({ hasText: title }).first()
check('botón pasa a «Guardado»', (await savedRow.locator('.guide-save').innerText()).includes('Guardado') && await savedRow.locator('.guide-save').isDisabled())
await p.getByRole('tab', { name: 'Recursos' }).click()
await p.waitForTimeout(200)
check('aparece en Mis recursos', (await p.locator('.resource-item').filter({ hasText: title }).count()) === 1, title)
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(400)
// La pestaña vive ahora en la URL, así que recargar te deja donde estabas.
check('recargar mantiene la pestaña abierta', p.url().endsWith('/recursos'), p.url())
check('el recurso guardado sigue ahí tras recargar',
  (await p.locator('.resource-item').filter({ hasText: title }).count()) === 1, title)
await p.getByRole('tab', { name: 'Guía de estudio' }).click()
await p.waitForTimeout(400)
check('guardado persiste tras recargar', (await p.locator('.guide-res').filter({ hasText: title }).locator('.guide-save').innerText()).includes('Guardado'))

// ---- Kit del estudiante en Estudio
await p.goto(BASE + '#/estudio', { waitUntil: 'networkidle' })
await p.waitForTimeout(200)
check('kit del estudiante presente', (await p.locator('.card').filter({ hasText: 'Kit del estudiante' }).count()) === 1)
await p.getByRole('button', { name: /Kit del estudiante/ }).click()
await p.waitForTimeout(150)
check('kit despliega herramientas', (await p.locator('#student-kit .guide-res').count()) >= 10)
check('kit muestra evaluación UNIPRO', (await p.locator('#student-kit').innerText()).includes('70 %'))

// ---- Móvil 400 px: la guía no desborda
const m = await ctx.newPage()
await m.setViewportSize({ width: 400, height: 800 })
for (const id of ['algebra', 'seguridad', 'tfb']) {
  await m.goto(BASE + '#/asignatura/' + id, { waitUntil: 'networkidle' })
  await m.locator('.guide').waitFor({ timeout: 10000 }).catch(() => {})
  await m.waitForTimeout(200)
  const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  check(`móvil guía ${id} sin overflow`, sw <= cw + 1, `${sw} > ${cw}`)
}
await m.goto(BASE + '#/estudio', { waitUntil: 'networkidle' })
await m.getByRole('button', { name: /Kit del estudiante/ }).click()
await m.waitForTimeout(200)
const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
check('móvil kit sin overflow', sw <= cw + 1, `${sw} > ${cw}`)

await b.close()

// Resumen en el formato común: es lo que permite al lanzador saber que
// esta suite llegó al final y no se cortó a mitad.
const _pass = out.filter((x) => x.startsWith('PASS')).length
const _fail = out.filter((x) => x.startsWith('FAIL')).length
console.log(`\n${_pass} PASS · ${_fail} FAIL`)
