// Qué asignaturas tienen problemas, sin cargar los problemas.
//
// Vive aparte del índice a propósito: el módulo de práctica pesa 42 kB
// y hay sitios (el cierre de una sesión de estudio) que solo necesitan
// saber si ofrecer el enlace o no. Una prueba comprueba que esta lista
// y las claves de PRACTICE no se separen nunca.
export const PRACTICE_SUBJECTS = ['algebra', 'tec-comp']

export function hasPractice(subjectId) {
  return PRACTICE_SUBJECTS.includes(subjectId)
}
