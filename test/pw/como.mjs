// «Cómo se hace» en el navegador: que la pestaña esté donde tiene que
// estar, que la ficha traiga las cuatro partes, que el ejemplo esté
// plegado de entrada y que el orden responda a lo que estás fallando.
import { lanzar, vigilarConsola } from './_navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)

const seed = (data) => p.evaluate((d) => {
  const cur = JSON.parse(localStorage.getItem('nucleo.data') || '{}')
  localStorage.setItem('nucleo.data', JSON.stringify({ ...cur, ...d }))
}, data)

// ---------- la pestaña existe y carga
await p.goto(BASE + '#/asignatura/algebra/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
check('Álgebra ofrece la pestaña', await p.getByRole('tab', { name: 'Cómo se hace' }).isVisible())
await p.getByRole('tab', { name: 'Cómo se hace' }).click()
await p.waitForTimeout(1100)
const fichas = await p.locator('.howto-card').count()
check('pinta los procedimientos', fichas >= 8, String(fichas))

// ---------- las cuatro partes de una ficha
// «Cuándo se usa» es la que justifica la funcionalidad entera: sin ella
// esto sería el formulario de pasos que ya está en cualquier apunte.
const uno = p.locator('.howto-card').first()
check('cada ficha dice cuándo se usa', (await uno.locator('.howto-when p').innerText()).length > 100)
check('todas traen ese apartado', (await p.locator('.howto-when').count()) === fichas)
const pasos = await uno.locator('.howto-steps li').count()
check('cada ficha trae sus pasos', pasos >= 3, String(pasos))
check('los pasos vienen anotados', (await uno.locator('.howto-note').count()) >= 3)
check('cada ficha dice dónde se tuerce', (await uno.locator('.howto-trap p').innerText()).length > 100)
check('todas traen la trampa', (await p.locator('.howto-trap').count()) === fichas)

// ---------- el ejemplo va plegado
// Igual que las soluciones en Práctica: tenerlo delante convierte el
// procedimiento en lectura.
check('el ejemplo no se enseña de entrada', (await p.locator('.howto-ex').count()) === 0)
await uno.getByRole('button', { name: 'Ver un ejemplo' }).click()
await p.waitForTimeout(400)
check('se abre a un clic', (await p.locator('.howto-ex').count()) === 1)
const pasosEj = await p.locator('.howto-ex .howto-walk li').count()
check('el ejemplo viene desarrollado', pasosEj >= 3, String(pasosEj))
await uno.getByRole('button', { name: 'Ocultar el ejemplo' }).click()
await p.waitForTimeout(400)
check('y se vuelve a cerrar', (await p.locator('.howto-ex').count()) === 0)

// ---------- enlaza con la práctica
check('las fichas enlazan con los problemas',
  (await p.locator('.howto-linked a[href="#/asignatura/algebra/practica"]').count()) > 0)

// ---------- agrupar por temas
await p.getByRole('tab', { name: 'Por temas' }).click()
await p.waitForTimeout(500)
const temas = await p.locator('.howto-topic').count()
check('por temas aparecen los encabezados', temas >= 3, String(temas))
check('y siguen estando todas las fichas', (await p.locator('.howto-card').count()) === fichas)
await p.getByRole('tab', { name: 'Lo que te falta' }).click()
await p.waitForTimeout(500)
check('volver quita los encabezados', (await p.locator('.howto-topic').count()) === 0)

// ---------- sin datos tuyos no se inventa una urgencia
const avisos = await p.locator('.plan-warn-block').allInnerTexts()
check('sin fallos no dice que algo se te atraganta',
  avisos.every((t) => !t.includes('atragantando')), avisos.join(' | '))

// ---------- el orden responde a lo que estás fallando
// Ojo: goto cambiando solo el hash no recarga, así que la semilla se
// quedaría en localStorage sin que la app la leyera. Hay que recargar.
await seed({
  practice: {
    'algebra:ind1': { ok: 0, fail: 2, last: 'fail' },
    'algebra:ind2': { ok: 0, fail: 1, last: 'fail' }
  }
})
await p.reload({ waitUntil: 'networkidle' })
await p.goto(BASE + '#/asignatura/algebra/como', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const aviso = (await p.locator('.plan-warn-block').allInnerTexts()).join(' ')
check('con problemas fallados lo dice', aviso.includes('atragantando'), aviso)
check('y nombra el procedimiento que falta', aviso.includes('inducción'), aviso)
check('delante va lo que estás fallando',
  (await p.locator('.howto-card').first().locator('.howto-weak').count()) === 1,
  await p.locator('.howto-t').first().innerText())
// Y detrás queda alguna sin marcar: si no, el orden no habría hecho
// nada y la comprobación anterior pasaría sola.
check('las demás no salen marcadas', (await p.locator('.howto-weak').count()) < fichas,
  String(await p.locator('.howto-weak').count()))

// Por temas manda el orden del fichero, no lo que fallas: es lo que
// distingue las dos pestañas.
await p.getByRole('tab', { name: 'Por temas' }).click()
await p.waitForTimeout(500)
check('por temas vuelve el orden del temario',
  (await p.locator('.howto-card').first().locator('.howto-weak').count()) === 0,
  await p.locator('.howto-t').first().innerText())

// ---------- una asignatura sin procedimientos
await p.goto(BASE + '#/asignatura/ipo/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('una asignatura sin procedimientos no ofrece la pestaña',
  (await p.getByRole('tab', { name: 'Cómo se hace' }).count()) === 0)
await p.goto(BASE + '#/asignatura/ipo/como', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('pedirla por la URL donde no la hay no deja la página vacía',
  (await p.locator('.howto-card').count()) === 0 &&
  (await p.getByRole('tab', { selected: true }).innerText()).includes('Guía'))

// ---------- móvil
const movil = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage()
await movil.goto(BASE + '#/asignatura/tec-comp/como', { waitUntil: 'networkidle' })
await movil.waitForTimeout(1200)
check('en el móvil también carga', (await movil.locator('.howto-card').count()) > 0)
const ancho = await movil.evaluate(() => document.documentElement.scrollWidth)
check('en el móvil no desborda a lo ancho', ancho <= 392, `${ancho}px`)
const recortado = await movil.evaluate(() =>
  [...document.querySelectorAll('.howto-t, .howto-step, .howto-trap p')]
    .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).length)
check('ni se sale el texto de las fichas', recortado === 0, String(recortado))
await movil.close()

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

await b.close()
console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
