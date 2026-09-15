// Pruebas del módulo de práctica: estadísticas, coherencia de los datos
// y verificación mecánica de las soluciones que se pueden comprobar.
import { PRACTICE, practiceStats, attemptKey, groupProblems, LEVELS } from '../src/data/practice/index.js'
import { PRACTICE_SUBJECTS, hasPractice } from '../src/data/practice/meta.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

// ---------- coherencia de los datos
check('hay problemas de Álgebra', PRACTICE.algebra.length >= 25, String(PRACTICE.algebra.length))
check('hay problemas de TC', PRACTICE['tec-comp'].length >= 20, String(PRACTICE['tec-comp'].length))
check('hay problemas de FP', PRACTICE['fund-prog'].length >= 25, String(PRACTICE['fund-prog'].length))

for (const [sid, list] of Object.entries(PRACTICE)) {
  const ids = list.map((p) => p.id)
  check(`${sid}: ids únicos`, new Set(ids).size === ids.length, `${ids.length} → ${new Set(ids).size}`)
  check(`${sid}: todos tienen enunciado, pista y solución`,
    list.every((p) => p.q && p.hint && p.a && p.g), String(list.filter((p) => !(p.q && p.hint && p.a && p.g)).length))
  check(`${sid}: todos tienen nivel válido`, list.every((p) => LEVELS[p.level]))
  check(`${sid}: las soluciones son sustanciales`,
    list.every((p) => p.a.length > 120), String(list.filter((p) => p.a.length <= 120).map((p) => p.id)))
  check(`${sid}: la pista no es la solución`, list.every((p) => p.hint.length < p.a.length))
  check(`${sid}: hay problemas de los tres niveles`,
    new Set(list.map((p) => p.level)).size === 3, JSON.stringify([...new Set(list.map((p) => p.level))]))
}

// La lista ligera y los datos reales no pueden separarse (hallazgo de
// Codex en el PR #7: el enlace a practicar se mostraba en asignaturas
// que no tienen problemas).
check('meta y datos coinciden',
  JSON.stringify([...PRACTICE_SUBJECTS].sort()) === JSON.stringify(Object.keys(PRACTICE).sort()),
  `${PRACTICE_SUBJECTS} vs ${Object.keys(PRACTICE)}`)
check('hasPractice acierta con las que sí',
  hasPractice('algebra') && hasPractice('tec-comp') && hasPractice('fund-prog'))
check('hasPractice acierta con las que no', !hasPractice('redes') && !hasPractice('calculo'))

// ---------- agrupación
const grupos = groupProblems(PRACTICE.algebra)
check('agrupa por tema', grupos.length >= 6, String(grupos.length))
check('no pierde ningún problema',
  grupos.reduce((a, g) => a + g.items.length, 0) === PRACTICE.algebra.length)
check('respeta el orden de aparición', grupos[0].g === PRACTICE.algebra[0].g)

// ---------- estadísticas
const P = [
  { id: 'a1', g: 'Uno', level: 1, q: 'q', hint: 'h', a: 'a' },
  { id: 'a2', g: 'Uno', level: 1, q: 'q', hint: 'h', a: 'a' },
  { id: 'b1', g: 'Dos', level: 1, q: 'q', hint: 'h', a: 'a' },
  { id: 'b2', g: 'Dos', level: 1, q: 'q', hint: 'h', a: 'a' },
  { id: 'c1', g: 'Tres', level: 1, q: 'q', hint: 'h', a: 'a' }
]
const at = (o) => {
  const m = {}
  for (const [id, v] of Object.entries(o)) m[attemptKey('x', id)] = v
  return m
}

const vacio = practiceStats(P, {}, 'x')
check('sin intentos: nada hecho', vacio.done === 0 && vacio.okFirst === 0)
check('sin intentos no hay porcentaje', vacio.rate === null)
check('sin intentos no hay punto flojo', vacio.weak === null)
check('cuenta el total de problemas', vacio.total === 5)
check('los temas aparecen aunque no se hayan tocado', vacio.byTopic.length === 3)

// CLAVE (hallazgo de Codex): recuperado no es «a la primera»
const recuperado = practiceStats(P, at({ a1: { ok: 1, fail: 1, last: 'ok' } }), 'x')
check('un problema recuperado cuenta como hecho', recuperado.done === 1)
check('pero NO como sacado a la primera', recuperado.okFirst === 0, String(recuperado.okFirst))
check('y el porcentaje no dice 100 %', recuperado.rate === 0, String(recuperado.rate))
check('recuperado ya no está pendiente', recuperado.pending === 0)

