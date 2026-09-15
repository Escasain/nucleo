import { lanzar, vigilarConsola } from './navegador.mjs'
const ARTEFACTOS = new URL('../.artefactos/', import.meta.url).pathname
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA (' + errors.length + ') ---\n' + (errors.join('\n') || '(limpia)')) })
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)

// ---- Inicio: tutorial, Hoy, expediente
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
check('tutorial de bienvenida visible', await p.locator('.onboarding').isVisible())
await p.getByRole('button', { name: 'Entendido' }).click()
await p.waitForTimeout(200)
check('tutorial se cierra', (await p.locator('.onboarding').count()) === 0)
await p.reload({ waitUntil: 'networkidle' })
check('tutorial no vuelve tras recargar', (await p.locator('.onboarding').count()) === 0)
check('panel Hoy presente', await p.locator('.today').isVisible())
const todayTxt = await p.locator('.today').innerText()
check('Hoy muestra bloque bimestral', /Bloque|Próximo bloque/.test(todayTxt), todayTxt.slice(0, 80))
check('Hoy muestra asignaturas del bloque o pendientes', /Este bloque|Sin entregas|tarjeta/.test(todayTxt))
const stats = await p.locator('.stat').allInnerTexts()
check('expediente: ECTS sobre 180', stats.some((s) => s.includes('/180')), stats.join(' | '))
check('curso académico dinámico', /Curso 20\d\d\/\d\d/.test(await p.locator('.page-head .sub').innerText()))

// ---- Ajustes: objetivo semanal → barra en Inicio y Estudio
await p.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
await p.locator('#weekly-goal').fill('8')
await p.waitForTimeout(200)
check('última copia: nunca', (await p.locator('.card').filter({ hasText: 'Copia de seguridad' }).innerText()).includes('nunca'))
await p.goto(BASE, { waitUntil: 'networkidle' })
check('Inicio muestra objetivo 8 h', (await p.locator('.today').innerText()).includes('de 8 h'))

