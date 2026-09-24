// Los procedimientos («Cómo se hace»): coherencia de los datos, que
// nada apunte al vacío, y el orden en que se ofrecen.
//
// La comprobación que más importa es que cada procedimiento enlace con
// problemas que existen y con un tema que existe: una receta que no se
// puede aplicar a nada es un texto bonito, no una funcionalidad.
import { PROCEDURES, proceduresFor } from '../src/data/procedures/index.js'
import { PROCEDURE_SUBJECTS, hasProcedures } from '../src/data/procedures/meta.js'
import {
  groupProcedures, topicsOf, procedureStatus, sortProcedures, stuckOn, proceduresForTopic
} from '../src/lib/procedures.js'
import { PRACTICE, attemptKey } from '../src/data/practice/index.js'
import { CURRICULUM } from '../src/data/curriculum.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const SUBJECT_IDS = new Set(CURRICULUM.map((s) => s.id))
const ALL = Object.entries(PROCEDURES).flatMap(([s, list]) => list.map((p) => ({ s, p })))

// ---------- meta y datos no se separan
check('meta y datos cubren las mismas asignaturas',
  JSON.stringify([...PROCEDURE_SUBJECTS].sort()) === JSON.stringify(Object.keys(PROCEDURES).sort()),
  `${PROCEDURE_SUBJECTS.join(', ')} vs ${Object.keys(PROCEDURES).join(', ')}`)
check('las asignaturas con procedimientos existen en el plan',
  PROCEDURE_SUBJECTS.every((s) => SUBJECT_IDS.has(s)))
check('hasProcedures acierta', hasProcedures('algebra') && !hasProcedures('calculo'))
check('proceduresFor devuelve null donde no hay', proceduresFor('calculo') === null)

// ---------- forma de los datos
check('hay procedimientos', ALL.length >= 20, String(ALL.length))
for (const s of PROCEDURE_SUBJECTS) {
  check(`${s} tiene varios procedimientos`, PROCEDURES[s].length >= 5, String(PROCEDURES[s].length))
  const ids = PROCEDURES[s].map((p) => p.id)
  check(`${s}: ids únicos`, new Set(ids).size === ids.length)
}
check('todos tienen id, nombre y tema', ALL.every(({ p }) => p.id && p.t && p.g))

// Los tres campos que justifican la funcionalidad. Sin «when» esto es
// un formulario de pasos; sin «trap» es el libro de texto otra vez.
for (const campo of ['when', 'trap']) {
  const flojos = ALL.filter(({ p }) => !p[campo] || p[campo].length < 120).map(({ p }) => p.id)
  check(`todos explican «${campo}» con sustancia`, flojos.length === 0, flojos.join(', '))
}

// ---------- los pasos
const pocosPasos = ALL.filter(({ p }) => !Array.isArray(p.steps) || p.steps.length < 3).map(({ p }) => p.id)
check('todos tienen al menos tres pasos', pocosPasos.length === 0, pocosPasos.join(', '))
const pasoVacio = ALL.filter(({ p }) => (p.steps || []).some((st) => !st.s || st.s.length < 20)).map(({ p }) => p.id)
check('ningún paso está vacío', pasoVacio.length === 0, pasoVacio.join(', '))
// La nota de cada paso es donde va el «dónde se tuerce» fino. Un paso
// sin ella es la receta que ya está en cualquier apunte.
const sinNotas = ALL.filter(({ p }) => (p.steps || []).filter((st) => st.note && st.note.length >= 40).length < 3)
  .map(({ p }) => p.id)
check('los pasos vienen anotados', sinNotas.length === 0, sinNotas.join(', '))

// ---------- el ejemplo
const malEj = ALL.filter(({ p }) => !p.ex || !p.ex.q || !Array.isArray(p.ex.walk) || p.ex.walk.length < 3)
  .map(({ p }) => p.id)
check('todos traen un ejemplo desarrollado', malEj.length === 0, malEj.join(', '))

// ---------- los enlaces apuntan a sitios que existen
const malProblema = []
const malTema = []
for (const { s, p } of ALL) {
  const problemas = PRACTICE[s] || []
  const idsProblema = new Set(problemas.map((x) => x.id))
  const temas = new Set(problemas.map((x) => x.g))
  for (const pid of p.see || []) if (!idsProblema.has(pid)) malProblema.push(`${p.id}→${pid}`)
  if (!temas.has(p.g)) malTema.push(`${p.id}→${p.g}`)
}
check('los problemas enlazados existen', malProblema.length === 0, malProblema.join(', '))
check('el tema de cada procedimiento existe en su práctica', malTema.length === 0, malTema.join(', '))

