// ============================================================
// Lo que has entendido y lo que no
// ------------------------------------------------------------
// Las dudas de quien estudia por su cuenta se pierden: aparecen a las
// once de la noche y a la mañana siguiente ya no te acuerdas ni de qué
// no entendías. Aquí quedan apuntadas, y al resolverlas se convierten
// en tarjeta de repaso — que es cuando de verdad se te queda.
// ============================================================
import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { formatShort } from '../lib/dates.js'
import { IconPlus, IconTrash, IconCheck } from './Icons.jsx'

export default function Understanding({ subjectId }) {
  const { data, dispatch, toast } = useStore()
  const [text, setText] = useState('')
  const [answering, setAnswering] = useState(null) // id de la duda que estás cerrando
  const [answer, setAnswer] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const mine = useMemo(
    () => (data.understanding || []).filter((n) => n.subjectId === subjectId),
    [data.understanding, subjectId]
  )
  const doubts = mine.filter((n) => n.type === 'duda' && !n.resolved)
  const resolved = mine.filter((n) => n.type === 'duda' && n.resolved)
  const explanations = mine.filter((n) => n.type === 'explicacion')

  const fronts = useMemo(() => {
    const deck = Array.isArray(data.decks[subjectId]) ? data.decks[subjectId] : []
    return new Set(deck.map((c) => c.front))
  }, [data.decks, subjectId])

  function addDoubt() {
    if (!text.trim()) return
    dispatch({ type: 'addUnderstanding', note: { subjectId, type: 'duda', text: text.trim() } })
    setText('')
    toast('Duda apuntada')
  }

  function resolve(id) {
    dispatch({
      type: 'updateUnderstanding',
      id,
      patch: { resolved: true, answer: answer.trim(), resolvedAt: new Date().toISOString() }
    })
    setAnswering(null)
    setAnswer('')
    toast(answer.trim() ? 'Resuelta. Ya puedes hacer tarjeta con ella.' : 'Resuelta')
  }

  function cardFromDoubt(n) {
    if (!n.answer || fronts.has(n.text)) return
    dispatch({ type: 'addCard', subjectId, front: n.text, back: n.answer })
    toast('Tarjeta creada')
  }

  return (
    <>
      <div className="card">
        <h3 style={{ marginBottom: 2 }}>
          Dudas {doubts.length > 0 && <span className="guide-count">{doubts.length} abierta{doubts.length === 1 ? '' : 's'}</span>}
        </h3>
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Lo que no te ha quedado claro, apuntado antes de que se te olvide que no lo entendías. Al cerrar una sesión de
          estudio también puedes dejarlas aquí.
        </p>

        <div className="doubt-add">
          <label htmlFor="new-doubt" className="sr-only">
            Nueva duda
          </label>
          <input
            id="new-doubt"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDoubt()}
            placeholder="No acabo de ver por qué…"
          />
          <button type="button" className="btn btn-secondary" disabled={!text.trim()} onClick={addDoubt}>
            <IconPlus aria-hidden="true" /> Apuntar
          </button>
        </div>

        {doubts.length === 0 ? (
          <p className="plan-detail-empty muted">
            {resolved.length > 0 ? 'Ninguna duda abierta ahora mismo.' : 'Todavía no has apuntado ninguna duda.'}
          </p>
        ) : (
          <ul className="doubt-list">
            {doubts.map((n) => (
              <li key={n.id} className="doubt">
                <div className="doubt-body">
                  <p className="doubt-text">{n.text}</p>
                  <span className="doubt-meta">
                    {n.unitTitle ? `${n.unitTitle} · ` : ''}
                    {formatShort(String(n.createdAt).slice(0, 10))}
                  </span>
                </div>
                {answering === n.id ? (
                  <div className="doubt-answer">
                    <label htmlFor={`ans-${n.id}`} className="sr-only">
                      Cómo la has resuelto
                    </label>
                    <textarea
                      id={`ans-${n.id}`}
                      rows={3}
                      autoFocus
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Lo que te faltaba era…"
                    />
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setAnswering(null)
                          setAnswer('')
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => resolve(n.id)}>
                        Resolver
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="doubt-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setAnswering(n.id)
                        setAnswer('')
                      }}
                    >
                      <IconCheck aria-hidden="true" /> Resolver
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Borrar duda: ${n.text}`}
                      title="Borrar"
                      onClick={() => dispatch({ type: 'deleteUnderstanding', id: n.id })}
                    >
                      <IconTrash aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {resolved.length > 0 && (
          <>
            <button
              type="button"
              className="guide-toggle"
              style={{ marginTop: 12 }}
              aria-expanded={showResolved}
              aria-controls="doubts-resolved"
              onClick={() => setShowResolved((v) => !v)}
            >
              <span className="guide-label" style={{ margin: 0 }}>
                Resueltas ({resolved.length})
              </span>
              <span className="guide-toggle-hint">{showResolved ? 'Ocultar' : 'Ver'}</span>
            </button>
            {showResolved && (
              <ul className="doubt-list is-resolved" id="doubts-resolved">
                {resolved.map((n) => (
                  <li key={n.id} className="doubt">
                    <div className="doubt-body">
                      <p className="doubt-text">{n.text}</p>
                      {n.answer && <p className="doubt-answer-text">{n.answer}</p>}
                    </div>
                    <div className="doubt-actions">
                      {n.answer && (
                        <button
                          type="button"
                          className={`btn btn-sm ${fronts.has(n.text) ? 'btn-ghost' : 'btn-secondary'}`}
                          disabled={fronts.has(n.text)}
                          title={fronts.has(n.text) ? 'Ya tienes tarjeta de esta duda' : 'Crear tarjeta de repaso'}
                          onClick={() => cardFromDoubt(n)}
                        >
                          {fronts.has(n.text) ? <IconCheck aria-hidden="true" /> : <IconPlus aria-hidden="true" />}
                          {fronts.has(n.text) ? 'Ya está' : 'Tarjeta'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => dispatch({ type: 'updateUnderstanding', id: n.id, patch: { resolved: false } })}
                      >
                        Reabrir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {explanations.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>Cómo te lo explicaste</h3>
          <p className="guide-summary" style={{ marginTop: 0 }}>
            Lo que escribiste al cerrar cada sesión. Releerlo antes del examen vale más que releer el tema: es tu propia
            versión, y si algo suena flojo es que sigue flojo.
          </p>
          <ul className="explain-list">
            {[...explanations].reverse().map((n) => (
              <li key={n.id} className="explain">
                <div className="explain-head">
                  <strong>{n.unitTitle || 'Sesión de estudio'}</strong>
                  <span className="doubt-meta">{formatShort(String(n.createdAt).slice(0, 10))}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Borrar explicación de ${n.unitTitle || 'la sesión'}`}
                    title="Borrar"
                    onClick={() => dispatch({ type: 'deleteUnderstanding', id: n.id })}
                  >
                    <IconTrash aria-hidden="true" />
                  </button>
                </div>
                <p className="explain-text">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
