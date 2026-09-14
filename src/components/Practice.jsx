// ============================================================
// Práctica de una asignatura
// ------------------------------------------------------------
// Lo que faltaba: un sitio donde resolver, no donde leer. El orden de
// la pantalla es deliberado — enunciado, y nada más. La pista y la
// solución están a un clic pero detrás de un clic, porque tenerlas
// delante convierte el ejercicio en lectura.
//
// Al fallar se ofrece apuntar por qué, y eso pasa a la lista de dudas
// de la asignatura: los fallos propios valen más que cualquier resumen
// cuando quedan dos días para el examen.
// ============================================================
import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { practiceFor, groupProblems, practiceStats, attemptKey, LEVELS } from '../data/practice/index.js'
import { IconCheck, IconX } from './Icons.jsx'

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendientes', label: 'Sin hacer' },
  { id: 'fallados', label: 'Fallados' }
]

export default function Practice({ subjectId }) {
  const { data, dispatch, toast } = useStore()
  const problems = practiceFor(subjectId)
  const [filter, setFilter] = useState('todos')
  const [open, setOpen] = useState({}) // problemId → 'hint' | 'solution'
  const [failing, setFailing] = useState(null)
  const [why, setWhy] = useState('')

  const attempts = data.practice
  const stats = useMemo(
    () => (problems ? practiceStats(problems, attempts, subjectId) : null),
    [problems, attempts, subjectId]
  )

  if (!problems) {
    return (
      <div className="card empty">
        <div className="big">Todavía no hay problemas de esta asignatura</div>
        Se añaden en <code>src/data/practice/</code> y aparecen aquí sin tocar nada más.
      </div>
    )
  }

  const visible = problems.filter((pr) => {
    // Marcar un fallo le da un resultado al problema, y desde «Sin
    // hacer» eso lo sacaría del filtro en el mismo render: la fila
    // desaparecería antes de poder apuntar qué te faltaba. El que estás
    // contestando se queda hasta que termines con él.
    if (pr.id === failing) return true
    const a = attempts[attemptKey(subjectId, pr.id)]
    if (filter === 'pendientes') return !a || !a.last
    if (filter === 'fallados') return a && a.last === 'fail'
    return true
  })

  function mark(pr, result) {
    dispatch({ type: 'logAttempt', subjectId, problemId: pr.id, result })
    if (result === 'ok') {
      setOpen((o) => ({ ...o, [pr.id]: undefined }))
      toast('Anotado')
    } else {
      setFailing(pr.id)
      setWhy('')
    }
  }

  function saveWhy(pr) {
    if (why.trim()) {
      dispatch({
        type: 'addUnderstanding',
        note: { subjectId, type: 'duda', text: why.trim(), unitTitle: `Problema: ${pr.g}` }
      })
      toast('Apuntado en tus dudas')
    }
    setFailing(null)
    setWhy('')
  }

  return (
    <div className="practice">
      <div className="card">
        <h3 style={{ marginBottom: 2 }}>Práctica</h3>
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Resuélvelo en papel antes de abrir nada. La pista empuja sin dar la respuesta; la solución viene razonada paso
          a paso, porque el resultado sin el camino no enseña.
        </p>

        <div className="stats-row" style={{ marginTop: 14 }}>
          <div>
            <div className="stat-num">
              {stats.done}
              <span className="stat-of">/{stats.total}</span>
            </div>
            <div className="stat-lbl">problemas hechos</div>
            <div
              className="progress gold"
              style={{ marginTop: 6 }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={stats.total}
              aria-valuenow={stats.done}
              aria-label="Problemas hechos"
            >
              <div style={{ width: `${Math.round((stats.done / stats.total) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="stat-num">{stats.rate == null ? '—' : `${Math.round(stats.rate * 100)} %`}</div>
            <div className="stat-lbl">los sacaste a la primera</div>
          </div>
          <div>
            <div className="stat-num">{stats.pending}</div>
            <div className="stat-lbl">fallados, para volver</div>
          </div>
        </div>

        {stats.weak && (
          <p className="plan-warn plan-warn-block" style={{ marginTop: 12 }}>
            Tu punto flojo ahora mismo es <strong>{stats.weak.g}</strong>: {stats.weak.okFirst} a la primera de{' '}
            {stats.weak.done}. Ahí es donde renta el tiempo, no en lo que ya te sale.
          </p>
        )}

        <div className="tabs" role="tablist" style={{ marginTop: 14 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? 'active' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card empty">
          <div className="big">{filter === 'fallados' ? 'Ningún problema fallado' : 'Los has hecho todos'}</div>
          {filter === 'fallados'
            ? 'Aquí irán apareciendo los que no te salgan, para volver sobre ellos.'
            : 'Vuelve sobre los que fallaste, o repásalos desde cero cuando se acerque el examen.'}
        </div>
      ) : (
        groupProblems(visible).map((g) => (
          <div className="card" key={g.g}>
            <div className="guide-label">{g.g}</div>
            <ul className="prob-list">
              {g.items.map((pr) => {
                const a = attempts[attemptKey(subjectId, pr.id)]
                const state = open[pr.id]
                const lvl = LEVELS[pr.level] || LEVELS[1]
                return (
                  <li key={pr.id} className={`prob${a?.last === 'ok' ? ' is-ok' : a?.last === 'fail' ? ' is-fail' : ''}`}>
                    <div className="prob-head">
                      <i className={`plan-kind ${lvl.className}`}>{lvl.label}</i>
                      {a?.last && (
                        <span className={`prob-mark ${a.last}`}>
                          {a.last === 'ok' ? 'lo tenías' : 'fallado'}
                          {a.ok + a.fail > 1 ? ` · ${a.ok + a.fail} intentos` : ''}
                        </span>
                      )}
                    </div>
                    <p className="prob-q">{pr.q}</p>

                    <div className="prob-actions">
                      {state !== 'solution' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-expanded={state === 'hint'}
                          onClick={() => setOpen((o) => ({ ...o, [pr.id]: state === 'hint' ? undefined : 'hint' }))}
                        >
                          {state === 'hint' ? 'Ocultar pista' : 'Pista'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        aria-expanded={state === 'solution'}
                        onClick={() =>
                          setOpen((o) => ({ ...o, [pr.id]: state === 'solution' ? undefined : 'solution' }))
                        }
                      >
                        {state === 'solution' ? 'Ocultar solución' : 'Ver solución'}
                      </button>
                    </div>

                    {state === 'hint' && <p className="prob-hint">{pr.hint}</p>}

                    {state === 'solution' && (
                      <div className="prob-solution">
                        {pr.key && (
                          <p className="prob-key">
                            <strong>Respuesta:</strong> {pr.key}
                          </p>
                        )}
                        <pre className="prob-a">{pr.a}</pre>
                        {failing === pr.id ? (
                          <div className="prob-why">
                            <label htmlFor={`why-${pr.id}`}>¿Qué te faltaba? Queda apuntado en tus dudas</label>
                            <textarea
                              id={`why-${pr.id}`}
                              rows={2}
                              autoFocus
                              value={why}
                              onChange={(e) => setWhy(e.target.value)}
                              placeholder="Se me olvidó que…"
                            />
                            <div className="actions">
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFailing(null)}>
                                Ahora no
                              </button>
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => saveWhy(pr)}>
                                Apuntar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="prob-verdict">
                            <span className="guide-fine">¿Lo habías sacado?</span>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => mark(pr, 'ok')}>
                              <IconCheck aria-hidden="true" /> Sí
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => mark(pr, 'fail')}>
                              <IconX aria-hidden="true" /> No
                            </button>
                            {a?.last && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => dispatch({ type: 'clearAttempt', subjectId, problemId: pr.id })}
                              >
                                Olvidar intento
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
