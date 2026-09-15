// La ficha de repaso: que se llene con TUS datos y solo con ellos.
import { lanzar, vigilarConsola } from './navegador.mjs'
const ARTEFACTOS = new URL('../.artefactos/', import.meta.url).pathname
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 1100 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)
const seed = (d) => p.evaluate((x) => {
  const cur = JSON.parse(localStorage.getItem('nucleo.data') || '{}')
  localStorage.setItem('nucleo.data', JSON.stringify({ ...cur, ...x }))
}, d)

// ---------- se llega desde la asignatura
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
check('la asignatura ofrece la ficha', await p.getByRole('button', { name: 'Ficha de repaso' }).isVisible())
await p.getByRole('button', { name: 'Ficha de repaso' }).click()
await p.waitForTimeout(900)
check('y lleva a su pantalla', p.url().includes('#/repaso/algebra'), p.url())

// ---------- sin datos no se inventa nada
check('sin datos lo dice en vez de enseñar una hoja vacía',
  (await p.locator('.empty .big').innerText()).includes('nada tuyo que repasar'),
  await p.locator('.empty .big').innerText())
check('no hay sección de problemas por recuperar', !(await p.locator('.review-probs').count()))
check('ni de dudas', !(await p.locator('.review-notes').count()))
// Las trampas sí salen: antes de un examen merecen una pasada entera.
check('las trampas salen todas cuando no hay temas flojos',
  (await p.locator('.review-traps li').count()) === 12,
  String(await p.locator('.review-traps li').count()))
check('y lo explica', (await p.locator('.review-traps').locator('xpath=preceding-sibling::p[1]').innerText()).includes('pasada entera'))
check('cada trampa dice el error y el arreglo', (await p.locator('.review-traps li .is-wrong').count()) === 12)
check('y de qué tema es', (await p.locator('.review-traps li').first().innerText()).includes('Lógica'))
check('dice qué es esta hoja', (await p.locator('.guide-summary').innerText()).includes('no es un resumen del temario'))
check('y trae botón de imprimir', await p.getByRole('button', { name: 'Imprimir' }).isVisible())