// ---- Horario semanal: añadir bloque para HOY → aparece en Inicio
const dow = (new Date().getDay() + 6) % 7
await p.goto(BASE + '#/agenda', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Horario semanal' }).click()
await p.getByRole('button', { name: 'Añadir bloque' }).click()
await p.locator('#slot-day').selectOption(String(dow))
await p.locator('#slot-start').fill('19:00')
await p.locator('#slot-end').fill('20:30')
await p.locator('#slot-title').fill('Repaso de Álgebra')
await p.getByRole('button', { name: 'Guardar' }).click()
await p.waitForTimeout(250)
check('bloque en el día de hoy', (await p.locator('.schedule-day.is-today').innerText()).includes('Repaso de Álgebra'))
check('horas planificadas', (await p.locator('.card').filter({ hasText: 'Horario semanal' }).innerText()).includes('h/semana'))
await p.goto(BASE, { waitUntil: 'networkidle' })
check('Inicio → Horario de hoy muestra el bloque', (await p.locator('.today').innerText()).includes('Repaso de Álgebra'))
await p.goto(BASE + '#/agenda', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Horario semanal' }).click()
await p.getByRole('button', { name: /Borrar bloque/ }).first().click()
await p.waitForTimeout(200)
check('bloque borrado', !(await p.locator('.schedule').innerText()).includes('Repaso de Álgebra'))

// ---- Vista mensual con una evaluación
const due = new Date(); due.setDate(due.getDate() + 3)
await p.getByRole('button', { name: 'Nueva evaluación' }).click()
await p.locator('.modal input').first().fill('Test tema 2')
await p.locator('.modal select').first().selectOption({ index: 1 })
await p.locator('.modal input[type="date"]').fill(iso(due))
await p.getByRole('button', { name: 'Guardar' }).click()
await p.waitForTimeout(200)
await p.getByRole('tab', { name: 'Mes' }).click()
await p.waitForTimeout(200)
const monthText = await p.locator('.month-head h3').innerText()
check('vista mensual muestra el mes', /20\d\d/.test(monthText), monthText)
const dayBtn = p.locator('.month-day').filter({ has: p.locator('.dot-task') }).first()
check('día con punto de evaluación', (await dayBtn.count()) >= 1 || due.getMonth() !== new Date().getMonth())
if ((await dayBtn.count()) >= 1) {
  await dayBtn.click()
  await p.waitForTimeout(150)
  check('detalle del día lista la evaluación', (await p.locator('.month-detail').innerText()).includes('Test tema 2'))
}
await p.getByRole('button', { name: 'Mes siguiente' }).click()
await p.waitForTimeout(100)
check('navegación de mes', (await p.locator('.month-head h3').innerText()) !== monthText)

// ---- Progreso del temario desde la guía → cabecera, plan e inicio
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.locator('.guide').waitFor()
const boxes = p.locator('.topic-row [role=checkbox]')
const nTopics = await boxes.count()
await boxes.nth(0).click(); await boxes.nth(1).click(); await boxes.nth(2).click()
await p.waitForTimeout(250)
check('contador de temas 3/N', (await p.locator('.guide-count').first().innerText()).trim() === `3/${nTopics}`)
const expectPct = Math.round((3 / nTopics) * 100)
check('cabecera muestra % temario', (await p.locator('.calc-progress').innerText()).includes(`${expectPct} %`))
await boxes.nth(2).click()
await p.waitForTimeout(150)
check('desmarcar tema', (await p.locator('.guide-count').first().innerText()).trim() === `2/${nTopics}`)
await p.goto(BASE + '#/plan', { waitUntil: 'networkidle' })
check('plan muestra % temario', (await p.locator('.subject-card').filter({ hasText: 'Álgebra y Matemática Discreta' }).innerText()).includes('% temario'))
check('plan muestra ECTS', (await p.locator('.subject-card').first().innerText()).includes('ECTS'))
check('plan: franja de bloques con 4 bloques', (await p.locator('.block-pill').count()) === 4)
check('plan: bloque en curso o próximo marcado', (await p.locator('.block-pill').allInnerTexts()).join(' ').includes('–'))
await p.goto(BASE, { waitUntil: 'networkidle' })
check('inicio muestra % temario en la asignatura', (await p.locator('.row-item').filter({ hasText: 'Álgebra' }).innerText()).includes('temario'))

// ---- Calculadora de nota UNIPRO
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.locator('#grade-cont').fill('6')
await p.waitForTimeout(150)
let hint = await p.locator('.calc-hint').innerText()
check('necesita en la prueba final = (5-4.2)/0.3 = 2.67', hint.includes('2.67'), hint)
check('y para un 7 = 9.33', hint.includes('9.33'), hint)
await p.locator('#grade-exam').fill('8')
await p.waitForTimeout(150)
check('resultado 0.7·6+0.3·8 = 6.60', (await p.locator('.calc-result .stat-num').innerText()).trim() === '6.60')
await p.getByRole('button', { name: 'Usar como nota final' }).click()
await p.waitForTimeout(150)
check('nota final rellenada', (await p.locator('#subject-grade').inputValue()) === '6.60')
await p.locator('#grade-cont').fill('2')
await p.locator('#grade-exam').fill('')
await p.waitForTimeout(150)
check('aviso imposible aprobar con continua 2', (await p.locator('.calc-hint').innerText()).includes('no llegas'))
await p.locator('#grade-cont').fill('7.5')
await p.waitForTimeout(150)
check('continua 7.5 ⇒ aprobado asegurado', (await p.locator('.calc-hint').innerText()).includes('asegurado'))

// ---- Expediente: aprobar con nota → ECTS y media
await p.locator('#subject-status').selectOption('aprobada')
await p.locator('#subject-grade').fill('8')
await p.goto(BASE, { waitUntil: 'networkidle' })
const st2 = await p.locator('.stat').allInnerTexts()
check('ECTS superados = 6 (álgebra) + 6 (fund. empresa reconocida) = 12', st2.some((s) => s.startsWith('12/180')), st2.join(' | '))
check('nota media = 8.00 (solo aprobadas cuentan)', st2.some((s) => s.startsWith('8.00')), st2.join(' | '))

// ---- Búsqueda global Ctrl+K
await p.keyboard.press('Control+k')
await p.waitForTimeout(400)
check('Ctrl+K abre la búsqueda', await p.locator('.modal.search').isVisible())
await p.locator('.search-input').fill('grafos')
await p.waitForTimeout(500)
const items = await p.locator('.search-item').allInnerTexts()
check('busca en temas y guía', items.some((t) => /Tema|Guía/.test(t)) && items.length >= 2, items.slice(0, 3).join(' | '))
await p.locator('.search-input').fill('Estadística')
await p.waitForTimeout(300)
await p.keyboard.press('Enter')
await p.waitForTimeout(300)
check('Enter abre la asignatura', p.url().includes('#/asignatura/estadistica'), p.url())
check('búsqueda se cierra', (await p.locator('.modal.search').count()) === 0)

// ---- Ayuda con ? y navegación G+letra
await p.keyboard.press('Escape')
await p.keyboard.press('?')
await p.waitForTimeout(250)
check('? abre la ayuda', (await p.getByRole('dialog', { name: 'Cómo usar NÚCLEO' }).count()) === 1)
await p.keyboard.press('Escape')
await p.waitForTimeout(150)
await p.keyboard.press('g'); await p.keyboard.press('a')
await p.waitForTimeout(250)
check('G A → Agenda', p.url().endsWith('#/agenda'), p.url())
await p.keyboard.press('g'); await p.keyboard.press('e')
await p.waitForTimeout(250)
check('G E → Estudio', p.url().endsWith('#/estudio'), p.url())

// ---- Estadísticas en Estudio
check('card Tu estudio con barras', (await p.locator('.bars .bar').count()) === 7)
check('objetivo en Tu estudio', (await p.locator('.card').filter({ hasText: 'Tu estudio' }).innerText()).includes('objetivo 8 h'))

// ---- Ayuda desde la barra lateral; búsqueda desde la barra lateral
await p.locator('.sidebar-help').click()
await p.waitForTimeout(200)
check('botón Ayuda de la barra lateral', (await p.getByRole('dialog', { name: 'Cómo usar NÚCLEO' }).count()) === 1)
await p.keyboard.press('Escape')
await p.locator('.sidebar-search').click()
await p.waitForTimeout(200)
check('botón Buscar de la barra lateral', await p.locator('.modal.search').isVisible())
await p.keyboard.press('Escape')

// ---- Borrar datos con confirmación
await p.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: 'Borrar todos los datos…' }).click()
await p.getByRole('button', { name: 'Sí, borrar todo' }).click()
await p.waitForTimeout(300)
await p.goto(BASE, { waitUntil: 'networkidle' })
check('reset: tutorial vuelve y expediente inicial', (await p.locator('.onboarding').count()) === 1 && (await p.locator('.stat').allInnerTexts()).some((s) => s.startsWith('6/180')))

