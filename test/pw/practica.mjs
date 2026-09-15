// La pestaña de Práctica: resolver, autocorregirse y aprender del fallo.
import { lanzar, vigilarConsola } from './navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)
const store = () => p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')))

await p.clock.install({ time: new Date() })

// ---------- la pestaña existe y trae los problemas
await p.goto(BASE + '#/asignatura/algebra/practica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
const n = await p.locator('.prob').count()
check('la pestaña de práctica trae problemas', n > 25, String(n))
check('agrupados por tema', (await p.locator('.prob-list').count()) >= 6, String(await p.locator('.prob-list').count()))
check('cada problema dice su nivel', (await p.locator('.prob .plan-kind').count()) === n)
check('hay problemas de nivel examen', (await p.locator('.plan-kind.is-l3').count()) > 0)

// ---------- la solución no está a la vista
check('ni pistas ni soluciones abiertas de entrada',
  (await p.locator('.prob-hint').count()) === 0 && (await p.locator('.prob-solution').count()) === 0)
check('el contador arranca a cero', (await p.locator('.practice .stat-num').first().innerText()).startsWith('0'),
  await p.locator('.practice .stat-num').first().innerText())
check('sin intentos no hay porcentaje', (await p.locator('.practice .stat-num').nth(1).innerText()).trim() === '—')

// ---------- pista y solución, una cada vez
const pr = p.locator('.prob').first()
await pr.getByRole('button', { name: 'Pista' }).click()
await p.waitForTimeout(300)
check('la pista se abre', (await p.locator('.prob-hint').count()) === 1)
check('la pista no destapa la solución', (await p.locator('.prob-solution').count()) === 0)
await pr.getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
check('la solución se abre', (await p.locator('.prob-solution').count()) === 1)
check('la solución trae respuesta corta', (await p.locator('.prob-key').count()) === 1)
check('y el razonamiento', (await p.locator('.prob-a').innerText()).length > 100,
  String((await p.locator('.prob-a').innerText()).length))
check('con la solución abierta no ofrece la pista', (await pr.getByRole('button', { name: 'Pista' }).count()) === 0)

// ---------- marcarlo como acertado
await pr.getByRole('button', { name: 'Sí' }).click()
await p.waitForTimeout(500)
const d1 = await store()
const claves = Object.keys(d1.practice)
check('se registra el intento', claves.length === 1, JSON.stringify(claves))
check('la clave lleva asignatura y problema', claves[0].startsWith('algebra:'), claves[0])
check('queda como acertado', d1.practice[claves[0]].last === 'ok' && d1.practice[claves[0]].ok === 1,
  JSON.stringify(d1.practice[claves[0]]))
check('con su fecha', /^\d{4}-\d{2}-\d{2}$/.test(d1.practice[claves[0]].lastAt), d1.practice[claves[0]].lastAt)
check('al acertar se cierra la solución', (await p.locator('.prob-solution').count()) === 0)
check('el contador sube', (await p.locator('.practice .stat-num').first().innerText()).startsWith('1'),
  await p.locator('.practice .stat-num').first().innerText())
check('y el porcentaje pasa a 100 %', (await p.locator('.practice .stat-num').nth(1).innerText()).includes('100'))
check('el problema queda marcado', (await pr.locator('.prob-mark').innerText()).includes('lo tenías'))

// ---------- fallar: pide el motivo y lo manda a las dudas
const pr2 = p.locator('.prob').nth(1)
await pr2.getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
await pr2.getByRole('button', { name: 'No' }).click()
await p.waitForTimeout(400)
check('al fallar pregunta qué te faltaba', (await p.locator('.prob-why').count()) === 1)
await p.locator('.prob-why textarea').fill('Se me olvidó que la negación cambia el cuantificador.')
await p.locator('.prob-why').getByRole('button', { name: 'Apuntar' }).click()
await p.waitForTimeout(600)
const d2 = await store()
check('el fallo queda registrado', Object.values(d2.practice).some((a) => a.last === 'fail'),
  JSON.stringify(d2.practice))
check('el motivo pasa a las dudas de la asignatura',
  d2.understanding.some((u) => u.type === 'duda' && u.subjectId === 'algebra' && /cuantificador/.test(u.text)),
  JSON.stringify(d2.understanding.map((u) => u.text)))
check('la duda dice de qué problema viene',
  d2.understanding.some((u) => String(u.unitTitle || '').startsWith('Problema:')),
  String(d2.understanding[0] && d2.understanding[0].unitTitle))
check('el problema queda marcado como fallado', (await pr2.locator('.prob-mark').innerText()).includes('fallado'))
check('el porcentaje baja a 50 %', (await p.locator('.practice .stat-num').nth(1).innerText()).includes('50'))
check('y cuenta uno como fallado para volver', (await p.locator('.practice .stat-num').nth(2).innerText()).trim() === '1')

// fallar sin dar motivo también vale
const pr3 = p.locator('.prob').nth(2)
await pr3.getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
await pr3.getByRole('button', { name: 'No' }).click()
await p.waitForTimeout(300)
const dudasAntes = (await store()).understanding.length
await pr3.getByRole('button', { name: 'Ahora no' }).click()
await p.waitForTimeout(400)
check('«Ahora no» registra el fallo sin crear duda',
  (await store()).understanding.length === dudasAntes && Object.keys((await store()).practice).length === 3,
  `${dudasAntes} dudas · ${Object.keys((await store()).practice).length} intentos`)

// ---------- fallar desde «Sin hacer» no hace desaparecer la fila (Codex, PR #7)
await p.getByRole('tab', { name: 'Sin hacer' }).click()
await p.waitForTimeout(500)
const pendiente = p.locator('.prob').first()
await pendiente.getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
await pendiente.getByRole('button', { name: 'No' }).click()
await p.waitForTimeout(500)
check('desde «Sin hacer», fallar deja pedir el motivo', (await p.locator('.prob-why').count()) === 1,
  String(await p.locator('.prob-why').count()))
await p.locator('.prob-why textarea').fill('No me acordaba del caso base.')
await p.locator('.prob-why').getByRole('button', { name: 'Apuntar' }).click()
await p.waitForTimeout(600)
check('y el motivo llega a las dudas',
  (await store()).understanding.some((u) => /caso base/.test(u.text)),
  JSON.stringify((await store()).understanding.map((u) => u.text)))
check('al terminar, la fila ya sí sale del filtro',
  (await p.locator('.prob-why').count()) === 0 && (await p.locator('.prob').count()) === n - 4,
  `${await p.locator('.prob').count()} de ${n}`)

// ---------- filtros
await p.getByRole('tab', { name: 'Fallados' }).click()
await p.waitForTimeout(500)
check('el filtro de fallados deja solo los fallados', (await p.locator('.prob').count()) === 3,
  String(await p.locator('.prob').count()))
await p.getByRole('tab', { name: 'Sin hacer' }).click()
await p.waitForTimeout(500)
check('el filtro de pendientes descuenta los hechos', (await p.locator('.prob').count()) === n - 4,
  `${await p.locator('.prob').count()} de ${n}`)
await p.getByRole('tab', { name: 'Todos' }).click()
await p.waitForTimeout(500)
check('el filtro de todos los devuelve', (await p.locator('.prob').count()) === n)

// ---------- olvidar un intento
const marcado = p.locator('.prob').first()
await marcado.getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
await marcado.getByRole('button', { name: 'Olvidar intento' }).click()
await p.waitForTimeout(500)
check('se puede olvidar un intento', Object.keys((await store()).practice).length === 3,
  JSON.stringify(Object.keys((await store()).practice)))
check('el problema vuelve a estar sin marcar', (await marcado.locator('.prob-mark').count()) === 0)

// ---------- «a la primera» no confunde recuperar con acertar (Codex, PR #7)
await p.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('nucleo.data'))
  d.practice = { 'algebra:log1': { ok: 1, fail: 1, last: 'ok', lastAt: '2026-09-14' } }
  localStorage.setItem('nucleo.data', JSON.stringify(d))
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('un problema recuperado no da 100 % a la primera',
  (await p.locator('.practice .stat-num').nth(1).innerText()).includes('0 %'),
  await p.locator('.practice .stat-num').nth(1).innerText())
