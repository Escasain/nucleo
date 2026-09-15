// El mapa de la asignatura: coherencia de los datos, niveles, cruce con
// tus datos y el diagnóstico.
import { MAPS, mapFor } from '../src/data/map/index.js'
import { MAP_SUBJECTS, hasMap } from '../src/data/map/meta.js'
import { levelsOf, layoutMap, mapStatus, diagnose, wrapLabel, placeNodes } from '../src/lib/subjectMap.js'
import { STUDY_PLANS } from '../src/modules/study-planner/studyPlanData.js'
import { PRACTICE } from '../src/data/practice/index.js'
import { CONCEPTS } from '../src/data/concepts/index.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

// ---------- coherencia de los datos
check('meta y datos coinciden',
  JSON.stringify([...MAP_SUBJECTS].sort()) === JSON.stringify(Object.keys(MAPS).sort()),
  `${MAP_SUBJECTS} vs ${Object.keys(MAPS)}`)
check('hasMap acierta con las que sí', hasMap('algebra') && hasMap('tec-comp') && hasMap('fund-prog'))
check('hasMap acierta con las que no', !hasMap('redes') && !hasMap('calculo'))
check('mapFor devuelve null en las que no tienen', mapFor('ipo') === null)

for (const [sid, nodes] of Object.entries(MAPS)) {
  const ids = nodes.map((n) => n.id)
  check(`${sid}: ids únicos`, new Set(ids).size === ids.length)
  check(`${sid}: todos tienen título y resumen`, nodes.every((n) => n.t && n.gist))
  check(`${sid}: los resúmenes son sustanciales`,
    nodes.every((n) => n.gist.length > 60), String(nodes.filter((n) => n.gist.length <= 60).map((n) => n.id)))

  // Cada dependencia apunta a un tema que existe...
  const huerfanas = nodes.flatMap((n) => (n.needs || []).filter((d) => !ids.includes(d)).map((d) => `${n.id}→${d}`))
  check(`${sid}: ninguna dependencia apunta al vacío`, huerfanas.length === 0, huerfanas.join(', '))

  // ...y todas traen su explicación, que es lo que de verdad enseña.
  const sinPorque = nodes.flatMap((n) =>
    (n.needs || []).filter((d) => !(n.why && n.why[d] && n.why[d].length > 60)).map((d) => `${n.id}→${d}`))
  check(`${sid}: toda flecha explica qué aporta`, sinPorque.length === 0, sinPorque.join(', '))

  // Sin ciclos: con un ciclo, «vuelve atrás a X» podría mandarte en círculo.
  const byId = new Map(nodes.map((n) => [n.id, n]))
  let ciclo = null
  const visit = (id, camino) => {
    if (camino.includes(id)) { ciclo = [...camino, id].join('→'); return }
    for (const d of byId.get(id)?.needs || []) visit(d, [...camino, id])
  }
  for (const n of nodes) visit(n.id, [])
  check(`${sid}: el mapa no tiene ciclos`, ciclo === null, ciclo || '')

  // Las unidades existen de verdad en el temario del planificador.
  const reales = new Set(STUDY_PLANS[sid].units.map((u) => u.id))
  const inventadas = nodes.flatMap((n) => (n.units || []).filter((u) => !reales.has(u)).map((u) => `${n.id}:${u}`))
  check(`${sid}: todas las unidades existen en el temario`, inventadas.length === 0, inventadas.join(', '))
  check(`${sid}: ningún tema se queda sin unidades`, nodes.every((n) => (n.units || []).length > 0))

  // Los temas con `g` enganchan de verdad con problemas y conceptos.
  const temasPractica = new Set((PRACTICE[sid] || []).map((p) => p.g))
  const malG = nodes.filter((n) => n.g && !temasPractica.has(n.g)).map((n) => n.id)
  check(`${sid}: los temas con g tienen problemas`, malG.length === 0, malG.join(', '))
  const temasConceptos = new Set((CONCEPTS[sid]?.concepts || []).map((c) => c.g))
  const sinConcepto = nodes.filter((n) => n.g && !temasConceptos.has(n.g)).map((n) => n.id)
  check(`${sid}: y también conceptos`, sinConcepto.length === 0, sinConcepto.join(', '))

  // Las trampas se filtran por tema en la ficha de repaso: una trampa sin
  // tema, o con un tema que el mapa no conoce, no llegaría nunca.
  const trampas = CONCEPTS[sid]?.pitfalls || []
  check(`${sid}: toda trampa dice de qué tema es`,
    trampas.every((t) => t.g), trampas.filter((t) => !t.g).map((t) => t.t).join(', '))
  const temasMapa = new Set(nodes.map((n) => n.g).filter(Boolean))
  const temasHuerfanos = trampas.filter((t) => !temasMapa.has(t.g)).map((t) => `${t.t} → ${t.g}`)
  check(`${sid}: y ese tema existe en el mapa`, temasHuerfanos.length === 0, temasHuerfanos.join(' | '))
}

