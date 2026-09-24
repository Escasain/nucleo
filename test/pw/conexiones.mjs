// Las conexiones entre asignaturas en el navegador: la vista general,
// la pestaña de cada asignatura y que el orden responda a tus datos.
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

// ---------- la vista general
await p.goto(BASE + '#/conexiones', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('la vista carga', (await p.locator('h1').innerText()).includes('Conexiones'))
const puentes = await p.locator('.bridge').count()
check('pinta todos los puentes', puentes === 9, String(puentes))

// Las cuatro partes de un puente. La tercera es la que justifica la
// funcionalidad: sin ella esto sería una lista de analogías bonitas.
const primero = p.locator('.bridge').first()
check('cada puente dice la idea desnuda', (await primero.locator('.bridge-idea').innerText()).length > 60)
check('cada puente dice qué se traslada', (await primero.locator('.bridge-same').innerText()).length > 80)
check('cada puente dice dónde deja de valer', (await primero.locator('.bridge-breaks p').innerText()).length > 80)
check('cada puente propone algo que comprobar', (await primero.locator('.bridge-check p').innerText()).length > 60)
check('todos traen el apartado que más importa',
  (await p.locator('.bridge-breaks').count()) === puentes)

// ---------- los extremos
const extremos = await p.locator('.bridge-end').count()
check('los extremos se pintan', extremos >= puentes * 2, String(extremos))
check('cada extremo lleva su notación', (await p.locator('.bridge-as').count()) === extremos)
check('cada extremo enlaza a su asignatura',
  (await p.locator('.bridge-end-name[href^="#/asignatura/"]').count()) === extremos)

// ---------- se llega desde la barra lateral
await p.goto(BASE + '#/', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.locator('.sidebar a[href="#/conexiones"]').click()
await p.waitForTimeout(1100)
check('se llega desde la barra lateral', (await p.locator('.bridge').count()) > 0)

// ---------- filtrar por asignatura
await p.getByRole('tab', { name: 'Tecnología de Computadores' }).click()
await p.waitForTimeout(500)
const soloTC = await p.locator('.bridge').count()
check('el filtro por asignatura recorta la lista', soloTC > 0 && soloTC < puentes, String(soloTC))
// Y lo que queda toca esa asignatura de verdad: filtrar por una cosa y
// enseñar otra sería peor que no filtrar.
const nombres = await p.locator('.bridge .bridge-end-name').allInnerTexts()
check('todo lo que queda nombra esa asignatura',
  nombres.some((n) => n.includes('Tecnología')), nombres.slice(0, 4).join(' | '))
await p.getByRole('tab', { name: 'Todas' }).click()
await p.waitForTimeout(500)
check('volver a «Todas» las devuelve', (await p.locator('.bridge').count()) === puentes)

// ---------- la pestaña dentro de la asignatura
await p.goto(BASE + '#/asignatura/algebra/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
check('Álgebra ofrece la pestaña Conexiones',
  await p.getByRole('tab', { name: 'Conexiones' }).isVisible())
await p.getByRole('tab', { name: 'Conexiones' }).click()
await p.waitForTimeout(1100)
const deAlgebra = await p.locator('.bridge').count()
check('la pestaña enseña solo los puentes de esa asignatura',
  deAlgebra > 0 && deAlgebra < puentes, String(deAlgebra))

// Desde dentro de una asignatura, repetirle al lector dónde está es
// ruido: el puente debe enseñar solo el otro lado.
const dentro = await p.locator('.bridge .bridge-end-name').allInnerTexts()
check('no se repite la asignatura desde la que miras',
  dentro.every((n) => !n.includes('Álgebra')), dentro.slice(0, 4).join(' | '))
// innerText devuelve el texto tal y como se ve, y .guide-label va en
// versalitas: comparar en minúsculas o esto falla por el CSS.
check('el encabezado cambia al mirar desde dentro',
  (await p.locator('.bridge .guide-label').first().innerText()).toLowerCase().includes('dónde más'))
check('desde la pestaña se llega a la vista general',
  (await p.locator('a[href="#/conexiones"]').count()) > 0)

// ---------- una asignatura sin puentes
await p.goto(BASE + '#/asignatura/ipo/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('una asignatura sin puentes no ofrece la pestaña',
  (await p.getByRole('tab', { name: 'Conexiones' }).count()) === 0)
// Y pedirla por la URL cae en la primera pestaña, no en una en blanco.
await p.goto(BASE + '#/asignatura/ipo/conexiones', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('pedirla por la URL donde no la hay no deja la página vacía',
  (await p.locator('.bridge').count()) === 0 &&
  (await p.getByRole('tab', { selected: true }).innerText()).includes('Guía'))

// ---------- el orden responde a tus datos
// Ojo: goto cambiando solo el hash no recarga la página, así que la
// semilla se quedaría en localStorage sin que la app llegara a leerla.
// Hay que recargar de verdad, y comprobar que la semilla ha entrado.
const sembrar = async (subjects) => {
  await seed({ subjects })
  await p.reload({ waitUntil: 'networkidle' })
  await p.goto(BASE + '#/conexiones', { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)
}

// Con una sola asignatura en marcha no hay ningún puente «vivo», así
// que el aviso de arriba no debe aparecer: sería una promesa falsa.
await sembrar({ algebra: { status: 'cursando' } })
const activasUna = await p.locator('.bridge-end.is-activa').count()
check('la semilla llega a la app', activasUna > 0 && activasUna < extremos,
  `${activasUna} de ${extremos}`)
const conUna = await p.locator('.guide-fine').allInnerTexts()
check('con una sola asignatura activa no promete puentes vivos',
  conUna.every((t) => !t.includes('entre manos')), conUna.join(' | '))

// Con dos en marcha, los que unen esas dos salen delante.
await sembrar({ 'tec-comp': { status: 'cursando' }, 'fund-prog': { status: 'cursando' } })
const aviso = (await p.locator('.guide-fine').allInnerTexts()).join(' ')
check('con dos asignaturas en marcha lo dice', aviso.includes('entre manos'), aviso)
const activasDos = await p.locator('.bridge-end.is-activa').count()
check('los extremos de las asignaturas en marcha se marcan',
  activasDos > 0 && activasDos < extremos, `${activasDos} de ${extremos}`)
check('delante va un puente que une las dos que estás dando',
  await p.locator('.bridge').first().locator('.bridge-end.is-activa').count() >= 2,
  await p.locator('.bridge-t').first().innerText())
// Y detrás queda alguno que no las une: si no, el orden no habría hecho
// nada y la comprobación anterior pasaría sola.
check('y detrás queda alguno que no',
  await p.locator('.bridge').last().locator('.bridge-end.is-activa').count() < 2,
  await p.locator('.bridge-t').last().innerText())

// ---------- en el móvil
// La notación va en un <code> que no parte por sí solo: si algo
// desborda a lo ancho, es ahí.
const movil = await ctx.newPage()
vigilarConsola(movil, errors)
await movil.setViewportSize({ width: 390, height: 844 })
await movil.goto(BASE + '#/conexiones', { waitUntil: 'networkidle' })
await movil.waitForTimeout(1200)
check('en el móvil también se pintan', (await movil.locator('.bridge').count()) > 0)
const ancho = await movil.evaluate(() =>
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))
check('en el móvil no desborda a lo ancho', ancho <= 392, `${ancho}px`)
const recortado = await movil.evaluate(() =>
  [...document.querySelectorAll('.bridge-as, .bridge-end-name')]
    .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).length)
check('ni se sale la notación de los extremos', recortado === 0, String(recortado))
await movil.close()

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

await b.close()
console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
