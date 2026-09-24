// Lógica de los puentes entre asignaturas.
//
// Aparte para que se pueda probar sin navegador: aquí no se pinta nada,
// solo se decide qué puente es relevante ahora mismo y en qué orden
// merece la pena leerlos.
import { BRIDGES } from '../data/bridges/index.js'

// Una asignatura «activa» es una en la que puedes actuar hoy. Suspensa
// entra: es en la que más falta hace entender, no menos.
export const ACTIVE_STATUS = ['cursando', 'matriculada', 'suspensa']
export const DONE_STATUS = ['aprobada', 'reconocida']

/**
 * En qué situación está el extremo de un puente para ti.
 *
 *   activa → la estás dando; el puente sirve ya
 *   hecha  → ya la aprobaste; es el lado del que puedes tirar
 *   lejos  → aún no la has empezado
 */
export function endStatus(subjectId, subjects = {}) {
  const st = subjects[subjectId] && subjects[subjectId].status
  if (ACTIVE_STATUS.includes(st)) return 'activa'
  if (DONE_STATUS.includes(st)) return 'hecha'
  return 'lejos'
}

/** Los puentes que tocan una asignatura, en el orden en que están escritos. */
export function bridgesFor(subjectId) {
  if (!subjectId) return []
  return BRIDGES.filter((b) => b.ends.some((e) => e.s === subjectId))
}

/** Los extremos que NO son la asignatura desde la que miras. */
export function otherEnds(bridge, subjectId) {
  return bridge.ends.filter((e) => e.s !== subjectId)
}

/** Las asignaturas distintas que aparecen en un puente, sin repetir. */
export function subjectsOf(bridge) {
  const out = []
  for (const e of bridge.ends) if (!out.includes(e.s)) out.push(e.s)
  return out
}

/** Todas las asignaturas que aparecen en algún puente, sin repetir. */
export function subjectsInBridges(list = BRIDGES) {
  const out = []
  for (const b of list) for (const s of subjectsOf(b)) if (!out.includes(s)) out.push(s)
  return out
}

/**
 * Cuánto te alcanza un puente ahora mismo.
 *
 * Se cuenta por asignaturas distintas, no por extremos: un puente con
 * dos extremos en Fundamentos no llega a más sitios que uno con uno
 * solo, y ordenar por extremos lo colocaría por delante sin motivo.
 */
export function bridgeReach(bridge, subjects = {}) {
  let live = 0
  let done = 0
  const all = subjectsOf(bridge)
  for (const s of all) {
    const st = endStatus(s, subjects)
    if (st === 'activa') live += 1
    else if (st === 'hecha') done += 1
  }
  return { live, done, total: all.length }
}

/**
 * Ordena los puentes por lo que te sirven hoy.
 *
 * Primero los que unen más asignaturas que tienes entre manos: ver que
 * dos cosas que estás estudiando esta semana son la misma vale mucho
 * más que enterarte de una conexión con algo de dentro de dos años.
 * Luego los que se apoyan en asignaturas ya aprobadas. A igualdad, se
 * respeta el orden del fichero, que está puesto a mano.
 */
export function sortBridges(list, subjects = {}) {
  return list
    .map((b, i) => ({ b, i, r: bridgeReach(b, subjects) }))
    .sort((x, y) => y.r.live - x.r.live || y.r.done - x.r.done || x.i - y.i)
    .map((x) => x.b)
}

/**
 * Los puentes que unen dos asignaturas que estás dando a la vez.
 *
 * Es el caso que justifica la funcionalidad entera, y el que conviene
 * enseñar primero: la idea que se te está apareciendo dos veces esta
 * misma semana sin que nadie te haya dicho que era la misma.
 */
export function liveBridges(subjects = {}, list = BRIDGES) {
  return list.filter((b) => bridgeReach(b, subjects).live >= 2)
}
