import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { CURRICULUM } from '../data/curriculum.js'
import { IconBook, IconCalendar, IconLink, IconExternal } from './Icons.jsx'

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export default function SearchModal({ onClose, navigate }) {
  const { data } = useStore()
  const [q, setQ] = useState('')
  const [guide, setGuide] = useState(null)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  // onClose cambia en cada render del padre: se guarda en un ref para que
  // el efecto de foco/teclado se registre una sola vez.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // La guía es un chunk aparte: se carga la primera vez que se abre la búsqueda.
  useEffect(() => {
    let alive = true
    import('../data/guide/index.js')
      .then((m) => alive && setGuide(m.GUIDE))
      .catch(() => alive && setGuide({}))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const previous = document.activeElement
    inputRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (previous && typeof previous.focus === 'function') previous.focus()
    }
  }, [])

  const results = useMemo(() => {
    const t = norm(q.trim())
    if (t.length < 2) return []
    const out = []
    for (const s of CURRICULUM) {
      if (norm(s.name).includes(t) || norm(s.id).includes(t)) {
        out.push({ kind: 'Asignatura', title: s.name, sub: `Año ${s.year}`, path: `/asignatura/${s.id}`, Icon: IconBook })
      }
    }
    for (const task of data.tasks) {
      if (norm(task.title).includes(t)) {
        const s = CURRICULUM.find((x) => x.id === task.subjectId)
        out.push({ kind: 'Evaluación', title: task.title, sub: `${s?.name || '—'}${task.due ? ' · ' + task.due : ''}${task.done ? ' · hecha' : ''}`, path: `/asignatura/${task.subjectId}`, Icon: IconCalendar })
      }
    }
    for (const [sid, list] of Object.entries(data.resources)) {
      const s = CURRICULUM.find((x) => x.id === sid)
      for (const r of list || []) {
        if (norm(r.title).includes(t)) out.push({ kind: 'Mi recurso', title: r.title, sub: s?.name || sid, url: r.url, Icon: IconLink })
      }
    }
    for (const [sid, st] of Object.entries(data.subjects)) {
      if (st?.notes && norm(st.notes).includes(t)) {
        const s = CURRICULUM.find((x) => x.id === sid)
        out.push({ kind: 'Notas', title: s?.name || sid, sub: 'coincidencia en tus notas', path: `/asignatura/${sid}`, Icon: IconBook })
      }
    }
    if (guide) {
      for (const [sid, g] of Object.entries(guide)) {
        const s = CURRICULUM.find((x) => x.id === sid)
        for (const r of g.resources) {
          if (norm(r.title).includes(t) || norm(r.note).includes(t)) {
            out.push({ kind: 'Guía', title: r.title, sub: s?.name || sid, url: r.url, path: `/asignatura/${sid}`, Icon: IconExternal })
          }
        }
        for (const tool of g.lab.tools) {
          if (norm(tool.title).includes(t)) out.push({ kind: 'Herramienta', title: tool.title, sub: s?.name || sid, url: tool.url, path: `/asignatura/${sid}`, Icon: IconExternal })
        }
        for (const topic of g.topics) {
          if (norm(topic).includes(t)) out.push({ kind: 'Tema', title: topic, sub: s?.name || sid, path: `/asignatura/${sid}`, Icon: IconBook })
        }
      }
    }
    return out.slice(0, 40)
  }, [q, data, guide])

  useEffect(() => {
    setCursor(0)
  }, [q])

  function go(r) {
    if (r.url) window.open(r.url, '_blank', 'noopener')
    else if (r.path) navigate(r.path)
    onClose()
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(results.length - 1, c + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(0, c - 1))
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault()
      go(results[cursor])
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[cursor]
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [cursor])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal search" role="dialog" aria-modal="true" aria-label="Buscar">
        <input
          ref={inputRef}
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Buscar asignaturas, temas, recursos, evaluaciones…"
          aria-label="Buscar"
          aria-controls="search-results"
          aria-activedescendant={results[cursor] ? `sr-${cursor}` : undefined}
          role="combobox"
          aria-expanded={results.length > 0}
          autoComplete="off"
        />
        <ul className="search-results" id="search-results" role="listbox" ref={listRef}>
          {results.map((r, i) => (
            <li
              key={`${r.kind}-${r.title}-${i}`}
              id={`sr-${i}`}
              role="option"
              aria-selected={i === cursor}
              className={`search-item${i === cursor ? ' active' : ''}`}
              onMouseMove={() => cursor !== i && setCursor(i)}
              onClick={() => go(r)}
            >
              <r.Icon aria-hidden="true" />
              <div className="grow">
                <div className="search-title">{r.title}</div>
                <div className="search-sub">
                  {r.kind} · {r.sub}
                </div>
              </div>
              {r.url && <span className="chip">abre enlace</span>}
            </li>
          ))}
          {q.trim().length >= 2 && results.length === 0 && (
            <li className="search-empty">Sin resultados para «{q}».</li>
          )}
          {q.trim().length < 2 && (
            <li className="search-empty">
              Escribe al menos dos letras. <span className="kbd">↑</span> <span className="kbd">↓</span> para moverte,{' '}
              <span className="kbd">Enter</span> para abrir, <span className="kbd">Esc</span> para cerrar.
              {!guide && ' Cargando la guía…'}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
