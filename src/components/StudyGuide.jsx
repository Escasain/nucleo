import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { guideFor, RESOURCE_TYPES, RESOURCE_GROUPS, UNIPRO_EVALUATION } from '../data/guide/index.js'
import { IconExternal, IconPlus, IconCheck, IconPrint } from './Icons.jsx'
import Checkbox from './Checkbox.jsx'

const TYPE_ICON = {
  teoria: '📄',
  curso: '🎓',
  video: '▶️',
  libro: '📚',
  practica: '🧩',
  herramienta: '🛠️'
}

function LangChip({ lang }) {
  return (
    <span className="chip lang" title={lang === 'es' ? 'En español' : 'En inglés'}>
      {lang.toUpperCase()}
    </span>
  )
}

function ResourceRow({ r, saved, onSave }) {
  const meta = RESOURCE_TYPES[r.type]
  return (
    <li className="guide-res">
      <span className="guide-res-icon" aria-hidden="true">
        {TYPE_ICON[r.type]}
      </span>
      <div className="guide-res-body">
        <div className="guide-res-head">
          {r.url ? (
            <a href={r.url} target="_blank" rel="noreferrer noopener" className="guide-res-title">
              {r.title}
              <IconExternal aria-hidden="true" />
            </a>
          ) : (
            <span className="guide-res-title">{r.title}</span>
          )}
          <span className="chip">{meta.label}</span>
          <LangChip lang={r.lang} />
        </div>
        <div className="guide-res-note">{r.note}</div>
      </div>
      {r.url && (
        <button
          type="button"
          className={`btn btn-sm ${saved ? 'btn-ghost' : 'btn-secondary'} guide-save`}
          disabled={saved}
          aria-label={saved ? `${r.title}: ya está en mis recursos` : `Guardar ${r.title} en mis recursos`}
          title={saved ? 'Ya está en mis recursos' : 'Guardar en mis recursos'}
          onClick={() => onSave(r)}
        >
          {saved ? <IconCheck aria-hidden="true" /> : <IconPlus aria-hidden="true" />}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      )}
    </li>
  )
}

export default function StudyGuide({ subjectId }) {
  const { data, dispatch, toast } = useStore()
  const guide = guideFor(subjectId)
  const [openTopics, setOpenTopics] = useState(true)

  const savedUrls = useMemo(() => {
    const list = Array.isArray(data.resources[subjectId]) ? data.resources[subjectId] : []
    return new Set(list.map((r) => r.url))
  }, [data.resources, subjectId])

  if (!guide) {
    return <div className="empty">Todavía no hay guía de estudio para esta asignatura.</div>
  }

  function save(r) {
    dispatch({ type: 'addResource', subjectId, resource: { title: r.title, url: r.url } })
    toast('Añadido a mis recursos')
  }

  const progress = data.topicProgress?.[subjectId] || { done: [], total: 0 }
  const doneSet = new Set(progress.done)
  const doneCount = guide.topics.filter((t) => doneSet.has(t)).length
  const pct = Math.round((doneCount / guide.topics.length) * 100)

  const grouped = RESOURCE_GROUPS.map((g) => ({
    ...g,
    items: guide.resources.filter((r) => RESOURCE_TYPES[r.type].group === g.id)
  }))

  return (
    <div className="guide">
      <div className="card">
        <div className="guide-head">
          <h3 style={{ marginBottom: 0 }}>Guía de estudio</h3>
          <span className="chip">{guide.ects} ECTS</span>
          <button type="button" className="btn btn-ghost btn-sm print-hide" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
            <IconPrint aria-hidden="true" style={{ width: 14, height: 14 }} /> Imprimir
          </button>
        </div>
        <p className="guide-summary">{guide.summary}</p>
        <div className="guide-approach">
          <div className="guide-label">Cómo abordarla</div>
          <p>{guide.approach}</p>
        </div>
        <div className="guide-eval">
          <div className="guide-label">Evaluación en UNIPRO</div>
          <p>{UNIPRO_EVALUATION.summary}</p>
        </div>
      </div>

      <div className="card">
        <button
          type="button"
          className="guide-toggle"
          aria-expanded={openTopics}
          aria-controls={`temario-${subjectId}`}
          onClick={() => setOpenTopics((v) => !v)}
        >
          <h3 style={{ marginBottom: 0 }}>
            Temario orientativo <span className="guide-count">{doneCount}/{guide.topics.length}</span>
          </h3>
          <span className="guide-toggle-hint">{openTopics ? 'Ocultar' : `${guide.topics.length} temas`}</span>
        </button>
        <div className="progress" style={{ marginTop: 10 }} role="progressbar" aria-valuemin={0} aria-valuemax={guide.topics.length} aria-valuenow={doneCount} aria-label="Temas estudiados">
          <div style={{ width: `${pct}%` }} />
        </div>
        {openTopics && (
          <div id={`temario-${subjectId}`}>
            <ol className="guide-topics">
              {guide.topics.map((t, i) => (
                <li key={i} className={`topic-row${doneSet.has(t) ? ' done' : ''}`}>
                  <Checkbox
                    checked={doneSet.has(t)}
                    label={`Tema estudiado: ${t}`}
                    onChange={() => dispatch({ type: 'toggleTopic', subjectId, topic: t, total: guide.topics.length })}
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <p className="guide-fine print-hide">Marca cada tema cuando lo tengas estudiado: el porcentaje se ve en el plan y en Inicio.</p>
            <p className="guide-fine">
              Basado en el plan de UNIPRO y en las guías docentes públicas de esta asignatura. Contrasta el orden y los
              nombres exactos con la guía docente de tu campus.
            </p>
          </div>
        )}
      </div>

      {grouped.map((g) => (
        <div className="card" key={g.id}>
          <h3>
            {g.label} <span className="guide-count">{g.items.length}</span>
          </h3>
          <ul className="guide-list">
            {g.items.map((r) => (
              <ResourceRow key={r.url || r.title} r={r} saved={Boolean(r.url && savedUrls.has(r.url))} onSave={save} />
            ))}
          </ul>
        </div>
      ))}

      <div className="card">
        <h3>Laboratorio y entorno de prácticas</h3>
        <p className="guide-summary">{guide.lab.intro}</p>
        <div className="guide-label">Herramientas</div>
        <ul className="guide-list guide-tools">
          {guide.lab.tools.map((t) => (
            <li className="guide-res" key={t.url + t.title}>
              <span className="guide-res-icon" aria-hidden="true">
                🛠️
              </span>
              <div className="guide-res-body">
                <a href={t.url} target="_blank" rel="noreferrer noopener" className="guide-res-title">
                  {t.title}
                  <IconExternal aria-hidden="true" />
                </a>
                <div className="guide-res-note">{t.note}</div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${savedUrls.has(t.url) ? 'btn-ghost' : 'btn-secondary'} guide-save`}
                disabled={savedUrls.has(t.url)}
                aria-label={savedUrls.has(t.url) ? `${t.title}: ya está en mis recursos` : `Guardar ${t.title} en mis recursos`}
                title={savedUrls.has(t.url) ? 'Ya está en mis recursos' : 'Guardar en mis recursos'}
                onClick={() => save(t)}
              >
                {savedUrls.has(t.url) ? <IconCheck aria-hidden="true" /> : <IconPlus aria-hidden="true" />}
                {savedUrls.has(t.url) ? 'Guardado' : 'Guardar'}
              </button>
            </li>
          ))}
        </ul>
        <div className="guide-label" style={{ marginTop: 14 }}>
          Plan de prácticas
        </div>
        <ol className="guide-steps">
          {guide.lab.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
