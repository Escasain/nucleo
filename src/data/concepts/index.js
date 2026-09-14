// Conceptos clave y trampas por asignatura.
//
// El resto de la guía te dice qué estudiar y con qué. Esto va a otra
// cosa: al vocabulario que bloquea. Cuando una asignatura «no se
// entiende» casi siempre es que hay un puñado de palabras cuyo
// significado exacto se da por sabido, y una serie de confusiones que
// todo el mundo comete y nadie escribe en ningún sitio.
//
// Módulo pesado: impórtalo solo bajo demanda (React.lazy o import()).
// Para añadir otra asignatura basta con crear su fichero y ponerlo
// aquí: no hay que tocar ningún componente.
import { ALGEBRA } from './algebra.js'
import { TEC_COMP } from './tec-comp.js'

export const CONCEPTS = {
  algebra: ALGEBRA,
  'tec-comp': TEC_COMP
}

export function conceptsFor(subjectId) {
  return CONCEPTS[subjectId] || null
}

/** Agrupa los conceptos por su tema, respetando el orden de aparición. */
export function groupConcepts(concepts) {
  const out = []
  for (const c of concepts) {
    let g = out.find((x) => x.g === c.g)
    if (!g) {
      g = { g: c.g, items: [] }
      out.push(g)
    }
    g.items.push(c)
  }
  return out
}

/**
 * Tarjeta de repaso a partir de un concepto.
 *
 * La cara frontal es el término tal cual, sin envolverlo en «¿Qué es…?»:
 * muchos conceptos no son sustantivos («El óptimo está en un vértice»,
 * «Leyes de De Morgan») y la pregunta salía mal construida.
 */
export function cardFromConcept(c) {
  return {
    front: c.t,
    back: c.why ? `${c.d}\n\n${c.why}` : c.d
  }
}
