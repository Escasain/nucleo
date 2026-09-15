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
const planner = () => p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).planner)

// ---------- Inicio: tarjeta compacta
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
// Cuántas asignaturas tienen temario cargado y cuántas no: se leen de
// los datos para que añadir una tercera no rompa la prueba.
const PLANES = await p.evaluate(async () => {
  const m = await import('/src/modules/study-planner/studyPlanData.js')
  const v = Object.values(m.STUDY_PLANS)
  return { con: v.filter((x) => x.units.length > 0).length, sin: v.filter((x) => x.units.length === 0).length }
})

check('tarjeta del planificador en Inicio', await p.locator('.plan-summary').isVisible())
const sum = await p.locator('.plan-summary').innerText()
check('cuenta atrás al próximo examen', /\d+\s*días para (AMD|TC)/.test(sum), sum.split('\n').slice(0,3).join(' | '))
check('una barra de presión por asignatura con temario',
  (await p.locator('.plan-summary .plan-pressure').count()) === PLANES.con,
  `${await p.locator('.plan-summary .plan-pressure').count()} de ${PLANES.con}`)
check('sin calendario grande en Inicio', (await p.locator('.plan-summary .plan-week').count()) === 0)

// leyenda/nombre navega al detalle
await p.locator('.plan-summary .plan-linkname').first().click()
await p.waitForTimeout(300)
check('desde Inicio se abre la asignatura', /#\/asignatura\/(algebra|tec-comp)/.test(p.url()), p.url())

// ---------- Agenda: pestaña Planificador
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
check('hero con próxima prueba', await p.locator('.plan-hero').isVisible())
check('editor de horas con 7 días', (await p.locator('.plan-hourcell').count()) === 7)
check('calendario con 6 semanas', (await p.locator('.plan-week').count()) === 6)
check('días con bloques de trabajo', (await p.locator('.plan-item').count()) > 10, String(await p.locator('.plan-item').count()))
check('leyenda con todas las asignaturas del reparto',
  (await p.locator('.plan-legend-item').count()) === PLANES.con,
  `${await p.locator('.plan-legend-item').count()} de ${PLANES.con}`)
check('«Más adelante» lista las que no tienen temario',
  (await p.locator('.plan-later li').count()) === PLANES.sin,
  `${await p.locator('.plan-later li').count()} de ${PLANES.sin}`)

// CRITERIO: cambiar horas recoloca al instante
const itemsAntes = await p.locator('.plan-item').count()
const totalAntes = await p.locator('.plan-weektotal strong').innerText()
const lunes = p.locator('.plan-hourcell').first()
for (let i = 0; i < 6; i++) await lunes.getByRole('button', { name: /Añadir tiempo/ }).click()
await p.waitForTimeout(400)
const totalDespues = await p.locator('.plan-weektotal strong').innerText()
check('CRITERIO subir horas cambia el total semanal', totalAntes !== totalDespues, `${totalAntes} → ${totalDespues}`)
check('CRITERIO el calendario se recoloca', (await p.locator('.plan-item').count()) !== itemsAntes, `${itemsAntes} → ${await p.locator('.plan-item').count()}`)
check('las horas se guardan en el store', (await planner()).weekHours[0] === 4.5, JSON.stringify((await planner()).weekHours))

// persistencia
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(400)
check('las horas persisten al recargar', (await p.locator('.plan-weektotal strong').innerText()) === totalDespues)

// día: excepción y día libre
const dia = p.locator('.plan-day').nth(8)
await dia.click()
await p.waitForTimeout(250)
check('se abre el detalle del día', await p.locator('.plan-detail').isVisible())
await p.locator('.plan-detail').getByRole('button', { name: 'Día libre' }).click()
await p.waitForTimeout(300)
check('día libre guarda excepción a 0', Object.values((await planner()).exceptions).includes(0), JSON.stringify((await planner()).exceptions))
check('el día marcado muestra el punto de ajuste', (await p.locator('.plan-tweak').count()) >= 1)
await p.locator('.plan-detail').getByRole('button', { name: 'Usar el horario normal' }).click()
await p.waitForTimeout(300)
check('quitar la excepción la borra del store', Object.keys((await planner()).exceptions).length === 0)

// ver más semanas
await p.getByRole('button', { name: 'Ver más semanas' }).click()
await p.waitForTimeout(300)
check('«Ver más semanas» amplía a 10', (await p.locator('.plan-week').count()) === 10)

// ---------- Detalle de asignatura
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(500)
check('estadísticas de la asignatura', (await p.locator('.plan-stats > div').count()) === 4)
const stats = await p.locator('.plan-stats').innerText()
check('muestra 63 h de trabajo estimado', stats.includes('63 h'), stats.replace(/\n/g,' '))
check('temario completo de AMD', (await p.locator('.plan-unit').count()) === 31, String(await p.locator('.plan-unit').count()))
check('unidades agrupadas por semana', (await p.locator('.plan-groupname').count()) >= 3)
const kinds = await p.locator('.plan-kind').allInnerTexts()
check('etiquetas base/teoría/laboratorio/repaso', new Set(kinds).size === 4, [...new Set(kinds)].join(','))
check('fechas asignadas a las unidades', (await p.locator('.plan-unitmeta .muted').count()) > 5)

// CRITERIO: marcar una unidad como hecha replanifica
const antesFin = await p.locator('.plan-stats > div').nth(3).innerText()
const hechasAntes = await p.locator('.plan-stats > div').nth(1).innerText()
await p.locator('.plan-unit').first().getByRole('checkbox').click()
await p.waitForTimeout(400)
check('CRITERIO marcar hecho sube «ya hechas»', (await p.locator('.plan-stats > div').nth(1).innerText()) !== hechasAntes,
  `${hechasAntes.replace(/\n/g,' ')} → ${(await p.locator('.plan-stats > div').nth(1).innerText()).replace(/\n/g,' ')}`)
check('CRITERIO replanifica (cambia la fecha de fin)', (await p.locator('.plan-stats > div').nth(3).innerText()) !== antesFin,
  `${antesFin.replace(/\n/g,' ')} → ${(await p.locator('.plan-stats > div').nth(3).innerText()).replace(/\n/g,' ')}`)
// El CSS pone los títulos de grupo en mayúsculas.
check('la unidad pasa al grupo «Completado»', (await p.locator('.plan-groupname').first().innerText()).toUpperCase().includes('COMPLETADO'))
check('se guarda en el store', ((await planner()).done.algebra || []).length === 1, JSON.stringify((await planner()).done))
await p.locator('.plan-unit').first().getByRole('checkbox').click()
await p.waitForTimeout(300)
check('desmarcar la devuelve a pendiente', ((await planner()).done.algebra || []).length === 0)

// ajuste de horas por unidad
const stepper = p.locator('.plan-unit').first().locator('.plan-stepper')
const hAntes = await stepper.locator('span').first().innerText()
await stepper.getByRole('button', { name: /Más horas/ }).click()
await p.waitForTimeout(300)
check('ajustar horas de una unidad', (await stepper.locator('span').first().innerText()) !== hAntes, `${hAntes} → ${await stepper.locator('span').first().innerText()}`)
check('el ajuste se marca como propio', (await stepper.locator('span.is-custom').count()) === 1)
check('se guarda el override', Object.keys((await planner()).hourOverrides).length === 1, JSON.stringify((await planner()).hourOverrides))
await stepper.getByRole('button', { name: /Volver a la estimación/ }).click()
await p.waitForTimeout(300)
check('restaurar la estimación borra el override', Object.keys((await planner()).hourOverrides).length === 0)

// ---------- CRITERIO: aviso de horas que faltan
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
// bajar todos los días a 0 salvo un poco
for (let i = 0; i < 7; i++) {
  const cell = p.locator('.plan-hourcell').nth(i)
  for (let k = 0; k < 12; k++) await cell.getByRole('button', { name: /Quitar tiempo/ }).click()
}
await p.locator('.plan-hourcell').first().getByRole('button', { name: /Añadir tiempo/ }).click()
await p.waitForTimeout(500)
check('CRITERIO aviso de déficit por asignatura', (await p.locator('.plan-pressure .plan-warn').count()) === PLANES.con,
  String(await p.locator('.plan-pressure .plan-warn').count()))
const warn = await p.locator('.plan-pressure .plan-warn').first().innerText()
check('CRITERIO el aviso dice cuántas horas faltan', /No entra por [\d,]+ h/.test(warn), warn)
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(400)
check('CRITERIO déficit también en la asignatura', (await p.locator('.plan-warn-block').innerText()).includes('Faltan'))
check('unidades sin hueco en su propio grupo', (await p.locator('.plan-groupname').allInnerTexts()).some(t=>t.toUpperCase().includes('SIN HUECO')))
check('estadística muestra el déficit en negativo', (await p.locator('.plan-stats .is-deficit').count()) === 1)

// ---------- TC provisional
await p.goto(BASE + '#/asignatura/tec-comp', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(400)
check('TC avisa de que el plan es provisional', (await p.locator('.banner').innerText()).includes('provisional'))
check('TC tiene 30 unidades', (await p.locator('.plan-unit').count()) === 30, String(await p.locator('.plan-unit').count()))
check('TC no deja temas «por definir»', !(await p.locator('.plan-unit').allInnerTexts()).some(t=>t.toLowerCase().includes('por definir')))
const tcTxt = await p.locator('.plan-stack').innerText()
check('TC dice sus fechas reales', tcTxt.includes('Empieza el 9 nov') && tcTxt.includes('termina el 23 dic'), tcTxt.split('\n').find(l=>l.startsWith('Empieza')))
check('TC cuenta el margen desde que empieza, no desde hoy', !tcTxt.includes('quedan 100 días') && /empieza el 9 nov: \d+ días de margen/.test(tcTxt))
// AMD ya no compite con TC por las mismas semanas: cabe entera
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(400)
const amdTxt = await p.locator('.plan-stack').innerText()
// En pasado o en futuro según el día en que se corra: AMD arranca el
// 15 de septiembre, y clavar el tiempo verbal rompía la prueba sola al
// llegar esa fecha.
check('AMD dice sus fechas', /Empez(ó|ará|a) el 15 sep/.test(amdTxt) && amdTxt.includes('termina el 6 nov'),
  amdTxt.split('\n')[0])

// ---------- asignatura sin temario / fuera del planificador
// IPO, que arranca en marzo: está en el planificador pero sin unidades.
// Antes se usaba fund-prog, y al cargarle el temario esta prueba dejó de
// encontrar el mensaje, MURIÓ aquí y se llevó por delante las tres
// comprobaciones siguientes sin que el recuento de PASS lo delatara.
await p.goto(BASE + '#/asignatura/ipo', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(400)
check('sin temario: mensaje claro', (await p.locator('.empty').innerText()).includes('Todavía no hay temario'))
await p.goto(BASE + '#/asignatura/redes', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(400)
check('asignatura sin plan: mensaje claro', (await p.locator('.empty').innerText()).includes('no tiene plan'))

// ---------- exportación incluye el planner
await p.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
const dl = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.getByRole('button', { name: 'Exportar JSON' }).click()]).then(([d]) => d).catch(() => null)
if (dl) {
  const fs = await import('node:fs/promises')
  const j = JSON.parse(await fs.readFile(await dl.path(), 'utf8'))
  check('la copia de seguridad incluye el planificador', Boolean(j.planner && Array.isArray(j.planner.weekHours)), JSON.stringify(j.planner?.weekHours))
} else check('la copia de seguridad incluye el planificador', false, 'sin descarga')

await b.close()
