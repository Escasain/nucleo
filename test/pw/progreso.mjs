// Sesión de estudio enfocada + vista Progreso, en el navegador.
import { chromium } from 'playwright'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
const p = await ctx.newPage()
p.on('console', (m) => { if (m.type() === 'error' && !/ERR_(CONNECTION|NAME|BLOCKED)/.test(m.text())) errors.push(m.text()) })
p.on('pageerror', (e) => errors.push('pageerror: ' + String(e)))

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Reloj simulado desde el principio, con la fecha real. El cronómetro
// se adelanta con runFor: el otro método adelanta el reloj disparando
// cada temporizador como mucho una vez, y un setInterval solo avanzaría
// un tic.
await p.clock.install({ time: new Date() })

await p.goto(BASE, { waitUntil: 'networkidle' })

// ---------- la pestaña existe y navega
check('Progreso está en el menú', (await p.locator('.nav a', { hasText: 'Progreso' }).count()) === 1)
await p.locator('.nav a', { hasText: 'Progreso' }).click()
await p.waitForTimeout(600)
check('navega a #/progreso', p.url().endsWith('#/progreso'), p.url())
check('la vista tiene su título', (await p.locator('.page-head h1').innerText()).includes('Progreso'))
check('avisa de que no hay nada registrado', (await p.locator('.banner').innerText()).includes('Todavía no hay nada registrado'))
check('el menú marca la pestaña activa', (await p.locator('.nav a.active').innerText()).includes('Progreso'))

// ---------- atajo de teclado G R
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.locator('body').click()
await p.keyboard.press('g')
await p.keyboard.press('r')
await p.waitForTimeout(400)
check('atajo G R lleva a Progreso', p.url().endsWith('#/progreso'), p.url())

// ---------- secciones de Progreso sin datos
const txt = await p.locator('.main').innerText()
check('sección de horas previstas', txt.includes('Horas previstas y horas hechas'))
check('sección de calibración', txt.includes('Tus estimaciones frente a la realidad'))
check('sección de mapa de calor', txt.includes('Un año de estudio'))
check('sección de expediente', txt.includes('Expediente'))
check('dice que aún no hay unidades cronometradas', txt.includes('ninguna unidad terminada y cronometrada'))
// Una por cada asignatura con temario cargado, sean las que sean: clavar
// el número obligaba a tocar la prueba cada vez que se añade una.
const conTemario = await p.evaluate(async () => {
  const m = await import('/src/modules/study-planner/studyPlanData.js')
  return Object.values(m.STUDY_PLANS).filter((p) => p.units.length > 0).length
})
check('lista las asignaturas con temario',
  (await p.locator('.cal-item').count()) === conTemario,
  `${await p.locator('.cal-item').count()} de ${conTemario}`)
check('cada asignatura dice que no tiene datos', (await p.locator('.cal-badge').first().innerText()).includes('sin datos'))
check('el mapa de calor pinta 53 semanas', (await p.locator('.heat-week').count()) >= 52, String(await p.locator('.heat-week').count()))
check('el mapa de calor pinta 7 días por semana', (await p.locator('.heat-week').first().locator('.heat-cell').count()) === 7)
check('adherencia con 6 semanas', (await p.locator('.adh li').count()) === 6)
check('ritmo real a cero sin datos', (await p.locator('.stat-num').nth(0).innerText()).startsWith('0'))

// ---------- desde el calendario se entra a la sesión
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first().click()
await p.waitForTimeout(500)
check('el detalle del día ofrece «Estudiar»', (await p.locator('.plan-detail-go').count()) > 0,
  String(await p.locator('.plan-detail-go').count()))
