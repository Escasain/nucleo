import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM } from '../data/curriculum.js'
import { dayNum, monthShort, relativeLabel, isOverdue, todayISO, toISO, parseISO } from '../lib/dates.js'
import Checkbox from '../components/Checkbox.jsx'
import Modal from '../components/Modal.jsx'
import { IconPlus, IconTrash } from '../components/Icons.jsx'
import { TaskModal } from './SubjectDetail.jsx'
import StudyOverview from '../modules/study-planner/StudyOverview.jsx'

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default function Agenda({ navigate }) {
  const { data, dispatch } = useStore()
  const [showDone, setShowDone] = useState(false)
  const [modal, setModal] = useState(false)
  const [view, setView] = useState('lista') // 'lista' | 'mes' | 'horario' | 'planificador'

  const subjName = (id) => CURRICULUM.find((s) => s.id === id)?.name || '—'

  const tasks = useMemo(
    () =>
      data.tasks
        .filter((t) => (showDone ? true : !t.done))
        .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')),
    [data.tasks, showDone]
  )

  const relevantSubjects = useMemo(
    () =>
      CURRICULUM.filter((s) => {
        const st = data.subjects[s.id]?.status
        return st === 'cursando' || st === 'matriculada'
      }),
    [data.subjects]
  )

  return (
    <div>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Agenda</h1>
          <div className="sub">Entregas, exámenes, horario semanal y calendario de estudio</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <IconPlus style={{ width: 14, height: 14 }} aria-hidden="true" /> Nueva evaluación
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="Vista de la agenda">
        <button role="tab" aria-selected={view === 'lista'} className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')}>
          Lista
        </button>
        <button role="tab" aria-selected={view === 'mes'} className={view === 'mes' ? 'active' : ''} onClick={() => setView('mes')}>
          Mes
        </button>
        <button role="tab" aria-selected={view === 'horario'} className={view === 'horario' ? 'active' : ''} onClick={() => setView('horario')}>
          Horario semanal
        </button>
        <button
          role="tab"
          aria-selected={view === 'planificador'}
          className={view === 'planificador' ? 'active' : ''}
          onClick={() => setView('planificador')}
        >
          Planificador
        </button>
      </div>

      {view === 'lista' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDone((v) => !v)}>
              {showDone ? 'Ocultar completadas' : 'Mostrar completadas'}
            </button>
          </div>
          {tasks.map((t) => (
            <div key={t.id} className={`deadline-item${!t.done && isOverdue(t.due) ? ' overdue' : ''}`}>
              <div className="deadline-date">
                <div className="d">{t.due ? dayNum(t.due) : '·'}</div>
                <div className="m">{t.due ? monthShort(t.due) : 'sin fecha'}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0, opacity: t.done ? 0.55 : 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
                  <a
                    href={`#/asignatura/${t.subjectId}`}
                    style={{ color: 'inherit' }}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/asignatura/${t.subjectId}`)
                    }}
                  >
                    {subjName(t.subjectId)}
                  </a>
                  {' · '}
                  {t.type}
                  {t.due ? ` · ${relativeLabel(t.due)}` : ''}
                </div>
              </div>
              <Checkbox
                checked={Boolean(t.done)}
                label={`Marcar como hecha: ${t.title}`}
                onChange={() => dispatch({ type: 'updateTask', id: t.id, patch: { done: !t.done } })}
              />
              <button
                className="icon-btn"
                aria-label={`Borrar: ${t.title}`}
                title="Borrar"
                onClick={() => dispatch({ type: 'deleteTask', id: t.id })}
              >
                <IconTrash />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="empty">
              <div className="big">Nada pendiente</div>
              Añade entregas y exámenes con el botón de arriba.
            </div>
          )}
        </div>
      )}

      {view === 'mes' && <MonthView data={data} navigate={navigate} subjName={subjName} />}

      {view === 'horario' && <WeeklySchedule data={data} dispatch={dispatch} subjects={relevantSubjects} subjName={subjName} />}

      {view === 'planificador' && <StudyOverview navigate={navigate} />}

      {modal && (
        <TaskModal
          subjectSelector
          subjects={relevantSubjects.length > 0 ? relevantSubjects : CURRICULUM}
          onClose={() => setModal(false)}
          onSave={(task) => {
            dispatch({ type: 'addTask', task })
            setModal(false)
          }}
        />
      )}
    </div>
  )
}

/* ---------------- Vista mensual ---------------- */

function MonthView({ data, navigate, subjName }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [selected, setSelected] = useState(todayISO())
  const today = todayISO()

  const first = new Date(cursor.y, cursor.m, 1)
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // lunes = 0

  const byDay = useMemo(() => {
    const map = {}
    for (const t of data.tasks) if (t.due) (map[t.due] ||= { tasks: [], sessions: [] }).tasks.push(t)
    for (const s of data.sessions) if (s.date) (map[s.date] ||= { tasks: [], sessions: [] }).sessions.push(s)
    return map
  }, [data.tasks, data.sessions])

  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(cursor.y, cursor.m, d)))

  const sel = byDay[selected] || { tasks: [], sessions: [] }
  const move = (delta) => {
    const d = new Date(cursor.y, cursor.m + delta, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div className="card">
      <div className="month-head">
        <button className="btn btn-ghost btn-sm" onClick={() => move(-1)} aria-label="Mes anterior">
          ‹
        </button>
        <h3 style={{ marginBottom: 0 }}>
          {MONTHS[cursor.m]} {cursor.y}
        </h3>
        <button className="btn btn-ghost btn-sm" onClick={() => move(1)} aria-label="Mes siguiente">
          ›
        </button>
      </div>
      <div className="month-grid" role="grid" aria-label="Calendario mensual">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((w) => (
          <div key={w} className="month-wd" aria-hidden="true">
            {w}
          </div>
        ))}
        {cells.map((iso, i) =>
          iso ? (
            <button
              key={iso}
              type="button"
              className={`month-day${iso === today ? ' is-today' : ''}${iso === selected ? ' is-selected' : ''}`}
              onClick={() => setSelected(iso)}
              aria-label={`${dayNum(iso)} de ${MONTHS[cursor.m]}${byDay[iso] ? `, ${byDay[iso].tasks.length} evaluaciones y ${byDay[iso].sessions.length} sesiones` : ''}`}
              aria-pressed={iso === selected}
            >
              <span className="month-num">{dayNum(iso)}</span>
              <span className="month-dots">
                {byDay[iso]?.tasks.some((t) => !t.done) && <span className="dot-task" />}
                {byDay[iso]?.sessions.length > 0 && <span className="dot-session" />}
              </span>
            </button>
          ) : (
            <div key={`e${i}`} />
          )
        )}
      </div>
      <div className="month-legend">
        <span>
          <span className="dot-task" /> evaluación
        </span>
        <span>
          <span className="dot-session" /> clase o sesión
        </span>
      </div>
      <div className="month-detail">
        <div className="guide-label" style={{ textTransform: 'none', letterSpacing: 0 }}>
          {relativeLabel(selected)} · {dayNum(selected)} de {MONTHS[parseISO(selected).getMonth()]}
        </div>
        {sel.tasks.length + sel.sessions.length === 0 ? (
          <div className="muted" style={{ fontSize: 13.5 }}>
            Nada ese día.
          </div>
        ) : (
          <ul className="today-list">
            {sel.tasks.map((t) => (
              <li key={t.id} className={!t.done && isOverdue(t.due) ? 'overdue' : ''}>
                <span className="dot-task" />
                <a href={`#/asignatura/${t.subjectId}`} onClick={(e) => { e.preventDefault(); navigate(`/asignatura/${t.subjectId}`) }}>
                  {t.title}
                </a>
                <span className="muted"> · {subjName(t.subjectId)} · {t.type}{t.done ? ' · hecha' : ''}</span>
              </li>
            ))}
            {sel.sessions.map((s) => (
              <li key={s.id}>
                <span className="dot-session" />
                <a href={`#/asignatura/${s.subjectId}`} onClick={(e) => { e.preventDefault(); navigate(`/asignatura/${s.subjectId}`) }}>
                  {s.title}
                </a>
                <span className="muted"> · {subjName(s.subjectId)}{s.done ? ' · hecha' : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ---------------- Horario semanal ---------------- */

function WeeklySchedule({ data, dispatch, subjects, subjName }) {
  const [modal, setModal] = useState(false)
  const todayDow = (new Date().getDay() + 6) % 7
  const byDay = useMemo(() => {
    const out = WEEKDAYS.map(() => [])
    for (const s of data.schedule) if (s.weekday >= 0 && s.weekday <= 6) out[s.weekday].push(s)
    for (const list of out) list.sort((a, b) => (a.start || '').localeCompare(b.start || ''))
    return out
  }, [data.schedule])

  const totalMin = data.schedule.reduce((acc, s) => acc + slotMinutes(s), 0)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div>
          <h3 style={{ marginBottom: 2 }}>Horario semanal</h3>
          <div className="muted" style={{ fontSize: 13 }}>
            Bloques fijos de estudio. {totalMin > 0 ? `${Math.round(totalMin / 60)} h/semana planificadas.` : 'Planifica y aparecerán cada día en Inicio.'}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
          <IconPlus style={{ width: 13, height: 13 }} aria-hidden="true" /> Añadir bloque
        </button>
      </div>
      <div className="schedule">
        {WEEKDAYS.map((name, i) => (
          <div key={name} className={`schedule-day${i === todayDow ? ' is-today' : ''}`}>
            <div className="schedule-dayname">{name}</div>
            {byDay[i].length === 0 ? (
              <div className="muted" style={{ fontSize: 12.5 }}>
                —
              </div>
            ) : (
              byDay[i].map((s) => (
                <div key={s.id} className="schedule-slot">
                  <span className="today-time">
                    {s.start}
                    {s.end ? `–${s.end}` : ''}
                  </span>
                  <span className="schedule-title">{s.title || subjName(s.subjectId)}</span>
                  <button
                    className="icon-btn"
                    aria-label={`Borrar bloque ${name} ${s.start}`}
                    title="Borrar"
                    onClick={() => dispatch({ type: 'deleteSlot', id: s.id })}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
      {modal && (
        <SlotModal
          subjects={subjects.length > 0 ? subjects : CURRICULUM}
          onClose={() => setModal(false)}
          onSave={(slot) => {
            dispatch({ type: 'addSlot', slot })
            setModal(false)
          }}
        />
      )}
    </div>
  )
}

function slotMinutes(s) {
  if (!s.start || !s.end) return 0
  const [h1, m1] = s.start.split(':').map(Number)
  const [h2, m2] = s.end.split(':').map(Number)
  return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1))
}

function SlotModal({ subjects, onClose, onSave }) {
  const [weekday, setWeekday] = useState(0)
  const [start, setStart] = useState('19:00')
  const [end, setEnd] = useState('21:00')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [title, setTitle] = useState('')
  const valid = start && (!end || end > start)
  return (
    <Modal title="Nuevo bloque de estudio" onClose={onClose}>
      <div className="field">
        <label htmlFor="slot-day">Día</label>
        <select id="slot-day" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
          {WEEKDAYS.map((w, i) => (
            <option key={w} value={i}>
              {w}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="slot-start">Empieza</label>
          <input id="slot-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="slot-end">Termina</label>
          <input id="slot-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="slot-subject">Asignatura</label>
        <select id="slot-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Sin asignatura concreta</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="slot-title">Título (opcional)</label>
        <input id="slot-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Repaso de flashcards, videoclase…" />
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSave({ weekday, start, end, subjectId: subjectId || null, title: title.trim() })}>
          Guardar
        </button>
      </div>
    </Modal>
  )
}
