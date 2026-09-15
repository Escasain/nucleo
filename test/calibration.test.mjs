// Pruebas de src/lib/calibration.js — el plan contra la realidad.
import {
  unitKey, minutesByUnit, calibrationFor, roundFactor, minutesByDay,
  weeklyAdherence, realPace, heatmap, heatLevel, firstActivityISO, startOfWeek
} from '../src/lib/calibration.js'
import { unitHours, buildSchedule } from '../src/modules/study-planner/planner-engine.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const TODAY = new Date(2026, 8, 14) // lunes 14 sep 2026
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const days = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() + n); return iso(d) }

const S = (o) => ({ id: 'x' + Math.random(), done: true, type: 'estudio', ...o })
const base = { sessions: [], pomodoro: [] }

// ---------- unitKey / minutesByUnit
check('unitKey junta asignatura y unidad', unitKey('algebra', 't1a') === 'algebra:t1a')

const conUnidades = {
  ...base,
  sessions: [
    S({ subjectId: 'algebra', unitId: 't1a', date: days(-3), durationMin: 90 }),
    S({ subjectId: 'algebra', unitId: 't1a', date: days(-2), durationMin: 30 }),
    S({ subjectId: 'algebra', unitId: 'b1', date: days(-2), durationMin: 60 }),
    // sin unidad: cuenta para las horas, no para calibrar
    S({ subjectId: 'algebra', date: days(-1), durationMin: 120 }),
    // sin terminar: no cuenta en absoluto
    S({ subjectId: 'algebra', unitId: 'b2', date: days(-1), durationMin: 45, done: false })
  ]
}
const porUnidad = minutesByUnit(conUnidades)
check('suma varias sesiones de la misma unidad', porUnidad['algebra:t1a'] === 120, String(porUnidad['algebra:t1a']))
check('ignora sesiones sin unidad', porUnidad['algebra:undefined'] === undefined)
check('ignora sesiones sin terminar', porUnidad['algebra:b2'] === undefined)

// ---------- calibrationFor
const subject = {
  id: 'algebra',
  units: [
    { id: 'b1', t: 'Base 1', h: 1, kind: 'base' },
    { id: 't1a', t: 'Tema 1a', h: 1.5, kind: 'tema' },
    { id: 't1b', t: 'Tema 1b', h: 2, kind: 'tema' },
    { id: 't1c', t: 'Tema 1c', h: 2, kind: 'tema' }
  ]
}
const st = (done, extra = {}) => ({ done: { algebra: done }, hourOverrides: {}, exceptions: {}, weekHours: [2,2,2,2,2,2,2], ...extra })

const cal0 = calibrationFor(subject, st([]), conUnidades)
check('sin unidades hechas: no hay factor', cal0.samples === 0 && cal0.factor === null)
check('sin datos no es fiable', cal0.reliable === false)

// b1 (1 h estimada, 60 min reales) y t1a (1,5 h estimada, 120 min reales)
const cal2 = calibrationFor(subject, st(['b1', 't1a']), conUnidades)
check('solo cuentan las hechas Y cronometradas', cal2.samples === 2, String(cal2.samples))
check('estimadas correctas', cal2.estimatedH === 2.5, String(cal2.estimatedH))
check('reales correctas', cal2.realH === 3, String(cal2.realH))
check('factor = real / estimado', cal2.factor === 1.2, String(cal2.factor))
check('dos muestras todavía no son fiables', cal2.reliable === false)

// una unidad marcada como hecha pero sin tiempo registrado no cuenta
const cal3 = calibrationFor(subject, st(['b1', 't1a', 't1c']), conUnidades)
check('hecha sin cronometrar no entra en la muestra', cal3.samples === 2 && cal3.factor === 1.2)

const muchas = {
  ...base,
  sessions: [
    S({ subjectId: 'algebra', unitId: 'b1', date: days(-5), durationMin: 90 }),
    S({ subjectId: 'algebra', unitId: 't1a', date: days(-4), durationMin: 135 }),
    S({ subjectId: 'algebra', unitId: 't1b', date: days(-3), durationMin: 180 })
  ]
}
const cal4 = calibrationFor(subject, st(['b1', 't1a', 't1b']), muchas)
check('tres muestras ya son fiables', cal4.reliable === true)
check('factor 1,5 con todo un 50 % más largo', cal4.factor === 1.5, String(cal4.factor))

// ---------- roundFactor
check('roundFactor redondea a 0,05', roundFactor(1.237) === 1.25, String(roundFactor(1.237)))
check('roundFactor acota por arriba', roundFactor(9) === 3)
check('roundFactor acota por abajo', roundFactor(0.01) === 0.4)
check('roundFactor con null', roundFactor(null) === null)

