// El mapa de la asignatura en el navegador: que se dibuje, que responda
// a lo que llevas hecho y que el consejo cambie con tus datos.
import { lanzar, vigilarConsola } from './navegador.mjs'
const ARTEFACTOS = new URL('../.artefactos/', import.meta.url).pathname
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

// ---------- la pestaña existe donde hay mapa, y no donde no lo hay
await p.goto(BASE + '#/asignatura/algebra/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('Álgebra ofrece la pestaña Mapa', await p.getByRole('tab', { name: 'Mapa' }).isVisible())

await p.goto(BASE + '#/asignatura/redes/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
check('una asignatura sin mapa no la ofrece', (await p.getByRole('tab', { name: 'Mapa' }).count()) === 0)
// Y pedirla por la URL cae en la primera pestaña, no en una en blanco.
await p.goto(BASE + '#/asignatura/redes/mapa', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
check('pedir el mapa donde no lo hay no deja la página vacía',
  (await p.locator('.smap').count()) === 0 && (await p.getByRole('tab', { selected: true }).innerText()).includes('Guía'))

// ---------- el dibujo
await p.goto(BASE + '#/asignatura/algebra/mapa', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const nodos = await p.locator('.smap-node').count()
check('dibuja los diez temas de Álgebra', nodos === 10, String(nodos))
const flechas = await p.locator('.smap-edge').count()
check('dibuja las nueve dependencias del temario', flechas === 9, String(flechas))
check('cada tema lleva su etiqueta', (await p.locator('.smap-node .smap-t').count()) >= nodos)
check('el SVG escala con viewBox', (await p.locator('.smap-canvas svg').getAttribute('viewBox')) !== null)
check('el dibujo se anuncia a lectores de pantalla',
  (await p.locator('.smap-canvas svg').getAttribute('aria-label')).includes('10 temas'))

// Nada hecho: todo «sin empezar» y ningún aviso inventado.
check('sin datos, todos los temas salen sin empezar',
  (await p.locator('.smap-node.is-todo').count()) === 10,
  String(await p.locator('.smap-node.is-todo').count()))
check('sin datos no hay aviso de nada flojo', (await p.locator('.plan-warn-block').count()) === 0)
check('pero sí propone por dónde empezar', (await p.locator('.smap .guide-fine').first().innerText()).includes('Lógica'))

// ---------- el detalle
check('de entrada no hay panel de detalle', (await p.locator('.smap-detail').count()) === 0)
await p.locator('.smap-node').first().click()
await p.waitForTimeout(400)
check('al pinchar un tema se abre su detalle', (await p.locator('.smap-detail').count()) === 1)
check('el detalle dice de qué va el tema', (await p.locator('.smap-gist').innerText()).length > 60)
check('y cuántas unidades llevas', (await p.locator('.smap-detail .stat-num').first().innerText()).startsWith('0'))
check('un tema raíz no inventa cimientos', (await p.locator('.smap-why').count()) === 0)
check('pero sí dice quién lo va a necesitar',
  (await p.locator('.smap-detail .guide-fine').innerText()).includes('necesitar'))
check('lista las unidades del tema', (await p.locator('.smap-units li').count()) === 3,
  String(await p.locator('.smap-units li').count()))

// Un tema con cimientos: la explicación de la flecha es el contenido útil.
await p.locator('.smap-node').filter({ hasText: 'Grafos' }).click()
await p.waitForTimeout(400)
check('un tema con dependencias las enseña', (await p.locator('.smap-why li').count()) === 1)
check('y explica qué le aporta cada una',
  (await p.locator('.smap-why li p').first().innerText()).length > 80,
  String((await p.locator('.smap-why li p').first().innerText()).length))
check('la explicación es la del par concreto, no genérica',
  (await p.locator('.smap-why li p').first().innerText()).includes('matriz de adyacencia'))

// Navegar por el mapa desde el propio texto.
await p.locator('.smap-why .smap-jump').first().click()
await p.waitForTimeout(400)
check('se salta al cimiento desde su nombre',
  (await p.locator('.smap-detail h3').innerText()) === 'Relaciones',
  await p.locator('.smap-detail h3').innerText())
check('Relaciones tiene dos cimientos', (await p.locator('.smap-why li').count()) === 2)

// Al seleccionar, lo no relacionado se atenúa: el mapa se lee de un vistazo.
check('lo ajeno al tema seleccionado se atenúa', (await p.locator('.smap-node.is-dim').count()) > 0)
check('el seleccionado no se atenúa', (await p.locator('.smap-node.is-sel.is-dim').count()) === 0)

// ---------- con datos: unidades hechas
await seed({
  planner: {
    weekHours: null, exceptions: {}, hourOverrides: {}, startTimes: null, paceFactor: {},
    done: { algebra: ['t1a', 't1b', 't1c', 'b1', 't7', 'b3', 't2a'] }
  }
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
// Hallazgo de Codex en el PR #8: terminar el temario y no haber tocado un
// problema no es tenerlo sólido. Con solo unidades hechas, ninguno puede
// salir en verde.
check('el temario hecho, por sí solo, no pinta ningún tema de sólido',
  (await p.locator('.smap-node.is-solid').count()) === 0,
  String(await p.locator('.smap-node.is-solid').count()))
check('los terminados y los empezados salen en marcha',
  (await p.locator('.smap-node.is-open').count()) >= 3,
  String(await p.locator('.smap-node.is-open').count()))
await p.locator('.smap-node').filter({ hasText: 'Conjuntos' }).click()
await p.waitForTimeout(400)
check('y el detalle lo dice con esas palabras',
  (await p.locator('.smap-detail .guide-label').first().innerText()).toLowerCase().includes('sin comprobar'),
  await p.locator('.smap-detail .guide-label').first().innerText())
check('la barra de cada tema refleja lo hecho',
  (await p.locator('.smap-node.is-open .smap-bar').first().getAttribute('width')) === '104')
check('el consejo pasa a terminar lo que tienes empezado',
  (await p.locator('.smap .guide-fine').first().innerText()).includes('Inducción'),
  await p.locator('.smap .guide-fine').first().innerText())

// Con problemas que salen, ahí sí se pone en verde.
await seed({ practice: { 'algebra:cj1': { ok: 1, fail: 0, last: 'ok' }, 'algebra:cj2': { ok: 1, fail: 0, last: 'ok' } } })
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('con problemas que salen sí pasa a sólido',
  (await p.locator('.smap-node.is-solid').count()) === 1,
  String(await p.locator('.smap-node.is-solid').count()))
check('y es el tema de esos problemas',
  await p.locator('.smap-node.is-solid').filter({ hasText: 'Conjuntos' }).isVisible())

// ---------- con datos: problemas que no salen
await seed({
  practice: {
    'algebra:log1': { ok: 0, fail: 2, last: 'fail' },
    'algebra:log2': { ok: 1, fail: 1, last: 'ok' },
    'algebra:log3': { ok: 0, fail: 1, last: 'fail' }
  }
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const flojos = await p.locator('.smap-node.is-weak').count()
check('un tema cuyos problemas no salen se marca', flojos === 1, String(flojos))
check('aunque el temario esté terminado, deja de contar como sólido',
  (await p.locator('.smap-node.is-weak.is-solid').count()) === 0)
const aviso = await p.locator('.plan-warn-block').innerText()
check('y el aviso lo dice con nombre propio', aviso.includes('Lógica'), aviso)
check('el aviso distingue si los cimientos aguantan',
  aviso.includes('aquí sí toca insistir'), aviso)

// Ahora el caso que da valor al mapa: falla un tema cuyo cimiento no
// está cerrado. Lógica se queda sin t1c a propósito.
await seed({
  planner: {
    weekHours: null, exceptions: {}, hourOverrides: {}, startTimes: null, paceFactor: {},
    done: { algebra: ['t1a', 't1b', 'b1', 't7', 'b3', 't2a', 't2b'] }
  },
  practice: {
    'algebra:ind1': { ok: 0, fail: 2, last: 'fail' },
    'algebra:ind2': { ok: 0, fail: 2, last: 'fail' }
  }
})
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const aviso2 = await p.locator('.plan-warn-block').innerText()
check('cuando falla un tema con cimientos flojos, manda hacia atrás',
  aviso2.includes('vuelve a') && aviso2.includes('Lógica'), aviso2)

// ---------- el salto a estudiar una unidad
await p.locator('.smap-node').filter({ hasText: 'Inducción' }).click()
await p.waitForTimeout(400)
await p.locator('.smap-units button').first().click()
await p.waitForTimeout(900)
check('desde el mapa se entra a estudiar la unidad', p.url().includes('#/sesion/algebra/'), p.url())

// ---------- TC y el móvil
await p.goto(BASE + '#/asignatura/tec-comp/mapa', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
check('TC también tiene mapa', (await p.locator('.smap-node').count()) === 7,
  String(await p.locator('.smap-node').count()))
// Cinco niveles: 5 cajas de 54 + 4 huecos de 46, más el margen = 466.
check('con sus cinco niveles', (await p.locator('.smap-canvas svg').getAttribute('viewBox')).endsWith(' 466'),
  await p.locator('.smap-canvas svg').getAttribute('viewBox'))

await p.setViewportSize({ width: 390, height: 780 })
await p.waitForTimeout(500)
const w = await p.evaluate(() => document.documentElement.scrollWidth)
check('en el móvil no desborda a lo ancho', w <= 390, String(w))
check('y el mapa sigue completo', (await p.locator('.smap-node').count()) === 7)
await p.screenshot({ path: ARTEFACTOS + 'shot-mapa-movil.png', fullPage: true })

await p.setViewportSize({ width: 1280, height: 1000 })
await p.goto(BASE + '#/asignatura/algebra/mapa', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
await p.screenshot({ path: ARTEFACTOS + 'shot-mapa.png', fullPage: true })

// ---------- teclado
await p.keyboard.press('Tab')
for (let i = 0; i < 40; i++) {
  const esNodo = await p.evaluate(() => document.activeElement?.classList?.contains('smap-node'))
  if (esNodo) break
  await p.keyboard.press('Tab')
}
check('los temas del mapa se alcanzan con el tabulador',
  await p.evaluate(() => document.activeElement?.classList?.contains('smap-node')))
await p.keyboard.press('Enter')
await p.waitForTimeout(400)
check('y se abren con Enter', (await p.locator('.smap-detail').count()) === 1)

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

await b.close()
console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
