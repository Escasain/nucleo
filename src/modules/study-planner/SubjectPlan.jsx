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
  const daysLeft = subject.exam ? daysBetween(today, parseISO(subject.exam)) : null

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
            <strong>Plan provisional.</strong> Los temas y las horas de esta asignatura están inventados para poder
            repartir el tiempo. Sustitúyelos por el temario real cuando lo tengas.
          </div>
        </div>
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
          {daysLeft != null ? ` (quedan ${daysLeft} días)` : ''}. Sube tus horas, recorta estimaciones o marca como
          hecho lo que ya domines.
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