// ---------- unitHours con paceFactor
const u = { id: 't1b', h: 2 }
check('sin factor devuelve la estimación', unitHours({ hourOverrides: {} }, 'algebra', u) === 2)
check('aplica el factor', unitHours({ hourOverrides: {}, paceFactor: { algebra: 1.5 } }, 'algebra', u) === 3)
check('redondea a cuartos de hora', unitHours({ hourOverrides: {}, paceFactor: { algebra: 1.2 } }, 'algebra', u) === 2.5,
  String(unitHours({ hourOverrides: {}, paceFactor: { algebra: 1.2 } }, 'algebra', u)))
check('el ajuste manual manda sobre el factor',
  unitHours({ hourOverrides: { 'algebra:t1b': 1 }, paceFactor: { algebra: 2 } }, 'algebra', u) === 1)
check('el factor no baja de media hora',
  unitHours({ hourOverrides: {}, paceFactor: { algebra: 0.4 } }, 'algebra', { id: 'z', h: 0.5 }) === 0.5)
check('factor de otra asignatura no afecta',
  unitHours({ hourOverrides: {}, paceFactor: { otra: 2 } }, 'algebra', u) === 2)

// el factor llega al calendario entero
const planSubject = { id: 'algebra', name: 'A', short: 'A', color: 'c', units: subject.units, start: null, exam: null }
const sinFactor = buildSchedule([planSubject], st([]), TODAY)
const conFactor = buildSchedule([planSubject], st([], { paceFactor: { algebra: 1.5 } }), TODAY)
check('el factor sube el total del calendario', conFactor.meta.algebra.totalHours > sinFactor.meta.algebra.totalHours,
  `${sinFactor.meta.algebra.totalHours} → ${conFactor.meta.algebra.totalHours}`)

// ---------- minutesByDay
const mixto = {
  sessions: [
    S({ subjectId: 'algebra', date: days(-1), durationMin: 60 }),
    S({ subjectId: 'algebra', date: days(-1), durationMin: 30, done: false }) // sin hacer
  ],
  pomodoro: [{ id: 'p1', date: days(-1), minutes: 25 }]
}
const pd = minutesByDay(mixto)
check('suma sesiones hechas y pomodoros', pd[days(-1)] === 85, String(pd[days(-1)]))

// ---------- weeklyAdherence
const schedule = { days: [{ key: days(0), items: [{ h: 2 }, { h: 1 }] }, { key: days(1), items: [{ h: 1.5 }] }] }
const stAdh = { weekHours: [1, 1, 1, 1, 1, 0, 0], exceptions: {}, done: {}, hourOverrides: {} }
const adh = weeklyAdherence(mixto, stAdh, schedule, 3, TODAY)
check('devuelve tantas semanas como se piden', adh.length === 3, String(adh.length))
check('la última semana es la de hoy', adh[2].key === iso(startOfWeek(TODAY)), adh[2].key)
check('la semana en curso usa el calendario', adh[2].plannedH === 4.5, String(adh[2].plannedH))
// TODAY es lunes, así que days(-1) (domingo) cae en la semana ANTERIOR.
check('las horas reales caen en la semana que les toca', adh[1].realH === 1.42 && adh[2].realH === 0,
  `anterior ${adh[1].realH} · en curso ${adh[2].realH}`)
check('la semana en curso no está cerrada', adh[2].past === false)
check('las semanas anteriores sí', adh[0].past === true && adh[1].past === true)
// semana pasada sin calendario: lo previsto es la capacidad del horario (5 días × 1 h)
check('una semana pasada usa el horario semanal', adh[1].plannedH === 5, String(adh[1].plannedH))

// una excepción de un día pasado manda sobre el horario
const adhEx = weeklyAdherence(mixto, { ...stAdh, exceptions: { [days(-7)]: 4 } }, schedule, 3, TODAY)
check('la excepción de un día pasado manda', adhEx[1].plannedH === 8, String(adhEx[1].plannedH))

// ---------- realPace
const cuatroSemanas = {
  sessions: [
    S({ subjectId: 'a', date: days(-7), durationMin: 120 }),  // semana -1
    S({ subjectId: 'a', date: days(-14), durationMin: 60 }),  // semana -2
    S({ subjectId: 'a', date: days(0), durationMin: 600 })    // HOY: semana en curso
  ],
  pomodoro: []
}
const rp = realPace(cuatroSemanas, 4, TODAY)
// Las semanas -3 y -4 son anteriores al primer registro: no son «cero
// horas», es que aún no usaba la app. (120 + 60) min entre las 2 semanas
// que sí cuentan = 1,5 h/semana. Las 10 h de hoy tampoco entran: la
// semana en curso va a medias y hundiría la media.
check('el ritmo ignora la semana en curso y las anteriores a empezar', rp.hoursPerWeek === 1.5, String(rp.hoursPerWeek))
check('solo cuenta las semanas desde que hay registros', rp.weeks === 2, String(rp.weeks))
check('cuenta las semanas con estudio', rp.weeksWithStudy === 2, String(rp.weeksWithStudy))
check('sin nada registrado el ritmo es cero', realPace(base, 4, TODAY).hoursPerWeek === 0)
check('sin nada registrado no hay semanas contadas', realPace(base, 4, TODAY).weeks === 0)