// Cubrir el temario: casi todas las unidades de teoría deben caer en algún
// tema del mapa. Los repasos y algún laboratorio suelto pueden quedar fuera.
for (const [sid, nodes] of Object.entries(MAPS)) {
  const cubiertas = new Set(nodes.flatMap((n) => n.units || []))
  const teoria = STUDY_PLANS[sid].units.filter((u) => u.kind === 'tema' || u.kind === 'base')
  const fuera = teoria.filter((u) => !cubiertas.has(u.id)).map((u) => u.id)
  check(`${sid}: el mapa cubre toda la teoría`, fuera.length === 0, fuera.join(', '))
}

// ---------- niveles
const A = MAPS.algebra
const lv = levelsOf(A)
check('los temas raíz están en el nivel 0', lv.get('logica') === 0 && lv.get('matrices') === 0)
check('un tema va siempre por debajo de aquello de lo que depende',
  A.every((n) => (n.needs || []).every((d) => lv.get(d) < lv.get(n.id))))
check('el nivel es el camino más largo, no el más corto',
  lv.get('grafos') === 3, `grafos=${lv.get('grafos')}`)

const filas = layoutMap(A)
check('layoutMap agrupa por nivel', filas.length === 4, String(filas.length))
check('no pierde ningún tema', filas.reduce((a, f) => a + f.length, 0) === A.length)
check('respeta el orden del temario dentro de la fila',
  filas[0].map((n) => n.id).join() === 'logica,matrices', filas[0].map((n) => n.id).join())

// Ciclos y dependencias inexistentes no pueden colgar el cálculo.
const roto = [{ id: 'a', t: 'A', units: ['x'], needs: ['b'] }, { id: 'b', t: 'B', units: ['y'], needs: ['a', 'fantasma'] }]
const lvRoto = levelsOf(roto)
check('un ciclo no cuelga el cálculo', lvRoto.size === 2)
check('una dependencia inexistente se ignora', Number.isFinite(lvRoto.get('b')))

// ---------- cruce con tus datos
const N = [
  { id: 'base', t: 'Base', g: 'Base', units: ['u1', 'u2'], needs: [] },
  { id: 'medio', t: 'Medio', g: 'Medio', units: ['u3'], needs: ['base'], why: { base: 'porque sí' } },
  { id: 'alto', t: 'Alto', g: 'Alto', units: ['u4'], needs: ['medio'], why: { medio: 'porque sí' } }
]
const topic = (g, done, okFirst) => ({ g, total: 4, done, okFirst, pending: 0 })

const vacio = mapStatus(N, [], null)
check('sin nada hecho, nada está empezado', vacio.every((r) => !r.started && !r.solid))
check('sin problemas no hay porcentaje', vacio.every((r) => r.rate === null))
check('sin problemas nada se marca como flojo', vacio.every((r) => !r.weak))

const aMedias = mapStatus(N, ['u1'], null)
check('media unidad cuenta como empezado', aMedias[0].started && !aMedias[0].complete)
check('la proporción sale bien', aMedias[0].ratio === 0.5, String(aMedias[0].ratio))

// CLAVE: terminar el temario no basta para dar un tema por sólido.
const terminadoPeroFallando = mapStatus(N, ['u1', 'u2'], [topic('Base', 4, 1)])
check('temario terminado cuenta como completo', terminadoPeroFallando[0].complete)
check('pero si los problemas no salen NO es sólido', !terminadoPeroFallando[0].solid)
check('y se marca como que se resiste', terminadoPeroFallando[0].weak)

const terminadoYSaliendo = mapStatus(N, ['u1', 'u2'], [topic('Base', 4, 4)])
check('terminado y con los problemas saliendo sí es sólido', terminadoYSaliendo[0].solid)

