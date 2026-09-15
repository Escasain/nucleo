// ============================================================
// Mapa de la asignatura
// ------------------------------------------------------------
// El calendario dice cuándo estudiar cada unidad y la práctica dice
// cómo va cada tema. Falta la pregunta que uno se hace de verdad
// cuando algo no entra: ¿esto de qué se apoya?
//
// Un tema que se resiste casi nunca está roto por dentro. Lo que está
// flojo suele ser algo anterior que se dio por sabido — y entonces
// insistir justo donde te has atascado es la peor inversión posible.
// Este mapa dibuja esa estructura y la cruza con tus datos para poder
// decirlo con nombres concretos.
//
// Las flechas llevan texto a propósito: una flecha sola no enseña
// nada, lo que enseña es qué viaja por ella.
// ============================================================
import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { usePlanner } from '../modules/study-planner/PlannerProvider.jsx'
import { planFor } from '../modules/study-planner/studyPlanData.js'
import { mapFor } from '../data/map/index.js'
import { mapStatus, diagnose, wrapLabel, placeNodes, NODE_W as W, NODE_H as H, GAP_Y as GY } from '../lib/subjectMap.js'
import { practiceFor, practiceStats } from '../data/practice/index.js'
import { IconPlay } from './Icons.jsx'

function stateClass(r) {
  if (r.weak) return 'is-weak'
  if (r.solid) return 'is-solid'
  if (r.started) return 'is-open'
  return 'is-todo'
}

// Haber terminado el temario de un tema y no haber tocado un problema
// suyo no es tenerlo sólido, y decirlo sería justo el autoengaño que
// esta pantalla existe para deshacer. Va antes que `solid` a propósito:
// al revés la rama no se alcanzaba nunca.
function stateLabel(r) {
  if (r.weak) return 'se te está resistiendo'
  if (r.complete && r.tried === 0) return 'temario hecho, sin comprobar con problemas'
  if (r.solid) return 'sólido'
  if (r.started) return 'empezado'
  return 'sin empezar'
}