// Recién llegado: una sola semana completa con 10 h no es «2,5 h/semana»
const recien = { sessions: [S({ subjectId: 'a', date: days(-7), durationMin: 600 })], pomodoro: [] }
const rpRecien = realPace(recien, 4, TODAY)
check('el recién llegado no sale penalizado', rpRecien.hoursPerWeek === 10 && rpRecien.weeks === 1,
  `${rpRecien.hoursPerWeek} h en ${rpRecien.weeks} semana(s)`)

// Una semana en blanco DESPUÉS de empezar sí cuenta: eso sí es ritmo cero
const conHueco = {
  sessions: [
    S({ subjectId: 'a', date: days(-21), durationMin: 600 }),
    S({ subjectId: 'a', date: days(-7), durationMin: 600 })
  ],
  pomodoro: []
}
const rpHueco = realPace(conHueco, 4, TODAY)
check('una semana en blanco posterior sí baja la media', rpHueco.weeks === 3 && rpHueco.hoursPerWeek === 6.67,
  `${rpHueco.hoursPerWeek} h en ${rpHueco.weeks} semanas`)
check('las semanas en blanco no cuentan como semanas con estudio', rpHueco.weeksWithStudy === 2)

// ---------- la proyección realista reparte, no promete a cada uno el total
// (hallazgo de Codex en el PR #5: dar el ritmo global entero a cada
// asignatura hacía que dos salieran «llegas» siendo juntas imposibles).
const examen = days(7)
const mk = (id) => ({
  id, name: id, short: id, color: 'c', start: null, exam: examen,
  units: [{ id: 'u1', t: 'u1', h: 5, kind: 'tema' }, { id: 'u2', t: 'u2', h: 5, kind: 'tema' }]
})
const dosAsignaturas = [mk('p'), mk('q')]
const stReparto = { weekHours: [3,3,3,3,3,0,0], exceptions: {}, done: {}, hourOverrides: {} } // 15 h/semana
const reparto = buildSchedule(dosAsignaturas, stReparto, TODAY)
const deficitTotal = reparto.meta.p.deficit + reparto.meta.q.deficit
check('20 h de temario en 15 h de capacidad dejan déficit', deficitTotal > 0,
  `p ${reparto.meta.p.deficit} · q ${reparto.meta.q.deficit}`)
check('el déficit es la diferencia real, no el doble', Math.abs(deficitTotal - 5) < 1.5, String(deficitTotal))
check('ninguna asignatura se queda sin nada del reparto',
  reparto.meta.p.scheduledHours > 0 && reparto.meta.q.scheduledHours > 0)
// Con capacidad de sobra, ninguna tiene déficit
const holgado = buildSchedule(dosAsignaturas, { ...stReparto, weekHours: [8,8,8,8,8,0,0] }, TODAY)
check('con capacidad de sobra no hay déficit', holgado.meta.p.deficit === 0 && holgado.meta.q.deficit === 0,
  `p ${holgado.meta.p.deficit} · q ${holgado.meta.q.deficit}`)

// ---------- heatmap
const hm = heatmap(mixto, 30, TODAY)
check('el mapa agrupa por semanas de 7', hm.weeks.every((w) => w.length === 7))
check('el mapa cuenta los días con actividad', hm.days === 1, String(hm.days))
check('el máximo es el día más largo', hm.max === 85, String(hm.max))
check('el total son todos los minutos', hm.total === 85)
const todasLasCeldas = hm.weeks.flat().filter(Boolean)
check('el último día del mapa es hoy', todasLasCeldas[todasLasCeldas.length - 1].key === days(0))
check('nivel 0 sin minutos', heatLevel(0, 100) === 0)
check('nivel 4 en el máximo', heatLevel(100, 100) === 4)
check('nivel 1 en el cuartil bajo', heatLevel(10, 100) === 1)
check('sin máximo no revienta', heatLevel(5, 0) === 0)

// ---------- firstActivityISO
check('primer día con actividad', firstActivityISO(cuatroSemanas) === days(-14), String(firstActivityISO(cuatroSemanas)))
check('sin actividad devuelve null', firstActivityISO(base) === null)

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
