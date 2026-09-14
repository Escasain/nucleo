// ============================================================
// Motor de planificación
// ------------------------------------------------------------
// Reparte el temario pendiente de cada asignatura entre los días
// disponibles. Función pura: mismas entradas, mismo calendario.
// Las utilidades de fecha comunes viven en lib/dates.js; aquí solo
// están las que el planificador necesita y allí no existen.
// ============================================================
import { toISO, parseISO } from '../../lib/dates.js'

export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Tamaño del bloque de reparto, en horas. */
export const BLOCK_SIZE = 0.5

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Día de la semana con lunes = 0 (JS usa domingo = 0). */
export function dow(d) {
  return (d.getDay() + 6) % 7
}

export function startOfWeek(d) {
  return addDays(d, -dow(d))
}

/** Medianoche local: evita que la hora del día descuadre las restas. */
export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function sameDay(a, b) {
  return toISO(a) === toISO(b)
}

/** Días naturales entre dos fechas (negativo si `b` es anterior). */
export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000)
}

/** «1,5 h» · «2 h» — coma decimal, como el resto de la app. */
export function hoursLabel(n) {
  const v = Number(n) || 0
  return Number.isInteger(v) ? `${v} h` : `${v.toFixed(1).replace('.', ',')} h`
}

/**
 * Horas de una unidad.
 *
 * Manda siempre el ajuste que hayas hecho tú a mano. Si no lo hay y la
 * asignatura tiene factor de ritmo (calibrado con lo que de verdad has
 * tardado en las unidades terminadas), se aplica sobre la estimación
 * original del temario: así recalibrar dos veces no compone el error.
 */
export function unitHours(state, subjectId, unit) {
  const override = state.hourOverrides?.[`${subjectId}:${unit.id}`]
  if (override !== undefined) return override
  const factor = state.paceFactor?.[subjectId]
  if (!factor || factor === 1) return unit.h
  return Math.max(0.5, Math.round(unit.h * factor * 4) / 4)
}

/**
 * Reparte el temario pendiente entre los días disponibles.
 *
 * Asigna en bloques de media hora. En cada bloque gana la asignatura
 * con más presión (horas pendientes ÷ días que quedan hasta su
 * examen), y la presión se recalcula tras cada bloque. Así las
 * asignaturas se alternan solas y la que va más justa se lleva más
 * tiempo, sin repartir porcentajes a mano.
 *
 * @param {Array}  subjects  asignaturas ya resueltas (id, start, exam, units)
 * @param {Object} state     { weekHours, exceptions, done, hourOverrides }
 * @param {Date}   today     día de referencia
 * @returns {{ days: Array, meta: Object, horizonEnd: Date }}
 */
export function buildSchedule(subjects, state, today = new Date()) {
  const weekHours = Array.isArray(state.weekHours) ? state.weekHours : []
  const exceptions = state.exceptions || {}
  const done = state.done || {}
  const from = startOfDay(today)

  const queues = {}
  const meta = {}
  for (const s of subjects) {
    const doneSet = new Set(done[s.id] || [])
    queues[s.id] = s.units
      .filter((u) => !doneSet.has(u.id))
      .map((u) => ({ ...u, left: unitHours(state, s.id, u) }))
    const totalAll = s.units.reduce((a, u) => a + unitHours(state, s.id, u), 0)
    const remaining = queues[s.id].reduce((a, u) => a + u.left, 0)
    meta[s.id] = {
      totalHours: +totalAll.toFixed(2),
      doneHours: +(totalAll - remaining).toFixed(2),
      remainingHours: +remaining.toFixed(2),
      scheduledHours: 0,
      finishDate: null,
      deficit: 0,
      unitDates: {}
    }
  }

  // Horizonte: hasta el último examen que caiga dentro de 20 semanas.
  // Si no hay ninguno, ocho semanas para que el calendario no salga vacío.
  let horizonEnd = addDays(from, 56)
  for (const s of subjects) {
    if (!s.exam) continue
    const e = parseISO(s.exam)
    const d = daysBetween(from, e)
    if (d > 0 && d <= 140 && e > horizonEnd) horizonEnd = e
  }

  const days = []
  for (let d = new Date(from); d <= horizonEnd; d = addDays(d, 1)) {
    const key = toISO(d)
    const capacity = exceptions[key] !== undefined ? exceptions[key] : weekHours[dow(d)] || 0
    const day = { date: new Date(d), key, capacity, items: [], exams: [] }

    for (const s of subjects) {
      if (s.exam && sameDay(parseISO(s.exam), d)) day.exams.push(s)
    }

    let left = capacity
    const blocks = []
    while (left >= BLOCK_SIZE) {
      // Activas hoy: han empezado, el examen no ha llegado y les queda temario.
      const active = subjects.filter((s) => {
        if (!queues[s.id].length) return false
        if (s.start && d < parseISO(s.start)) return false
        if (s.exam && d >= parseISO(s.exam)) return false
        return true
      })
      if (!active.length) break

      let best = null
      let bestPressure = -1
      for (const s of active) {
        const rem = queues[s.id].reduce((a, u) => a + u.left, 0)
        const daysLeft = s.exam ? Math.max(1, daysBetween(d, parseISO(s.exam))) : 30
        const pressure = rem / daysLeft
        if (pressure > bestPressure) {
          bestPressure = pressure
          best = s
        }
      }

      const unit = queues[best.id][0]
      const chunk = Math.min(BLOCK_SIZE, unit.left, left)
      unit.left = +(unit.left - chunk).toFixed(2)
      left = +(left - chunk).toFixed(2)
      blocks.push({ subjectId: best.id, unitId: unit.id, title: unit.t, kind: unit.kind, h: chunk })

      meta[best.id].scheduledHours = +(meta[best.id].scheduledHours + chunk).toFixed(2)
      const ud = meta[best.id].unitDates[unit.id] || { first: key, last: key, h: 0 }
      ud.last = key
      ud.h = +(ud.h + chunk).toFixed(2)
      meta[best.id].unitDates[unit.id] = ud

      if (unit.left <= 0.001) {
        queues[best.id].shift()
        if (!queues[best.id].length) meta[best.id].finishDate = key
      }
    }

    // Bloques seguidos de la misma unidad se ven como un solo item.
    // Hay que comparar también la asignatura: los id de unidad solo son
    // únicos dentro de su temario, así que dos asignaturas pueden tener
    // ambas un «t2a» y, si sus bloques caen seguidos, se fusionarían en
    // uno solo quedándose con el título y la asignatura del primero.
    for (const b of blocks) {
      const prev = day.items[day.items.length - 1]
      if (prev && prev.subjectId === b.subjectId && prev.unitId === b.unitId) {
        prev.h = +(prev.h + b.h).toFixed(2)
      } else {
        day.items.push({ ...b })
      }
    }

    days.push(day)
  }

  for (const s of subjects) {
    const stillLeft = queues[s.id].reduce((a, u) => a + u.left, 0)
    meta[s.id].deficit = +stillLeft.toFixed(1)
  }

  return { days, meta, horizonEnd }
}