// ---------- con datos tuyos
await seed({
  planner: {
    weekHours: null, exceptions: {}, hourOverrides: {}, startTimes: null, paceFactor: {},
    done: { algebra: ['t1a', 't1b', 't1c', 'b3', 't2a', 't2b'] }
  },
  practice: {
    'algebra:ind1': { ok: 0, fail: 2, last: 'fail' },
    'algebra:ind2': { ok: 0, fail: 1, last: 'fail' },
    'algebra:log1': { ok: 1, fail: 0, last: 'ok' },
    'algebra:gr1': { ok: 0, fail: 1, last: 'fail' }
  },
  understanding: [
    { id: 'd1', subjectId: 'algebra', type: 'duda', text: 'No veo por qué el paso inductivo no es circular.', resolved: false },
    { id: 'd2', subjectId: 'algebra', type: 'duda', text: 'Ya resuelta', resolved: true },
    { id: 'd3', subjectId: 'tec-comp', type: 'duda', text: 'De otra asignatura', resolved: false },
    { id: 'e1', subjectId: 'algebra', type: 'explicacion', unitTitle: 'T2 · Principio de inducción',
      text: 'Inducción es una fila de fichas de dominó: tiras la primera y garantizas que cada una tira a la siguiente.' }
  ],
  mocks: [{ id: 'm1', subjectId: 'algebra', date: '2026-09-14T10:00:00.000Z', nota: 4.5, aciertos: 3, total: 6, minutes: 70, limitMin: 84, temas: [] }]
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

check('ya no dice que no haya nada', !(await p.locator('.empty .big').count()))
const cabecera = await p.locator('.review .guide-fine').first().innerText()
check('la cabecera trae la nota del último simulacro', cabecera.includes('4.5'), cabecera)
check('y cómo se llama esa nota', cabecera.includes('suspenso'))
// CLAVE (hallazgo de Codex en el PR #10): la fecha sale del temario, no
// de la agenda. En papel no puede afirmarse como un hecho.
check('no afirma una fecha de examen que no has confirmado',
  !cabecera.includes('Examen el'), cabecera)
check('usa el rótulo del temario tal cual', cabecera.includes('Prueba final · 6-8 nov'), cabecera)
check('y dice de dónde sale', cabecera.includes('sin') && cabecera.includes('agenda'), cabecera)
check('los días son «unos», no exactos', cabecera.includes('faltan unos'), cabecera)

// Por dónde empezar: el tema flojo, y a dónde volver.
check('señala por dónde empezar', (await p.locator('.review-weak li').count()) >= 1,
  String(await p.locator('.review-weak li').count()))
const flojo = await p.locator('.review-weak li').first().innerText()
check('nombra el tema que se resiste', flojo.includes('Inducción'), flojo.replace(/\n/g, ' · '))
check('con la cifra que lo respalda', /0 de \d+ a la primera/.test(flojo), flojo.replace(/\n/g, ' · '))
check('y a dónde volver, con el porqué', flojo.includes('vuelve a') && flojo.includes('paso inductivo'),
  flojo.replace(/\n/g, ' · '))

// Con el examen apuntado por ti en la agenda, entonces sí es un hecho.
await seed({
  tasks: [{ id: 't1', subjectId: 'algebra', type: 'examen', title: 'Prueba final AMD', due: '2026-11-07', done: false }]
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const conAgenda = await p.locator('.review .guide-fine').first().innerText()
check('con el examen en tu agenda sí afirma la fecha', conAgenda.includes('Examen el 7 nov'), conAgenda)
check('y los días dejan de ser aproximados', /faltan \d+ días/.test(conAgenda) && !conAgenda.includes('unos'), conAgenda)
check('sin repetir que es del plan', !conAgenda.includes('sin confirmar'), conAgenda)

// Problemas por recuperar.
const probs = await p.locator('.review-probs li').count()
check('lista los problemas fallados sin recuperar', probs === 3, String(probs))
check('agrupados por tema', (await p.locator('.review-group').count()) === 2,
  String(await p.locator('.review-group').count()))
check('con su enunciado', (await p.locator('.review-probs .prob-q').first().innerText()).length > 30)
check('y la respuesta para comprobar en papel', (await p.locator('.review-key').count()) >= 1)
// Los dos temas fallados y solo esos: Lógica salió limpia y no aparece.
const grupos = (await p.locator('.review-group .guide-label').allInnerTexts()).map((x) => x.toLowerCase())
check('los grupos son los temas fallados', grupos.join() === 'inducción,grafos', grupos.join())
check('no cuela el tema que sí sacaste', !grupos.includes('lógica'))

// Dudas y explicaciones.
check('trae tus dudas sin cerrar', (await p.locator('.review-notes').first().locator('li').count()) === 1,
  String(await p.locator('.review-notes').first().locator('li').count()))
check('no las resueltas', !(await p.locator('.review').innerText()).includes('Ya resuelta'))
check('ni las de otra asignatura', !(await p.locator('.review').innerText()).includes('De otra asignatura'))
check('y tus explicaciones con tus palabras',
  (await p.locator('.review').innerText()).includes('fichas de dominó'))
check('con la unidad de la que salieron',
  (await p.locator('.review').innerText()).toLowerCase().includes('t2 · principio de inducción'))

// Trampas: ahora filtradas por tus temas flojos.
const trampas = await p.locator('.review-traps li').count()
check('las trampas se filtran a tus temas flojos', trampas > 0 && trampas < 12, String(trampas))
check('y son las del tema que falla',
  (await p.locator('.review-traps').innerText()).includes('Inducción'))
check('lo dice en vez de dejarlo a la adivinanza',
  (await p.locator('.review-traps').locator('xpath=preceding-sibling::p[1]').innerText()).includes('se te están resistiendo'))

// CLAVE (hallazgo de Codex): un tema flojo SIN trampas escritas no puede
// enseñar todas las de la asignatura diciendo que no hay temas flojos —
// contradiría la sección de arriba, que acaba de nombrar uno.
// Programación lineal: dos problemas (hacen falta dos intentos para
// declarar flojo un tema) y ninguna trampa escrita.
await seed({
  planner: {
    weekHours: null, exceptions: {}, hourOverrides: {}, startTimes: null, paceFactor: {},
    done: { algebra: [] }
  },
  practice: {
    'algebra:pl1': { ok: 0, fail: 2, last: 'fail' },
    'algebra:pl2': { ok: 0, fail: 1, last: 'fail' }
  },
  understanding: [], tasks: []
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const flojoSinTrampas = await p.locator('.review-weak li').first().innerText()
check('el tema flojo es uno sin trampas escritas', flojoSinTrampas.includes('Programación lineal'), flojoSinTrampas)
const rotulo = await p.locator('.review-traps').locator('xpath=preceding-sibling::p[1]').innerText()
check('no dice que no haya temas flojos cuando acaba de nombrar uno',
  !rotulo.includes('Sin temas flojos') && !rotulo.includes('sin temas flojos'), rotulo)
check('explica el motivo de verdad', rotulo.includes('No hay ninguna trampa escrita'), rotulo)
check('y las enseña todas igual, que antes de un examen valen',
  (await p.locator('.review-traps li').count()) === 12,
  String(await p.locator('.review-traps li').count()))

// Vocabulario de los temas flojos.
check('trae el vocabulario de esos temas', (await p.locator('.review-terms li').count()) > 0,
  String(await p.locator('.review-terms li').count()))
check('solo de esos temas',
  !(await p.locator('.review-terms').innerText()).includes('Matriz identidad'))

await p.screenshot({ path: ARTEFACTOS + 'shot-repaso.png', fullPage: true })

// ---------- en papel
const antesDeImprimir = await p.locator('.review-traps li').count()
await p.emulateMedia({ media: 'print' })
await p.waitForTimeout(400)
check('al imprimir desaparecen los botones',
  (await p.getByRole('button', { name: 'Imprimir' }).isVisible()) === false)
check('y la navegación', (await p.locator('.sidebar').isVisible()) === false)
check('pero el contenido sigue entero',
  (await p.locator('.review-traps li').count()) === antesDeImprimir,
  `${antesDeImprimir} → ${await p.locator('.review-traps li').count()}`)
await p.screenshot({ path: ARTEFACTOS + 'shot-repaso-papel.png', fullPage: true })
await p.emulateMedia({ media: 'screen' })

// ---------- otra asignatura y el móvil
await p.goto(BASE + '#/repaso/tec-comp', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
check('TC también tiene ficha', (await p.locator('.review-traps li').count()) === 12,
  String(await p.locator('.review-traps li').count()))
check('y es la suya', (await p.locator('.review-traps').innerText()).includes('complemento a dos'))
// El caso que nombra el hallazgo: el temario de TC dice literalmente
// «Examen por confirmar», y la hoja no puede convertirlo en el 23 dic.
const tc = await p.locator('.review .guide-fine').first().innerText()
check('TC no convierte «por confirmar» en una fecha', !tc.includes('Examen el'), tc)
check('y repite lo que dice su temario', tc.includes('Examen por confirmar'), tc)

// Una asignatura sin nada de esto no revienta.
await p.goto(BASE + '#/repaso/redes', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('una asignatura sin material no revienta', (await p.locator('.review').count()) === 1)
check('y dice que no hay nada', (await p.locator('.empty .big').innerText()).includes('nada tuyo que repasar'))

await p.goto(BASE + '#/repaso/algebra', { waitUntil: 'networkidle' })
await p.setViewportSize({ width: 390, height: 780 })
await p.waitForTimeout(900)
const w = await p.evaluate(() => document.documentElement.scrollWidth)
check('en el móvil no desborda a lo ancho', w <= 390, String(w))

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

await b.close()
console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
