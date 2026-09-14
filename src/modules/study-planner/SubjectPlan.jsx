// ============================================================
// Plan de una asignatura: estadísticas y temario con sus fechas
// ============================================================
import React from 'react'
import { usePlanner } from './PlannerProvider.jsx'
import { HoursEditor } from './StudyOverview.jsx'
import { hoursLabel, daysBetween, startOfWeek, unitHours } from './planner-engine.js'
import { toISO, parseISO, formatShort } from '../../lib/dates.js'
import { UNIT_KINDS, planFor } from './studyPlanData.js'
import Checkbox from '../../components/Checkbox.jsx'
import { IconPlay } from '../../components/Icons.jsx'

function Stepper({ value, onChange, onClear, custom, label }) {
  return (
    <div className="plan-stepper">
      <button type="button" onClick={() => onChange(value - 0.5)} aria-label={`Menos horas: ${label}`}>
        −
      </button>
      <span className={custom ? 'is-custom' : ''} title={custom ? 'Ajustado por ti' : undefined}>
        {hoursLabel(value)}
      </span>
      <button type="button" onClick={() => onChange(value + 0.5)} aria-label={`Más horas: ${label}`}>
        +
      </button>
      {custom && (
        <button type="button" className="plan-clear" onClick={onClear} aria-label={`Volver a la estimación: ${label}`}>
          ↺
        </button>
      )}
    </div>
  )
}

