// ============================================================
// Sesión de estudio enfocada
// ------------------------------------------------------------
// La pieza que faltaba entre el plan y el estudio real. Se entra desde
// un bloque del calendario y la pantalla contesta a lo único que
// importa cuando te sientas: qué toca ahora, con qué material, y
// cuánto llevo. Al terminar registra los minutos reales atados a esa
// unidad del temario, que es lo que luego permite calibrar el plan.
// ============================================================
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { usePlanner } from '../modules/study-planner/PlannerProvider.jsx'
import { UNIT_KINDS, planFor } from '../modules/study-planner/studyPlanData.js'
import { hoursLabel, unitHours } from '../modules/study-planner/planner-engine.js'
import { todayISO, minutesLabel } from '../lib/dates.js'
import { subjectById } from '../data/curriculum.js'
import { IconArrowLeft, IconCheck, IconExternal, IconClock } from '../components/Icons.jsx'

// Sugerencia de descanso al estilo pomodoro, sin imponer el ciclo: aquí
// el reloj cuenta hacia arriba porque un bloque de estudio dura lo que
// dura, no 25 minutos.
const BREAK_EVERY_MIN = 25

function clock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export default function Focus({ subjectId, unitId, navigate }) {
  const { data, dispatch, toast } = useStore()
  const { state, markDone, subjects } = usePlanner()
  const [guide, setGuide] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(null)
  const [explain, setExplain] = useState('')
  const [doubt, setDoubt] = useState('')
  const [reflected, setReflected] = useState(false)
  const nextBreak = useRef(BREAK_EVERY_MIN * 60)
  // El tiempo sale del reloj, no de contar tics: el navegador frena los
  // temporizadores de una pestaña en segundo plano y los suspende al
  // bloquear el móvil. Contando tics, abrir uno de los recursos de la
  // sesión haría que el rato contara de menos, y eso es justo el dato
  // del que vive la calibración.
  const elapsedMs = useRef(0) // acumulado de los tramos ya cerrados
  const startedAt = useRef(0) // instante en que arrancó el tramo actual

  const subject = subjectById(subjectId)
  const plan = planFor(subjectId)
  const unit = plan?.units.find((u) => u.id === unitId) || null
  const plannerSubject = subjects.find((s) => s.id === subjectId)
  const estimated = unit ? unitHours(state, subjectId, unit) : 0
  const alreadyDone = (state.done[subjectId] || []).includes(unitId)

  // La guía pesa: se carga aparte y la sesión ya es usable sin ella.
  useEffect(() => {
    let alive = true
    import('../data/guide/index.js')
      .then((m) => {
        if (alive) setGuide(m.guideFor(subjectId))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [subjectId])

  useEffect(() => {
    if (!running) return undefined
    const tick = () => setSeconds(Math.floor((elapsedMs.current + (Date.now() - startedAt.current)) / 1000))
    tick()
    const t = setInterval(tick, 1000)
    // Al volver a la pestaña, el número se pone al día sin esperar al
    // siguiente tic (que puede venir frenado).
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [running])

  const start = useCallback(() => {
    startedAt.current = Date.now()
    setRunning(true)
  }, [])
  const pause = useCallback(() => {
    elapsedMs.current += Date.now() - startedAt.current
    setSeconds(Math.floor(elapsedMs.current / 1000))
    setRunning(false)
  }, [])

  // El aviso de descanso vive en su propio efecto: lanzarlo dentro del
  // actualizador del contador se ejecutaría dos veces en StrictMode.
  useEffect(() => {
    if (!running || seconds < nextBreak.current) return
    nextBreak.current += BREAK_EVERY_MIN * 60
    toast(`Llevas ${Math.round(seconds / 60)} min seguidos. Levántate un momento.`)
  }, [running, seconds, toast])

  // Si cierras la pestaña con el reloj en marcha se pierde el rato: el
  // navegador pregunta antes de irse.
  useEffect(() => {
    if (!running && seconds === 0) return undefined
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [running, seconds])

  const topics = useMemo(() => {
    if (!guide || !unit) return []
    return guide.topics
      .map((t) => ({ t, score: score(unit.t, t) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.t)
  }, [guide, unit])

  const resources = useMemo(() => {
    if (!guide || !unit) return { list: [], matched: false }
    const pool = [
      ...guide.resources,
      ...(unit.kind === 'lab' || unit.kind === 'repaso'
        ? guide.lab.tools.map((t) => ({ ...t, type: 'herramienta', lang: 'es' }))
        : [])
    ]
    const scored = pool
      .map((r) => ({ r, score: score(unit.t, `${r.title} ${r.note || ''}`) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
    return { list: scored.map((x) => x.r), matched: scored.some((x) => x.score > 0) }
  }, [guide, unit])

  const mine = useMemo(() => (data.resources[subjectId] || []).slice(0, 5), [data.resources, subjectId])

  const minutes = Math.floor(seconds / 60)

  const record = useCallback(
    (mins) =>
      dispatch({
        type: 'addSession',
        session: {
          subjectId,
          unitId,
          title: unit ? unit.t : 'Sesión de estudio',
          date: todayISO(),
          type: 'estudio',
          durationMin: mins,
          done: true,
          notes: ''
        }
      }),
    [dispatch, subjectId, unitId, unit]
  )

  const finish = useCallback(
    (alsoDone) => {
      setRunning(false)
      if (minutes >= 1) record(minutes)
      if (alsoDone) markDone(subjectId, unitId)
      setSaved({ minutes, marked: Boolean(alsoDone) })
    },
    [minutes, record, subjectId, unitId, markDone]
  )

  // Salir de la vista no puede tirar el rato a la basura. El aviso del
  // navegador solo cubre cerrar la pestaña: una navegación por hash (el
  // botón de volver, cualquier enlace del menú) desmonta la vista sin
  // pasar por él. Así que al desmontar se guarda lo que llevases, sin
  // marcar la unidad como hecha: eso solo lo decides tú.
  const onExit = useRef(null)
  onExit.current = { minutes, done: Boolean(saved), record, toast, title: unit?.t }
  useEffect(
    () => () => {
      const x = onExit.current
      if (!x || x.done || x.minutes < 1) return
      x.record(x.minutes)
      x.toast(`${minutesLabel(x.minutes)} guardados en «${x.title}»`)
    },
    []
  )

  if (!plan || !unit) {
    return (
      <div>
        <div className="page-head">
          <h1>Sesión de estudio</h1>
        </div>
        <div className="card empty">
          <div className="big">No encuentro esa unidad</div>
          El temario de la asignatura puede haber cambiado.{' '}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/calendario')}>
            Volver al calendario
          </button>
        </div>
      </div>
    )
  }

  const kind = UNIT_KINDS[unit.kind] || UNIT_KINDS.tema

  if (saved) {
    return (
      <div className="focus-done">
        <div className="card">
          <div className="focus-done-mark" aria-hidden="true">
            <IconCheck />
          </div>
          <h2>Sesión registrada</h2>
          <p className="muted">
            {saved.minutes >= 1
              ? `${minutesLabel(saved.minutes)} en «${unit.t}»${saved.marked ? ', unidad marcada como hecha' : ''}.`
              : 'Menos de un minuto: no se ha registrado tiempo.'}
          </p>
          {saved.minutes >= 1 && (
            <p className="guide-fine">
              Estimabas {hoursLabel(estimated)}. Cuando tengas tres unidades cronometradas, Progreso podrá ajustar el
              plan a tu ritmo real.
            </p>
          )}
        </div>

        {!reflected ? (
          <div className="card focus-reflect">
            <h3>Antes de cerrar: explícatelo</h3>
            <p className="guide-summary" style={{ marginTop: 0 }}>
              Contarlo con tus palabras es lo que separa haber leído un tema de haberlo entendido. Si te atascas al
              escribirlo, ahí está el agujero — y ese es justo el valor del ejercicio.
            </p>
            <div className="field">
              <label htmlFor="focus-explain">¿Qué has entendido? Explícalo como si se lo contaras a alguien</label>
              <textarea
                id="focus-explain"
                rows={4}
                value={explain}
                onChange={(e) => setExplain(e.target.value)}
                placeholder="La idea central es… y sirve para…"
              />
            </div>
            <div className="field">
              <label htmlFor="focus-doubt">¿Qué te ha quedado a medias?</label>
              <textarea
                id="focus-doubt"
                rows={2}
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                placeholder="No acabo de ver por qué…"
              />
            </div>
            <div className="actions">
              <button type="button" className="btn btn-ghost" onClick={() => setReflected(true)}>
                Ahora no
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!explain.trim() && !doubt.trim()}
                onClick={() => {
                  const base = { subjectId, unitId, unitTitle: unit.t }
                  if (explain.trim()) {
                    dispatch({ type: 'addUnderstanding', note: { ...base, type: 'explicacion', text: explain.trim() } })
                  }
                  if (doubt.trim()) {
                    dispatch({ type: 'addUnderstanding', note: { ...base, type: 'duda', text: doubt.trim() } })
                  }
                  toast(doubt.trim() ? 'Guardado. La duda queda pendiente en la asignatura.' : 'Guardado')
                  setReflected(true)
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(`/asignatura/${subjectId}`)}>
              Ver la asignatura
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/calendario')}>
              Volver al calendario
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="focus">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 14 }}
        onClick={() => navigate('/calendario')}
      >
        <IconArrowLeft style={{ width: 14, height: 14 }} aria-hidden="true" /> Calendario
      </button>

      <div className="page-head">
        <div className="focus-subject">
          <span className="plan-dot" style={{ background: plannerSubject?.color || plan.color }} aria-hidden="true" />
          {subject?.name || subjectId}
          <i className={`plan-kind ${kind.className}`}>{kind.label}</i>
        </div>
        <h1>{unit.t}</h1>
        <div className="sub">
          Estimado: {hoursLabel(estimated)}
          {alreadyDone ? ' · ya la tenías marcada como hecha' : ''}
        </div>
      </div>

      <div className="card focus-timer">
        <div className="focus-time" role="timer" aria-live="off">
          {clock(seconds)}
        </div>
        <div className="focus-timer-sub">
          <IconClock aria-hidden="true" />
          {running ? 'En marcha' : seconds > 0 ? 'En pausa' : 'Sin empezar'}
          {estimated > 0 && seconds > 0 ? ` · ${Math.round((minutes / (estimated * 60)) * 100)} % de lo estimado` : ''}
        </div>
        <div className="focus-actions">
          {!running ? (
            <button type="button" className="btn btn-primary" onClick={start}>
              {seconds > 0 ? 'Seguir' : 'Empezar'}
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={pause}>
              Pausa
            </button>
          )}
          <button type="button" className="btn btn-ghost" disabled={minutes < 1} onClick={() => finish(false)}>
            Guardar y salir
          </button>
          <button type="button" className="btn btn-primary" disabled={minutes < 1} onClick={() => finish(true)}>
            Terminar unidad
          </button>
        </div>
        {minutes < 1 && seconds > 0 && <p className="guide-fine">Se registra a partir del primer minuto.</p>}
      </div>

      {topics.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>Qué entra en esta unidad</h3>
          <ul className="focus-topics">
            {topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {resources.list.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>Material recomendado</h3>
          <p className="guide-summary" style={{ marginTop: 0 }}>
            {resources.matched
              ? 'De la guía de la asignatura, lo que más se parece a esta unidad.'
              : 'Nada de la guía encaja con el título de esta unidad; esto es lo principal de la asignatura.'}
          </p>
          <ul className="guide-list">
            {resources.list.map((r) => (
              <li className="guide-res" key={r.url || r.title}>
                <div className="guide-res-body">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer noopener" className="guide-res-title">
                      {r.title}
                      <IconExternal aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="guide-res-title">{r.title}</span>
                  )}
                  {r.note && <div className="guide-res-note">{r.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mine.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>Tus recursos</h3>
          <ul className="guide-list">
            {mine.map((r) => (
              <li className="guide-res" key={r.id}>
                <div className="guide-res-body">
                  <a href={r.url} target="_blank" rel="noreferrer noopener" className="guide-res-title">
                    {r.title}
                    <IconExternal aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Solape de palabras largas entre el título de la unidad y un texto.
// Es el mismo criterio que usa la exportación al calendario; aquí se
// repite en pequeño para no cargar ese módulo solo por esto.
const STOP = new Set(['para', 'como', 'con', 'del', 'las', 'los', 'una', 'uno', 'por', 'sus', 'que', 'base', 'tema'])
function words(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
}
function score(a, b) {
  const hay = words(b)
  return words(a).filter((w) => hay.includes(w)).length
}
