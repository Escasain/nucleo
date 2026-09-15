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
import { FUND_PROG_PRACTICE } from './fund-prog.js'

export const PRACTICE = {
  algebra: ALGEBRA_PRACTICE,
  'tec-comp': TEC_COMP_PRACTICE,
  'fund-prog': FUND_PROG_PRACTICE
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
 * flojeas.
 *
 * «A la primera» se mira con los contadores, no con el último
 * resultado: un problema con {ok:1, fail:1, last:'ok'} lo acabaste
 * sacando, pero no a la primera, y contarlo como tal daría un 100 %
 * falso. Es `fail === 0` lo que distingue haberlo tenido de haberlo
 * recuperado.
 *
 * «Pendientes» es otra cosa distinta y también útil: los que ahora
 * mismo tienes fallados, o sea sobre los que hay que volver.
 *
 * El punto débil es el tema con peor porcentaje a la primera entre los
 * que tengan al menos dos intentos: con uno solo, un fallo daría un 0 %
 * que no significa nada.
 */
export function practiceStats(problems, attempts, subjectId) {
  const byTopic = []
  let done = 0
  let okFirst = 0
  let pending = 0
  for (const pr of problems) {
    const a = attempts[attemptKey(subjectId, pr.id)]
    let t = byTopic.find((x) => x.g === pr.g)
    if (!t) {
      t = { g: pr.g, total: 0, done: 0, okFirst: 0, pending: 0 }
      byTopic.push(t)
    }
    t.total++
    if (!a || !a.last) continue
    done++
    t.done++
    if (!a.fail) {
      okFirst++
      t.okFirst++
    }
    if (a.last === 'fail') {
      pending++
      t.pending++
    }
  }
  const weak = byTopic
    .filter((t) => t.done >= 2)
    .sort((a, b) => a.okFirst / a.done - b.okFirst / b.done)[0]
  return {
    total: problems.length,
    done,
    okFirst,
    pending,
    rate: done > 0 ? okFirst / done : null,
    byTopic,
    weak: weak && weak.okFirst / weak.done < 0.7 ? weak : null
  }
}