export default function SubjectPlan({ subjectId, navigate }) {
  const { subjects, schedule, state, toggleDone, setUnitHours, clearUnitHours, today } = usePlanner()
  const subject = subjects.find((s) => s.id === subjectId)
  const plan = planFor(subjectId)

  // Sin ficha de temario: no es una asignatura del planificador.
  if (!plan) {
    return (
      <div className="card empty">
        <div className="big">Esta asignatura no tiene plan todavía</div>
        Añade su temario en <code>src/data/../modules/study-planner/studyPlanData.js</code> y aparecerá aquí y en el
        calendario.
      </div>
    )
  }

  // Con ficha pero fuera del planificador: aún no la cursas.
  if (!subject) {
    return (
      <div className="card empty">
        <div className="big">Todavía no está en curso</div>
        Marca la asignatura como «matriculada» o «cursando» y entrará en el reparto del calendario.
      </div>
    )
  }

  if (!subject.units.length) {
    return (
      <div className="plan-stack">
        <div className="card empty">
          <div className="big">Todavía no hay temario</div>
          {subject.examLabel}. Carga sus unidades y el planificador la coloca en el calendario junto al resto.
        </div>
      </div>
    )
  }

  const m = schedule.meta[subjectId]
  const doneSet = new Set(state.done[subjectId] || [])

  // Una asignatura puede empezar más adelante (TC arranca el 9 de nov).
  // Entonces el margen no son los días que faltan para el examen, sino
  // los que dura la asignatura: decirle «quedan 100 días» cuando solo
  // puede estudiarla 45 sería engañarle.
  const examDate = subject.exam ? parseISO(subject.exam) : null
  const startDate = subject.start ? parseISO(subject.start) : null
  const notStarted = startDate != null && daysBetween(today, startDate) > 0
  const daysLeft = examDate ? daysBetween(notStarted ? startDate : today, examDate) : null
  const windowNote =
    daysLeft == null
      ? ''
      : notStarted
        ? ` (empieza el ${formatShort(subject.start)}: ${daysLeft} días de margen)`
        : ` (quedan ${daysLeft} días)`

  // Agrupa las unidades por la semana en la que caen.
  const groups = []
  for (const u of subject.units) {
    const ud = m.unitDates[u.id]
    const isDone = doneSet.has(u.id)
    const weekKey = ud ? toISO(startOfWeek(parseISO(ud.first))) : isDone ? 'done' : 'out'
    let g = groups.find((x) => x.key === weekKey)
    if (!g) {
      g = { key: weekKey, units: [] }
      groups.push(g)
    }
    g.units.push({ ...u, ud, isDone })
  }

  return (
    <div className="plan-stack">
      {subject.provisional && (
        <div className="banner" role="status">
          <div>
            <strong>Plan provisional.</strong> El temario está reconstruido a partir del programa habitual de la
            asignatura y las horas son una estimación por peso, no salen de la guía docente oficial. Ajústalo cuando
            tengas la guía.
          </div>
        </div>
      )}

      {startDate && examDate && (
        <p className="plan-sub">
          {notStarted ? 'Empieza' : 'Empezó'} el {formatShort(subject.start)} y termina el {formatShort(subject.exam)}
          {subject.examLabel ? ` · ${subject.examLabel}` : ''}.
        </p>
      )}

      <div className="card plan-stats">
        <div>
          <strong>{hoursLabel(m.totalHours)}</strong>
          <span>de trabajo estimado</span>
        </div>
        <div>
          <strong>{hoursLabel(m.doneHours)}</strong>
          <span>ya hechas</span>
        </div>
        <div>
          <strong>{hoursLabel(m.remainingHours)}</strong>
          <span>pendientes</span>
        </div>
        <div>
          <strong className={m.deficit > 0 ? 'is-deficit' : ''}>
            {m.deficit > 0 ? `−${hoursLabel(m.deficit)}` : m.finishDate ? formatShort(m.finishDate) : '—'}
          </strong>
          <span>{m.deficit > 0 ? 'no caben antes del examen' : 'terminas el temario'}</span>
        </div>
      </div>

      {m.deficit > 0 && (
        <p className="plan-warn plan-warn-block">
          Faltan {hoursLabel(m.deficit)} para cubrir el temario antes de la prueba
          {windowNote}. Sube tus horas, recorta estimaciones o marca como hecho lo que ya domines.
        </p>
      )}

      <HoursEditor />

      <div className="card">
        <div className="plan-head">
          <div>
            <h3 style={{ marginBottom: 0 }}>Temario</h3>
            <p className="plan-sub">
              Marca lo que ya domines y ajusta lo que te vaya a costar más de la cuenta: el calendario se rehace solo.
            </p>
          </div>
          {navigate && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/calendario')}>
              Ver calendario
            </button>
          )}
        </div>

        {groups.map((g) => (
          <div key={g.key} className="plan-group">
            <h4 className="plan-groupname">
              {g.key === 'done'
                ? 'Completado'
                : g.key === 'out'
                  ? 'Sin hueco antes del examen'
                  : `Semana del ${formatShort(g.key)}`}
            </h4>
            {g.units.map((u) => {
              const key = `${subjectId}:${u.id}`
              const custom = state.hourOverrides[key] !== undefined
              const h = unitHours(state, subjectId, u)
              const kind = UNIT_KINDS[u.kind] || UNIT_KINDS.tema
              return (
                <div
                  key={u.id}
                  className={`plan-unit${u.isDone ? ' is-done' : ''}${g.key === 'out' ? ' is-out' : ''}`}
                >
                  <Checkbox
                    checked={u.isDone}
                    label={`${u.isDone ? 'Marcar como pendiente' : 'Marcar como hecho'}: ${u.t}`}
                    onChange={() => toggleDone(subjectId, u.id)}
                  />
                  <div className="plan-unitbody">
                    <span className="plan-unittitle">{u.t}</span>
                    <span className="plan-unitmeta">
                      <i className={`plan-kind ${kind.className}`}>{kind.label}</i>
                      {u.ud && !u.isDone && (
                        <span className="muted">
                          {u.ud.first === u.ud.last
                            ? formatShort(u.ud.first)
                            : `${formatShort(u.ud.first)} → ${formatShort(u.ud.last)}`}
                        </span>
                      )}
                      {g.key === 'out' && !u.isDone && <span className="muted">no cabe antes del examen</span>}
                    </span>
                  </div>
                  {navigate && !u.isDone && (
                    <button
                      type="button"
                      className="icon-btn plan-unit-go"
                      title={`Estudiar: ${u.t}`}
                      aria-label={`Estudiar: ${u.t}`}
                      onClick={() => navigate(`/sesion/${subjectId}/${u.id}`)}
                    >
                      <IconPlay aria-hidden="true" />
                    </button>
                  )}
                  <Stepper
                    value={h}
                    custom={custom}
                    label={u.t}
                    onChange={(v) => setUnitHours(subjectId, u.id, v)}
                    onClear={() => clearUnitHours(subjectId, u.id)}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
