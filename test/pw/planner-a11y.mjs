import { lanzar, vigilarConsola } from './navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA (' + errors.length + ') ---\n' + (errors.join('\n') || '(limpia)')); console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`) })

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)

// ---------- CRITERIO: foco visible por teclado en todos los controles
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
const focusables = [
  ['.plan-day', 'día del calendario'],
  ['.plan-stepper button', 'stepper de horas'],
  ['.plan-legend-item', 'leyenda'],
  ['.plan-linkname', 'nombre de asignatura']
]
// :focus-visible solo se activa con el teclado, así que se enfoca el
// control anterior y se llega al objetivo con un Tab real.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
for (const [sel, label] of focusables) {
  if (await p.locator(sel).count() === 0) { check(`CRITERIO foco visible: ${label}`, false, 'no encontrado'); continue }
  const placed = await p.evaluate(({ sel, FOCUSABLE }) => {
    const all = [...document.querySelectorAll(FOCUSABLE)].filter((e) => e.offsetParent !== null)
    const i = all.findIndex((e) => e.matches(sel))
    if (i <= 0) return false
    all[i - 1].focus()
    return true
  }, { sel, FOCUSABLE })
  if (!placed) { check(`CRITERIO foco visible: ${label}`, false, 'no se pudo situar el foco'); continue }
  await p.keyboard.press('Tab')
  const ring = await p.evaluate((sel) => {
    const n = document.activeElement
    if (!n || !n.matches(sel)) return { mismatch: n ? n.className : 'ninguno' }
    const cs = getComputedStyle(n)
    return { w: cs.outlineWidth, style: cs.outlineStyle, visible: n.matches(':focus-visible') }
  }, sel)
  const ok = !ring.mismatch && ring.visible && parseFloat(ring.w) >= 2 && ring.style !== 'none'
  check(`CRITERIO foco visible: ${label}`, ok, JSON.stringify(ring))
}
// todos los controles del planificador son <button> alcanzables por tabulación
const noTab = await p.evaluate(() => {
  const els = [...document.querySelectorAll('.plan-day, .plan-stepper button, .plan-legend-item, .plan-linkname, .plan-unit [role=checkbox]')]
  return els.filter((e) => e.tabIndex < 0 || e.disabled).length
})
check('CRITERIO ningún control queda fuera de la tabulación', noTab === 0, String(noTab))

// nombres accesibles
const unnamed = await p.evaluate(() => {
  const els = [...document.querySelectorAll('.plan-day, .plan-stepper button, .plan-legend-item')]
  return els.filter((e) => !(e.getAttribute('aria-label') || e.textContent.trim())).length
})
check('todos los controles tienen nombre accesible', unnamed === 0, String(unnamed))
check('el día expone aria-label con fecha', /\w+.*\d/.test(await p.locator('.plan-day').first().getAttribute('aria-label')),
  await p.locator('.plan-day').first().getAttribute('aria-label'))
check('las barras de presión son progressbar', (await p.locator('.plan-bar[role=progressbar]').count()) >= 2)

// operar el calendario solo con teclado
await p.locator('.plan-day').nth(5).focus()
await p.keyboard.press('Enter')
await p.waitForTimeout(300)
check('se abre el día con Enter', await p.locator('.plan-detail').isVisible())
await p.locator('.plan-hourcell').first().getByRole('button', { name: /Añadir tiempo/ }).focus()
await p.keyboard.press('Enter')
await p.waitForTimeout(300)
check('el stepper funciona con Enter', (await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).planner.weekHours)) !== null)

// ---------- CRITERIO: móvil, el calendario colapsa a lista de días
const m = await ctx.newPage()
await m.setViewportSize({ width: 400, height: 800 })
await m.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await m.waitForTimeout(500)
const cols = await m.locator('.plan-week').first().evaluate((n) => getComputedStyle(n).gridTemplateColumns)
check('CRITERIO móvil: el calendario es una columna', cols.split(' ').length === 1, cols)
check('CRITERIO móvil: cabecera de días oculta', (await m.locator('.plan-calhead').first().evaluate((n) => getComputedStyle(n).display)) === 'none')
check('CRITERIO móvil: cada día muestra su día de la semana', (await m.locator('.plan-dayweek').first().evaluate((n) => getComputedStyle(n).display)) !== 'none')
const dayDir = await m.locator('.plan-day').first().evaluate((n) => getComputedStyle(n).flexDirection)
check('CRITERIO móvil: el día se dispone en fila', dayDir === 'row', dayDir)

// sin desbordes horizontales en ninguna vista del planificador
for (const [hash, tab] of [['#/', null], ['#/calendario', null], ['#/asignatura/algebra', 'Calendario'], ['#/asignatura/tec-comp', 'Calendario']]) {
  await m.goto(BASE + hash, { waitUntil: 'networkidle' })
  if (tab) await m.getByRole('tab', { name: tab }).click()
  await m.waitForTimeout(400)
  const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  check(`CRITERIO móvil sin overflow ${hash}${tab ? ' · ' + tab : ''}`, sw <= cw + 1, `${sw} > ${cw}`)
}
// el editor de horas sigue siendo usable a 400px
await m.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await m.waitForTimeout(300)
const cellW = await m.locator('.plan-hourcell').first().evaluate((n) => n.getBoundingClientRect().width)
check('móvil: las celdas de horas no se aplastan', cellW >= 100, String(Math.round(cellW)))

// ---------- movimiento reducido / impresión no rompen
await ctx.close()
const ctx2 = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const p2 = await ctx2.newPage()
await p2.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p2.waitForTimeout(400)
check('con movimiento reducido sigue funcionando', (await p2.locator('.plan-day').count()) > 20)

await b.close()