check('pero sí cuenta como hecho', (await p.locator('.practice .stat-num').first().innerText()).startsWith('1'))
check('y no queda como fallado', (await p.locator('.practice .stat-num').nth(2).innerText()).trim() === '0')

// ---------- punto flojo
await p.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('nucleo.data'))
  const hoy = new Date().toISOString().slice(0, 10)
  // Tres de Grafos fallados: debería señalarlos como punto flojo.
  d.practice = {
    'algebra:gr1': { ok: 0, fail: 1, last: 'fail', lastAt: hoy },
    'algebra:gr2': { ok: 0, fail: 1, last: 'fail', lastAt: hoy },
    'algebra:gr3': { ok: 0, fail: 1, last: 'fail', lastAt: hoy },
    'algebra:log1': { ok: 1, fail: 0, last: 'ok', lastAt: hoy },
    'algebra:log2': { ok: 1, fail: 0, last: 'ok', lastAt: hoy }
  }
  localStorage.setItem('nucleo.data', JSON.stringify(d))
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const flojo = await p.locator('.plan-warn-block').innerText()
check('señala el tema más flojo', flojo.includes('Grafos') && flojo.includes('0 a la primera de 3'), flojo)
check('y no señala el que va bien', !flojo.includes('Lógica'), flojo)

