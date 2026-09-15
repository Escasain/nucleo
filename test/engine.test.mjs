import { buildSchedule, daysBetween, hoursLabel, startOfWeek, dow } from '../src/modules/study-planner/planner-engine.js'
import { STUDY_PLANS } from '../src/modules/study-planner/studyPlanData.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
const TODAY = new Date(2026, 8, 14) // 14 sep 2026
const AMD = { id: 'algebra', name: 'AMD', short: 'AMD', color: 'c1', units: STUDY_PLANS.algebra.units, start: '2026-09-15', exam: '2026-11-06' }
const TC  = { id: 'tec-comp', name: 'TC', short: 'TC', color: 'c2', units: STUDY_PLANS['tec-comp'].units, start: '2026-09-15', exam: '2026-11-06' }
const base = { weekHours: [1.5,1.5,1.5,1.5,0,2.5,0], exceptions: {}, done: {}, hourOverrides: {} }
const sum = (u) => u.reduce((a,x)=>a+x.h,0)

// ---- utilidades
check('hoursLabel entero', hoursLabel(2) === '2 h', hoursLabel(2))
check('hoursLabel decimal con coma', hoursLabel(1.5) === '1,5 h', hoursLabel(1.5))
check('dow lunes=0', dow(new Date(2026,8,14)) === 0)
check('dow domingo=6', dow(new Date(2026,8,20)) === 6)
check('startOfWeek cae en lunes', dow(startOfWeek(new Date(2026,8,17))) === 0)
check('daysBetween ignora la hora', daysBetween(new Date(2026,8,14,23,59), new Date(2026,8,15,0,1)) === 1)

// ---- temario de AMD intacto
const amdTotal = sum(STUDY_PLANS.algebra.units)
check('AMD tiene 31 unidades', STUDY_PLANS.algebra.units.length === 31, String(STUDY_PLANS.algebra.units.length))
check('AMD suma 63 h', amdTotal === 63, String(amdTotal))
check('AMD conserva los kinds', new Set(STUDY_PLANS.algebra.units.map(u=>u.kind)).size === 4)

// ---- reparto básico
const r1 = buildSchedule([AMD], base, TODAY)
check('meta: total = suma del temario', r1.meta.algebra.totalHours === amdTotal)
check('meta: nada hecho al principio', r1.meta.algebra.doneHours === 0)
const cap = r1.days.reduce((a,d)=>a+d.capacity,0)
const sched = r1.days.reduce((a,d)=>a+d.items.reduce((b,i)=>b+i.h,0),0)
check('lo planificado no supera la capacidad', sched <= cap + 0.001, `${sched} / ${cap}`)
check('scheduled + deficit = pendiente', Math.abs(r1.meta.algebra.scheduledHours + r1.meta.algebra.deficit - amdTotal) < 0.05,
  `${r1.meta.algebra.scheduledHours} + ${r1.meta.algebra.deficit} vs ${amdTotal}`)
check('no planifica antes del start', !r1.days.filter(d=>d.key < '2026-09-15').some(d=>d.items.length))
check('no planifica el día del examen ni después', !r1.days.filter(d=>d.key >= '2026-11-06').some(d=>d.items.length))
check('marca el examen en su día', r1.days.find(d=>d.key==='2026-11-06')?.exams.length === 1)
check('viernes y domingo sin capacidad', r1.days.filter(d=>[4,6].includes(dow(d.date))).every(d=>d.capacity===0))

// ---- CRITERIO: subir horas recoloca (menos déficit)
const pocas = buildSchedule([AMD, TC], { ...base, weekHours: [0.5,0.5,0.5,0.5,0,0.5,0] }, TODAY)
const muchas = buildSchedule([AMD, TC], { ...base, weekHours: [4,4,4,4,4,6,6] }, TODAY)
const defPocas = pocas.meta.algebra.deficit + pocas.meta['tec-comp'].deficit
const defMuchas = muchas.meta.algebra.deficit + muchas.meta['tec-comp'].deficit
check('CRITERIO subir horas reduce el déficit', defMuchas < defPocas, `${defPocas} → ${defMuchas}`)
check('CRITERIO con horas de sobra todo cabe (déficit 0)', defMuchas === 0, String(defMuchas))
check('con horas de sobra hay fecha de fin', Boolean(muchas.meta.algebra.finishDate))

// ---- CRITERIO: si no cabe, se sabe cuánto falta
check('CRITERIO déficit por asignatura cuando no cabe', pocas.meta.algebra.deficit > 0 && pocas.meta['tec-comp'].deficit > 0,
  `AMD ${pocas.meta.algebra.deficit} · TC ${pocas.meta['tec-comp'].deficit}`)

// ---- CRITERIO: marcar hecho libera tiempo y replanifica
const doneIds = STUDY_PLANS.algebra.units.slice(0, 6).map(u => u.id)
const doneH = sum(STUDY_PLANS.algebra.units.slice(0, 6))
const conHechos = buildSchedule([AMD], { ...base, done: { algebra: doneIds } }, TODAY)
check('CRITERIO doneHours refleja lo marcado', Math.abs(conHechos.meta.algebra.doneHours - doneH) < 0.01, `${conHechos.meta.algebra.doneHours} vs ${doneH}`)
check('CRITERIO pendientes baja al marcar', conHechos.meta.algebra.remainingHours === +(amdTotal - doneH).toFixed(2))
// Con AMD sola el temario ya cabe, así que «liberar tiempo» se mide en
// que se termina antes, no en el déficit.
check('CRITERIO marcar hecho adelanta la fecha de fin',
  conHechos.meta.algebra.finishDate < r1.meta.algebra.finishDate,
  `${r1.meta.algebra.finishDate} → ${conHechos.meta.algebra.finishDate}`)