// CLAVE (hallazgo de Codex en el PR #8): terminar el temario sin haber
// tocado un problema tampoco es tenerlo sólido. Si lo fuera, el mapa
// diría «tus cimientos están firmes» sin ninguna evidencia, justo lo
// contrario de lo que el detalle del tema enseña en pantalla.
const terminadoSinTocar = mapStatus(N, ['u1', 'u2'], null)
check('temario terminado sin problemas cuenta como completo', terminadoSinTocar[0].complete)
check('pero NO como sólido', !terminadoSinTocar[0].solid)
check('y tampoco como flojo: no es lo mismo no saber que ir mal',
  !terminadoSinTocar[0].weak)
check('un cimiento sin comprobar sale como no firme',
  terminadoSinTocar.find((r) => r.node.id === 'medio').shaky.map((d) => d.node.id).join() === 'base')

// Un solo acierto tampoco basta: con un intento, cualquier porcentaje
// es ruido. Hacen falta dos, igual que para llamarlo flojo.
const unAcierto = mapStatus(N, ['u1', 'u2'], [topic('Base', 1, 1)])
check('un solo problema acertado no da un tema por sólido', !unAcierto[0].solid)
check('dos que salen sí', mapStatus(N, ['u1', 'u2'], [topic('Base', 2, 1)])[0].solid)

// Un tema sin problemas propios no puede quedarse en el limbo: ahí el
// temario es toda la evidencia que hay.
const SIN_G = [{ id: 'solo', t: 'Solo', units: ['u1'], needs: [] }]
check('un tema sin problemas se da por sólido con el temario hecho',
  mapStatus(SIN_G, ['u1'], null)[0].solid)
check('y no antes', !mapStatus(SIN_G, [], null)[0].solid)

// Y el efecto que importa: el aviso ya no puede afirmar que los
// cimientos aguantan cuando nadie los ha comprobado.
const sinComprobar = diagnose(mapStatus(N, ['u1', 'u2', 'u3'], [topic('Medio', 2, 0)]))
check('no declara firmes unos cimientos sin comprobar',
  sinComprobar.weak[0].row.node.id === 'medio' && sinComprobar.weak[0].because.length === 1,
  sinComprobar.weak[0].because.map((d) => d.node.id).join())

// Un solo intento no basta para llamar flojo a un tema.
const unIntento = mapStatus(N, ['u1', 'u2'], [topic('Base', 1, 0)])
check('con un solo intento no se declara flojo', !unIntento[0].weak)
check('pero el porcentaje se enseña igual', unIntento[0].rate === 0)
// El recuento de aciertos viaja tal cual: el aviso dice «2 de 3 fallados»
// y no puede depender de deshacer un porcentaje redondeado.
const mixto = mapStatus(N, ['u1', 'u2'], [topic('Base', 3, 1)])
check('lleva el recuento de aciertos, no solo el porcentaje',
  mixto[0].okFirst === 1 && mixto[0].tried === 3)
check('sin problemas, el recuento es cero y no nulo', vacio[0].okFirst === 0)

// Los cimientos se leen del estado de los demás, no del propio.
const cimientoFlojo = mapStatus(N, ['u1', 'u2', 'u3'], [topic('Base', 4, 1)])
const medio = cimientoFlojo.find((r) => r.node.id === 'medio')
check('un tema sabe qué cimientos suyos no están firmes',
  medio.shaky.map((d) => d.node.id).join() === 'base', medio.shaky.map((d) => d.node.id).join())

// ---------- diagnóstico
const d1 = diagnose(cimientoFlojo)
check('detecta el tema que se resiste', d1.weak.length === 1 && d1.weak[0].row.node.id === 'base')
// Un tema flojo cuyo cimiento tampoco está firme: ahí está el consejo.
const conCimientoFlojo = diagnose(mapStatus(N, ['u1', 'u2', 'u3'], [topic('Base', 4, 1), topic('Medio', 4, 0)]))
const sobreMedio = conCimientoFlojo.weak.find((w) => w.row.node.id === 'medio')
check('y a dónde volver cuando lo que falla es un cimiento',
  sobreMedio.because.length === 1 && sobreMedio.because[0].node.id === 'base',
  sobreMedio.because.map((d) => d.node.id).join())
// Y al revés: si los cimientos aguantan, no manda a ningún sitio.
const soloEl = diagnose(mapStatus(N, ['u1', 'u2', 'u3'], [topic('Base', 4, 4), topic('Medio', 4, 0)]))
check('si los cimientos aguantan no inventa a dónde volver',
  soloEl.weak[0].row.node.id === 'medio' && soloEl.weak[0].because.length === 0)

