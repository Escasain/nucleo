import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM } from '../data/curriculum.js'
import { todayISO, minutesLabel } from '../lib/dates.js'
import { minutesByDay, lastNDays, weekMinutes, streak, minutesBySubject } from '../lib/stats.js'
import Modal from '../components/Modal.jsx'
import { IconPlus, IconTrash, IconExternal } from '../components/Icons.jsx'
import { STUDENT_KIT, UNIPRO_EVALUATION } from '../data/guide/meta.js'

export default function Study({ subjectId, navigate }) {
  const { data } = useStore()

  const subjects = useMemo(() => {
    const withActivity = new Set(Object.keys(data.decks))
    return CURRICULUM.filter((s) => {
      const st = data.subjects[s.id]?.status
      return st === 'cursando' || st === 'matriculada' || withActivity.has(s.id)
    })
  }, [data.subjects, data.decks])

  const selected = subjectId && CURRICULUM.some((s) => s.id === subjectId) ? subjectId : null

  return (
    <div>
      <div className="page-head">
        <h1>Estudio</h1>
        <div className="sub">Flashcards con repaso espaciado y temporizador pomodoro</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <h3>Flashcards</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {subjects.map((s) => {
                const deck = data.decks[s.id] || []
                const today = todayISO()
                const due = deck.filter((c) => c && (!c.nextReview || c.nextReview <= today)).length
                return (
                  <button
                    key={s.id}
                    className={`btn btn-sm ${selected === s.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => navigate(`/estudio/${s.id}`)}
                  >
                    {s.name.length > 30 ? s.name.slice(0, 28) + '…' : s.name}
                    {due > 0 && (
                      <span
                        style={{
                          background: 'var(--gold)',
                          color: '#2a2a24',
                          borderRadius: 999,
                          fontSize: 11,
                          padding: '1px 7px',
                          fontWeight: 700
                        }}
                      >
                        {due}
                      </span>
                    )}
                  </button>
                )
              })}
              {subjects.length === 0 && (
                <div className="empty">Marca asignaturas como «cursando» en el plan para empezar.</div>
              )}
            </div>
            {selected ? (
              <Deck subjectId={selected} />
            ) : (
              <div className="empty">Elige una asignatura para repasar o crear tarjetas.</div>
            )}
          </div>
        </div>

        <div>
          <Pomodoro subjects={subjects} />
          <StudyStats />
          <StudentKit />
        </div>
      </div>
    </div>
  )
}

/* ---------------- Estadísticas de estudio ---------------- */

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function StudyStats() {
  const { data } = useStore()
  const goal = Number(data.settings?.weeklyGoalMin) || 0
  const byDay = useMemo(() => minutesByDay(data), [data])
  const days = useMemo(() => lastNDays(7), [])
  const week = useMemo(() => weekMinutes(data), [data])
  const run = useMemo(() => streak(data), [data])
  const bySubject = useMemo(() => {
    const m = minutesBySubject(data)
    return Object.entries(m)
      .map(([id, min]) => ({ id, min, name: id === '_' ? 'Sin asignatura' : CURRICULUM.find((s) => s.id === id)?.name || id }))
      .sort((a, b) => b.min - a.min)
      .slice(0, 8)
  }, [data])
  const max = Math.max(60, ...days.map((d) => byDay[d] || 0))
  const total = days.reduce((acc, d) => acc + (byDay[d] || 0), 0)
  const maxSubj = Math.max(1, ...bySubject.map((x) => x.min))

  return (
    <div className="card">
      <h3>Tu estudio</h3>
      <div className="stats-row">
        <div>
          <div className="stat-num">{minutesLabel(week)}</div>
          <div className="stat-lbl">esta semana{goal > 0 ? ` · objetivo ${minutesLabel(goal)}` : ''}</div>
          {goal > 0 && (
            <div className="progress gold" style={{ marginTop: 6 }} role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={week} aria-label="Objetivo semanal">
              <div style={{ width: `${Math.min(100, Math.round((week / goal) * 100))}%` }} />
            </div>
          )}
        </div>
        <div>
          <div className="stat-num">{run}</div>
          <div className="stat-lbl">día{run === 1 ? '' : 's'} de racha</div>
        </div>
        <div>
          <div className="stat-num">{minutesLabel(total)}</div>
          <div className="stat-lbl">últimos 7 días</div>
        </div>
      </div>
      <div className="bars" role="img" aria-label={`Minutos por día en los últimos 7 días: ${days.map((d) => byDay[d] || 0).join(', ')}`}>
        {days.map((d) => {
          const v = byDay[d] || 0
          const dow = (new Date(d + 'T00:00:00').getDay() + 6) % 7
          return (
            <div className="bar" key={d} title={`${d}: ${minutesLabel(v)}`}>
              <div className="bar-fill" style={{ height: `${Math.round((v / max) * 100)}%` }} />
              <div className="bar-lbl">{DOW[dow]}</div>
            </div>
          )
        })}
      </div>
      {bySubject.length > 0 && (
        <>
          <div className="guide-label" style={{ marginTop: 12 }}>
            Por asignatura
          </div>
          <ul className="subj-bars">
            {bySubject.map((x) => (
              <li key={x.id}>
                <span className="subj-name">{x.name}</span>
                <span className="subj-track">
                  <span className="subj-fill" style={{ width: `${Math.round((x.min / maxSubj) * 100)}%` }} />
                </span>
                <span className="subj-min">{minutesLabel(x.min)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {goal === 0 && (
        <p className="guide-fine">
          Pon un objetivo semanal en <a href="#/ajustes">Ajustes</a> para ver tu progreso aquí y en Inicio.
        </p>
      )}
    </div>
  )
}

/* ---------------- Kit del estudiante ---------------- */

function StudentKit() {
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <button
        type="button"
        className="guide-toggle"
        aria-expanded={open}
        aria-controls="student-kit"
        onClick={() => setOpen((v) => !v)}
      >
        <h3 style={{ marginBottom: 0 }}>Kit del estudiante</h3>
        <span className="guide-toggle-hint">{open ? 'Ocultar' : `${STUDENT_KIT.length} herramientas`}</span>
      </button>
      <p className="guide-summary" style={{ marginTop: 8 }}>
        Lo que sirve para todas las asignaturas. Cada asignatura tiene además su propia guía con temario, recursos
        y laboratorio en la pestaña «Guía de estudio».
      </p>
      {open && (
        <div id="student-kit">
          <ul className="guide-list">
            {STUDENT_KIT.map((k) => (
              <li className="guide-res" key={k.url}>
                <span className="guide-res-icon" aria-hidden="true">
                  🛠️
                </span>
                <div className="guide-res-body">
                  <a href={k.url} target="_blank" rel="noreferrer noopener" className="guide-res-title">
                    {k.title}
                    <IconExternal aria-hidden="true" />
                  </a>
                  <div className="guide-res-note">{k.note}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="guide-eval" style={{ marginTop: 12 }}>
            <div className="guide-label">Cómo evalúa UNIPRO</div>
            <p>{UNIPRO_EVALUATION.summary}</p>
            <p style={{ marginBottom: 0 }}>{UNIPRO_EVALUATION.method}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Flashcards ---------------- */

function Deck({ subjectId }) {
  const { data, dispatch } = useStore()
  const deck = useMemo(
    () => (Array.isArray(data.decks[subjectId]) ? data.decks[subjectId] : []),
    [data.decks, subjectId]
  )
  const [mode, setMode] = useState('repaso') // 'repaso' | 'gestionar'
  const [addModal, setAddModal] = useState(false)
  const [flipped, setFlipped] = useState(false)

  const due = useMemo(() => {
    const today = todayISO()
    return deck
      .filter((c) => c && (!c.nextReview || c.nextReview <= today))
      .sort((a, b) => (a.reviewedAt || 0) - (b.reviewedAt || 0))
  }, [deck])
  const current = due[0] || null
  const currentId = current ? current.id : null

  useEffect(() => {
    setFlipped(false)
  }, [currentId])

  function review(quality) {
    if (!current) return
    dispatch({ type: 'reviewCard', subjectId, id: current.id, quality })
    setFlipped(false)
  }

  return (
    <div>
      <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
        <button
          role="tab"
          aria-selected={mode === 'repaso'}
          className={mode === 'repaso' ? 'active' : ''}
          onClick={() => setMode('repaso')}
        >
          Repasar ({due.length})
        </button>
        <button
          role="tab"
          aria-selected={mode === 'gestionar'}
          className={mode === 'gestionar' ? 'active' : ''}
          onClick={() => setMode('gestionar')}
        >
          Tarjetas ({deck.length})
        </button>
      </div>

      {mode === 'repaso' &&
        (current ? (
          <div>
            <div
              className={`flashcard${flipped ? ' back' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setFlipped((f) => !f)
                }
              }}
            >
              <div className="side-label">{flipped ? 'Respuesta' : 'Pregunta · toca para girar'}</div>
              <div className="content">{flipped ? current.back : current.front}</div>
            </div>
            {flipped && (
              <div className="review-buttons">
                <button className="btn btn-danger" onClick={() => review('otra')}>
                  Otra vez
                </button>
                <button className="btn btn-secondary" onClick={() => review('bien')}>
                  Bien
                </button>
                <button className="btn btn-primary" onClick={() => review('facil')}>
                  Fácil
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty">
            <div className="big">Repaso al día</div>
            {deck.length === 0
              ? 'Crea tus primeras tarjetas en la pestaña «Tarjetas».'
              : 'No hay tarjetas pendientes hoy. Vuelve mañana.'}
          </div>
        ))}

      {mode === 'gestionar' && (
        <div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)} style={{ marginBottom: 12 }}>
            <IconPlus style={{ width: 13, height: 13 }} /> Nueva tarjeta
          </button>
          <div className="row-list">
            {deck.map((c) => (
              <div key={c.id} className="row-item">
                <div className="grow">
                  <div className="title">{c.front}</div>
                  <div className="meta">
                    {(c.back || '').length > 80 ? c.back.slice(0, 78) + '…' : c.back} · caja {c.box || 1} ·
                    próx. {c.nextReview || todayISO()}
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Borrar tarjeta: ${c.front}`}
                  title="Borrar tarjeta"
                  onClick={() => dispatch({ type: 'deleteCard', subjectId, id: c.id })}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
            {deck.length === 0 && <div className="empty">Todavía no hay tarjetas en este mazo.</div>}
          </div>
        </div>
      )}

      {addModal && (
        <CardModal
          onClose={() => setAddModal(false)}
          onSave={(front, back) => {
            dispatch({ type: 'addCard', subjectId, front, back })
            setAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function CardModal({ onClose, onSave }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  return (
    <Modal title="Nueva tarjeta" onClose={onClose}>
      <div className="field">
        <label>Anverso (pregunta)</label>
        <textarea rows={3} value={front} onChange={(e) => setFront(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label>Reverso (respuesta)</label>
        <textarea rows={4} value={back} onChange={(e) => setBack(e.target.value)} />
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          disabled={!front.trim() || !back.trim()}
          onClick={() => onSave(front.trim(), back.trim())}
        >
          Guardar
        </button>
      </div>
    </Modal>
  )
}

/* ---------------- Pomodoro ---------------- */

const FOCUS_MIN = 25
const BREAK_MIN = 5

function Pomodoro({ subjects }) {
  const { dispatch, toast } = useStore()
  const [phase, setPhase] = useState('focus') // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60)
  const [running, setRunning] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const focusSeconds = useRef(0) // segundos de concentración de la fase actual

  // El tic solo descuenta tiempo. El cambio de fase vive en su propio
  // efecto: llamar a dispatch/setState dentro del actualizador de
  // useState se ejecuta dos veces en StrictMode y duplicaba los
  // pomodoros registrados.
  const finished = secondsLeft <= 0
  useEffect(() => {
    if (!running || finished) return undefined
    const t = setInterval(() => {
      if (phase === 'focus') focusSeconds.current += 1
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [running, phase, finished])

  useEffect(() => {
    if (!running || !finished) return
    if (phase === 'focus') {
      dispatch({ type: 'logPomodoro', minutes: FOCUS_MIN, subjectId: subjectId || null })
      toast(`Pomodoro completado · ${FOCUS_MIN} min registrados · descansa ${BREAK_MIN}`)
      focusSeconds.current = 0
      setPhase('break')
      setSecondsLeft(BREAK_MIN * 60)
    } else {
      toast('Descanso terminado · a por otro pomodoro')
      setPhase('focus')
      setRunning(false)
      setSecondsLeft(FOCUS_MIN * 60)
    }
  }, [running, finished, phase, subjectId, dispatch, toast])

  function stop() {
    // Al parar a mitad de un foco, registra los minutos completos hechos
    const mins = Math.floor(focusSeconds.current / 60)
    if (phase === 'focus' && mins >= 1) {
      dispatch({ type: 'logPomodoro', minutes: mins, subjectId: subjectId || null })
      toast(`${mins} min registrados`)
    }
    focusSeconds.current = 0
    setRunning(false)
    setPhase('focus')
    setSecondsLeft(FOCUS_MIN * 60)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const atStart = phase === 'focus' && secondsLeft === FOCUS_MIN * 60

  return (
    <div className="card pomodoro">
      <div className="phase">{phase === 'focus' ? 'Concentración' : 'Descanso'}</div>
      <div className="time" role="timer" aria-live="off">
        {mm}:{ss}
      </div>
      <div style={{ maxWidth: 280, margin: '16px auto 0' }}>
        <label htmlFor="pomodoro-subject" className="sr-only">
          Asignatura del pomodoro
        </label>
        <select id="pomodoro-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Sin asignatura concreta</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="controls">
        {!running ? (
          <button className="btn btn-primary" onClick={() => setRunning(true)}>
            {atStart ? 'Empezar' : 'Continuar'}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setRunning(false)}>
            Pausa
          </button>
        )}
        <button className="btn btn-ghost" onClick={stop} disabled={atStart && !running}>
          Terminar
        </button>
      </div>
    </div>
  )
}
