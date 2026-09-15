// Qué asignaturas tienen mapa, sin cargar los mapas.
//
// Mismo motivo que en práctica: la pestaña solo debe aparecer donde hay
// algo que enseñar, y saberlo no puede costar el módulo entero.
export const MAP_SUBJECTS = ['algebra', 'tec-comp']

export function hasMap(subjectId) {
  return MAP_SUBJECTS.includes(subjectId)
}
