// ============================================================
// Plan contra realidad
// ------------------------------------------------------------
// El planificador proyecta: reparte horas estimadas entre los días.
// Aquí se mira lo contrario, lo que de verdad has estudiado, para
// poder responder tres preguntas que la proyección sola no contesta:
//
//   1. ¿Cuánto me cuestan de verdad las unidades? (calibración)
//   2. ¿Cumplo las horas que me propuse? (adherencia)
//   3. A mi ritmo real, ¿llego al examen? (proyección)
//
// Todo se calcula sobre `data`: son funciones puras, sin estado.
// ============================================================
import { toISO, parseISO, todayISO } from './dates.js'

/** Clave con la que una sesión queda atada a una unidad del temario. */
export function unitKey(subjectId, unitId) {
  return `${subjectId}:${unitId}`
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
/** Lunes de la semana de `d`. */
export function startOfWeek(d) {
  const x = startOfDay(d)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

/**
 * Minutos registrados por unidad del temario.
 *
 * Solo cuentan las sesiones hechas que dicen a qué unidad pertenecen:
 * las de siempre (una clase, un rato suelto) no saben de unidades y no
 * sirven para calibrar. Los pomodoros tampoco, salvo que se lancen
 * desde una sesión de estudio, que ya los graba como sesión.
 */
export function minutesByUnit(data) {
  const out = {}
  for (const s of data.sessions || []) {
    if (!s || !s.done || !s.unitId || !s.subjectId) continue
    const min = Number(s.durationMin) || 0
    if (min <= 0) continue
    const k = unitKey(s.subjectId, s.unitId)
    out[k] = (out[k] || 0) + min
  }
  return out
}

/**
 * Cuánto se desvían tus estimaciones en una asignatura.
 *
 * Compara lo estimado con lo real **solo en las unidades terminadas y
 * cronometradas**: una unidad a medias diría que tardas menos de lo que
 * tardas. El factor se calcula sobre la estimación original del temario
 * (`unit.h`), nunca sobre la ya corregida, para que aplicarlo dos veces
 * no multiplique el error.
 *
 * @returns {{samples:number, estimatedH:number, realH:number, factor:number|null, reliable:boolean}}
 */
export function calibrationFor(subject, plannerState, data) {
  const byUnit = minutesByUnit(data)
  const doneSet = new Set((plannerState.done || {})[subject.id] || [])
  let estimated = 0
  let real = 0
  let samples = 0
  for (const u of subject.units || []) {
    if (!doneSet.has(u.id)) continue
    const min = byUnit[unitKey(subject.id, u.id)] || 0
    if (min <= 0) continue
    samples++
    estimated += Number(u.h) || 0
    real += min / 60
  }
  const factor = estimated > 0 ? real / estimated : null
  return {
    samples,
    estimatedH: +estimated.toFixed(2),
    realH: +real.toFixed(2),
    factor: factor == null ? null : +factor.toFixed(3),
    // Con una o dos unidades el factor es ruido: se enseña, pero no se
    // propone aplicarlo hasta tener una muestra que signifique algo.
    reliable: samples >= 3 && estimated >= 3
  }
}

/** Factor redondeado a un paso legible, acotado para que no dispare. */
export function roundFactor(factor) {
  if (factor == null || !Number.isFinite(factor)) return null
  return Math.min(3, Math.max(0.4, Math.round(factor * 20) / 20))
}

/**
 * Minutos registrados por día: sesiones hechas con duración más
 * pomodoros. Es la misma cuenta que usa «Tu estudio», repetida aquí
 * para no atar este módulo a la forma de stats.js.
 */
export function minutesByDay(data) {
  const map = {}
  for (const p of data.pomodoro || []) {
    if (!p || !p.date) continue
    map[p.date] = (map[p.date] || 0) + (Number(p.minutes) || 0)
  }
  for (const s of data.sessions || []) {
    if (!s || !s.date || !s.done || !s.durationMin) continue
    map[s.date] = (map[s.date] || 0) + (Number(s.durationMin) || 0)
  }
  return map
}

/**
 * Lo que te propusiste frente a lo que registraste, semana a semana.
 *
 * Lo propuesto sale del calendario ya calculado (`schedule.days`), que
 * solo cubre de hoy en adelante; para las semanas pasadas se usa la
 * capacidad del horario semanal, que es lo que te habías propuesto
 * entonces. Las excepciones de un día concreto mandan sobre el horario.
 *
 * @returns {Array<{key:string, from:Date, plannedH:number, realH:number, past:boolean}>}
 */
export function weeklyAdherence(data, plannerState, schedule, weeks = 6, today = new Date()) {
  const byDay = minutesByDay(data)
  const weekHours = Array.isArray(plannerState.weekHours) ? plannerState.weekHours : []
  const exceptions = plannerState.exceptions || {}
  const plannedByDay = {}
  for (const d of schedule?.days || []) {
    plannedByDay[d.key] = d.items.reduce((a, i) => a + i.h, 0)
  }

  const thisWeek = startOfWeek(today)
  const out = []
  for (let w = weeks - 1; w >= 0; w--) {
    const from = addDays(thisWeek, -7 * w)
    let planned = 0
    let real = 0
    for (let i = 0; i < 7; i++) {
      const day = addDays(from, i)
      const key = toISO(day)
      real += byDay[key] || 0
      if (plannedByDay[key] !== undefined) {
        planned += plannedByDay[key]
      } else if (day < startOfDay(today)) {
        // Semana pasada: lo previsto era la capacidad de ese día.
        planned += exceptions[key] !== undefined ? exceptions[key] : weekHours[(day.getDay() + 6) % 7] || 0
      }
    }
    out.push({
      key: toISO(from),
      from,
      plannedH: +planned.toFixed(2),
      realH: +(real / 60).toFixed(2),
      past: addDays(from, 7) <= startOfDay(today)
    })
  }
  return out
}

/**
 * Ritmo real: media de horas por semana de las últimas `weeks` semanas
 * completas. Se ignora la semana en curso, que siempre va a medias y
 * hundiría la media.
 */
export function realPace(data, weeks = 4, today = new Date()) {
  const byDay = minutesByDay(data)
  const thisWeek = startOfWeek(today)
  let total = 0
  let counted = 0
  let withStudy = 0
  for (let w = 1; w <= weeks; w++) {
    const from = addDays(thisWeek, -7 * w)
    let min = 0
    for (let i = 0; i < 7; i++) min += byDay[toISO(addDays(from, i))] || 0
    // Solo cuentan las semanas desde que hay algún registro: las
    // anteriores a empezar a usar la app no son ritmo cero, son nada.
    counted++
    total += min
    if (min > 0) withStudy++
  }
  return {
    weeks: counted,
    weeksWithStudy: withStudy,
    hoursPerWeek: counted > 0 ? +(total / 60 / counted).toFixed(2) : 0
  }
}

/**
 * A tu ritmo real, ¿te da tiempo antes del examen?
 *
 * `neededPerWeek` es lo que haría falta para cubrir lo que queda; si tu
 * ritmo real se queda por debajo, `shortfallH` dice cuántas horas te
 * faltarían al llegar la fecha.
 */
export function paceCheck(remainingH, examISO, hoursPerWeek, today = new Date()) {
  if (!examISO) return null
  const exam = parseISO(examISO)
  const days = Math.round((startOfDay(exam) - startOfDay(today)) / 86400000)
  if (days <= 0) return null
  const weeksLeft = days / 7
  const needed = remainingH / weeksLeft
  const willDo = hoursPerWeek * weeksLeft
  return {
    daysLeft: days,
    neededPerWeek: +needed.toFixed(2),
    hoursPerWeek: +hoursPerWeek.toFixed(2),
    shortfallH: +Math.max(0, remainingH - willDo).toFixed(1),
    onTrack: hoursPerWeek >= needed
  }
}

/**
 * Rejilla para el mapa de calor: un año de días terminando hoy,
 * alineado a semanas que empiezan en lunes.
 *
 * @returns {{weeks:Array<Array<{key:string, min:number}|null>>, max:number, total:number, days:number}}
 */
export function heatmap(data, days = 364, today = new Date()) {
  const byDay = minutesByDay(data)
  const end = startOfDay(today)
  const first = startOfWeek(addDays(end, -(days - 1)))
  const weeks = []
  let max = 0
  let total = 0
  let active = 0
  for (let d = new Date(first); d <= end; d = addDays(d, 1)) {
    const key = toISO(d)
    const min = byDay[key] || 0
    if (min > max) max = min
    total += min
    if (min > 0) active++
    const col = (d.getDay() + 6) % 7
    if (col === 0) weeks.push([null, null, null, null, null, null, null])
    const week = weeks[weeks.length - 1]
    if (week) week[col] = { key, min }
  }
  return { weeks, max, total, days: active }
}

/** Nivel 0-4 para pintar una celda del mapa de calor. */
export function heatLevel(min, max) {
  if (!min) return 0
  if (max <= 0) return 0
  const r = min / max
  if (r > 0.75) return 4
  if (r > 0.5) return 3
  if (r > 0.25) return 2
  return 1
}

/** Primer día con actividad registrada, o null si no hay ninguno. */
export function firstActivityISO(data) {
  const keys = Object.keys(minutesByDay(data)).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
  if (!keys.length) return null
  keys.sort()
  return keys[0] <= todayISO() ? keys[0] : null
}
