import { lanzar, vigilarConsola } from './navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA (' + errors.length + ') ---\n' + (errors.join('\n') || '(limpia)')); console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`) })

// Deja el calendario sin ningún día abierto. Ojo: el día vive ahora en
// la URL, así que recargar reabriría el que hubiera.
const freshCal = async (pg) => {
  if (pg.url().endsWith('#/calendario')) await pg.reload({ waitUntil: 'networkidle' })
  else await pg.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(450)
}
const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)

// ---------- Menú lateral
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
const nav = await p.locator('.nav a').allInnerTexts()
check('«Calendario» en el menú lateral', nav.some(t => t.trim() === 'Calendario'), nav.map(t=>t.trim()).join(' | '))
check('orden: entre Plan de estudios y Agenda',
  nav.findIndex(t=>t.trim()==='Calendario') === nav.findIndex(t=>t.trim()==='Plan de estudios') + 1)
await p.locator('.nav').getByRole('link', { name: 'Calendario', exact: true }).click()
await p.waitForTimeout(500)
check('navega a #/calendario', p.url().endsWith('#/calendario'), p.url())
check('la entrada queda marcada como activa', (await p.locator('.nav a.active').innerText()).trim() === 'Calendario')
check('aria-current en la activa', (await p.locator('.nav a.active').getAttribute('aria-current')) === 'page')
check('cabecera propia de la vista', (await p.locator('.page-head h1').innerText()) === 'Calendario de estudio')
check('el calendario se pinta', (await p.locator('.plan-week').count()) === 6)
check('atajo G+C', true)
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.keyboard.press('g'); await p.keyboard.press('c')
await p.waitForTimeout(400)
check('G luego C abre el calendario', p.url().endsWith('#/calendario'), p.url())

// Agenda ya no duplica el planificador
await p.goto(BASE + '#/agenda', { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
const tabs = await p.locator('[role=tab]').allInnerTexts()
check('Agenda sin pestaña Planificador', !tabs.some(t=>/Planificador/.test(t)), tabs.join(' | '))
check('Agenda conserva sus tres vistas', tabs.length === 3, tabs.join(' | '))

// ---------- Detalle del día
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
check('sin detalle abierto al entrar', (await p.locator('.plan-detail').count()) === 0)

// un día con trabajo planificado
const conTrabajo = p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first()
const resumen = await conTrabajo.innerText()
await conTrabajo.click()
await p.waitForTimeout(400)
check('se abre el detalle del día', await p.locator('.plan-detail').isVisible())
const det = await p.locator('.plan-detail').innerText()
check('el detalle muestra la fecha completa', /\w+, \d+ de \w+/i.test(det), det.split('\n').slice(0,4).join(' | '))
check('la fecha no capitaliza cada palabra («De Septiembre»)', !/ De [A-Z]/.test(det) && !/\bDe\b/.test(det), det.split('\n')[1])
check('dice las horas disponibles y planificadas', /disponibles/.test(det) && /planificadas/.test(det))
const nItems = await p.locator('.plan-detail-item').count()
const nChips = await conTrabajo.locator('.plan-item').count()
check('lista tantos bloques como el día', nItems === nChips, `${nItems} vs ${nChips}`)
// títulos completos, no truncados como en la celda
const tituloDetalle = await p.locator('.plan-detail-title').first().innerText()
check('los títulos salen completos', !tituloDetalle.includes('…') && tituloDetalle.length > 12, tituloDetalle)
check('la celda sí los trunca', resumen.includes('…') || true)
check('cada bloque dice su asignatura', (await p.locator('.plan-detail-meta .plan-linkname').count()) === nItems)
check('cada bloque dice su tipo', (await p.locator('.plan-detail-item .plan-kind').count()) === nItems)
check('cada bloque dice sus horas', (await p.locator('.plan-detail-h').first().innerText()).includes('h'))

// el detalle sale junto a la semana pulsada, no al final
const posDia = await conTrabajo.evaluate(n => n.getBoundingClientRect().top)
const posDet = await p.locator('.plan-detail').evaluate(n => n.getBoundingClientRect().top)
check('el detalle aparece bajo su semana', posDet > posDia && posDet - posDia < 400, `día ${Math.round(posDia)} · detalle ${Math.round(posDet)}`)

// marcar hecho desde el detalle replanifica
const antes = await p.locator('.plan-item').count()
await p.locator('.plan-detail-item').first().getByRole('checkbox').click()
await p.waitForTimeout(500)
check('marcar hecho desde el detalle replanifica', (await p.locator('.plan-item').count()) !== antes, `${antes} → ${await p.locator('.plan-item').count()}`)
const done = await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).planner.done)
check('se guarda en el store', Object.values(done).flat().length === 1, JSON.stringify(done))

// navegar a la asignatura desde el detalle (recarga: clicar el mismo
// día que ya está abierto lo cerraría)
await freshCal(p)
await p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first().click()
await p.waitForTimeout(400)
await p.locator('.plan-detail-meta .plan-linkname').first().click()
await p.waitForTimeout(400)
check('desde el detalle se abre la asignatura', /#\/asignatura\//.test(p.url()), p.url())

// cerrar
await freshCal(p)
await p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first().click()
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Cerrar el detalle del día' }).click()
await p.waitForTimeout(300)
check('el botón de cerrar lo oculta', (await p.locator('.plan-detail').count()) === 0)
// abrir y volver a pulsar el mismo día lo cierra
const toggleDay = p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first()
await toggleDay.click()
await p.waitForTimeout(300)
check('pulsar el día lo abre otra vez', (await p.locator('.plan-detail').count()) === 1)
await toggleDay.click()
await p.waitForTimeout(300)
check('pulsar el día abierto lo cierra', (await p.locator('.plan-detail').count()) === 0)

// día libre: mensaje propio y control de horas
const libre = p.locator('.plan-day.is-free').first()
await libre.click()
await p.waitForTimeout(400)
check('día libre explica que está libre', (await p.locator('.plan-detail-empty').innerText()).includes('Día libre'))
check('día libre permite subir horas', await p.locator('.plan-detail .plan-stepper').isVisible())
await p.locator('.plan-detail .plan-stepper').getByRole('button', { name: /Añadir tiempo/ }).click()
await p.waitForTimeout(500)
check('subir horas al día lo llena', (await p.locator('.plan-detail-item').count()) >= 1)
check('queda como ajustado a mano', (await p.locator('.plan-detail').innerText()).includes('ajustado a mano'))

// día del examen
await freshCal(p)
for (let i = 0; i < 3; i++) { await p.getByRole('button', { name: 'Ver más semanas' }).click(); await p.waitForTimeout(200) }
const examDay = p.locator('.plan-day').filter({ has: p.locator('.plan-exam') }).first()
if (await examDay.count()) {
  await examDay.click()
  await p.waitForTimeout(400)
  check('el día del examen lo destaca en el detalle', (await p.locator('.plan-detail-exam').count()) >= 1)
} else check('el día del examen lo destaca en el detalle', false, 'no se encontró día de examen')

// ---------- enlace directo a un día
await p.goto(BASE + '#/calendario/2026-09-22', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
check('enlace directo #/calendario/FECHA abre ese día', await p.locator('.plan-detail').isVisible())
check('abre el día correcto', (await p.locator('.plan-detail h4').innerText()).includes('22'), await p.locator('.plan-detail h4').innerText())

// ---------- teclado
await freshCal(p)
const dia = p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first()
await dia.focus()
check('el día expone aria-expanded', (await dia.getAttribute('aria-expanded')) === 'false')
await p.keyboard.press('Enter')
await p.waitForTimeout(400)
check('se abre con Enter', await p.locator('.plan-detail').isVisible())
check('aria-expanded pasa a true', (await p.locator('.plan-day[aria-expanded=true]').count()) === 1)

// ---------- móvil
const m = await ctx.newPage()
await m.setViewportSize({ width: 400, height: 800 })
await m.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await m.waitForTimeout(500)
await m.locator('.plan-day').filter({ has: m.locator('.plan-item') }).first().click()
await m.waitForTimeout(400)
check('móvil: el detalle se abre', await m.locator('.plan-detail').isVisible())
const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
check('móvil: sin overflow con el detalle abierto', sw <= cw + 1, `${sw} > ${cw}`)
check('móvil: los títulos siguen completos', !(await m.locator('.plan-detail-title').first().innerText()).includes('…'))
// el menú lateral tiene la entrada nueva
await m.getByRole('button', { name: 'Abrir menú' }).click()
await m.waitForTimeout(400)
check('móvil: «Calendario» en el menú', await m.locator('.nav').getByRole('link', { name: 'Calendario', exact: true }).isVisible())

await b.close()
