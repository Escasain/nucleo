// Qué asignaturas tienen procedimientos, sin cargarlos.
//
// Mismo motivo que en mapa, práctica y conexiones: la pestaña solo debe
// salir donde hay algo que enseñar, y averiguarlo no puede costar el
// módulo entero. Una prueba comprueba que esta lista y la de
// procedimientos no se separen.
export const PROCEDURE_SUBJECTS = ['algebra', 'tec-comp', 'fund-prog']

export function hasProcedures(subjectId) {
  return PROCEDURE_SUBJECTS.includes(subjectId)
}
