import React from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM, BLOCKS, STATUS_META, ectsOf, academicYearOf, blockRanges, blockOf, planYearOf } from '../data/curriculum.js'
import { toISO, formatShort } from '../lib/dates.js'

const YEAR_LABEL = { 1: 'Primer año · 2026/27', 2: 'Segundo año · 2027/28', 3: 'Tercer año · 2028/29' }
const BLOCK_ORDER = ['sep', 'nov', 'mar', 'may']

export default function Plan({ navigate }) {
  const { data } = useStore()

  const statusOf = (id) => data.subjects[id]?.status || 'pendiente'
  const statusMeta = (st) => STATUS_META[st] || STATUS_META.pendiente
  const course = academicYearOf()
  const current = blockOf()
  const ranges = blockRanges(course.start)
  const planYear = planYearOf()

  return (
    <div>
      <div className="page-head">
        <h1>Plan de estudios</h1>
        <div className="sub">
          Bachelor en Ingeniería Informática · UNIPRO · bloques bimestrales
        </div>
      </div>

      <div className="card block-strip" style={{ marginBottom: 16 }} aria-label={`Bloques del curso ${course.label}`}>
        <div className="guide-label">Curso {course.label} · bloques bimestrales (fechas aproximadas)</div>
        <div className="block-pills">
          {ranges.map((b) => (
            <div key={b.id} className={`block-pill${b.id === current.id && !current.upcoming ? ' is-current' : ''}`} style={{ borderColor: b.color }}>
              <span className="swatch" style={{ background: b.color }} />
              <strong>{b.label}</strong>
              <span className="muted">
                {formatShort(toISO(b.from))} – {formatShort(toISO(b.to))}
              </span>
              {b.id === current.id && !current.upcoming && <span className="chip">en curso</span>}
            </div>
          ))}
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
            {planYear === year && <span className="chip" style={{ color: 'var(--pine)' }}>este curso</span>}
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
                  const tp = data.topicProgress?.[s.id]
                  const pct = tp && tp.total > 0 ? Math.round((tp.done.length / tp.total) * 100) : null
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
                      <span className="chip" title="Créditos">{ectsOf(s)} ECTS</span>
                      {s.english && <span className="chip english">EN INGLÉS</span>}
                      {pct != null && (
                        <span className="chip" title="Temario estudiado">
                          {pct} % temario
                        </span>
                      )}
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