const limpio = practiceStats(P, at({ a1: { ok: 1, fail: 0, last: 'ok' } }), 'x')
check('acertado sin fallos sí cuenta a la primera', limpio.okFirst === 1 && limpio.rate === 1)

const fallado = practiceStats(P, at({ a1: { ok: 0, fail: 2, last: 'fail' } }), 'x')
check('fallado cuenta como hecho pero no a la primera', fallado.done === 1 && fallado.okFirst === 0)
check('fallado cuenta como pendiente', fallado.pending === 1)

const mixto = practiceStats(
  P,
  at({
    a1: { ok: 1, fail: 0, last: 'ok' },
    a2: { ok: 1, fail: 2, last: 'ok' },
    b1: { ok: 0, fail: 1, last: 'fail' }
  }),
  'x'
)
check('cuenta bien los hechos', mixto.done === 3)
check('cuenta bien los de primera', mixto.okFirst === 1, String(mixto.okFirst))
check('cuenta bien los pendientes', mixto.pending === 1)
check('porcentaje = primera / hechos', Math.abs(mixto.rate - 1 / 3) < 1e-9, String(mixto.rate))

// ---------- punto flojo
const flojo = practiceStats(
  P,
  at({
    a1: { ok: 1, fail: 0, last: 'ok' },
    a2: { ok: 1, fail: 0, last: 'ok' },
    b1: { ok: 0, fail: 1, last: 'fail' },
    b2: { ok: 1, fail: 3, last: 'ok' }
  }),
  'x'
)
check('señala el tema con peor acierto a la primera', flojo.weak && flojo.weak.g === 'Dos', String(flojo.weak && flojo.weak.g))
check('el tema bueno no sale señalado', flojo.weak.okFirst === 0 && flojo.weak.done === 2,
  JSON.stringify(flojo.weak))

const unSolo = practiceStats(P, at({ b1: { ok: 0, fail: 1, last: 'fail' } }), 'x')
check('con un solo intento no se declara punto flojo', unSolo.weak === null)

const todoBien = practiceStats(
  P,
  at({ a1: { ok: 1, fail: 0, last: 'ok' }, a2: { ok: 1, fail: 0, last: 'ok' } }),
  'x'
)
check('si vas bien no hay punto flojo', todoBien.weak === null)

// ---------- los intentos de una asignatura no contaminan a otra
const otra = practiceStats(P, { 'y:a1': { ok: 1, fail: 0, last: 'ok' } }, 'x')
check('los intentos de otra asignatura no cuentan', otra.done === 0)

// ---------- verificación mecánica del contador módulo 6 (hallazgo de Codex)
// La solución publica estas tres ecuaciones: se comprueban aquí para que
// no vuelvan a publicarse unas que no cierren el ciclo.
const D0 = (q2, q1, q0) => (q0 ? 0 : 1)
const D1 = (q2, q1, q0) => (q2 ? 0 : 1) & (q1 ^ q0)
const D2 = (q2, q1, q0) => (((q2 ? 0 : 1) & q1 & q0) | (q2 & (q0 ? 0 : 1)))
const step = (s) => {
  const q2 = (s >> 2) & 1, q1 = (s >> 1) & 1, q0 = s & 1
  return (D2(q2, q1, q0) << 2) | (D1(q2, q1, q0) << 1) | D0(q2, q1, q0)
}
const ciclo = [0]
let st = 0
for (let i = 0; i < 6; i++) { st = step(st); ciclo.push(st) }
check('contador módulo 6: el ciclo cierra en 0→5→0',
  JSON.stringify(ciclo) === JSON.stringify([0, 1, 2, 3, 4, 5, 0]), ciclo.join('→'))
check('contador módulo 6: se recupera desde 110', step(6) === 5, String(step(6)))
check('contador módulo 6: se recupera desde 111', step(7) === 0, String(step(7)))

const sec2 = PRACTICE['tec-comp'].find((p) => p.id === 'sec2')
check('la solución publica esas ecuaciones', /D₂ = ¬Q₂·Q₁·Q₀ \+ Q₂·¬Q₀/.test(sec2.a), sec2.key)
check('y ya no promete un forzado sin lógica', !/hay que forzar/.test(sec2.a))

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