const unidad = await p.locator('.plan-detail-item .plan-detail-title').first().innerText()
await p.locator('.plan-detail-go').first().click()
await p.waitForTimeout(700)
check('abre la sesión de estudio', /#\/sesion\/[a-z-]+\/\w+/.test(p.url()), p.url())
check('la sesión muestra la unidad', (await p.locator('.page-head h1').innerText()).trim() === unidad.trim(),
  `${await p.locator('.page-head h1').innerText()} vs ${unidad}`)
check('la sesión dice la asignatura', (await p.locator('.focus-subject').innerText()).length > 3)
check('la sesión dice lo estimado', (await p.locator('.page-head .sub').innerText()).includes('Estimado'))
check('el reloj empieza a cero', (await p.locator('.focus-time').innerText()).trim() === '00:00')
check('no se puede guardar sin tiempo', await p.getByRole('button', { name: 'Terminar unidad' }).isDisabled())

// material de la guía (carga diferida)
await p.waitForTimeout(1200)
const cuerpo = await p.locator('.main').innerText()
check('la sesión trae material de la guía', cuerpo.includes('Material recomendado') || cuerpo.includes('Qué entra en esta unidad'),
  cuerpo.slice(0, 120))

// ---------- el cronómetro cuenta y registra
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(65_000)
await p.waitForTimeout(300)
check('el reloj avanza', (await p.locator('.focus-time').innerText()).trim() !== '00:00', await p.locator('.focus-time').innerText())
check('ya se puede terminar', await p.getByRole('button', { name: 'Terminar unidad' }).isEnabled())
check('dice el % de lo estimado', (await p.locator('.focus-timer-sub').innerText()).includes('%'))

// pausa y reanudar
await p.getByRole('button', { name: 'Pausa' }).click()
await p.waitForTimeout(200)
const pausado = await p.locator('.focus-time').innerText()
await p.clock.runFor(20_000)
await p.waitForTimeout(200)
check('en pausa el reloj no corre', (await p.locator('.focus-time').innerText()) === pausado, pausado)
check('el estado dice «En pausa»', (await p.locator('.focus-timer-sub').innerText()).includes('En pausa'))

// Pestaña en segundo plano: el navegador frena los temporizadores.
// fastForward adelanta el reloj disparando cada timer como mucho UNA
// vez, que es justo ese escenario. Contando tics marcaría 01:06; el
// tiempo tiene que salir del reloj, no del número de tics.
await p.getByRole('button', { name: 'Seguir' }).click()
await p.clock.fastForward('05:00')
await p.waitForTimeout(300)
check('el tiempo sale del reloj, no de contar tics', (await p.locator('.focus-time').innerText()).trim() === '06:05',
  await p.locator('.focus-time').innerText())

const url = p.url()
const [, subjectId, unitId] = url.match(/#\/sesion\/([^/]+)\/([^/]+)/)

await p.getByRole('button', { name: 'Terminar unidad' }).click()
await p.waitForTimeout(500)
check('confirma que la sesión queda registrada', (await p.locator('.focus-done h2').innerText()).includes('Sesión registrada'))
check('dice los minutos y la unidad', (await p.locator('.focus-done .muted').innerText()).includes('unidad marcada como hecha'))

// ---------- lo guardado es lo que se esperaba
const guardado = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')))
const ses = guardado.sessions[guardado.sessions.length - 1]
check('se guarda una sesión', guardado.sessions.length === 1, String(guardado.sessions.length))
check('la sesión va atada a la unidad', ses.unitId === unitId && ses.subjectId === subjectId,
  `${ses.subjectId}:${ses.unitId}`)
check('la sesión queda hecha y con los minutos reales', ses.done === true && ses.durationMin === 6,
  JSON.stringify({ d: ses.done, m: ses.durationMin }))
check('la sesión es de tipo estudio', ses.type === 'estudio')
check('la sesión es de hoy', ses.date === iso(new Date()), ses.date)
check('la unidad queda marcada como hecha', (guardado.planner.done[subjectId] || []).includes(unitId),
  JSON.stringify(guardado.planner.done))

// ---------- con datos, Progreso ya dice algo
await p.goto(BASE + '#/progreso', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
check('ya no avisa de que no hay nada', (await p.locator('.banner').count()) === 0)
const conDatos = await p.locator('.cal-list').innerText()
check('la asignatura muestra su muestra', /1 unidad cronometrada/.test(conDatos), conDatos.slice(0, 200))
check('compara estimado con real', conDatos.includes('Estimabas') && conDatos.includes('tardaste'))
check('los ratos cortos se dicen en minutos, no en «0,0 h»',
  /tardaste\s*6 min/.test(conDatos) && !conDatos.includes('0,0 h'), conDatos.match(/tardaste[^—]*/)?.[0])
check('una sola muestra no ofrece ajustar', (await p.locator('.cal-apply').count()) === 0)
check('sin semanas cerradas no se proyecta nada', (await p.locator('.cal-pace').count()) === 0,
  String(await p.locator('.cal-pace').count()))

// ---------- salir a mitad guarda sin marcar la unidad
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first().click()
await p.waitForTimeout(400)
await p.locator('.plan-detail-go').first().click()
await p.waitForTimeout(600)
const url2 = p.url()
const [, sid2, uid2] = url2.match(/#\/sesion\/([^/]+)\/([^/]+)/)
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(150_000)
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Guardar y salir' }).click()
await p.waitForTimeout(500)
const g2 = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')))
const s2 = g2.sessions[g2.sessions.length - 1]
check('«Guardar y salir» registra el tiempo', s2.durationMin === 2 && s2.unitId === uid2, JSON.stringify({ m: s2.durationMin, u: s2.unitId }))
check('«Guardar y salir» NO marca la unidad', !(g2.planner.done[sid2] || []).includes(uid2),
  JSON.stringify(g2.planner.done))
check('el resumen lo dice', !(await p.locator('.focus-done .muted').innerText()).includes('marcada como hecha'))

// ---------- salir por el menú no tira el rato a la basura
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first().click()
await p.waitForTimeout(400)
await p.locator('.plan-detail-go').first().click()
await p.waitForTimeout(600)
const [, sid3, uid3] = p.url().match(/#\/sesion\/([^/]+)\/([^/]+)/)
const antesDeSalir = (await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).sessions)).length
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(200_000)
await p.waitForTimeout(300)
// Navegación por hash: el aviso del navegador no se entera de esta.
await p.locator('.nav a', { hasText: 'Calendario' }).click()
await p.waitForTimeout(700)
const g3 = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')))
check('salir por el menú guarda el rato igualmente', g3.sessions.length === antesDeSalir + 1,
  `${antesDeSalir} → ${g3.sessions.length}`)
const s3 = g3.sessions[g3.sessions.length - 1]
check('lo guardado al salir son los minutos reales y su unidad', s3.durationMin === 3 && s3.unitId === uid3,
  JSON.stringify({ m: s3.durationMin, u: s3.unitId }))
check('salir por el menú NO marca la unidad', !(g3.planner.done[sid3] || []).includes(uid3),
  JSON.stringify(g3.planner.done))
check('avisa de que lo ha guardado', (await p.locator('.toast').innerText()).includes('guardados'),
  await p.locator('.toast').innerText().catch(() => '(sin toast)'))

// terminar una sesión no debe guardarla dos veces al desmontar
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first().click()
await p.waitForTimeout(400)
await p.locator('.plan-detail-go').first().click()
await p.waitForTimeout(600)
const antesDeTerminar = (await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).sessions)).length
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(70_000)
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Guardar y salir' }).click()
await p.waitForTimeout(400)
await p.locator('.nav a', { hasText: 'Calendario' }).click()
await p.waitForTimeout(700)
const g4 = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).sessions)
check('una sesión ya guardada no se duplica al salir', g4.length === antesDeTerminar + 1,
  `${antesDeTerminar} → ${g4.length}`)

