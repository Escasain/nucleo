import React, { useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM, STATUS_META, BLOCKS } from '../data/curriculum.js'
import { todayISO, relativeLabel, minutesLabel, dayNum, monthShort, isOverdue } from '../lib/dates.js'
import Checkbox from '../components/Checkbox.jsx'

export default function Dashboard({ navigate }) {
  const { data, dispatch } = useStore()

  const active = useMemo(
    () =>
      CURRICULUM.filter((s) => {
        const st = data.subjects[s.id]?.status
        return st === 'cursando' || st === 'matriculada'
      }),
    [data.subjects]
  )

  const approved = CURRICULUM.filter((s) => {
    const st = data.subjects[s.id]?.status
    return st === 'aprobada' || st === 'reconocida'
  }).length

  const upcomingTasks = useMemo(
    () =>
      data.tasks
        .filter((t) => !t.done)
        .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
        .slice(0, 6),
    [data.tasks]
  )

  const upcomingSessions = useMemo(() => {
    const today = todayISO()
    return data.sessions
      .filter((s) => !s.done && s.date && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [data.sessions])

  const weekMinutes = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    const startISO = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    return data.pomodoro
      .filter((p) => p.date && p.date >= startISO)
      .reduce((acc, p) => acc + (Number(p.minutes) || 0), 0)
  }, [data.pomodoro])

  const dueCards = useMemo(() => {
    const today = todayISO()
    let n = 0
    for (const deck of Object.values(data.decks)) {
      if (!Array.isArray(deck)) continue
      n += deck.filter((c) => c && (!c.nextReview || c.nextReview <= today)).length
    }
    return n
  }, [data.decks])

  const subjName = (id) => CURRICULUM.find((s) => s.id === id)?.name || '—'
  const statusMeta = (st) => STATUS_META[st] || STATUS_META.pendiente

  return (
    <div>
      <div className="page-head">
        <h1>Hola, Carlos</h1>
        <div className="sub">
          Curso 2026/27 · Bachelor en Ingeniería Informática · UNIPRO
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="num">{active.length}</div>
          <div className="lbl">asignaturas este curso</div>
        </div>
        <div className="stat">
          <div className="num">{minutesLabel(weekMinutes)}</div>
          <div className="lbl">estudiados en los últimos 7 días</div>
        </div>
        <div className="stat">
          <div className="num">{dueCards}</div>
          <div className="lbl">tarjetas por repasar hoy</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <h3>Mis asignaturas</h3>
            <div className="row-list">
              {active.map((s) => {
                const st = data.subjects[s.id]?.status || 'pendiente'
                return (
                  <div
                    key={s.id}
                    className="row-item clickable"
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir ${s.name}`}
                    onClick={() => navigate(`/asignatura/${s.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/asignatura/${s.id}`)
                      }
                    }}
                  >
                    <span className="chip" style={{ background: BLOCKS[s.block].color, color: '#2a2a24' }}>
                      {BLOCKS[s.block].label}
                    </span>
                    <div className="grow">
                      <div className="title">{s.name}</div>
                    </div>
                    <span className="chip" style={{ color: statusMeta(st).color }}>
                      <span className="dot" />
                      {statusMeta(st).label}
                    </span>
                  </div>
                )
              })}
              {active.length === 0 && (
                <div className="empty">No hay asignaturas en curso. Márcalas en el plan de estudios.</div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Próximas clases y sesiones</h3>
            <div className="row-list">
              {upcomingSessions.map((s) => (
                <div key={s.id} className="row-item">
                  <Checkbox
                    checked={false}
                    label={`Marcar como hecha: ${s.title}`}
                    onChange={() => dispatch({ type: 'updateSession', id: s.id, patch: { done: true } })}
                  />
                  <div className="grow">
                    <div className="title">{s.title}</div>
                    <div className="meta">
                      {subjName(s.subjectId)} · {relativeLabel(s.date)}
                      {s.durationMin ? ` · ${minutesLabel(s.durationMin)}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && (
                <div className="empty">Nada programado. Añade clases desde cada asignatura.</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Próximas entregas y exámenes</h3>
            <div className="row-list">
              {upcomingTasks.map((t) => (
                <div key={t.id} className={`deadline-item${isOverdue(t.due) ? ' overdue' : ''}`}>
                  <div className="deadline-date">
                    <div className="d">{dayNum(t.due)}</div>
                    <div className="m">{monthShort(t.due)}</div>
                  </div>
                  <div className="grow" style={{ flex: 1, minWidth: 0 }}>
                    <div className="title" style={{ fontWeight: 600, fontSize: 14 }}>
                      {t.title}
                    </div>
                    <div className="meta" style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
                      {subjName(t.subjectId)} · {t.type} · {relativeLabel(t.due)}
                    </div>
                  </div>
                  <Checkbox
                    checked={false}
                    label={`Marcar como hecha: ${t.title}`}
                    onChange={() => dispatch({ type: 'updateTask', id: t.id, patch: { done: true } })}
                  />
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="empty">
                  <div className="big">Agenda despejada</div>
                  Añade entregas y exámenes desde la agenda o cada asignatura.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Progreso del grado</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={CURRICULUM.length}
                  aria-valuenow={approved}
                  aria-label="Asignaturas aprobadas o reconocidas"
                >
                  <div style={{ width: `${Math.round((approved / CURRICULUM.length) * 100)}%` }} />
                </div>
              </div>
              <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--pine)' }}>
                {approved}/{CURRICULUM.length}
              </strong>
            </div>
            <div className="meta" style={{ fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 8 }}>
              Asignaturas aprobadas o reconocidas sobre el total del plan.
            </div>
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/plan')}>
                Ver plan de estudios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
