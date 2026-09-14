// Problemas de práctica por asignatura.
//
// La app planificaba, explicaba y ayudaba a memorizar, pero no había
// dónde practicar. En Álgebra y en Tecnología de Computadores se
// aprueba resolviendo problemas, no releyendo temario: esto es lo que
// faltaba para cerrar ese hueco.
//
// Módulo pesado: impórtalo bajo demanda. Para añadir otra asignatura
// basta con crear su fichero y ponerlo aquí.
import { ALGEBRA_PRACTICE } from './algebra.js'
import { TEC_COMP_PRACTICE } from './tec-comp.js'

export const PRACTICE = {
  algebra: ALGEBRA_PRACTICE,
  'tec-comp': TEC_COMP_PRACTICE
}

export const LEVELS = {
  1: { label: 'básico', className: 'is-l1' },
  2: { label: 'medio', className: 'is-l2' },
  3: { label: 'examen', className: 'is-l3' }
}

export function practiceFor(subjectId) {
  return PRACTICE[subjectId] || null
}

/** Clave con la que se guarda el resultado de un problema. */
export function attemptKey(subjectId, problemId) {
  return `${subjectId}:${problemId}`
}

/** Agrupa por tema respetando el orden de aparición. */
export function groupProblems(problems) {
  const out = []
  for (const pr of problems) {
    let g = out.find((x) => x.g === pr.g)
    if (!g) {
      g = { g: pr.g, items: [] }
      out.push(g)
    }
    g.items.push(pr)
  }
  return out
}

/**
 * Resumen de cómo llevas una asignatura y, sobre todo, en qué tema
 * flojeas. El punto débil es el tema con peor porcentaje de acierto
 * entre los que tengan al menos dos intentos: con uno solo, un fallo
 * daría un 0 % que no significa nada.
 */
export function practiceStats(problems, attempts, subjectId) {
  const byTopic = []
  let done = 0
  let ok = 0
  for (const pr of problems) {
    const a = attempts[attemptKey(subjectId, pr.id)]
    let t = byTopic.find((x) => x.g === pr.g)
    if (!t) {
      t = { g: pr.g, total: 0, done: 0, ok: 0 }
      byTopic.push(t)
    }
    t.total++
    if (!a || !a.last) continue
    done++
    t.done++
    if (a.last === 'ok') {
      ok++
      t.ok++
    }
  }
  const weak = byTopic
    .filter((t) => t.done >= 2)
    .sort((a, b) => a.ok / a.done - b.ok / b.done)[0]
  return {
    total: problems.length,
    done,
    ok,
    rate: done > 0 ? ok / done : null,
    byTopic,
    weak: weak && weak.ok / weak.done < 0.7 ? weak : null
  }
}
