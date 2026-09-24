// ============================================================
// Cómo se hace: los procedimientos de cada asignatura
// ------------------------------------------------------------
// Entre «entiendo el concepto» y «sé resolver el problema» hay un
// escalón que no está escrito en ningún sitio. Los conceptos te dan el
// vocabulario, la práctica te da problemas resueltos, pero cada
// solución es de su problema: nadie te dice, en general, qué se hace
// cuando te ponen delante un sistema, una relación o un enunciado de
// caché. Quien va a clase lo pilla por imitación. Quien estudia solo se
// queda mirando el papel sin saber por dónde empezar, y confunde eso
// con no haber entendido la teoría.
//
// Esto es esa receta. Lo más importante de cada ficha no son los pasos
// sino el «cuándo»: reconocer qué método pide un enunciado es la mitad
// del examen, y es justo lo que no se practica leyendo.
//
// Módulo pesado: impórtalo solo bajo demanda (React.lazy o import()).
// Para añadir otra asignatura basta con crear su fichero, ponerlo aquí
// y añadir el id en meta.js.
import { ALGEBRA_PROCEDURES } from './algebra.js'
import { TEC_COMP_PROCEDURES } from './tec-comp.js'
import { FUND_PROG_PROCEDURES } from './fund-prog.js'

export const PROCEDURES = {
  algebra: ALGEBRA_PROCEDURES,
  'tec-comp': TEC_COMP_PROCEDURES,
  'fund-prog': FUND_PROG_PROCEDURES
}

export function proceduresFor(subjectId) {
  return PROCEDURES[subjectId] || null
}
