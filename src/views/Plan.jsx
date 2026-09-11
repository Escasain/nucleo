import React from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM, BLOCKS, STATUS_META } from '../data/curriculum.js'

const YEAR_LABEL = { 1: 'Primer año · 2026/27', 2: 'Segundo año · 2027/28', 3: 'Tercer año · 2028/29' }
const BLOCK_ORDER = ['sep', 'nov', 'mar', 'may']

export default function Plan({ navigate }) {
  const { data } = useStore()

  const statusOf = (id) => data.subjects[id]?.status || 'pendiente'
  const statusMeta = (st) => STATUS_META[st] || STATUS_META.pendiente

  return (
    <div>
      <div className="page-head">
        <h1>Plan de estudios</h1>
        <div className="sub">
          Bachelor en Ingeniería Informática · UNIPRO · bloques bimestrales
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <span key={key} className="chip" style={{ color: meta.color }}>
            <span className="dot" />
            {meta.label}
          </span>
        ))}
      </div>

      {[1, 2, 3].map((year) => (
        <section key={year} className="year-section">
          <h2 className="year-title">
            Año {year} <span className="yr-meta">{YEAR_LABEL[year]}</span>
          </h2>
          {BLOCK_ORDER.map((blockId) => {
            const subjects = CURRICULUM.filter((s) => s.year === year && s.block === blockId)
            if (subjects.length === 0) return null
            const block = BLOCKS[blockId]
            return (
              <div key={blockId} className="block-group">
                <div className="block-label">
                  <span className="swatch" style={{ background: block.color }} />
                  {block.label}
                </div>
                {subjects.map((s) => {
                  const st = statusOf(s.id)
                  const grade = data.subjects[s.id]?.grade
                  return (
                    <div
                      key={s.id}
                      className="subject-card"
                      role="button"
                      tabIndex={0}
                      aria-label={`Abrir ${s.name}`}
                      style={{ borderLeftColor: statusMeta(st).color }}
                      onClick={() => navigate(`/asignatura/${s.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/asignatura/${s.id}`)
                        }
                      }}
                    >
                      <div className="name">
                        {s.name}
                        {(s.note || s.semestral) && (
                          <small>{[s.note, s.semestral ? 'Semestral' : null].filter(Boolean).join(' · ')}</small>
                        )}
                      </div>
                      {s.english && <span className="chip english">EN INGLÉS</span>}
                      {grade != null && grade !== '' && (
                        <span className="chip" style={{ color: 'var(--pine)' }}>
                          Nota: {grade}
                        </span>
                      )}
                      <span className="chip" style={{ color: statusMeta(st).color }}>
                        <span className="dot" />
                        {statusMeta(st).label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
