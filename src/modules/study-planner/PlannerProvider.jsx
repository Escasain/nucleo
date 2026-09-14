// ============================================================
// Contexto del planificador
// ------------------------------------------------------------
// Capa fina sobre el store de NÚCLEO: no guarda estado propio. Lee
// data.planner y escribe con dispatch, así hereda localStorage,
// Google Drive con debounce, exportación y el aviso de copia sin
// duplicar nada.
// ============================================================
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useStore, DEFAULT_PLANNER, clampHours } from '../../lib/store.jsx'
import { CURRICULUM, blockRanges, academicYearOf } from '../../data/curriculum.js'
import { toISO } from '../../lib/dates.js'
import { STUDY_PLANS } from './studyPlanData.js'
import { buildSchedule, startOfDay, dow } from './planner-engine.js'

// Reparto por defecto cuando no hay horario semanal del que partir:
// tardes de lunes a jueves y una sesión larga el sábado.
export const FALLBACK_WEEK_HOURS = [1.5, 1.5, 1.5, 1.5, 0, 2.5, 0]

const PlannerContext = createContext(null)

export function usePlanner() {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner debe usarse dentro de <PlannerProvider>')
  return ctx
}

/** Hoy, a medianoche, revisado cada minuto para que no se quede pillado. */
function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()))
  useEffect(() => {
    const t = setInterval(() => {
      const now = startOfDay(new Date())
      setToday((prev) => (toISO(prev) === toISO(now) ? prev : now))
    }, 60000)
    return () => clearInterval(t)
  }, [])
  return today
}

/** Horas por día que suma tu horario semanal de la Agenda. */
export function weekHoursFromSchedule(schedule) {
  const out = [0, 0, 0, 0, 0, 0, 0]
  let any = false
  for (const slot of schedule || []) {
    if (!slot || !slot.start || !slot.end) continue
    const i = Number(slot.weekday)
    if (!(i >= 0 && i <= 6)) continue
    const [h1, m1] = String(slot.start).split(':').map(Number)
    const [h2, m2] = String(slot.end).split(':').map(Number)
    const mins = h2 * 60 + m2 - (h1 * 60 + m1)
    if (!Number.isFinite(mins) || mins <= 0) continue
    out[i] = +(out[i] + mins / 60).toFixed(1)
    any = true
  }
  return any ? out : null
}

/**
 * Asignaturas que entran en el planificador: las que estás cursando o
 * tienes matriculadas y además tienen ficha en studyPlanData.
 *
 * La fecha de examen sale de tus evaluaciones (Agenda): la de tipo
 * «examen» más próxima que no esté hecha. Si no has apuntado ninguna,
 * cae al dato provisional del temario y, en último término, al final
 * de su bloque bimestral.
 */
export function plannerSubjects(data, today) {
  const course = academicYearOf(today)
  const ranges = blockRanges(course.start)
  const out = []

  for (const s of CURRICULUM) {
    const plan = STUDY_PLANS[s.id]
    if (!plan) continue
    const status = data.subjects[s.id]?.status
    if (status !== 'cursando' && status !== 'matriculada') continue

    const range = ranges.find((r) => r.id === s.block)
    const examTask = data.tasks
      .filter((t) => t.subjectId === s.id && t.type === 'examen' && t.due && !t.done)
      .sort((a, b) => a.due.localeCompare(b.due))[0]

    const exam = examTask?.due || plan.examHint || (range ? toISO(range.to) : null)
    const start = plan.start || (range ? toISO(range.from) : null)

    out.push({
      id: s.id,
      name: s.name,
      short: plan.short || s.name.slice(0, 3).toUpperCase(),
      color: plan.color,
      provisional: Boolean(plan.provisional),
      units: plan.units,
      start,
      exam,
      examFromAgenda: Boolean(examTask),
      examLabel: examTask ? `${examTask.title} · apuntado en tu agenda` : plan.examLabel || ''
    })
  }

  out.sort((a, b) => (a.exam || '9999').localeCompare(b.exam || '9999'))
  return out
}

