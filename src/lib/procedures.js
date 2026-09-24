// Lógica de los procedimientos («Cómo se hace»).
//
// Aparte para que se pueda probar sin navegador: aquí no se pinta nada,
// solo se decide qué receta te hace falta ahora mismo y en qué orden
// merece la pena leerlas.
//
// La idea que justifica todo el fichero: los problemas que has fallado
// dicen qué procedimiento no tienes. Si fallas tres de inducción, lo
// que te falta no es leer más teoría, es el método. Así que el orden
// no es el del temario, es el de lo que se te está atragantando.
import { proceduresFor } from '../data/procedures/index.js'
import { attemptKey } from '../data/practice/index.js'

/** Agrupa los procedimientos por tema, respetando el orden de aparición. */
export function groupProcedures(list = []) {
  const out = []
  for (const p of list) {
    let g = out.find((x) => x.g === p.g)
    if (!g) {
      g = { g: p.g, items: [] }
      out.push(g)
    }
    g.items.push(p)
  }
  return out
}

/** Los temas distintos que cubre una lista de procedimientos. */
export function topicsOf(list = []) {
  const out = []
  for (const p of list) if (!out.includes(p.g)) out.push(p.g)
  return out
}

/**
 * Cómo llevas los problemas que usan este procedimiento.
 *
 *   linked → cuántos problemas tiene enlazados
 *   done   → en cuántos has marcado un resultado
 *   failed → en cuántos el último intento fue un fallo
 *
 * Un procedimiento sin problemas enlazados devuelve todo a cero: no es
 * que lo lleves bien, es que no hay con qué medirlo, y quien lo use
 * tiene que poder distinguir las dos cosas.
 */
export function procedureStatus(proc, attempts = {}, subjectId) {
  const ids = Array.isArray(proc.see) ? proc.see : []
  let done = 0
  let failed = 0
  for (const pid of ids) {
    const a = attempts[attemptKey(subjectId, pid)]
    if (!a || !a.last) continue
    done += 1
    if (a.last === 'fail') failed += 1
  }
  return { linked: ids.length, done, failed }
}

/**
 * Ordena los procedimientos por lo que te hacen falta hoy.
 *
 * Primero aquellos cuyos problemas estás fallando: es literalmente la
 * receta que no tienes. A igualdad, se respeta el orden del fichero,
 * que está puesto a mano y va de lo básico a lo que se apoya en ello.
 */
export function sortProcedures(list = [], attempts = {}, subjectId) {
  return list
    .map((p, i) => ({ p, i, s: procedureStatus(p, attempts, subjectId) }))
    .sort((x, y) => y.s.failed - x.s.failed || x.i - y.i)
    .map((x) => x.p)
}

/**
 * El procedimiento que más se te está atragantando ahora mismo, si hay
 * alguno. Devuelve null cuando no has fallado nada: entonces no hay
 * nada que destacar y la pantalla no debe inventarse una urgencia.
 */
export function stuckOn(subjectId, attempts = {}) {
  const list = proceduresFor(subjectId)
  if (!list) return null
  let best = null
  for (const p of list) {
    const s = procedureStatus(p, attempts, subjectId)
    if (s.failed === 0) continue
    if (!best || s.failed > best.status.failed) best = { procedure: p, status: s }
  }
  return best
}

/**
 * Los procedimientos de un tema concreto.
 *
 * El puente desde la práctica: cuando fallas un problema de «Sistemas»,
 * esto es lo que había que saber hacer.
 */
export function proceduresForTopic(subjectId, topic) {
  const list = proceduresFor(subjectId)
  if (!list || !topic) return []
  return list.filter((p) => p.g === topic)
}
