// El simulacro de examen en el navegador: el reloj, que no se vean las
// soluciones antes de entregar, la corrección y lo que queda guardado.
import { lanzar, vigilarConsola } from './navegador.mjs'
const ARTEFACTOS = new URL('../.artefactos/', import.meta.url).pathname
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)
const store = () => p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data') || '{}'))

await p.clock.install({ time: new Date('2026-09-15T17:00:00') })

// ---------- se llega desde la práctica
await p.goto(BASE + '#/asignatura/algebra/practica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('la práctica ofrece el simulacro', await p.getByRole('button', { name: 'Simulacro' }).isVisible())
await p.getByRole('button', { name: 'Simulacro' }).click()
await p.waitForTimeout(1000)
check('y lleva a su pantalla', p.url().includes('#/simulacro/algebra'), p.url())

// ---------- antes de empezar
check('no hay ni un enunciado a la vista todavía', (await p.locator('.mock-list li').count()) === 0)
check('deja elegir la longitud', (await p.locator('.mock .tabs button').count()) === 3)
const resumen = await p.locator('.mock .guide-fine').first().innerText()
check('dice cuántos problemas y de cuántos temas', /6 problemas de 6 temas/.test(resumen), resumen)
check('y cuánto dura', /\d+ ?h|\d+ min/.test(resumen), resumen)
const btn = await p.getByRole('button', { name: /^Empezar,/ }).innerText()
check('el botón dice el tiempo que te vas a jugar', /Empezar, .*(min|h)/.test(btn), btn)

// Otro sorteo cambia el examen.
await p.getByRole('tab', { name: 'Corto · 4' }).click()
await p.waitForTimeout(300)
check('«corto» son cuatro problemas', /4 problemas de 4 temas/.test(await p.locator('.mock .guide-fine').first().innerText()))
await p.getByRole('tab', { name: 'Largo · 8' }).click()
await p.waitForTimeout(300)
check('«largo» son ocho', /8 problemas de 8 temas/.test(await p.locator('.mock .guide-fine').first().innerText()))
await p.getByRole('tab', { name: 'Completo · 6' }).click()
await p.waitForTimeout(300)

// ---------- el examen
await p.getByRole('button', { name: /^Empezar,/ }).click()
await p.waitForTimeout(600)
const enunciados = await p.locator('.mock-list li').count()
check('entrega los seis enunciados', enunciados === 6, String(enunciados))
check('numerados', (await p.locator('.mock-list li strong').first().innerText()).startsWith('1'))
check('cada uno dice su nivel', (await p.locator('.mock-list .plan-kind').count()) === 6)

// CLAVE: durante el examen no hay ni pistas ni soluciones. Tenerlas
// convertiría el simulacro en otra sesión de lectura.
check('no hay soluciones durante el examen', (await p.locator('.prob-solution').count()) === 0)
check('ni pistas', (await p.locator('.prob-hint').count()) === 0)
check('ni un botón para abrirlas', (await p.getByRole('button', { name: 'Ver solución' }).count()) === 0)

// El reloj corre hacia atrás.
const t0 = await p.locator('.mock-clock').innerText()
await p.clock.runFor(65000)
await p.waitForTimeout(300)
const t1 = await p.locator('.mock-clock').innerText()
// El reloj tiene que arrancar exactamente con lo que prometió el botón,
// no con un número parecido: es el tiempo que te estás jugando.
const [, hh, mm] = btn.match(/Empezar, (?:(\d+) h )?(\d+) min/) || []
const prometidos = Number(hh || 0) * 60 + Number(mm)
check('el reloj arranca con el tiempo prometido',
  Number(t0.split(':')[0]) === prometidos, `${t0} frente a ${prometidos} min`)
check('y descuenta de verdad', t1 !== t0 && Number(t1.split(':')[0]) === Number(t0.split(':')[0]) - 2, `${t0} → ${t1}`)

// CLAVE (hallazgo de Codex en el PR #9): la barra lateral, el botón de
// volver y el «atrás» del navegador solo cambian el hash, y eso no
// dispara `beforeunload`. El examen tiene que sobrevivir a irse y volver.
await p.getByRole('link', { name: 'Calendario' }).click()
await p.waitForTimeout(700)
check('salir del examen no revienta', p.url().includes('#/calendario'), p.url())
const enVuelo = (await store()).mockRun
check('el examen en curso queda guardado', enVuelo && enVuelo.problemIds.length === 6,
  JSON.stringify(enVuelo && enVuelo.problemIds))
check('sabe en qué fase estaba', enVuelo.fase === 'haciendo')
await p.goBack()
await p.waitForTimeout(900)
check('al volver el examen sigue ahí', (await p.locator('.mock-list li').count()) === 6,
  String(await p.locator('.mock-list li').count()))
check('con los mismos enunciados',
  (await p.locator('.mock-list li').first().innerText()).includes((await store()).mockRun.items[0].g))
// Y el reloj no se ha parado mientras estabas fuera: el final es absoluto.
const tVuelta = await p.locator('.mock-clock').innerText()
check('el reloj ha seguido corriendo mientras estabas fuera',
  Number(tVuelta.split(':')[0]) < Number(t1.split(':')[0]) + 1, `${t1} → ${tVuelta}`)

// ---------- entregar y corregir
await p.getByRole('button', { name: 'Entregar y corregir' }).click()
await p.waitForTimeout(600)
check('al entregar aparecen los seis para corregir', (await p.locator('.mock-fix').count()) === 6)
check('ahora sí se puede ver la solución', (await p.getByRole('button', { name: 'Ver solución' }).count()) === 6)
check('pero no está abierta de entrada', (await p.locator('.prob-solution').count()) === 0)
await p.locator('.mock-fix').first().getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(300)
check('la solución se abre razonada', (await p.locator('.prob-a').innerText()).length > 100)

check('no deja ver el resultado hasta corregirlo todo',
  await p.getByRole('button', { name: /Quedan \d+ por corregir/ }).isDisabled())

// Cuatro bien, dos mal.
for (let i = 0; i < 6; i++) {
  const fila = p.locator('.mock-fix').nth(i)
  await fila.getByRole('button', { name: i < 4 ? 'Sí' : 'No' }).click()
  await p.waitForTimeout(150)
}
check('las filas corregidas se marcan', (await p.locator('.mock-fix.is-ok').count()) === 4,
  String(await p.locator('.mock-fix.is-ok').count()))
check('y las falladas también', (await p.locator('.mock-fix.is-fail').count()) === 2)

// Corregirse es un vaivén: dudar no puede contar como dos intentos.
await p.locator('.mock-fix').first().getByRole('button', { name: 'Sí' }).click()
await p.locator('.mock-fix').first().getByRole('button', { name: 'No' }).click()
await p.locator('.mock-fix').first().getByRole('button', { name: 'Sí' }).click()
await p.waitForTimeout(300)
check('dudar al corregirse no registra nada todavía',
  Object.keys((await store()).practice || {}).length === 0,
  JSON.stringify((await store()).practice))

// CLAVE (hallazgo de Codex): corregirse lleva su rato y ese rato no es
// tiempo de examen. Se pasan 20 minutos corrigiendo y no pueden acabar
// en el historial como «110 min de los 90 que tenías».
await p.clock.runFor(20 * 60 * 1000)
await p.waitForTimeout(300)

// ---------- el resultado
await p.getByRole('button', { name: 'Ver el resultado' }).click()
await p.waitForTimeout(600)

// Al cerrar el examen, un intento por problema y con el veredicto final.
const tras = await store()
const intentos = Object.keys(tras.practice || {}).filter((k) => k.startsWith('algebra:'))
check('cerrar el examen registra los intentos en práctica', intentos.length === 6, String(intentos.length))
check('uno por problema, aunque hayas dudado',
  Object.values(tras.practice).every((a) => a.ok + a.fail === 1),
  JSON.stringify(Object.values(tras.practice).map((a) => a.ok + a.fail)))
check('con la forma de siempre',
  Object.values(tras.practice).every((a) => (a.last === 'ok' || a.last === 'fail') && Number.isInteger(a.ok)))
check('cuatro aciertos', Object.values(tras.practice).filter((a) => a.last === 'ok').length === 4)
check('da la nota sobre 10', (await p.locator('.mock-final').innerText()) === '6.7',
  await p.locator('.mock-final').innerText())
check('y cómo se llama esa nota', (await p.locator('.mock .guide-label').first().innerText()).toLowerCase() === 'aprobado',
  await p.locator('.mock .guide-label').first().innerText())
check('dice cuántos de cuántos y en cuánto tiempo',
  /4 de 6 en .* de los .*/.test(await p.locator('.mock .guide-summary').innerText()),
  await p.locator('.mock .guide-summary').innerText())
// El examen duró poco más de un minuto y corregirse veinte. Si el
// cronómetro se parara al final en vez de al entregar, aquí saldrían 21.
const guardadoTiempo = (await store()).mocks[0]
check('el tiempo es el del examen, no el de corregirse',
  guardadoTiempo.minutes < 5, `${guardadoTiempo.minutes} min tras corregir durante 20`)
check('y nunca pasa del límite que tenías',
  guardadoTiempo.minutes <= guardadoTiempo.limitMin, `${guardadoTiempo.minutes} de ${guardadoTiempo.limitMin}`)
check('señala dónde se fueron los puntos',
  (await p.locator('.plan-warn-block').innerText()).includes('se te fueron los puntos'),
  await p.locator('.plan-warn-block').innerText())
check('y manda al mapa, no a repetir los mismos problemas',
  (await p.locator('.plan-warn-block').innerText()).includes('mapa'))
check('desglosa por temas', (await p.locator('.mock-topics li').count()) === 6,
  String(await p.locator('.mock-topics li').count()))
check('marcando los temas fallados', (await p.locator('.mock-topics li.is-fail').count()) === 2)

const guardado = await store()
check('el simulacro queda guardado', (guardado.mocks || []).length === 1, String((guardado.mocks || []).length))
const m = guardado.mocks[0]
check('con su nota, sus aciertos y su duración',
  m.nota === 6.7 && m.aciertos === 4 && m.total === 6 && m.minutes >= 1, JSON.stringify(m).slice(0, 120))
check('y el desglose por temas', Array.isArray(m.temas) && m.temas.length === 6)
check('atado a su asignatura', m.subjectId === 'algebra')

// ---------- otro simulacro y el historial
await p.getByRole('button', { name: 'Otro simulacro' }).click()
await p.waitForTimeout(600)
check('vuelve al principio', (await p.getByRole('button', { name: /^Empezar,/ }).count()) === 1)
check('y ahora hay historial', (await p.locator('.mock-history li').count()) === 1)
const hist = await p.locator('.mock-history li').first().innerText()
check('el historial dice la nota y qué flojeó', hist.includes('6.7') && hist.includes('flojeó'), hist.replace(/\n/g, ' · '))

// Borrar un simulacro.
await p.locator('.mock-history .icon-btn').first().click()
await p.waitForTimeout(400)
check('se puede borrar del historial', (await p.locator('.mock-history li').count()) === 0)
check('y desaparece del almacén', ((await store()).mocks || []).length === 0)

// ---------- descartar un examen empezado
await p.getByRole('button', { name: /^Empezar,/ }).click()
await p.waitForTimeout(500)
const antesDeDescartar = await store()
check('un examen empezado queda guardado', antesDeDescartar.mockRun !== null)
await p.getByRole('button', { name: 'Descartar' }).click()
await p.waitForTimeout(500)
check('descartar devuelve al principio', (await p.getByRole('button', { name: /^Empezar,/ }).count()) === 1)
check('y no deja examen a medias', (await store()).mockRun === null)
check('un examen abandonado no cuenta como resultado', ((await store()).mocks || []).length === 0)

// ---------- se acaba el tiempo
await p.getByRole('tab', { name: 'Corto · 4' }).click()
await p.getByRole('button', { name: /^Empezar,/ }).click()
await p.waitForTimeout(400)
check('el examen corto arranca', (await p.locator('.mock-list li').count()) === 4)
await p.clock.runFor(60 * 60 * 1000)
await p.waitForTimeout(600)
check('al agotarse el tiempo se entrega solo', (await p.locator('.mock-fix').count()) === 4,
  String(await p.locator('.mock-fix').count()))
check('y lo dice en lugar de dejarte a medias',
  (await p.locator('.mock .guide-summary').innerText()).includes('Se acabó el tiempo'),
  await p.locator('.mock .guide-summary').innerText())

// ---------- una asignatura sin problemas
await p.goto(BASE + '#/simulacro/redes', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('sin problemas no monta un examen vacío',
  (await p.locator('.empty .big').innerText()).includes('todavía no tiene problemas'),
  await p.locator('.empty .big').innerText())
check('y ofrece salida', await p.getByRole('button', { name: 'Volver al plan' }).isVisible())

// ---------- TC y el móvil
await p.goto(BASE + '#/simulacro/tec-comp', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
check('TC también tiene simulacro', (await p.getByRole('button', { name: /^Empezar,/ }).count()) === 1)
await p.setViewportSize({ width: 390, height: 780 })
await p.getByRole('button', { name: /^Empezar,/ }).click()
await p.waitForTimeout(600)
const w = await p.evaluate(() => document.documentElement.scrollWidth)
check('en el móvil no desborda a lo ancho', w <= 390, String(w))
check('y el reloj se ve', await p.locator('.mock-clock').isVisible())
await p.screenshot({ path: ARTEFACTOS + 'shot-simulacro-movil.png', fullPage: true })

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

await b.close()
console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