export default function SubjectMap({ subjectId, navigate }) {
  const { data } = useStore()
  const { state } = usePlanner()
  const nodes = mapFor(subjectId)
  const plan = planFor(subjectId)
  const [sel, setSel] = useState(null)

  const problems = practiceFor(subjectId)
  const attempts = data.practice

  const rows = useMemo(() => {
    if (!nodes) return null
    const done = new Set(state.done[subjectId] || [])
    const stats = problems ? practiceStats(problems, attempts, subjectId) : null
    return mapStatus(nodes, done, stats ? stats.byTopic : null)
  }, [nodes, state.done, subjectId, problems, attempts])

  const advice = useMemo(() => (rows ? diagnose(rows) : null), [rows])

  const levels = useMemo(() => {
    if (!rows) return []
    const out = []
    for (const r of rows) {
      while (out.length <= r.level) out.push([])
      out[r.level].push(r)
    }
    return out
  }, [rows])

  const geom = useMemo(() => (levels.length ? placeNodes(levels) : null), [levels])

  if (!nodes) {
    return (
      <div className="card empty">
        <div className="big">Esta asignatura todavía no tiene mapa</div>
        Se define en <code>src/data/map/</code> y aparece aquí sin tocar nada más.
      </div>
    )
  }

  const byId = new Map(rows.map((r) => [r.node.id, r]))
  const selected = sel ? byId.get(sel) : null
  const unitTitle = (uid) => plan?.units.find((u) => u.id === uid)?.t || uid

  // Temas que se apoyan en el seleccionado: la otra mitad de la
  // pregunta, y la que dice qué te vas a encontrar más adelante si
  // dejas este a medias.
  const feeds = selected ? rows.filter((r) => (r.node.needs || []).includes(selected.node.id)) : []

  // Dudas apuntadas desde los problemas de este tema: Practice las
  // etiqueta con «Problema: <tema>» al fallar.
  const doubts = selected
    ? (data.understanding || []).filter(
        (n) =>
          n.subjectId === subjectId &&
          n.type === 'duda' &&
          !n.resolved &&
          selected.node.g &&
          n.unitTitle === `Problema: ${selected.node.g}`
      )
    : []

  return (
    <div className="smap">
      <div className="card">
        <h3 style={{ marginBottom: 2 }}>Mapa de la asignatura</h3>
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Cada flecha es un tema que se apoya en otro. Pincha cualquiera para ver qué le aporta cada cimiento: cuando
          algo no entra, lo que suele fallar no es el tema sino uno de los de abajo.
        </p>

        {advice.weak.length > 0 && (
          <p className="plan-warn plan-warn-block" style={{ marginTop: 12 }}>
            <strong>{advice.weak[0].row.node.t}</strong> se te está resistiendo (
            {advice.weak[0].row.tried - advice.weak[0].row.okFirst} de {advice.weak[0].row.tried} problemas fallados de
            entrada).{' '}
            {advice.weak[0].because.length > 0 ? (
              <>
                Antes de insistir ahí, vuelve a{' '}
                <strong>{advice.weak[0].because.map((d) => d.node.t).join(' y ')}</strong>: es de donde sale lo que se
                te está atascando.
              </>
            ) : (
              <>Sus cimientos están firmes, así que aquí sí toca insistir: son problemas, no un hueco de antes.</>
            )}
          </p>
        )}

        {advice.weak.length === 0 && advice.blocked.length > 0 && (
          <p className="plan-warn plan-warn-block" style={{ marginTop: 12 }}>
            {advice.blocked[0].row.complete ? 'Das por hecho' : 'Estás con'}{' '}
            <strong>{advice.blocked[0].row.node.t}</strong> sin haber cerrado{' '}
            <strong>{advice.blocked[0].missing.map((d) => d.node.t).join(' y ')}</strong>.{' '}
            {advice.blocked[0].row.complete
              ? 'El tema figura como terminado, pero el hueco sigue ahí y aparecerá en el examen.'
              : 'Se puede, pero vas a pagarlo en los problemas.'}
          </p>
        )}

        {advice.weak.length === 0 && advice.blocked.length === 0 && advice.next && (
          <p className="guide-fine" style={{ marginTop: 12 }}>
            Con lo que llevas hecho, lo siguiente que puedes coger sin deudas es <strong>{advice.next.node.t}</strong>.
          </p>
        )}

        <div className="smap-legend">
          <span className="is-solid">temario hecho</span>
          <span className="is-open">empezado</span>
          <span className="is-weak">se resiste</span>
          <span className="is-todo">sin empezar</span>
        </div>

        <div className="smap-canvas">
          <svg
            viewBox={`-6 -6 ${geom.width + 12} ${geom.height + 12}`}
            role="img"
            aria-label={`Mapa de dependencias entre los ${rows.length} temas de la asignatura`}
          >
            <defs>
              {/* Dos marcadores en vez de uno: la punta de flecha no
                  hereda el color del trazo, así que la activa es otra. */}
              <marker id="smap-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" />
              </marker>
              <marker id="smap-arrow-on" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" />
              </marker>
            </defs>

            {rows.map((r) =>
              (r.node.needs || []).map((depId) => {
                const from = geom.pos.get(depId)
                const to = geom.pos.get(r.node.id)
                if (!from || !to) return null
                const x1 = from.x + W / 2
                const y1 = from.y + H
                const x2 = to.x + W / 2
                const y2 = to.y
                const active = sel === r.node.id || sel === depId
                return (
                  <path
                    key={`${depId}->${r.node.id}`}
                    className={`smap-edge${active ? ' is-active' : ''}${sel && !active ? ' is-dim' : ''}`}
                    d={`M${x1} ${y1} C${x1} ${y1 + GY / 2}, ${x2} ${y2 - GY / 2}, ${x2} ${y2 - 5}`}
                    markerEnd={active ? 'url(#smap-arrow-on)' : 'url(#smap-arrow)'}
                  />
                )
              })
            )}

            {rows.map((r) => {
              const p = geom.pos.get(r.node.id)
              const lines = wrapLabel(r.node.t)
              const related = sel === r.node.id || (selected && (
                (selected.node.needs || []).includes(r.node.id) || (r.node.needs || []).includes(selected.node.id)
              ))
              return (
                <g
                  key={r.node.id}
                  className={`smap-node ${stateClass(r)}${sel === r.node.id ? ' is-sel' : ''}${sel && !related ? ' is-dim' : ''}`}
                  transform={`translate(${p.x} ${p.y})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={sel === r.node.id}
                  aria-label={`${r.node.t}: ${stateLabel(r)}. ${r.doneUnits} de ${r.units} unidades hechas`}
                  onClick={() => setSel(sel === r.node.id ? null : r.node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSel(sel === r.node.id ? null : r.node.id)
                    }
                  }}
                >
                  <rect className="smap-box" width={W} height={H} rx="10" />
                  {lines.map((l, i) => (
                    <text key={i} className="smap-t" x={W / 2} y={lines.length === 1 ? 24 : 18 + i * 14}>
                      {l}
                    </text>
                  ))}
                  <rect className="smap-bar-bg" x="12" y={H - 13} width={W - 24} height="4" rx="2" />
                  <rect className="smap-bar" x="12" y={H - 13} width={(W - 24) * r.ratio} height="4" rx="2" />
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {selected && (
        <div className="card smap-detail">
          <div className="guide-label">{stateLabel(selected)}</div>
          <h3 style={{ marginBottom: 4 }}>{selected.node.t}</h3>
          <p className="smap-gist">{selected.node.gist}</p>

          <div className="stats-row" style={{ marginTop: 12 }}>
            <div>
              <div className="stat-num">
                {selected.doneUnits}
                <span className="stat-of">/{selected.units}</span>
              </div>
              <div className="stat-lbl">unidades del temario</div>
            </div>
            <div>
              <div className="stat-num">{selected.rate == null ? '—' : `${Math.round(selected.rate * 100)} %`}</div>
              <div className="stat-lbl">
                {selected.tried > 0 ? `a la primera, de ${selected.tried} problemas` : 'sin problemas hechos'}
              </div>
            </div>
            {doubts.length > 0 && (
              <div>
                <div className="stat-num">{doubts.length}</div>
                <div className="stat-lbl">dudas tuyas sin resolver</div>
              </div>
            )}
          </div>

          {selected.needs.length > 0 && (
            <>
              <div className="guide-label" style={{ marginTop: 16 }}>
                Se apoya en
              </div>
              <ul className="smap-why">
                {selected.needs.map((d) => (
                  <li key={d.node.id} className={d.solid ? '' : 'is-shaky'}>
                    <button type="button" className="smap-jump" onClick={() => setSel(d.node.id)}>
                      {d.node.t}
                    </button>
                    <span className="smap-why-state">{stateLabel(d)}</span>
                    <p>{selected.node.why?.[d.node.id]}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {feeds.length > 0 && (
            <p className="guide-fine" style={{ marginTop: 12 }}>
              Más adelante lo van a necesitar{' '}
              {feeds.map((f, i) => (
                <React.Fragment key={f.node.id}>
                  {i > 0 && (i === feeds.length - 1 ? ' y ' : ', ')}
                  <button type="button" className="smap-jump" onClick={() => setSel(f.node.id)}>
                    {f.node.t}
                  </button>
                </React.Fragment>
              ))}
              .
            </p>
          )}

          <div className="guide-label" style={{ marginTop: 16 }}>
            Unidades de este tema
          </div>
          <ul className="smap-units">
            {(selected.node.units || []).map((uid) => {
              const done = (state.done[subjectId] || []).includes(uid)
              return (
                <li key={uid} className={done ? 'is-done' : ''}>
                  <span>{unitTitle(uid)}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/sesion/${subjectId}/${uid}`)}
                  >
                    <IconPlay style={{ width: 13, height: 13 }} aria-hidden="true" /> Estudiar
                  </button>
                </li>
              )
            })}
          </ul>

          {selected.node.g && problems && (
            <div className="actions" style={{ marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/asignatura/${subjectId}/practica`)}
              >
                Ir a los problemas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