// Un procedimiento sin problemas no se puede practicar. Se admiten
// algunos (no todo tema tiene problemas todavía), pero no la mayoría:
// si lo fueran, la pestaña sería otro texto para leer y nada más.
const sueltos = ALL.filter(({ p }) => !p.see || p.see.length === 0)
check('la mayoría enlaza con problemas', sueltos.length * 2 < ALL.length,
  `${sueltos.length} de ${ALL.length} sin enlazar`)

// ---------- agrupar por tema
const grupos = groupProcedures(PROCEDURES.algebra)
check('agrupar no pierde ni duplica nada',
  grupos.reduce((a, g) => a + g.items.length, 0) === PROCEDURES.algebra.length)
check('cada grupo tiene un tema distinto',
  new Set(grupos.map((g) => g.g)).size === grupos.length)
check('topicsOf no repite', topicsOf(PROCEDURES.algebra).length === grupos.length)
check('agrupar una lista vacía no revienta', groupProcedures([]).length === 0)

// ---------- estado a partir de lo que llevas hecho
const induccion = PROCEDURES.algebra.find((p) => p.id === 'induccion')
check('el procedimiento de inducción existe y tiene problemas', !!induccion && induccion.see.length >= 2)

const sinIntentos = procedureStatus(induccion, {}, 'algebra')
check('sin intentos no hay ni hechos ni fallados',
  sinIntentos.done === 0 && sinIntentos.failed === 0 && sinIntentos.linked === induccion.see.length)

const intentos = {
  [attemptKey('algebra', induccion.see[0])]: { ok: 0, fail: 2, last: 'fail' },
  [attemptKey('algebra', induccion.see[1])]: { ok: 1, fail: 0, last: 'ok' }
}
const conIntentos = procedureStatus(induccion, intentos, 'algebra')
check('cuenta bien hechos y fallados', conIntentos.done === 2 && conIntentos.failed === 1,
  JSON.stringify(conIntentos))

// Un intento de OTRA asignatura con el mismo id de problema no puede
// contarse aquí: la clave lleva la asignatura justo por eso.
const ajenos = { [attemptKey('tec-comp', induccion.see[0])]: { ok: 0, fail: 1, last: 'fail' } }
check('no cuenta intentos de otra asignatura', procedureStatus(induccion, ajenos, 'algebra').done === 0)

// ---------- orden
const ordenados = sortProcedures(PROCEDURES.algebra, intentos, 'algebra')
check('lo que estás fallando va primero', ordenados[0].id === 'induccion', ordenados[0].id)
const sinDatos = sortProcedures(PROCEDURES.algebra, {}, 'algebra')
check('sin datos tuyos se respeta el orden del fichero',
  JSON.stringify(sinDatos.map((p) => p.id)) === JSON.stringify(PROCEDURES.algebra.map((p) => p.id)))
check('ordenar no muta la lista original', PROCEDURES.algebra[0].id === sinDatos[0].id)
check('ordenar no pierde procedimientos', ordenados.length === PROCEDURES.algebra.length)

// ---------- lo que se te atraganta
check('sin fallos no se inventa una urgencia', stuckOn('algebra', {}) === null)
const atasco = stuckOn('algebra', intentos)
check('señala el procedimiento fallado', atasco && atasco.procedure.id === 'induccion')
check('y con cuántos fallos', atasco && atasco.status.failed === 1, JSON.stringify(atasco && atasco.status))
check('en una asignatura sin procedimientos devuelve null', stuckOn('calculo', intentos) === null)

// Con dos procedimientos fallados manda el que más pesa, no el primero
// del fichero: es lo que hace útil el aviso.
const gauss = PROCEDURES.algebra.find((p) => p.id === 'gauss')
const dobles = {
  ...intentos,
  [attemptKey('algebra', gauss.see[0])]: { ok: 0, fail: 1, last: 'fail' },
  [attemptKey('algebra', gauss.see[1])]: { ok: 0, fail: 1, last: 'fail' }
}
check('con varios fallados gana el que más', stuckOn('algebra', dobles).procedure.id === 'gauss')

// ---------- el puente desde la práctica
const deInduccion = proceduresForTopic('algebra', 'Inducción')
check('desde un tema se llega a su procedimiento',
  deInduccion.length >= 1 && deInduccion.every((p) => p.g === 'Inducción'))
check('un tema inexistente no devuelve nada', proceduresForTopic('algebra', 'Topología').length === 0)
check('sin tema no devuelve nada', proceduresForTopic('algebra', null).length === 0)
check('una asignatura sin procedimientos no devuelve nada',
  proceduresForTopic('calculo', 'Inducción').length === 0)

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