// Terminar un tema por encima de cimientos sin cerrar es el caso serio:
// figura como hecho y el hueco sigue ahí.
const saltado = diagnose(mapStatus(N, ['u1', 'u4'], null))
check('detecta un tema terminado por encima de cimientos sin cerrar',
  saltado.blocked.some((b) => b.row.node.id === 'alto'))
check('y dice exactamente qué falta',
  saltado.blocked.find((b) => b.row.node.id === 'alto').missing[0].node.id === 'medio')
check('sabe que ese ya lo das por cerrado',
  saltado.blocked.find((b) => b.row.node.id === 'alto').row.complete)

// Y el caso corriente: empezado, a medias, con la base sin terminar.
const N4 = [...N, { id: 'top', t: 'Top', units: ['u5', 'u6'], needs: ['alto'], why: { alto: 'porque sí' } }]
const aMediasSinBase = diagnose(mapStatus(N4, ['u5'], null))
check('detecta haber empezado algo con los cimientos a medias',
  aMediasSinBase.blocked.some((b) => b.row.node.id === 'top' && !b.row.complete))
check('lo ya cerrado sale antes que lo que está a medias',
  diagnose(mapStatus(N4, ['u1', 'u4', 'u5'], null)).blocked[0].row.node.id === 'alto',
  diagnose(mapStatus(N4, ['u1', 'u4', 'u5'], null)).blocked.map((b) => b.row.node.id).join())

const limpio = mapStatus(N, ['u1', 'u2'], [topic('Base', 4, 4)])
const d2 = diagnose(limpio)
check('sin nada que reprochar no inventa avisos', d2.weak.length === 0 && d2.blocked.length === 0)
check('propone lo siguiente sin deudas', d2.next.node.id === 'medio', d2.next && d2.next.node.id)

const todoHecho = mapStatus(N, ['u1', 'u2', 'u3', 'u4'], [topic('Base', 4, 4), topic('Medio', 4, 4), topic('Alto', 4, 4)])
check('con todo hecho ya no propone nada', diagnose(todoHecho).next === null)

// Varios temas flojos: primero el de más abajo, porque arreglar el
// cimiento suele arreglar también lo que se apoya en él.
const dosFlojos = mapStatus(N, ['u1', 'u2', 'u3'], [topic('Base', 4, 1), topic('Medio', 4, 0)])
check('con dos temas flojos señala primero el de abajo', diagnose(dosFlojos).weak[0].row.node.id === 'base',
  diagnose(dosFlojos).weak.map((w) => w.row.node.id).join())
check('y no se olvida del otro', diagnose(dosFlojos).weak[1].row.node.id === 'medio')

// Entre dos del mismo nivel manda el que peor vaya.
const M = [
  { id: 'x', t: 'X', g: 'X', units: ['u1'], needs: [] },
  { id: 'y', t: 'Y', g: 'Y', units: ['u2'], needs: [] }
]
check('a igual nivel, primero el que peor va',
  diagnose(mapStatus(M, ['u1', 'u2'], [topic('X', 4, 1), topic('Y', 4, 0)])).weak[0].row.node.id === 'y')

// Terminar lo empezado va antes que abrir un tema nuevo.
const N4b = N4
const aMediasYUnoLibre = mapStatus(N4b, ['u1'], null)
check('propone terminar lo empezado antes que abrir otro',
  diagnose(aMediasYUnoLibre).next.node.id === 'base', diagnose(aMediasYUnoLibre).next.node.id)

// ---------- dibujo
check('parte una etiqueta larga en dos líneas',
  JSON.stringify(wrapLabel('Programación lineal')) === JSON.stringify(['Programación', 'lineal']))
check('una corta se queda en una línea', wrapLabel('Grafos').length === 1)
check('nunca pasa de dos líneas', wrapLabel('uno dos tres cuatro cinco seis siete').length === 2)
check('no parte una palabra por la mitad', wrapLabel('Combinacionales')[0] === 'Combinacionales')

const geo = placeNodes(layoutMap(A).map((f) => f.map((n) => ({ node: n }))))
check('todos los temas tienen sitio', geo.pos.size === A.length)
check('el lienzo tiene tamaño', geo.width > 0 && geo.height > 0)
check('cada nivel va más abajo que el anterior',
  geo.pos.get('grafos').y > geo.pos.get('logica').y)
check('dos temas del mismo nivel no se pisan',
  Math.abs(geo.pos.get('logica').x - geo.pos.get('matrices').x) >= 128)
check('las filas van centradas',
  Math.abs((geo.pos.get('grafos').x + 128 / 2) - geo.width / 2) < 1,
  String(geo.pos.get('grafos').x))

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