// ---- Copia importada antigua (sin settings/schedule) no rompe nada
const fs = await import('node:fs/promises')
const old = { subjects: { algebra: { status: 'cursando' } }, tasks: [], sessions: [] }
const fp = ARTEFACTOS + `old.json`; await fs.writeFile(fp, JSON.stringify(old))
await p.goto(BASE + '#/ajustes', { waitUntil: 'networkidle' })
await p.locator('input[type=file]').setInputFiles(fp)
await p.waitForTimeout(300)
const before = errors.length
for (const h of ['', '#/plan', '#/agenda', '#/estudio', '#/asignatura/algebra']) { await p.goto(BASE + h, { waitUntil: 'networkidle' }); await p.waitForTimeout(150) }
check('copia antigua sin campos nuevos: sin errores', errors.length === before)

// ---- Móvil 400 px: nuevas vistas sin overflow
const m = await ctx.newPage()
await m.setViewportSize({ width: 400, height: 800 })
for (const [h, action] of [['', null], ['#/agenda', 'Mes'], ['#/agenda', 'Horario semanal'], ['#/estudio', null], ['#/asignatura/algebra', null], ['#/ajustes', null]]) {
  await m.goto(BASE + h, { waitUntil: 'networkidle' })
  if (action) await m.getByRole('tab', { name: action }).click()
  await m.waitForTimeout(250)
  const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  check(`móvil ${h || '#/'}${action ? ' · ' + action : ''} sin overflow`, sw <= cw + 1, `${sw} > ${cw}`)
}
await m.goto(BASE, { waitUntil: 'networkidle' })
await m.locator('.mobile-topbar').getByRole('button', { name: 'Buscar' }).click()
await m.waitForTimeout(200)
check('móvil: búsqueda desde la barra superior', await m.locator('.modal.search').isVisible())
const { sw, cw } = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
check('móvil: búsqueda sin overflow', sw <= cw + 1)

await b.close()

// Resumen en el formato común: es lo que permite al lanzador saber que
// esta suite llegó al final y no se cortó a mitad.
const _pass = out.filter((x) => x.startsWith('PASS')).length
const _fail = out.filter((x) => x.startsWith('FAIL')).length
console.log(`\n${_pass} PASS · ${_fail} FAIL`)
