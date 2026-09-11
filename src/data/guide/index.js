// Guía de estudio de NÚCLEO
// Contenido curado por asignatura: temario orientativo, cómo abordarla,
// recursos (teoría, cursos, vídeo, libros, práctica, herramientas) y
// el laboratorio o entorno de prácticas recomendado.
// Este módulo es pesado: impórtalo solo desde componentes cargados bajo
// demanda (React.lazy). Los metadatos ligeros están en meta.js.
import { YEAR1 } from './year1.js'
import { YEAR2 } from './year2.js'
import { YEAR3 } from './year3.js'

export * from './meta.js'

export const GUIDE = { ...YEAR1, ...YEAR2, ...YEAR3 }

export function guideFor(subjectId) {
  return GUIDE[subjectId] || null
}
