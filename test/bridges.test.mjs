// Los puentes entre asignaturas: coherencia de los datos, que ningún
// extremo apunte al vacío, y el orden en que se enseñan.
import { BRIDGES } from '../src/data/bridges/index.js'
import { BRIDGE_SUBJECTS, hasBridges } from '../src/data/bridges/meta.js'
import {
  endStatus, bridgesFor, otherEnds, subjectsOf, subjectsInBridges,
  bridgeReach, sortBridges, liveBridges
} from '../src/lib/bridges.js'
import { CURRICULUM, INITIAL_SUBJECT_STATE } from '../src/data/curriculum.js'
import { MAPS } from '../src/data/map/index.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const SUBJECT_IDS = new Set(CURRICULUM.map((s) => s.id))

// ---------- forma de los datos
check('hay puentes', BRIDGES.length >= 5, String(BRIDGES.length))
const ids = BRIDGES.map((b) => b.id)
check('ids únicos', new Set(ids).size === ids.length)
check('todos tienen título e idea', BRIDGES.every((b) => b.t && b.idea))

// Un puente con un solo extremo no une nada: sería un concepto suelto,
// y para eso ya está la pestaña de conceptos.
const cortos = BRIDGES.filter((b) => subjectsOf(b).length < 2).map((b) => b.id)
check('todo puente une al menos dos asignaturas', cortos.length === 0, cortos.join(', '))

// Las tres partes que justifican la funcionalidad. Sin «breaks» esto
// sería una lista de analogías bonitas, que es justo lo que hace daño.
for (const campo of ['same', 'breaks', 'check']) {
  const flojos = BRIDGES.filter((b) => !b[campo] || b[campo].length < 120).map((b) => b.id)
  check(`todos explican «${campo}» con sustancia`, flojos.length === 0, flojos.join(', '))
}

// ---------- los extremos apuntan a sitios que existen
const malaAsig = []
const malNodo = []
const sinComo = []
for (const b of BRIDGES) {
  for (const e of b.ends) {
    if (!SUBJECT_IDS.has(e.s)) malaAsig.push(`${b.id}→${e.s}`)
    // El tema tiene que existir en el mapa de esa asignatura: si no, el
    // enlace lleva a un mapa donde no está lo que se acaba de nombrar.
    const nodos = MAPS[e.s]
    if (nodos && !nodos.some((n) => n.id === e.node)) malNodo.push(`${b.id}: ${e.s}/${e.node}`)
    if (!e.as || !e.how || e.how.length < 30) sinComo.push(`${b.id}/${e.s}`)
  }
  for (const l of b.later || []) {
    if (!SUBJECT_IDS.has(l.s)) malaAsig.push(`${b.id} later→${l.s}`)
    if (!l.how || l.how.length < 40) sinComo.push(`${b.id} later/${l.s}`)
  }
}
check('toda asignatura nombrada existe en el plan', malaAsig.length === 0, malaAsig.join(', '))
check('todo extremo apunta a un tema real del mapa', malNodo.length === 0, malNodo.join(', '))
check('todo extremo dice qué forma toma allí', sinComo.length === 0, sinComo.join(', '))

// Mirar hacia delante solo tiene sentido hacia asignaturas que aún no
// estás dando: un «vuelve a salir en» a una de las de ahora es un error
// de redacción, y el extremo debería ser un end normal.
const yaEs = []
for (const b of BRIDGES) {
  for (const l of b.later || []) if (subjectsOf(b).includes(l.s)) yaEs.push(`${b.id}/${l.s}`)
}
check('«vuelve a salir en» no repite un extremo', yaEs.length === 0, yaEs.join(', '))

// ---------- meta.js no puede separarse de los datos
check('meta y datos coinciden',
  JSON.stringify([...BRIDGE_SUBJECTS].sort()) === JSON.stringify([...subjectsInBridges()].sort()),
  `${BRIDGE_SUBJECTS} vs ${subjectsInBridges()}`)
check('hasBridges acierta con las que sí', hasBridges('algebra') && hasBridges('tec-comp') && hasBridges('fund-prog'))
check('hasBridges acierta con las que no', !hasBridges('ipo') && !hasBridges('redes'))

// ---------- selección por asignatura
for (const sid of BRIDGE_SUBJECTS) {
  const list = bridgesFor(sid)
  check(`${sid}: tiene al menos un puente`, list.length > 0)
  check(`${sid}: todos los devueltos la tocan`, list.every((b) => b.ends.some((e) => e.s === sid)))
  check(`${sid}: otherEnds nunca devuelve la propia`,
    list.every((b) => otherEnds(b, sid).every((e) => e.s !== sid)))
  check(`${sid}: otherEnds deja algo que enseñar`, list.every((b) => otherEnds(b, sid).length > 0))
}
check('bridgesFor con asignatura sin puentes da lista vacía', bridgesFor('ipo').length === 0)
check('bridgesFor sin argumento no revienta', bridgesFor(null).length === 0)

