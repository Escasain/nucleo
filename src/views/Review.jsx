// ============================================================
// Ficha de repaso
// ------------------------------------------------------------
// Los últimos días antes de un examen la app dejaba de servir: lo que
// hace falta entonces no es otra pantalla, es un papel. Y no un resumen
// del temario — ese ya está en el libro — sino la lista corta de lo que
// TÚ has fallado, lo que TÚ no has entendido y las trampas de los temas
// que se te resisten.
//
// Todo lo que sale aquí lo has generado tú usando la app: problemas
// fallados, dudas sin cerrar, explicaciones con tus palabras, y los
// temas que el mapa señala flojos. Nada se rellena de oficio: una ficha
// con secciones vacías sería una ficha que no dice nada, y se dice.
//
// Pensada para imprimirse. La hoja impresa es el producto.
// ============================================================
import React, { useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { usePlanner } from '../modules/study-planner/PlannerProvider.jsx'
import { subjectById } from '../data/curriculum.js'
import { daysBetween } from '../modules/study-planner/planner-engine.js'
import { formatShort } from '../lib/dates.js'
import { mapFor } from '../data/map/index.js'
import { mapStatus, diagnose } from '../lib/subjectMap.js'
import { practiceFor, practiceStats, attemptKey, groupProblems } from '../data/practice/index.js'
import { conceptsFor } from '../data/concepts/index.js'
import { notaLabel } from '../lib/mockExam.js'
import { IconArrowLeft, IconPrint } from '../components/Icons.jsx'

export default function Review({ subjectId, navigate }) {
  const { data } = useStore()
  const { state, subjects, today } = usePlanner()
  const subject = subjectById(subjectId)
  const plannerSubject = subjects.find((s) => s.id === subjectId)
  const problems = practiceFor(subjectId)
  const nodes = mapFor(subjectId)
  const concepts = conceptsFor(subjectId)

  const stats = useMemo(
    () => (problems ? practiceStats(problems, data.practice, subjectId) : null),
    [problems, data.practice, subjectId]
  )

  // Los temas flojos salen del mapa, que es quien cruza temario y
  // problemas. Sin mapa nos quedamos con el punto flojo de la práctica.
  const flojos = useMemo(() => {
    if (nodes) {
      const rows = mapStatus(nodes, new Set(state.done[subjectId] || []), stats ? stats.byTopic : null)
      const { weak } = diagnose(rows)
      return weak.map((w) => ({ g: w.row.node.g || w.row.node.t, row: w.row, because: w.because }))
    }
    return stats && stats.weak ? [{ g: stats.weak.g, row: null, because: [] }] : []
  }, [nodes, state.done, subjectId, stats])

  const temasFlojos = useMemo(() => new Set(flojos.map((f) => f.g)), [flojos])

  // Problemas que fallaste y no has recuperado: los primeros de la lista,
  // porque un fallo propio vale más que cualquier resumen.
  const porRecuperar = useMemo(() => {
    if (!problems) return []
    return problems.filter((pr) => data.practice[attemptKey(subjectId, pr.id)]?.last === 'fail')
  }, [problems, data.practice, subjectId])

  const mias = useMemo(
    () => (data.understanding || []).filter((n) => n.subjectId === subjectId),
    [data.understanding, subjectId]
  )
  const dudas = mias.filter((n) => n.type === 'duda' && !n.resolved)
  const explicaciones = mias.filter((n) => n.type === 'explicacion')

  // Trampas: las de tus temas flojos. Si no hay ninguno señalado, todas —
  // antes de un examen merecen una pasada de todas formas.
  const trampas = useMemo(() => {
    const todas = concepts?.pitfalls || []
    if (temasFlojos.size === 0) return { lista: todas, filtradas: false }
    const propias = todas.filter((p) => temasFlojos.has(p.g))
    return propias.length > 0 ? { lista: propias, filtradas: true } : { lista: todas, filtradas: false }
  }, [concepts, temasFlojos])

  const conceptosFlojos = useMemo(
    () => (concepts?.concepts || []).filter((c) => temasFlojos.has(c.g)),
    [concepts, temasFlojos]
  )

  const ultimoSimulacro = useMemo(
    () =>
      data.mocks
        .filter((m) => m.subjectId === subjectId)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0] || null,
    [data.mocks, subjectId]
  )

  if (!subject) {
    return (
      <div className="card empty">
        <div className="big">Asignatura no encontrada</div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plan')}>
          Volver al plan
        </button>
      </div>
    )
  }

  const examen = plannerSubject?.exam || null
  const faltan = examen ? daysBetween(today, new Date(`${examen}T00:00:00`)) : null
  const vacia =
    porRecuperar.length === 0 && dudas.length === 0 && explicaciones.length === 0 && flojos.length === 0

  return (
    <div className="review">
      <button className="btn btn-ghost btn-sm print-hide" onClick={() => navigate(`/asignatura/${subjectId}`)} style={{ marginBottom: 14 }}>
        <IconArrowLeft style={{ width: 14, height: 14 }} aria-hidden="true" /> {subject.name}
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div className="grow">
            <div className="guide-label">Ficha de repaso</div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>{subject.name}</h1>
            <p className="guide-fine" style={{ marginTop: 0 }}>
              {examen ? (
                <>
                  Examen el {formatShort(examen)}
                  {faltan != null && faltan >= 0 ? ` · faltan ${faltan} días` : ''}
                </>
              ) : (
                'Sin fecha de examen registrada'
              )}
              {ultimoSimulacro ? (
                <>
                  {' · último simulacro '}
                  <strong>{ultimoSimulacro.nota}</strong> ({notaLabel(ultimoSimulacro.nota)})
                </>
              ) : null}
            </p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm print-hide" onClick={() => window.print()}>
            <IconPrint aria-hidden="true" style={{ width: 14, height: 14 }} /> Imprimir
          </button>
        </div>
        <p className="guide-summary" style={{ marginTop: 12, marginBottom: 0 }}>
          Esto no es un resumen del temario — ese ya lo tienes en el libro. Es la lista corta de lo que has fallado, lo
          que no has cerrado y las trampas de los temas que se te resisten. Todo sale de lo que has ido dejando en la
          app.
        </p>
      </div>

      {vacia && (
        <div className="card empty">
          <div className="big">Todavía no hay nada tuyo que repasar</div>
          La ficha se llena sola según vas usando la app: los problemas que falles, las dudas que apuntes, las
          explicaciones que escribas al cerrar una sesión y los temas que el mapa señale flojos.
        </div>
      )}

      {flojos.length > 0 && (
        <div className="card">
          <h3>Por dónde empezar</h3>
          <ol className="review-weak">
            {flojos.map((f) => (
              <li key={f.g}>
                <strong>{f.g}</strong>
                {f.row && f.row.tried > 0 ? (
                  <span className="guide-fine">
                    {' '}
                    — {f.row.okFirst} de {f.row.tried} a la primera
                  </span>
                ) : null}
                {f.because.length > 0 && (
                  <p>
                    Antes de insistir, vuelve a <strong>{f.because.map((d) => d.node.t).join(' y ')}</strong>.{' '}
                    {f.because
                      .map((d) => (f.row?.node?.why || {})[d.node.id])
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {porRecuperar.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>Problemas por recuperar</h3>
          <p className="guide-fine" style={{ marginTop: 0 }}>
            {porRecuperar.length} que fallaste y no has vuelto a sacar. Hazlos en papel y compara con la respuesta; el
            razonamiento completo está en la app.
          </p>
          {groupProblems(porRecuperar).map((g) => (
            <div key={g.g} className="review-group">
              <div className="guide-label">{g.g}</div>
              <ol className="review-probs">
                {g.items.map((pr) => (
                  <li key={pr.id}>
                    <p className="prob-q">{pr.q}</p>
                    {pr.key && (
                      <p className="review-key">
                        <strong>Respuesta:</strong> {pr.key}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {dudas.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>Tus dudas sin cerrar</h3>
          <p className="guide-fine" style={{ marginTop: 0 }}>
            {dudas.length} apuntadas y sin resolver. Estas son las preguntas que llevar a una tutoría.
          </p>
          <ul className="review-notes">
            {dudas.map((n) => (
              <li key={n.id}>
                {n.unitTitle && <span className="guide-label">{n.unitTitle}</span>}
                <p>{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {explicaciones.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>Con tus palabras</h3>
          <p className="guide-fine" style={{ marginTop: 0 }}>
            Lo que escribiste al cerrar cada sesión. Releerlo vale más que releer el tema: si algo suena flojo ahora, es
            que no estaba tan entendido.
          </p>
          <ul className="review-notes">
            {explicaciones.map((n) => (
              <li key={n.id}>
                {n.unitTitle && <span className="guide-label">{n.unitTitle}</span>}
                <p>{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {trampas.lista.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>Trampas</h3>
          <p className="guide-fine" style={{ marginTop: 0 }}>
            {trampas.filtradas
              ? 'Las de los temas que se te están resistiendo.'
              : 'Todas las de la asignatura: sin temas flojos señalados, antes de un examen merecen una pasada entera.'}
          </p>
          <ul className="review-traps">
            {trampas.lista.map((t) => (
              <li key={t.t}>
                <strong>{t.t}</strong>
                {t.g && <span className="guide-fine"> · {t.g}</span>}
                <p className="is-wrong">{t.wrong}</p>
                <p>{t.right}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {conceptosFlojos.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>Vocabulario de tus temas flojos</h3>
          <p className="guide-fine" style={{ marginTop: 0 }}>
            Cuando un tema «no se entiende» casi siempre hay un puñado de palabras que se dan por sabidas.
          </p>
          <ul className="review-terms">
            {conceptosFlojos.map((c) => (
              <li key={c.t}>
                <strong>{c.t}</strong> — {c.d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
