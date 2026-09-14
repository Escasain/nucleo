// ============================================================
// Vista global del planificador
//  · StudySummary  → tarjeta compacta para Inicio
//  · StudyOverview → calendario completo (pestaña de Agenda)
// ============================================================
import React, { useMemo, useState } from 'react'
import { usePlanner } from './PlannerProvider.jsx'
import { DAY_LABELS, addDays, startOfWeek, sameDay, daysBetween, dow, hoursLabel } from './planner-engine.js'
import { toISO, parseISO, formatLong } from '../../lib/dates.js'
import { STUDY_PLANS } from './studyPlanData.js'
import { CURRICULUM } from '../../data/curriculum.js'

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/* ------------------------------------------------------------ piezas */

function Stepper({ value, onChange, step = 0.5, label }) {
  return (
    <div className="plan-stepper">
      <button type="button" onClick={() => onChange(value - step)} aria-label={`Quitar tiempo: ${label}`}>
        −
      </button>
      <span aria-live="off">{value === 0 ? '—' : hoursLabel(value)}</span>
      <button type="button" onClick={() => onChange(value + step)} aria-label={`Añadir tiempo: ${label}`}>
        +
      </button>
    </div>
  )
}

export function HoursEditor() {
  const { weekHours, setDayHours, resetHours, useScheduleHours, usingSchedule, hasSchedule } = usePlanner()
  const total = weekHours.reduce((a, b) => a + b, 0)
  return (
    <div className="card">
      <div className="plan-head">
        <div>
          <h3 style={{ marginBottom: 0 }}>Tus horas</h3>
          <p className="plan-sub">Lo que puedes dedicar cada día. El calendario se recoloca al instante.</p>
        </div>
        <div className="plan-weektotal">
          <strong>{hoursLabel(total)}</strong>
          <span>por semana</span>
        </div>
      </div>
      {usingSchedule && (
        <p className="plan-note">Tomadas de tu horario semanal de la Agenda. Si ajustas un día aquí, dejan de seguirlo.</p>
      )}
      <div className="plan-hours">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`plan-hourcell${weekHours[i] === 0 ? ' is-off' : ''}`}>
            <span className="plan-hourday">{d}</span>
            <Stepper value={weekHours[i]} onChange={(v) => setDayHours(i, v)} label={d} />
          </div>
        ))}
      </div>
      <div className="plan-actions">
        {hasSchedule && !usingSchedule && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={useScheduleHours}>
            Tomar de mi horario semanal
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={resetHours}>
          Volver a los valores iniciales
        </button>
      </div>
    </div>
  )
}

export function PressureBar({ subject, onOpen }) {
  const { schedule, today } = usePlanner()
  const m = schedule.meta[subject.id]
  if (!m || !m.totalHours) return null
  const donePct = (m.doneHours / m.totalHours) * 100
  const planPct = (m.scheduledHours / m.totalHours) * 100
  const daysLeft = subject.exam ? daysBetween(today, parseISO(subject.exam)) : null

  return (
    <div className="plan-pressure">
      <div className="plan-pressure-top">
        <span className="plan-dot" style={{ background: subject.color }} aria-hidden="true" />
        {onOpen ? (
          <button type="button" className="plan-linkname" onClick={() => onOpen(subject.id)}>
            {subject.short}
          </button>
        ) : (
          <strong>{subject.short}</strong>
        )}
        <span className="muted plan-grow">
          {m.remainingHours > 0 ? `${hoursLabel(m.remainingHours)} pendientes` : 'temario cubierto'}
        </span>
        <span className="muted plan-days">{daysLeft != null && daysLeft > 0 ? `${daysLeft} d` : '—'}</span>
      </div>
      <div
        className="plan-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(m.totalHours)}
        aria-valuenow={Math.round(m.doneHours)}
        aria-label={`${subject.name}: ${hoursLabel(m.doneHours)} de ${hoursLabel(m.totalHours)}`}
      >
        <div className="plan-bar-plan" style={{ width: `${planPct}%`, background: subject.color }} />
        <div className="plan-bar-done" style={{ width: `${donePct}%`, background: subject.color }} />
      </div>
      {m.deficit > 0 && (
        <p className="plan-warn">
          No entra por {hoursLabel(m.deficit)}. Sube horas, recorta estimaciones o empieza antes.
        </p>
      )}
    </div>
  )
}

/* --------------------------------------------- tarjeta compacta (Inicio) */

