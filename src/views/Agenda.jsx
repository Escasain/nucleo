import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM } from '../data/curriculum.js'
import { dayNum, monthShort, relativeLabel, isOverdue } from '../lib/dates.js'
import Checkbox from '../components/Checkbox.jsx'
import { IconPlus, IconTrash } from '../components/Icons.jsx'
import { TaskModal } from './SubjectDetail.jsx'

export default function Agenda({ navigate }) {
  const { data, dispatch } = useStore()
  const [showDone, setShowDone] = useState(false)
  const [modal, setModal] = useState(false)

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
          <div className="sub">Todas las entregas, exámenes y tareas del curso</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <IconPlus style={{ width: 14, height: 14 }} aria-hidden="true" /> Nueva evaluación
        </button>
      </div>

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