export function PlannerProvider({ children }) {
  const { data, dispatch } = useStore()
  const today = useToday()
  const planner = data.planner || DEFAULT_PLANNER

  const subjects = useMemo(() => plannerSubjects(data, today), [data, today])

  // weekHours en null = sin tocar: se siembra del horario de la Agenda.
  const seeded = useMemo(() => weekHoursFromSchedule(data.schedule), [data.schedule])
  const startTimes = planner.startTimes || DEFAULT_PLANNER.startTimes
  const weekHours = planner.weekHours || seeded || FALLBACK_WEEK_HOURS
  const usingSchedule = !planner.weekHours && Boolean(seeded)

  const schedule = useMemo(
    () => buildSchedule(subjects, { ...planner, weekHours }, today),
    [subjects, planner, weekHours, today]
  )

  const patch = useCallback((p) => dispatch({ type: 'setPlanner', patch: p }), [dispatch])

  const api = useMemo(
    () => ({
      today,
      subjects,
      schedule,
      state: { ...planner, weekHours, startTimes },
      weekHours,
      startTimes,
      weeklySchedule: data.schedule,
      usingSchedule,
      hasSchedule: Boolean(seeded),

      setDayHours: (i, v) => {
        const next = [...weekHours]
        next[i] = clampHours(v, 0, 12, 0)
        patch({ weekHours: next })
      },
      /** Vuelve a tomar las horas del horario semanal de la Agenda. */
      useScheduleHours: () => patch({ weekHours: null }),

      /** A qué hora empieza el estudio: 0 = entre semana, 5 = fin de semana. */
      setStartTime: (which, value) => {
        if (!/^\d{2}:\d{2}$/.test(value)) return
        const next = [...startTimes]
        if (which === 'weekday') for (let i = 0; i < 5; i++) next[i] = value
        else for (let i = 5; i < 7; i++) next[i] = value
        patch({ startTimes: next })
      },
      resetHours: () => patch({ weekHours: [...FALLBACK_WEEK_HOURS] }),

      setException: (key, v) => {
        const ex = { ...planner.exceptions }
        if (v === null) delete ex[key]
        else ex[key] = clampHours(v, 0, 12, 0)
        patch({ exceptions: ex })
      },

      toggleDone: (sid, uid) => {
        const cur = new Set(planner.done[sid] || [])
        if (cur.has(uid)) cur.delete(uid)
        else cur.add(uid)
        patch({ done: { ...planner.done, [sid]: [...cur] } })
      },

      setUnitHours: (sid, uid, v) =>
        patch({
          hourOverrides: { ...planner.hourOverrides, [`${sid}:${uid}`]: clampHours(v, 0.5, 20, 0.5) }
        }),
      clearUnitHours: (sid, uid) => {
        const o = { ...planner.hourOverrides }
        delete o[`${sid}:${uid}`]
        patch({ hourOverrides: o })
      },

      /**
       * Factor de ritmo de una asignatura. Se guarda aparte de los
       * ajustes manuales por unidad: así se puede quitar sin borrar lo
       * que hayas afinado tú a mano, y nada aparece como «ajustado por
       * ti» cuando lo ha puesto la calibración.
       */
      setPaceFactor: (sid, factor) => {
        const next = { ...(planner.paceFactor || {}) }
        if (factor == null || factor === 1) delete next[sid]
        else next[sid] = +Math.max(0.4, Math.min(3, Number(factor) || 1)).toFixed(2)
        patch({ paceFactor: next })
      },

      /** Marca una unidad como hecha sin alternar (para el fin de sesión). */
      markDone: (sid, uid) => {
        const cur = new Set(planner.done[sid] || [])
        if (cur.has(uid)) return
        cur.add(uid)
        patch({ done: { ...planner.done, [sid]: [...cur] } })
      },

      reset: () => patch({ ...DEFAULT_PLANNER })
    }),
    [today, subjects, schedule, planner, weekHours, startTimes, usingSchedule, seeded, data.schedule, patch]
  )

  return <PlannerContext.Provider value={api}>{children}</PlannerContext.Provider>
}

export { dow }
