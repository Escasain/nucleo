// Qué asignaturas aparecen en algún puente, sin cargar los puentes.
//
// Mismo motivo que en mapa y en práctica: la pestaña solo debe salir
// donde hay algo que enseñar, y averiguarlo no puede costar el módulo
// entero. Una prueba comprueba que esta lista y la de puentes no se
// separen.
export const BRIDGE_SUBJECTS = ['algebra', 'tec-comp', 'fund-prog']

export function hasBridges(subjectId) {
  return BRIDGE_SUBJECTS.includes(subjectId)
}