// subjectsOf no repite aunque el puente tenga dos extremos en la misma
// asignatura, que es el caso de «equivalencia» y «memoria».
const dosEnUna = BRIDGES.find((b) => b.ends.length > subjectsOf(b).length)
check('hay algún puente con dos extremos en la misma asignatura', Boolean(dosEnUna), String(dosEnUna && dosEnUna.id))
if (dosEnUna) {
  check('subjectsOf no repite asignatura',
    new Set(subjectsOf(dosEnUna)).size === subjectsOf(dosEnUna).length)
  check('bridgesFor no lo devuelve dos veces',
    bridgesFor(dosEnUna.ends[0].s).filter((b) => b.id === dosEnUna.id).length === 1)
}

// ---------- estado de cada extremo
const estados = {
  algebra: { status: 'cursando' },
  'tec-comp': { status: 'aprobada' },
  'fund-prog': { status: 'matriculada' },
  calculo: { status: 'pendiente' }
}
check('cursando cuenta como activa', endStatus('algebra', estados) === 'activa')
check('matriculada cuenta como activa', endStatus('fund-prog', estados) === 'activa')
check('aprobada cuenta como hecha', endStatus('tec-comp', estados) === 'hecha')
check('pendiente queda lejos', endStatus('calculo', estados) === 'lejos')
check('desconocida queda lejos', endStatus('redes', estados) === 'lejos')
check('sin estados no revienta', endStatus('algebra') === 'lejos')
// Suspensa es donde más falta hace entender: no puede quedarse fuera.
check('suspensa cuenta como activa', endStatus('x', { x: { status: 'suspensa' } }) === 'activa')

// ---------- alcance y orden
const boole = BRIDGES.find((b) => b.id === 'boole')
const alcance = bridgeReach(boole, estados)
check('el alcance cuenta las activas', alcance.live === 2, JSON.stringify(alcance))
check('el alcance cuenta las hechas', alcance.done === 1, JSON.stringify(alcance))
check('el alcance suma el total', alcance.total === 3, JSON.stringify(alcance))

// El alcance se mide en asignaturas, no en extremos: un puente con dos
// extremos en la misma asignatura no llega más lejos por ello.
if (dosEnUna) {
  const r = bridgeReach(dosEnUna, estados)
  check('el alcance no infla con extremos repetidos',
    r.total === subjectsOf(dosEnUna).length && r.total < dosEnUna.ends.length,
    JSON.stringify(r))
}

const soloAlgebra = { algebra: { status: 'cursando' } }
const orden = sortBridges(BRIDGES, estados)
check('ordenar no pierde ni duplica puentes',
  orden.length === BRIDGES.length && new Set(orden.map((b) => b.id)).size === BRIDGES.length)
const alcances = orden.map((b) => bridgeReach(b, estados).live)
check('los que unen más asignaturas de ahora van primero',
  alcances.every((v, i) => i === 0 || alcances[i - 1] >= v), alcances.join(','))

// A igualdad de alcance se respeta el orden del fichero, que está
// puesto a mano: sin eso, el orden cambiaría sin motivo entre renders.
const empatados = sortBridges(BRIDGES, {})
check('sin datos tuyos se respeta el orden del fichero',
  JSON.stringify(empatados.map((b) => b.id)) === JSON.stringify(BRIDGES.map((b) => b.id)))
check('ordenar no muta la lista original',
  JSON.stringify(BRIDGES.map((b) => b.id)) === JSON.stringify(ids))

// ---------- los puentes vivos, que son el motivo de todo esto
const vivos = liveBridges(estados)
check('los vivos unen dos asignaturas activas', vivos.every((b) => bridgeReach(b, estados).live >= 2))
check('con una sola asignatura activa no hay vivos', liveBridges(soloAlgebra).length === 0)
check('sin datos tuyos no hay vivos', liveBridges({}).length === 0)

// Con las asignaturas que Carlos tiene de verdad, la funcionalidad
// tiene que enseñar algo: si el reparto inicial no produce ni un
// puente vivo, la vista abre en frío y no sirve para lo que se hizo.
const reales = liveBridges(INITIAL_SUBJECT_STATE)
check('con las asignaturas reales hay puentes vivos', reales.length >= 3,
  `${reales.length}: ${reales.map((b) => b.id).join(', ')}`)

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