export function StudySummary({ navigate }) {
  const { subjects, schedule, today } = usePlanner()
  const active = subjects.filter((s) => s.units.length && (!s.exam || daysBetween(today, parseISO(s.exam)) >= 0))
  if (!active.length) return null

  const next = active[0]
  const daysLeft = next.exam ? daysBetween(today, parseISO(next.exam)) : null
  const totalDeficit = active.reduce((a, s) => a + (schedule.meta[s.id]?.deficit || 0), 0)
  const todayPlan = schedule.days.find((d) => sameDay(d.date, today))

  return (
    <div className="card plan-summary" role="region" aria-label="Calendario de estudio">
      <div className="plan-head">
        <div>
          <div className="guide-label">Calendario de estudio</div>
          <h3 style={{ marginBottom: 0 }}>
            {daysLeft != null ? (
              <>
                <span className="plan-count">{daysLeft}</span> <span className="plan-count-unit">días para {next.short}</span>
              </>
            ) : (
              'Sin examen a la vista'
            )}
          </h3>
          <p className="plan-sub">{next.examLabel}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/agenda')}>
          Ver calendario
        </button>
      </div>

      {todayPlan && todayPlan.items.length > 0 && (
        <ul className="plan-todaylist">
          {todayPlan.items.map((it, i) => {
            const s = active.find((x) => x.id === it.subjectId)
            return (
              <li key={`${it.unitId}-${i}`}>
                <span className="plan-dot" style={{ background: s?.color }} aria-hidden="true" />
                <span className="plan-todayh">{hoursLabel(it.h)}</span>
                <span className="plan-todaytitle">{it.title}</span>
              </li>
            )
          })}
        </ul>
      )}

      <div className="plan-pressures">
        {active.map((s) => (
          <PressureBar key={s.id} subject={s} onOpen={(id) => navigate(`/asignatura/${id}`)} />
        ))}
      </div>

      {totalDeficit > 0 && (
        <p className="plan-warn plan-warn-block">
          Con tus horas actuales faltan {hoursLabel(totalDeficit)} para cubrir todo el temario antes de los exámenes.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------- calendario completo (Agenda) */

export default function StudyOverview({ navigate }) {
  const { subjects, schedule, state, setException, today } = usePlanner()
  const [selected, setSelected] = useState(null)
  const [weeksShown, setWeeksShown] = useState(6)

  const active = subjects.filter((s) => s.units.length && (!s.exam || daysBetween(today, parseISO(s.exam)) >= 0))
  const upcoming = subjects.filter((s) => !s.units.length)
  const next = active[0]

  const byKey = useMemo(() => {
    const m = {}
    for (const d of schedule.days) m[d.key] = d
    return m
  }, [schedule])

  const weeks = useMemo(() => {
    const out = []
    let cursor = startOfWeek(today)
    for (let w = 0; w < weeksShown; w++) {
      out.push(
        Array.from({ length: 7 }, (_, i) => {
          const d = addDays(cursor, i)
          return byKey[toISO(d)] || { date: d, key: toISO(d), capacity: 0, items: [], exams: [] }
        })
      )
      cursor = addDays(cursor, 7)
    }
    return out
  }, [byKey, weeksShown, today])

  const sel = selected
    ? byKey[selected] || { key: selected, date: parseISO(selected), capacity: 0, items: [], exams: [] }
    : null

  if (!active.length && !upcoming.length) {
    return (
      <div className="card empty">
        <div className="big">Sin asignaturas que planificar</div>
        Marca alguna como «cursando» o «matriculada» en el plan de estudios.
      </div>
    )
  }

  return (
    <div className="plan-stack">
      {next && (
        <div className="card plan-hero">
          <div className="guide-label">Próxima prueba</div>
          <h3 className="plan-herotitle">
            <span className="plan-count">{next.exam ? daysBetween(today, parseISO(next.exam)) : '—'}</span>
            <span className="plan-count-unit">días · {next.name}</span>
          </h3>
          <p className="plan-sub">{next.examLabel}</p>
          {!next.examFromAgenda && (
            <p className="plan-note">
              Fecha estimada. Apunta la prueba como evaluación de tipo «examen» y el calendario usará la real.
            </p>
          )}
          <div className="plan-pressures">
            {active.map((s) => (
              <PressureBar key={s.id} subject={s} onOpen={(id) => navigate(`/asignatura/${id}`)} />
            ))}
          </div>
        </div>
      )}

      <HoursEditor />

      <div className="card">
        <div className="plan-head">
          <div>
            <h3 style={{ marginBottom: 0 }}>Calendario</h3>
            <p className="plan-sub">Toca un día para darte libre o añadir horas sueltas.</p>
          </div>
          <div className="plan-legend">
            {active.map((s) => (
              <button
                key={s.id}
                type="button"
                className="plan-legend-item"
                onClick={() => navigate(`/asignatura/${s.id}`)}
                title={`Abrir ${s.name}`}
              >
                <span className="plan-dot" style={{ background: s.color }} aria-hidden="true" />
                {s.short}
              </button>
            ))}
          </div>
        </div>

        <div className="plan-calhead" aria-hidden="true">
          {DAY_LABELS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div className="plan-week" key={wi}>
            {week.map((day) => {
              const isToday = sameDay(day.date, today)
              const isPast = day.date < today
              const overridden = state.exceptions[day.key] !== undefined
              const cls = [
                'plan-day',
                isToday ? 'is-today' : '',
                isPast ? 'is-past' : '',
                selected === day.key ? 'is-selected' : '',
                day.capacity === 0 && !isPast ? 'is-free' : ''
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={day.key}
                  type="button"
                  className={cls}
                  aria-pressed={selected === day.key}
                  aria-label={`${formatLong(day.key)}: ${
                    day.capacity > 0 ? hoursLabel(day.capacity) : 'sin estudio'
                  }${day.items.length ? `, ${day.items.length} bloques` : ''}`}
                  onClick={() => setSelected(selected === day.key ? null : day.key)}
                >
                  <span className="plan-daynum">
                    <span className="plan-dayweek" aria-hidden="true">
                      {DAY_LABELS[dow(day.date)]}
                    </span>
                    {day.date.getDate()}
                    {day.date.getDate() === 1 && <em>{MONTHS_SHORT[day.date.getMonth()]}</em>}
                    {overridden && <i className="plan-tweak" title="Ajustado a mano" />}
                  </span>
                  {day.exams.map((s) => (
                    <span key={s.id} className="plan-exam" style={{ borderColor: s.color, color: s.color }}>
                      Examen {s.short}
                    </span>
                  ))}
                  {day.items.map((it, i) => {
                    const s = subjects.find((x) => x.id === it.subjectId)
                    return (
                      <span key={`${it.unitId}-${i}`} className="plan-item" style={{ background: s?.color }}>
                        <em>{hoursLabel(it.h)}</em>
                        {it.title}
                      </span>
                    )
                  })}
                  {!day.items.length && !isPast && day.capacity === 0 && <span className="plan-freelabel">libre</span>}
                </button>
              )
            })}
          </div>
        ))}

        {weeksShown < 16 && (
          <button type="button" className="btn btn-ghost btn-sm plan-more" onClick={() => setWeeksShown((w) => w + 4)}>
            Ver más semanas
          </button>
        )}

        {sel && (
          <div className="plan-dayedit">
            <div>
              <h4>{formatLong(sel.key)}</h4>
              <p className="muted">
                {sel.capacity > 0 ? `${hoursLabel(sel.capacity)} planificadas` : 'Sin estudio este día'}
                {state.exceptions[sel.key] !== undefined && ' · ajustado a mano'}
              </p>
            </div>
            <div className="plan-dayedit-actions">
              <Stepper
                value={sel.capacity}
                onChange={(v) => setException(sel.key, v)}
                label={formatLong(sel.key)}
              />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setException(sel.key, 0)}>
                Día libre
              </button>
              {state.exceptions[sel.key] !== undefined && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setException(sel.key, null)}>
                  Usar el horario normal
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="card">
          <h3>Más adelante</h3>
          <ul className="plan-later">
            {upcoming.map((s) => (
              <li key={s.id}>
                <span className="plan-dot" style={{ background: s.color }} aria-hidden="true" />
                <button type="button" className="plan-linkname" onClick={() => navigate(`/asignatura/${s.id}`)}>
                  {s.name}
                </button>
                <span className="muted">{s.examLabel}</span>
              </li>
            ))}
          </ul>
          <p className="guide-fine">Entran en el calendario en cuanto cargues su temario.</p>
        </div>
      )}
    </div>
  )
}

/** Asignaturas del plan que aún no están en curso (para avisos). */
export function plannedSubjectIds() {
  return CURRICULUM.filter((s) => STUDY_PLANS[s.id]).map((s) => s.id)
}
