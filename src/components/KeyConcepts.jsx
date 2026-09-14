// ============================================================
// Conceptos clave y trampas de una asignatura
// ------------------------------------------------------------
// La guía dice qué estudiar y con qué. Esto ataca lo otro: el
// vocabulario que bloquea y las confusiones que todo el mundo comete.
// Cada concepto se puede convertir en tarjeta de repaso de un clic,
// que es donde estaba el verdadero coste de las flashcards.
// ============================================================
import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { conceptsFor, groupConcepts, cardFromConcept } from '../data/concepts/index.js'
import { IconPlus, IconCheck } from './Icons.jsx'

export default function KeyConcepts({ subjectId }) {
  const { data, dispatch, toast } = useStore()
  const pack = conceptsFor(subjectId)
  const [openConcepts, setOpenConcepts] = useState(false)
  const [openPitfalls, setOpenPitfalls] = useState(false)

  // Las tarjetas ya creadas se reconocen por su cara frontal: así el
  // botón no ofrece duplicar algo que ya tienes, ni aquí ni al usar
  // «crear todas».
  const fronts = useMemo(() => {
    const deck = Array.isArray(data.decks[subjectId]) ? data.decks[subjectId] : []
    return new Set(deck.map((c) => c.front))
  }, [data.decks, subjectId])

  if (!pack) return null

  const groups = groupConcepts(pack.concepts)
  const pending = pack.concepts.map(cardFromConcept).filter((c) => !fronts.has(c.front))

  function addCard(concept) {
    const card = cardFromConcept(concept)
    if (fronts.has(card.front)) return
    dispatch({ type: 'addCard', subjectId, front: card.front, back: card.back })
    toast('Tarjeta creada')
  }

  function addAll() {
    for (const card of pending) dispatch({ type: 'addCard', subjectId, front: card.front, back: card.back })
    toast(`${pending.length} tarjeta${pending.length === 1 ? '' : 's'} creada${pending.length === 1 ? '' : 's'}`)
  }

  return (
    <>
      <div className="card">
        <button
          type="button"
          className="guide-toggle"
          aria-expanded={openConcepts}
          aria-controls="key-concepts"
          onClick={() => setOpenConcepts((v) => !v)}
        >
          <h3 style={{ marginBottom: 0 }}>Conceptos clave</h3>
          <span className="guide-toggle-hint">
            {openConcepts ? 'Ocultar' : `${pack.concepts.length} términos`}
          </span>
        </button>
        <p className="guide-summary" style={{ marginTop: 8 }}>
          El vocabulario que hay que tener clavado para que el resto de la asignatura se entienda. No es un resumen del
          temario: son las palabras cuyo significado exacto se da por sabido y casi nunca lo está.
        </p>

        {openConcepts && (
          <div id="key-concepts">
            {pending.length > 0 && (
              <div className="concept-bulk">
                <button type="button" className="btn btn-secondary btn-sm" onClick={addAll}>
                  <IconPlus aria-hidden="true" /> Crear {pending.length} tarjeta{pending.length === 1 ? '' : 's'} de
                  repaso
                </button>
                <span className="guide-fine">
                  Una por concepto, con su definición detrás. Entran en el repaso espaciado de Estudio.
                </span>
              </div>
            )}

            {groups.map((g) => (
              <div key={g.g} className="concept-group">
                <div className="guide-label">{g.g}</div>
                <ul className="concept-list">
                  {g.items.map((c) => {
                    const already = fronts.has(cardFromConcept(c).front)
                    return (
                      <li key={c.t} className="concept">
                        <div className="concept-body">
                          <h4>{c.t}</h4>
                          <p className="concept-d">{c.d}</p>
                          {c.why && <p className="concept-why">{c.why}</p>}
                          {c.x && (
                            <p className="concept-x">
                              <strong>Ojo:</strong> {c.x}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`btn btn-sm ${already ? 'btn-ghost' : 'btn-secondary'} guide-save`}
                          disabled={already}
                          title={already ? 'Ya tienes tarjeta de este concepto' : 'Crear tarjeta de repaso'}
                          aria-label={
                            already ? `${c.t}: ya tienes tarjeta` : `Crear tarjeta de repaso de ${c.t}`
                          }
                          onClick={() => addCard(c)}
                        >
                          {already ? <IconCheck aria-hidden="true" /> : <IconPlus aria-hidden="true" />}
                          {already ? 'Ya está' : 'Tarjeta'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <button
          type="button"
          className="guide-toggle"
          aria-expanded={openPitfalls}
          aria-controls="key-pitfalls"
          onClick={() => setOpenPitfalls((v) => !v)}
        >
          <h3 style={{ marginBottom: 0 }}>Dónde se cae todo el mundo</h3>
          <span className="guide-toggle-hint">{openPitfalls ? 'Ocultar' : `${pack.pitfalls.length} trampas`}</span>
        </button>
        <p className="guide-summary" style={{ marginTop: 8 }}>
          Errores que se repiten examen tras examen. Leerlos antes de estudiar el tema es la forma más barata de no
          cometerlos.
        </p>

        {openPitfalls && (
          <ul className="pitfall-list" id="key-pitfalls">
            {pack.pitfalls.map((p) => (
              <li key={p.t} className="pitfall">
                <h4>{p.t}</h4>
                <p className="pitfall-wrong">
                  <span aria-hidden="true">✗</span> {p.wrong}
                </p>
                <p className="pitfall-right">
                  <span aria-hidden="true">✓</span> {p.right}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
