import React, { Suspense, lazy, useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { subjectById, BLOCKS, STATUS_META, ectsOf } from '../data/curriculum.js'
import { uniproGrade, neededFinal } from '../lib/stats.js'
import { todayISO, formatShort, minutesLabel, relativeLabel, isOverdue } from '../lib/dates.js'
import { pickDriveFiles, isPickerConfigured } from '../lib/driveSync.js'
import Modal from '../components/Modal.jsx'
import Checkbox from '../components/Checkbox.jsx'
import Understanding from '../components/Understanding.jsx'
// La guía trae bastante contenido: se carga solo al abrir una asignatura.
const StudyGuide = lazy(() => import('../components/StudyGuide.jsx'))
const SubjectPlan = lazy(() => import('../modules/study-planner/SubjectPlan.jsx'))
// Los problemas con sus soluciones pesan: solo al abrir la pestaña.
const Practice = lazy(() => import('../components/Practice.jsx'))
import { IconArrowLeft, IconPlus, IconTrash, IconDrive, IconLink, IconCards, IconExternal } from '../components/Icons.jsx'

const TABS = [
  { id: 'guia', label: 'Guía de estudio' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'practica', label: 'Práctica' },
  { id: 'clases', label: 'Clases y sesiones' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'evaluaciones', label: 'Evaluaciones' },
  { id: 'notas', label: 'Notas y dudas' }
]

function resourceKindLabel(r) {
  if (r.driveId) return 'Google Drive'
  try {
    return new URL(r.url).hostname.replace('www.', '')
  } catch {
    return 'enlace'
  }
}

export default function SubjectDetail({ id, tab: routeTab, navigate }) {
  const { data, dispatch, toast } = useStore()
  const subject = subjectById(id)
  // La pestaña vive en la ruta (#/asignatura/:id/:pestaña) para que un
  // enlace desde Inicio o desde la búsqueda caiga donde toca y se pueda
  // compartir. Una pestaña desconocida cae en la primera.
  const tab = TABS.some((t) => t.id === routeTab) ? routeTab : 'guia'
  const setTab = (t) => navigate(`/asignatura/${id}/${t}`)
  const [sessionModal, setSessionModal] = useState(false)
  const [taskModal, setTaskModal] = useState(false)
  const [linkModal, setLinkModal] = useState(false)

  const state = data.subjects[id] || {}
  const sessions = useMemo(
    () =>
      data.sessions
        .filter((s) => s.subjectId === id)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data.sessions, id]
  )
  const tasks = useMemo(
    () =>
      data.tasks
        .filter((t) => t.subjectId === id)
        .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')),
    [data.tasks, id]
  )
  const resources = Array.isArray(data.resources[id]) ? data.resources[id] : []
  const deckSize = (Array.isArray(data.decks[id]) ? data.decks[id] : []).length

  if (!subject) {
    return (
      <div className="empty">
        <div className="big">Asignatura no encontrada</div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plan')}>
          Volver al plan
        </button>
      </div>
    )
  }

  const status = state.status || 'pendiente'

  const pickerAvailable = isPickerConfigured()

  async function addFromDrive() {
    if (!pickerAvailable) {
      toast('El selector de Drive necesita el App ID de Google (ver SETUP.md)')
      return
    }
    try {
      const files = await pickDriveFiles()
      files.forEach((f) => {
        dispatch({
          type: 'addResource',
          subjectId: id,
          resource: { title: f.name, url: f.url, driveId: f.id, mimeType: f.mimeType }
        })
      })
      if (files.length > 0) toast(`${files.length} recurso(s) añadidos desde Drive`)
    } catch (e) {
      toast(`No se pudo abrir el selector: ${e.message}`)
    }
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plan')} style={{ marginBottom: 14 }}>
        <IconArrowLeft style={{ width: 14, height: 14 }} aria-hidden="true" /> Plan de estudios
      </button>

      <div className="page-head" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26 }}>{subject.name}</h1>
        <div className="sub" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <span className="chip block" style={{ background: BLOCKS[subject.block].color }}>
            Año {subject.year} · {BLOCKS[subject.block].label}
          </span>
          <span className="chip">{ectsOf(subject)} ECTS</span>
          {subject.english && <span className="chip english">EN INGLÉS</span>}
          {subject.note && <span className="chip">{subject.note}</span>}
          {subject.semestral && <span className="chip">Semestral</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 170 }}>
          <label htmlFor="subject-status">Estado</label>
          <select
            id="subject-status"
            value={status}
            onChange={(e) => dispatch({ type: 'setSubject', id, patch: { status: e.target.value } })}
          >
            {Object.entries(STATUS_META).map(([k, m]) => (
              <option key={k} value={k}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: 110 }}>
          <label htmlFor="subject-grade">Nota final</label>
          <input
            id="subject-grade"
            type="text"
            inputMode="decimal"
            placeholder="—"
            value={state.grade ?? ''}
            onChange={(e) => dispatch({ type: 'setSubject', id, patch: { grade: e.target.value } })}
          />
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary" onClick={() => navigate(`/estudio/${id}`)}>
          <IconCards style={{ width: 15, height: 15 }} aria-hidden="true" />
          Flashcards ({deckSize})
        </button>
      </div>

      <GradeCalc id={id} state={state} dispatch={dispatch} progress={data.topicProgress?.[id]} />

      <div className="tabs" role="tablist" aria-label="Secciones de la asignatura">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'guia' && (
        <Suspense fallback={<div className="empty">Cargando la guía de estudio…</div>}>
          <StudyGuide subjectId={id} />
        </Suspense>
      )}

      {tab === 'calendario' && (
        <Suspense fallback={<div className="empty">Cargando el calendario…</div>}>
          <SubjectPlan subjectId={id} navigate={navigate} />
        </Suspense>
      )}

      {tab === 'practica' && (
        <Suspense fallback={<div className="card empty">Cargando los problemas…</div>}>
          <Practice subjectId={id} />
        </Suspense>
      )}

      {tab === 'clases' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ marginBottom: 0 }}>Registro de clases y sesiones de estudio</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setSessionModal(true)}>
              <IconPlus style={{ width: 13, height: 13 }} aria-hidden="true" /> Añadir
            </button>
          </div>
          <div className="row-list">
            {sessions.map((s) => (
              <div key={s.id} className={`row-item${s.done ? ' done' : ''}`}>
                <Checkbox
                  checked={Boolean(s.done)}
                  label={`Marcar como hecha: ${s.title}`}
                  onChange={() => dispatch({ type: 'updateSession', id: s.id, patch: { done: !s.done } })}
                />
                <div className="grow">
                  <div className="title">{s.title}</div>
                  <div className="meta">
                    {s.type === 'clase' ? 'Clase' : 'Estudio'} · {formatShort(s.date)}
                    {s.durationMin ? ` · ${minutesLabel(s.durationMin)}` : ''}
                    {s.notes ? ` — ${s.notes}` : ''}
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Borrar: ${s.title}`}
                  title="Borrar"
                  onClick={() => dispatch({ type: 'deleteSession', id: s.id })}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="empty">Registra aquí cada clase vista y cada sesión de estudio.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'recursos' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <h3 style={{ marginBottom: 0 }}>Mis recursos</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={addFromDrive}
                disabled={!pickerAvailable}
                title={pickerAvailable ? 'Elegir ficheros de tu Drive' : 'Requiere configurar el App ID (SETUP.md)'}
              >
                <IconDrive style={{ width: 14, height: 14 }} aria-hidden="true" /> Desde Drive
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setLinkModal(true)}>
                <IconLink style={{ width: 14, height: 14 }} aria-hidden="true" /> Enlace
              </button>
            </div>
          </div>
          {resources.map((r) => (
            <div key={r.id} className="resource-item">
              <a className="r-open" href={r.url} target="_blank" rel="noreferrer noopener">
                {r.driveId ? (
                  <IconDrive style={{ width: 16, height: 16, color: 'var(--moss)' }} aria-hidden="true" />
                ) : (
                  <IconExternal style={{ width: 16, height: 16, color: 'var(--clay)' }} aria-hidden="true" />
                )}
                <span className="r-title">{r.title}</span>
                <span className="r-type">{resourceKindLabel(r)}</span>
              </a>
              <button
                className="icon-btn"
                aria-label={`Borrar recurso: ${r.title}`}
                title="Borrar recurso"
                onClick={() => dispatch({ type: 'deleteResource', subjectId: id, id: r.id })}
              >
                <IconTrash />
              </button>
            </div>
          ))}
          {resources.length === 0 && (
            <div className="empty">
              Aquí van tus propios enlaces y ficheros. Desde la pestaña «Guía de estudio» puedes guardar cualquier
              recurso recomendado con un clic.
            </div>
          )}
        </div>
      )}

      {tab === 'evaluaciones' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ marginBottom: 0 }}>Exámenes, entregas y tareas</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setTaskModal(true)}>
              <IconPlus style={{ width: 13, height: 13 }} aria-hidden="true" /> Añadir
            </button>
          </div>
          <div className="row-list">
            {tasks.map((t) => (
              <div key={t.id} className={`row-item${t.done ? ' done' : ''}${!t.done && isOverdue(t.due) ? ' overdue' : ''}`}>
                <Checkbox
                  checked={Boolean(t.done)}
                  label={`Marcar como hecha: ${t.title}`}
                  onChange={() => dispatch({ type: 'updateTask', id: t.id, patch: { done: !t.done } })}
                />
                <div className="grow">
                  <div className="title">{t.title}</div>
                  <div className="meta">
                    {t.type} · {t.due ? `${formatShort(t.due)} (${relativeLabel(t.due)})` : 'sin fecha'}
                  </div>
                </div>
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
            {tasks.length === 0 && <div className="empty">Sin evaluaciones registradas todavía.</div>}
          </div>
        </div>
      )}

      {tab === 'notas' && (
        <>
          <Understanding subjectId={id} />
          <div className="card">
            <h3>Notas de la asignatura</h3>
            <textarea
              rows={12}
              aria-label="Notas de la asignatura"
              placeholder="Apuntes rápidos, temario, contactos del profesor, criterios de evaluación…"
              value={state.notes || ''}
              onChange={(e) => dispatch({ type: 'setSubject', id, patch: { notes: e.target.value } })}
            />
          </div>
        </>
      )}

      {sessionModal && (
        <SessionModal
          onClose={() => setSessionModal(false)}
          onSave={(session) => {
            dispatch({ type: 'addSession', session: { ...session, subjectId: id } })
            setSessionModal(false)
          }}
        />
      )}
      {taskModal && (
        <TaskModal
          onClose={() => setTaskModal(false)}
          onSave={(task) => {
            dispatch({ type: 'addTask', task: { ...task, subjectId: id } })
            setTaskModal(false)
          }}
        />
      )}
      {linkModal && (
        <LinkModal
          onClose={() => setLinkModal(false)}
          onSave={(resource) => {
            dispatch({ type: 'addResource', subjectId: id, resource })
            setLinkModal(false)
          }}
        />
      )}
    </div>
  )
}

function GradeCalc({ id, state, dispatch, progress }) {
  const computed = uniproGrade(state.contGrade, state.examGrade)
  const need = neededFinal(state.contGrade, 5)
  const pct = progress && progress.total > 0 ? Math.round((progress.done.length / progress.total) * 100) : null
  const set = (patch) => dispatch({ type: 'setSubject', id, patch })
  return (
    <div className="card calc" style={{ marginBottom: 18 }}>
      <div className="calc-grid">
        <div>
          <div className="guide-label">Nota UNIPRO · 70 % continua + 30 % prueba final</div>
          <div className="calc-inputs">
            <div>
              <label htmlFor="grade-cont">Continua</label>
              <input id="grade-cont" type="text" inputMode="decimal" placeholder="0–10" value={state.contGrade ?? ''} onChange={(e) => set({ contGrade: e.target.value })} />
            </div>
            <div>
              <label htmlFor="grade-exam">Prueba final</label>
              <input id="grade-exam" type="text" inputMode="decimal" placeholder="0–10" value={state.examGrade ?? ''} onChange={(e) => set({ examGrade: e.target.value })} />
            </div>
            <div className="calc-result">
              <div className="stat-lbl">Resultado</div>
              <div className="stat-num" aria-live="polite">{computed != null ? computed.toFixed(2) : '—'}</div>
            </div>
          </div>
          <div className="calc-hint">
            {need != null && computed == null && (
              need <= 0 ? (
                <>Con esa continua ya tienes el 5 asegurado antes de la prueba final.</>
              ) : need > 10 ? (
                <>Con esa continua no llegas al 5 ni con un 10 en la prueba final: necesitas subir la continua.</>
              ) : (
                <>Para aprobar necesitas al menos un <strong>{need.toFixed(2)}</strong> en la prueba final{neededFinal(state.contGrade, 7) <= 10 && neededFinal(state.contGrade, 7) > 0 ? <>; para un 7, un <strong>{neededFinal(state.contGrade, 7).toFixed(2)}</strong></> : null}.</>
              )
            )}
            {computed != null && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => set({ grade: computed.toFixed(2) })}>
                Usar como nota final
              </button>
            )}
            {need == null && computed == null && <span className="muted">Escribe tu nota de evaluación continua para saber qué necesitas en la prueba final.</span>}
          </div>
        </div>
        {pct != null && (
          <div className="calc-progress">
            <div className="guide-label">Temario estudiado</div>
            <div className="stat-num">{pct} %</div>
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Temario estudiado">
              <div style={{ width: `${pct}%` }} />
            </div>
            <div className="stat-lbl">{progress.done.length} de {progress.total} temas</div>
          </div>
        )}
      </div>
    </div>
  )
}

function SessionModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayISO())
  const [type, setType] = useState('clase')
  const [durationMin, setDurationMin] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <Modal title="Nueva clase o sesión" onClose={onClose}>
      <div className="field">
        <label>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tema 3 — Grafos" autoFocus />
      </div>
      <div className="field" style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label>Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ width: 130 }}>
          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="clase">Clase</option>
            <option value="estudio">Estudio</option>
          </select>
        </div>
        <div style={{ width: 110 }}>
          <label>Minutos</label>
          <input
            type="number"
            min="0"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="60"
          />
        </div>
      </div>
      <div className="field">
        <label>Notas (opcional)</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Qué se vio, dudas pendientes…" />
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          disabled={!title.trim() || !date}
          onClick={() =>
            onSave({
              title: title.trim(),
              date,
              type,
              durationMin: durationMin ? Number(durationMin) : null,
              notes: notes.trim()
            })
          }
        >
          Guardar
        </button>
      </div>
    </Modal>
  )
}

export function TaskModal({ onClose, onSave, subjectSelector, subjects, initialSubject }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [type, setType] = useState('entrega')
  const [subjectId, setSubjectId] = useState(initialSubject || '')

  return (
    <Modal title="Nueva evaluación" onClose={onClose}>
      <div className="field">
        <label>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entrega práctica 1" autoFocus />
      </div>
      {subjectSelector && (
        <div className="field">
          <label>Asignatura</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">— Elegir —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="field" style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label>Fecha límite</label>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div style={{ width: 140 }}>
          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="entrega">Entrega</option>
            <option value="examen">Examen</option>
            <option value="tarea">Tarea</option>
          </select>
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          disabled={!title.trim() || (subjectSelector && !subjectId)}
          onClick={() => onSave({ title: title.trim(), due, type, subjectId: subjectSelector ? subjectId : undefined })}
        >
          Guardar
        </button>
      </div>
    </Modal>
  )
}

function LinkModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  return (
    <Modal title="Añadir enlace" onClose={onClose}>
      <div className="field">
        <label>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vídeo — Introducción a grafos" autoFocus />
      </div>
      <div className="field">
        <label>URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          disabled={!title.trim() || !/^https?:\/\/\S/.test(url.trim())}
          onClick={() => onSave({ title: title.trim(), url: url.trim() })}
        >
          Guardar
        </button>
      </div>
    </Modal>
  )
}