// Y en un escenario apretado, baja el déficit.
const apretado = { ...base, weekHours: [0.5,0.5,0.5,0.5,0,0.5,0] }
const apretadoHecho = buildSchedule([AMD], { ...apretado, done: { algebra: doneIds } }, TODAY)
check('CRITERIO marcar hecho baja el déficit cuando va justo',
  apretadoHecho.meta.algebra.deficit < buildSchedule([AMD], apretado, TODAY).meta.algebra.deficit,
  `${buildSchedule([AMD], apretado, TODAY).meta.algebra.deficit} → ${apretadoHecho.meta.algebra.deficit}`)
check('las unidades hechas no aparecen en el calendario', !conHechos.days.some(d=>d.items.some(i=>doneIds.includes(i.unitId))))

// ---- ajuste de horas por unidad
const conOverride = buildSchedule([AMD], { ...base, hourOverrides: { 'algebra:t2a': 6 } }, TODAY)
check('override cambia el total', conOverride.meta.algebra.totalHours === amdTotal - 3 + 6)

// ---- excepciones por día
const exc = buildSchedule([AMD], { ...base, exceptions: { '2026-09-18': 5 } }, TODAY)
check('excepción manda sobre el día de la semana', exc.days.find(d=>d.key==='2026-09-18').capacity === 5)
const libre = buildSchedule([AMD], { ...base, exceptions: { '2026-09-16': 0 } }, TODAY)
check('día libre a 0 no recibe trabajo', libre.days.find(d=>d.key==='2026-09-16').items.length === 0)

// ---- dos asignaturas: la más presionada se lleva más
const dos = buildSchedule([AMD, TC], base, TODAY)
check('reparte entre las dos', dos.meta.algebra.scheduledHours > 0 && dos.meta['tec-comp'].scheduledHours > 0)
const dias = dos.days.filter(d => d.items.length)
check('alterna asignaturas a lo largo del plan', new Set(dias.flatMap(d=>d.items.map(i=>i.subjectId))).size === 2)
check('ningún día se pasa de su capacidad', dos.days.every(d => d.items.reduce((a,i)=>a+i.h,0) <= d.capacity + 0.001))

// ---- unidades contiguas fusionadas
check('bloques de la misma unidad fusionados', !r1.days.some(d => d.items.some((it,i)=> i>0 && d.items[i-1].unitId===it.unitId)))

// ---- robustez
check('sin asignaturas no revienta', buildSchedule([], base, TODAY).days.length > 0)
check('weekHours vacío → todo déficit', buildSchedule([AMD], { ...base, weekHours: [0,0,0,0,0,0,0] }, TODAY).meta.algebra.deficit === amdTotal)
check('state incompleto no revienta', buildSchedule([AMD], { weekHours: [1,1,1,1,1,1,1] }, TODAY).meta.algebra.totalHours === amdTotal)
const sinExamen = buildSchedule([{ ...AMD, exam: null }], base, TODAY)
check('sin fecha de examen sigue planificando', sinExamen.meta.algebra.scheduledHours > 0)
check('unidades sin hueco quedan fuera de unitDates', Object.keys(pocas.meta.algebra.unitDates).length < STUDY_PLANS.algebra.units.length)

// ---- orden: las unidades se respetan en secuencia
const orden = []
for (const d of r1.days) for (const it of d.items) if (!orden.includes(it.unitId)) orden.push(it.unitId)
const esperado = STUDY_PLANS.algebra.units.map(u=>u.id).slice(0, orden.length)
check('respeta el orden del temario', JSON.stringify(orden) === JSON.stringify(esperado))

// ---- id de unidad repetidos entre asignaturas (Codex, PR #4)
// Los id solo son únicos dentro de su temario: AMD y TC tienen las dos
// un «t2a». Si dos bloques seguidos del mismo día se fusionaran mirando
// solo el unitId, las horas de una asignatura se contarían como de la
// otra y desaparecerían del calendario y del .ics.
const choqueUnits = (p) => [
  { id: 't1', t: `${p} tema 1`, h: 2, kind: 'tema' },
  { id: 't2a', t: `${p} tema 2a`, h: 2, kind: 'tema' },
  { id: 'l2', t: `${p} lab 2`, h: 2, kind: 'lab' }
]
const X = { id: 'x', name: 'X', short: 'X', color: 'c1', units: choqueUnits('X'), start: '2026-09-15', exam: '2026-10-30' }
const Y = { id: 'y', name: 'Y', short: 'Y', color: 'c2', units: choqueUnits('Y'), start: '2026-09-15', exam: '2026-10-30' }
const choque = buildSchedule([X, Y], { weekHours: [4,4,4,4,4,4,4], exceptions:{}, done:{}, hourOverrides:{} }, TODAY)
const horasEnItems = (id) => +choque.days
  .reduce((acc, d) => acc + d.items.filter(i => i.subjectId === id).reduce((x, i) => x + i.h, 0), 0).toFixed(2)
for (const id of ['x', 'y']) {
  check(`id repetidos: ${id} no pierde horas por fusión`, horasEnItems(id) === choque.meta[id].scheduledHours,
    `items ${horasEnItems(id)} vs meta ${choque.meta[id].scheduledHours}`)
}
check('id repetidos: ningún item mezcla dos asignaturas',
  !choque.days.some(d => d.items.some((it, i) => i > 0 && d.items[i-1].unitId === it.unitId && d.items[i-1].subjectId !== it.subjectId && d.items[i-1].title === it.title)))
check('id repetidos: los títulos de cada item son los de su asignatura',
  choque.days.every(d => d.items.every(it => it.title.startsWith(it.subjectId.toUpperCase()))))

console.log(out.join('\n'))
console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`)