// ---------- unidad inexistente
await p.goto(BASE + '#/sesion/algebra/no-existe', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
check('unidad inexistente: mensaje claro', (await p.locator('.empty .big').innerText()).includes('No encuentro esa unidad'))
await p.goto(BASE + '#/sesion/redes/t1', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
check('asignatura sin plan: mismo mensaje', (await p.locator('.empty .big').innerText()).includes('No encuentro esa unidad'))

// ---------- calibración aplicable con 3 muestras
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
const sembrado = await p.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('nucleo.data'))
  const hoy = new Date().toISOString().slice(0, 10)
  // Tres unidades de Álgebra terminadas, cada una el doble de lo estimado.
  const unidades = [['b1', 1.5], ['b2', 1], ['t1a', 2]]
  d.sessions = unidades.map(([u, h], i) => ({
    id: 'seed' + i, subjectId: 'algebra', unitId: u, title: u, date: hoy,
    type: 'estudio', durationMin: Math.round(h * 60 * 2), done: true, notes: ''
  }))
  d.planner.done = { ...d.planner.done, algebra: unidades.map(([u]) => u) }
  localStorage.setItem('nucleo.data', JSON.stringify(d))
  return d.sessions.length
})
check('semilla puesta', sembrado === 3)
await p.goto(BASE + '#/progreso', { waitUntil: 'networkidle' })
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(800)
const fila = p.locator('.cal-item').filter({ hasText: 'Álgebra' })
check('tres muestras contadas', (await fila.locator('.cal-badge').innerText()).includes('3 unidades'),
  await fila.locator('.cal-badge').innerText())
check('dice el desvío en porcentaje', (await fila.innerText()).includes('100 % más'), (await fila.innerText()).slice(0, 220))
check('ofrece ajustar el plan', (await fila.locator('.cal-apply').count()) === 1)

const antes = await p.evaluate(() => {
  location.hash = '#/asignatura/algebra'
  return null
})
void antes
await p.goto(BASE + '#/progreso', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.locator('.cal-item').filter({ hasText: 'Álgebra' }).locator('.cal-apply .btn').click()
await p.waitForTimeout(600)
const trasAjuste = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).planner)
check('el factor se guarda en el planificador', trasAjuste.paceFactor.algebra === 2, JSON.stringify(trasAjuste.paceFactor))
check('no ensucia los ajustes manuales', Object.keys(trasAjuste.hourOverrides).length === 0,
  JSON.stringify(trasAjuste.hourOverrides))
