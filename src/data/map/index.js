// Mapas de dependencias entre temas, por asignatura.
//
// Para dar de alta otra asignatura basta con crear su fichero y
// ponerlo aquí; y añadir su id en meta.js, que es lo que consultan los
// sitios que solo necesitan saber si hay mapa. Una prueba comprueba
// que las dos listas no se separen.
import { ALGEBRA_MAP } from './algebra.js'
import { TEC_COMP_MAP } from './tec-comp.js'
import { FUND_PROG_MAP } from './fund-prog.js'

export const MAPS = {
  algebra: ALGEBRA_MAP,
  'tec-comp': TEC_COMP_MAP,
  'fund-prog': FUND_PROG_MAP
}

export function mapFor(subjectId) {
  return MAPS[subjectId] || null
}