// un tema con un solo intento no se declara punto flojo
await p.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('nucleo.data'))
  d.practice = { 'algebra:gr1': { ok: 0, fail: 1, last: 'fail', lastAt: '2026-09-14' } }
  localStorage.setItem('nucleo.data', JSON.stringify(d))
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('un solo intento no basta para declarar punto flojo', (await p.locator('.plan-warn-block').count()) === 0)

// ---------- Tecnología de Computadores
await p.goto(BASE + '#/asignatura/tec-comp/practica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1400)
const nTC = await p.locator('.prob').count()
check('TC tiene sus propios problemas', nTC > 20, String(nTC))
const tcTxt = await p.locator('.practice').innerText()
check('cubre complemento a dos', /complemento a dos/i.test(tcTxt))
check('cubre Karnaugh', /Karnaugh/.test(tcTxt))
check('cubre máquinas de estados', /Mealy|Moore/.test(tcTxt))
check('los intentos de Álgebra no se mezclan', (await p.locator('.practice .stat-num').first().innerText()).startsWith('0'),
  await p.locator('.practice .stat-num').first().innerText())

// ---------- una asignatura sin problemas lo dice
await p.goto(BASE + '#/asignatura/redes/practica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
check('sin problemas, mensaje claro', (await p.locator('.empty .big').innerText()).includes('Todavía no hay problemas'))

// ---------- desde la sesión de estudio se llega a practicar
await p.goto(BASE + '#/sesion/algebra/b1', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(70_000)
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Terminar unidad' }).click()
await p.waitForTimeout(500)
await p.locator('.focus-reflect').getByRole('button', { name: 'Ahora no' }).click()
await p.waitForTimeout(400)
await p.getByRole('button', { name: 'Practicar lo que sé' }).click()
await p.waitForTimeout(900)
check('al acabar una sesión se puede practicar', p.url().endsWith('#/asignatura/algebra/practica'), p.url())

// ---------- la copia de seguridad se lo lleva
check('la copia de seguridad incluye los intentos', typeof (await store()).practice === 'object')

// ---------- móvil y accesibilidad
await p.setViewportSize({ width: 400, height: 820 })
await p.goto(BASE + '#/asignatura/algebra/practica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
await p.locator('.prob').first().getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
const w = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
check('móvil sin desbordamiento', w[0] <= w[1] + 1, `${w[0]} > ${w[1]}`)

await p.setViewportSize({ width: 1280, height: 1000 })
// goto a la MISMA url no recarga: la solución seguiría abierta del paso anterior.
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('los filtros son pestañas accesibles', (await p.locator('.practice [role="tab"]').count()) === 3)
check('el botón de solución dice si está abierto',
  (await p.locator('.prob').first().getByRole('button', { name: 'Ver solución' }).getAttribute('aria-expanded')) === 'false')
check('la barra de progreso está etiquetada',
  (await p.locator('.practice [role="progressbar"]').getAttribute('aria-label')) === 'Problemas hechos')

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log(out.join('\n'))
console.log(`\n--- CONSOLA (${errors.length}) ---`)
console.log(errors.length ? errors.join('\n') : '(limpia)')
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
await b.close()