check('la fila avisa de que el plan está ajustado',
  (await p.locator('.cal-item').filter({ hasText: 'Álgebra' }).innerText()).includes('Plan ajustado'))

// el ajuste llega al calendario de la asignatura
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(700)
const stats = await p.locator('.plan-stats').innerText()
check('el total de horas sube con el factor', /1\d\d h|9\d h/.test(stats.split('\n')[0]), stats.split('\n')[0])
check('las unidades ajustadas no salen como «ajustado por ti»',
  (await p.locator('.plan-stepper .is-custom').count()) === 0)

// quitar el ajuste lo revierte
await p.goto(BASE + '#/progreso', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.locator('.cal-item').filter({ hasText: 'Álgebra' }).getByRole('button', { name: 'Quitar el ajuste' }).click()
await p.waitForTimeout(500)
const quitado = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).planner.paceFactor)
check('quitar el ajuste borra el factor', quitado.algebra === undefined, JSON.stringify(quitado))

// ---------- la copia de seguridad se lo lleva todo
await p.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
const exportado = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')))
check('paceFactor forma parte del planificador guardado', 'paceFactor' in exportado.planner)

// ---------- la búsqueda global lleva a estudiar una unidad
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.keyboard.press('Control+k')
await p.waitForTimeout(400)
await p.keyboard.type('karnaugh')
await p.waitForTimeout(900)
const resultados = await p.locator('.search-results .search-item').allInnerTexts()
check('la búsqueda encuentra la unidad del temario',
  resultados.some((r) => /karnaugh/i.test(r) && /Estudiar/.test(r)),
  resultados.slice(0, 3).join(' | ') || '(sin resultados)')
await p.locator('.search-results .search-item').filter({ hasText: /Karnaugh/i }).first().click()
await p.waitForTimeout(600)
check('la búsqueda abre la sesión de esa unidad', /#\/sesion\/tec-comp\//.test(p.url()), p.url())

// El filtro de «ya hechas»: dos unidades hermanas de Álgebra, una
// terminada (b1, «Notación y conjuntos») y otra no (t1b, «Tablas de
// verdad»). Solo la pendiente debe ofrecerse para estudiar.
async function buscar(texto) {
  await p.goto(BASE, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  await p.keyboard.press('Control+k')
  await p.waitForTimeout(300)
  await p.keyboard.type(texto)
  await p.waitForTimeout(800)
  const r = await p.locator('.search-results .search-item').allInnerTexts()
  await p.keyboard.press('Escape')
  return r
}
const pendiente = await buscar('tablas de verdad')
check('una unidad pendiente sí se ofrece para estudiar',
  pendiente.some((r) => /Estudiar/.test(r) && /Tablas de verdad/i.test(r)),
  pendiente.join(' | ').slice(0, 200) || '(sin resultados)')
const hecha = await buscar('notacion y conjuntos')
check('una unidad ya hecha no se ofrece para estudiar',
  !hecha.some((r) => /Estudiar/.test(r)),
  hecha.join(' | ').slice(0, 200) || '(sin resultados)')

// ---------- móvil
await p.setViewportSize({ width: 400, height: 820 })
for (const hash of ['#/progreso', '#/sesion/algebra/b1']) {
  await p.goto(BASE + hash, { waitUntil: 'networkidle' })
  await p.waitForTimeout(600)
  const w = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  check(`móvil sin desbordamiento ${hash}`, w[0] <= w[1] + 1, `${w[0]} > ${w[1]}`)
}

// ---------- accesibilidad básica
await p.setViewportSize({ width: 1280, height: 1000 })
await p.goto(BASE + '#/progreso', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
check('el mapa de calor tiene alternativa textual',
  (await p.locator('.heat').getAttribute('aria-label'))?.includes('Mapa de estudio'),
  String(await p.locator('.heat').getAttribute('aria-label')))
check('la gráfica de adherencia tiene alternativa textual',
  (await p.locator('.adh').getAttribute('aria-label'))?.includes('Semana del'))
check('una sola h1 en la página', (await p.locator('h1').count()) === 1)

await p.goto(BASE + '#/sesion/algebra/b1', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.locator('.page-head h1').click()
await p.keyboard.press('Tab')
const foco = await p.evaluate(() => {
  const el = document.activeElement
  return { tag: el.tagName, ring: getComputedStyle(el).outlineStyle }
})
check('el foco de teclado se ve', foco.ring !== 'none', JSON.stringify(foco))
check('el temporizador se anuncia como tal', (await p.locator('[role="timer"]').count()) === 1)

console.log(out.join('\n'))
console.log(`\n--- CONSOLA (${errors.length}) ---`)
console.log(errors.length ? errors.join('\n') : '(limpia)')
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
await b.close()
