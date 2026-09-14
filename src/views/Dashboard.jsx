import React, { useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM, STATUS_META, BLOCKS, academicYearOf, blockOf, ectsOf } from '../data/curriculum.js'
import { todayISO, relativeLabel, minutesLabel, dayNum, monthShort, isOverdue, formatLong, formatShort, toISO, daysUntil } from '../lib/dates.js'
import { weekMinutes, streak, transcript } from '../lib/stats.js'
import Checkbox from '../components/Checkbox.jsx'
import { IconCards, IconCalendar, IconBook, IconDrive } from '../components/Icons.jsx'
import { StudySummary } from '../modules/study-planner/StudyOverview.jsx'

export default function Dashboard({ navigate }) {
  const { data, dispatch, syncStatus } = useStore()
  const settings = data.settings || {}
  const today = todayISO()
  const course = academicYearOf()
  const block = blockOf()

  const active = useMemo(
    () =>
      CURRICULUM.filter((s) => {
        const st = data.subjects[s.id]?.status
        return st === 'cursando' || st === 'matriculada'
      }),
    [data.subjects]
  )

  const blockSubjects = useMemo(
    () => active.filter((s) => s.block === block.id),
    [active, block.id]
  )

  const upcomingTasks = useMemo(
    () =>
      data.tasks
        .filter((t) => !t.done)
        .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
        .slice(0, 6),
    [data.tasks]
  )

  const soonTasks = useMemo(
    () => data.tasks.filter((t) => !t.done && t.due && daysUntil(t.due) <= 7).sort((a, b) => a.due.localeCompare(b.due)),
    [data.tasks]
  )

  const upcomingSessions = useMemo(() => {
    return data.sessions
      .filter((s) => !s.done && s.date && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [data.sessions, today])

  const todaySlots = useMemo(() => {
    const dow = (new Date().getDay() + 6) % 7
    return data.schedule.filter((s) => s.weekday === dow).sort((a, b) => (a.start || '').localeCompare(b.start || ''))
  }, [data.schedule])

  const week = useMemo(() => weekMinutes(data), [data])
  const days = useMemo(() => streak(data), [data])
  const goal = Number(settings.weeklyGoalMin) || 0
  const goalPct = goal > 0 ? Math.min(100, Math.round((week / goal) * 100)) : 0

  const dueCards = useMemo(() => {
    let n = 0
    for (const deck of Object.values(data.decks)) {
      if (!Array.isArray(deck)) continue
      n += deck.filter((c) => c && (!c.nextReview || c.nextReview <= today)).length
    }
    return n
  }, [data.decks, today])

  const tr = useMemo(() => transcript(data), [data])

  const subjName = (id) => CURRICULUM.find((s) => s.id === id)?.name || '—'
  const statusMeta = (st) => STATUS_META[st] || STATUS_META.pendiente

  // Aviso de copia de seguridad: sin Drive y sin exportar en 14 días
  const hasData = data.sessions.length + data.tasks.length + Object.keys(data.decks).length > 0
  const lastExport = settings.lastExportAt ? Date.parse(settings.lastExportAt) : 0
  const needsBackup =
    hasData && syncStatus !== 'synced' && syncStatus !== 'syncing' && Date.now() - lastExport > 14 * 86400000

  const open = (path) => () => navigate(path)
  const key = (path) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(path)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1>Hola, Carlos</h1>
        <div className="sub">
          Curso {course.label} · Bachelor en Ingeniería Informática · UNIPRO
        </div>
      </div>

      {!settings.onboardingDone && (
        <div className="card onboarding" role="region" aria-label="Primeros pasos">
          <h3>Bienvenido a NÚCLEO</h3>
          <ol>
            <li>
              En <a href="#/plan">Plan de estudios</a> tienes las 30 asignaturas; entra en cada una y ajusta su estado.
            </li>
            <li>
              Cada asignatura tiene una <strong>Guía de estudio</strong>: temario, recursos y laboratorio. Marca los temas
              según los estudies.
            </li>
            <li>
              Registra clases, sesiones y evaluaciones; usa el <a href="#/estudio">pomodoro y las flashcards</a> para
              estudiar.
            </li>
            <li>
              Pon tu horario semanal en <a href="#/agenda">Agenda</a> y un objetivo de horas en{' '}
              <a href="#/ajustes">Ajustes</a>. Aquí verás cada día qué toca.
            </li>
            <li>
              Pulsa <span className="kbd">?</span> para ver la ayuda y <span className="kbd">Ctrl</span>+
              <span className="kbd">K</span> para buscar cualquier cosa.
            </li>
          </ol>
          <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'setSettings', patch: { onboardingDone: true } })}>
            Entendido
          </button>
        </div>
      )}

      {needsBackup && (
        <div className="banner" role="status">
          <IconDrive style={{ width: 18, height: 18, flexShrink: 0 }} aria-hidden="true" />
          <div>
            Tus datos solo están en este navegador y hace más de dos semanas de la última copia. Conecta Drive o{' '}
            <a href="#/ajustes">exporta una copia</a> en Ajustes.
          </div>
        </div>
      )}

      {/* ---------- HOY ---------- */}
      <div className="card today" role="region" aria-label="Hoy">
        <div className="today-head">
          <div>
            <div className="guide-label">Hoy</div>
            <h3 style={{ marginBottom: 0 }} className="cap-first">
              {formatLong(today)}
            </h3>
          </div>
          <span className="chip block" style={{ background: block.color }}>
            {block.upcoming ? 'Próximo bloque' : 'Bloque'} {block.label} · {formatShort(toISO(block.from))} – {formatShort(toISO(block.to))}
          </span>
        </div>

        <div className="today-grid">
          <div className="today-col">
            <div className="guide-label">Horario de hoy</div>
            {todaySlots.length === 0 ? (
              <div className="today-empty">
                Nada programado. <a href="#/agenda">Pon tu horario semanal</a>.
              </div>
            ) : (
              <ul className="today-list">
                {todaySlots.map((s) => (
                  <li key={s.id}>
                    <span className="today-time">{s.start}{s.end ? `–${s.end}` : ''}</span>
                    <a href={s.subjectId ? `#/asignatura/${s.subjectId}` : '#/agenda'}>
                      {s.title || subjName(s.subjectId)}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="today-col">
            <div className="guide-label">Pendiente</div>
            <ul className="today-list">
              <li>
                <IconCards aria-hidden="true" />
                {dueCards > 0 ? (
                  <a href="#/estudio">{dueCards} tarjeta{dueCards === 1 ? '' : 's'} por repasar</a>
                ) : (
                  <span className="muted">Repaso al día</span>
                )}
              </li>
              {soonTasks.length === 0 ? (
                <li>
                  <IconCalendar aria-hidden="true" />
                  <span className="muted">Sin entregas en 7 días</span>
                </li>
              ) : (
                soonTasks.slice(0, 4).map((t) => (
                  <li key={t.id} className={isOverdue(t.due) ? 'overdue' : ''}>
                    <IconCalendar aria-hidden="true" />
                    <a href={`#/asignatura/${t.subjectId}`}>
                      {t.title} · {relativeLabel(t.due)}
                    </a>
                  </li>
                ))
              )}
              {blockSubjects.length > 0 && (
                <li>
                  <IconBook aria-hidden="true" />
                  <span>
                    Este bloque:{' '}
                    {blockSubjects.map((s, i) => (
                      <React.Fragment key={s.id}>
                        {i > 0 && ', '}
                        <a href={`#/asignatura/${s.id}`}>{s.name}</a>
                      </React.Fragment>
                    ))}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="today-col">
            <div className="guide-label">Esta semana</div>
            <div className="goal">
              <div className="goal-nums">
                <strong>{minutesLabel(week)}</strong>
                {goal > 0 && <span className="muted"> de {minutesLabel(goal)}</span>}
              </div>
              {goal > 0 && (
                <div className="progress gold" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={week} aria-label="Objetivo semanal de estudio">
                  <div style={{ width: `${goalPct}%` }} />
                </div>
              )}
              <div className="streak">
                {days > 0 ? (
                  <>
                    <strong>{days}</strong> día{days === 1 ? '' : 's'} seguido{days === 1 ? '' : 's'} estudiando
                  </>
                ) : (
                  <span className="muted">Registra una sesión o un pomodoro para empezar la racha</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <StudySummary navigate={navigate} />
      </div>

      <div className="grid-3" style={{ margin: '20px 0' }}>
        <div className="stat">
          <div className="num">{active.length}</div>
          <div className="lbl">asignaturas este curso</div>
        </div>
        <div className="stat">
          <div className="num">{tr.passedEcts}<span className="stat-of">/{tr.totalEcts}</span></div>
          <div className="lbl">ECTS superados · {tr.inProgressEcts} en curso</div>
        </div>
        <div className="stat">
          <div className="num">{tr.average != null ? tr.average.toFixed(2) : '—'}</div>
          <div className="lbl">nota media (ponderada por ECTS)</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <h3>Mis asignaturas</h3>
            <div className="row-list">
              {active.map((s) => {
                const st = data.subjects[s.id]?.status || 'pendiente'
                const tp = data.topicProgress?.[s.id]
                const pct = tp && tp.total > 0 ? Math.round((tp.done.length / tp.total) * 100) : null
                return (
                  <div
                    key={s.id}
                    className="row-item clickable"
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir ${s.name}`}
                    onClick={open(`/asignatura/${s.id}`)}
                    onKeyDown={key(`/asignatura/${s.id}`)}
                  >
                    <span className="chip" style={{ background: BLOCKS[s.block].color, color: '#2a2a24' }}>
                      {BLOCKS[s.block].label}
                    </span>
                    <div className="grow">
                      <div className="title">{s.name}</div>
                      <div className="meta">
                        {ectsOf(s)} ECTS{pct != null ? ` · temario ${pct} %` : ''}
                      </div>
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
                    <div className="d">{t.due ? dayNum(t.due) : '·'}</div>
                    <div className="m">{t.due ? monthShort(t.due) : 'sin fecha'}</div>
                  </div>
                  <div className="grow" style={{ flex: 1, minWidth: 0 }}>
                    <div className="title" style={{ fontWeight: 600, fontSize: 14 }}>
                      {t.title}
                    </div>
                    <div className="meta" style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
                      {subjName(t.subjectId)} · {t.type}
                      {t.due ? ` · ${relativeLabel(t.due)}` : ''}
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
                  aria-valuemax={tr.totalEcts}
                  aria-valuenow={tr.passedEcts}
                  aria-label="ECTS superados"
                >
                  <div style={{ width: `${Math.round((tr.passedEcts / tr.totalEcts) * 100)}%` }} />
                </div>
              </div>
              <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--pine)' }}>
                {Math.round((tr.passedEcts / tr.totalEcts) * 100)} %
              </strong>
            </div>
            <div className="meta" style={{ fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 8 }}>
              {tr.nPassed} de {CURRICULUM.length} asignaturas aprobadas o reconocidas · {tr.passedEcts} de {tr.totalEcts} ECTS.
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
