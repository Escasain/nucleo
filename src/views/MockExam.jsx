// ============================================================
// Simulacro de examen
// ------------------------------------------------------------
// La app ya planifica, explica, hace practicar y enseña de qué se apoya
// cada tema. Ninguna pantalla contestaba a lo que de verdad quita el
// sueño: ¿aprobaría si el examen fuera mañana?
//
// El orden de la pantalla imita al del examen real, y eso es casi todo
// el diseño: primero los enunciados y un reloj que corre, sin pistas ni
// soluciones a la vista. Solo cuando entregas aparecen las soluciones,
// una a una, para corregirte. Tener el «Ver solución» disponible
// durante la prueba convertiría el simulacro en otra sesión de lectura,
// que es justo lo que la pestaña de práctica ya hace mejor.
// ============================================================
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { subjectById } from '../data/curriculum.js'
import { practiceFor, LEVELS } from '../data/practice/index.js'
import { buildMock, mockMinutes, mockResult, notaLabel } from '../lib/mockExam.js'
import { formatShort, minutesLabel } from '../lib/dates.js'
import { IconArrowLeft, IconCheck, IconX, IconClock, IconTrash } from '../components/Icons.jsx'

const TAMANOS = [
  { n: 4, label: 'Corto' },
  { n: 6, label: 'Completo' },
  { n: 8, label: 'Largo' }
]

function clock(totalSeconds) {
  const sign = totalSeconds < 0 ? '−' : ''
  const t = Math.abs(totalSeconds)
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function MockExam({ subjectId, navigate }) {
  const { data, dispatch, toast } = useStore()
  const subject = subjectById(subjectId)
  const problems = practiceFor(subjectId)

  // Un examen a medias de esta asignatura: se reanuda tal cual. Solo se
  // lee al montar — de ahí los inicializadores de useState — porque a
  // partir de ahí manda el estado del componente.
  const guardadoRun = useMemo(() => {
    const r = data.mockRun
    if (!r || r.subjectId !== subjectId || !problems) return null
    const recuperados = r.problemIds.map((id) => problems.find((pr) => pr.id === id)).filter(Boolean)
    // Si el temario cambió y algún problema ya no existe, el examen no
    // se puede reconstruir entero: mejor empezar otro que enseñar uno
    // cojo con preguntas que faltan.
    if (recuperados.length !== r.problemIds.length || r.items.length !== recuperados.length) return null
    return { ...r, problemas: recuperados }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [fase, setFase] = useState(() => guardadoRun?.fase || 'antes')
  const [count, setCount] = useState(6)
  const [seed, setSeed] = useState(() => Date.now() % 100000)
  const [items, setItems] = useState(() => guardadoRun?.items || [])
  const [restante, setRestante] = useState(0)
  const [abierto, setAbierto] = useState(null)
  const [guardado, setGuardado] = useState(null)

  // El reloj sale de la hora, no de contar tics: el navegador frena los
  // temporizadores de una pestaña en segundo plano. Contando tics, mirar
  // otra cosa un momento te regalaría minutos de examen.
  const acaba = useRef(guardadoRun?.endsAt || 0)
  const empezo = useRef(guardadoRun?.startedAt || 0)
  // Minutos que costó el examen, congelados al entregar. Si se contaran
  // hasta el final incluirían el rato de corregirse, y el historial
  // diría cosas como «105 min de los 90 que tenías».
  const usados = useRef(guardadoRun?.usedMs || 0)

  // El examen que se está viendo antes de empezar. Depende de tus
  // intentos porque evita los problemas que ya sacaste limpios.
  const propuesta = useMemo(
    () => (problems ? buildMock(problems, data.practice, subjectId, { count, seed }) : []),
    [problems, data.practice, subjectId, count, seed]
  )
  // Y el examen de verdad, congelado al empezar. Tiene que ser estado y
  // no un memo: corregir un problema registra un intento, eso cambia
  // `data.practice`, y el examen se rehacía debajo de ti — las filas que
  // salían del nuevo sorteo desaparecían a mitad de la corrección.
  const [examen, setExamen] = useState(() => guardadoRun?.problemas || [])
  const enCurso = fase !== 'antes'
  const limite = useMemo(() => mockMinutes(enCurso ? examen : propuesta), [enCurso, examen, propuesta])
  const resultado = useMemo(() => mockResult(items), [items])

  const anteriores = useMemo(
    () => data.mocks.filter((m) => m.subjectId === subjectId).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data.mocks, subjectId]
  )

  const entregar = useCallback(() => {
    setFase((f) => {
      if (f !== 'haciendo') return f
      usados.current = Date.now() - empezo.current
      return 'corrigiendo'
    })
  }, [])

  useEffect(() => {
    if (fase !== 'haciendo') return undefined
    const tick = () => {
      const quedan = Math.round((acaba.current - Date.now()) / 1000)
      setRestante(quedan)
      if (quedan <= 0) entregar()
    }
    tick()
    const t = setInterval(tick, 1000)
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fase, entregar])

  // El examen en curso se guarda a cada cambio. La barra lateral, el
  // botón de volver y el botón «atrás» del navegador solo cambian el
  // hash, y un cambio de hash no dispara `beforeunload`: sin esto, mirar
  // una fecha en el calendario a mitad de examen lo tiraría sin avisar
  // siquiera. Guardarlo es mejor que avisar — se sale y se vuelve, y el
  // reloj sigue corriendo mientras tanto porque el final es absoluto.
  useEffect(() => {
    if (fase !== 'haciendo' && fase !== 'corrigiendo') return
    dispatch({
      type: 'setMockRun',
      run: {
        subjectId,
        problemIds: examen.map((pr) => pr.id),
        items,
        fase,
        startedAt: empezo.current,
        endsAt: acaba.current,
        usedMs: usados.current
      }
    })
  }, [fase, items, examen, subjectId, dispatch])

  if (!subject || !problems) {
    return (
      <div className="card empty">
        <div className="big">Esta asignatura todavía no tiene problemas</div>
        Sin problemas no se puede montar un examen. Se añaden en <code>src/data/practice/</code>.
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plan')}>
            Volver al plan
          </button>
        </div>
      </div>
    )
  }

  function empezar() {
    empezo.current = Date.now()
    acaba.current = Date.now() + limite * 60000
    setExamen(propuesta)
    setItems(propuesta.map((pr) => ({ problemId: pr.id, g: pr.g, level: pr.level, ok: null })))
    setFase('haciendo')
  }

  // Corregirse es un vaivén: te marcas un sí, lees la solución con más
  // calma y lo cambias a no. Aquí solo se guarda el estado; los intentos
  // se registran al cerrar el examen, uno por problema. Registrarlos a
  // cada clic contaría dos intentos por dudar, y un sí cambiado a no
  // dejaría el problema como «recuperado» cuando no lo sacaste.
  // Salida de emergencia: un examen empezado por error, o reanudado y ya
  // no querido, tiene que poder tirarse sin corregir seis problemas.
  // Nada de lo hecho se registra: un examen abandonado no es un
  // resultado.
  function descartar() {
    dispatch({ type: 'setMockRun', run: null })
    usados.current = 0
    setExamen([])
    setItems([])
    setAbierto(null)
    setFase('antes')
    toast('Simulacro descartado')
  }

  function marcar(problemId, ok) {
    setItems((list) => list.map((it) => (it.problemId === problemId ? { ...it, ok } : it)))
  }

  function terminar() {
    // Un intento por problema, con tu veredicto final: la pregunta «¿me
    // sale este problema?» tiene un solo sitio en la app, y fallarlo en
    // un examen es fallarlo.
    for (const it of items) {
      dispatch({ type: 'logAttempt', subjectId, problemId: it.problemId, result: it.ok ? 'ok' : 'fail' })
    }
    const minutos = Math.max(1, Math.round(usados.current / 60000))
    const mock = {
      subjectId,
      minutes: minutos,
      limitMin: limite,
      total: resultado.total,
      aciertos: resultado.aciertos,
      nota: resultado.nota,
      temas: resultado.temas
    }
    dispatch({ type: 'saveMock', mock })
    setGuardado({ ...mock, date: new Date().toISOString() })
    setFase('hecho')
    toast(`Simulacro guardado · ${resultado.nota} sobre 10`)
  }

  const problemaDe = (id) => examen.find((pr) => pr.id === id)

  return (
    <div className="mock">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/asignatura/${subjectId}/practica`)} style={{ marginBottom: 14 }}>
        <IconArrowLeft style={{ width: 14, height: 14 }} aria-hidden="true" /> {subject.name}
      </button>

      {fase === 'antes' && (
        <>
          <div className="card">
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>Simulacro de examen</h1>
            <p className="guide-summary">
              Practicar y examinarse no miden lo mismo. Practicando eliges el problema, te tomas el tiempo que haga
              falta y tienes la pista a un clic; en el examen te toca lo que te toca y el reloj corre. Aquí no hay
              pistas ni soluciones hasta que entregues.
            </p>

            <div className="guide-label" style={{ marginTop: 16 }}>
              Longitud
            </div>
            <div className="tabs" role="tablist" style={{ marginTop: 6 }}>
              {TAMANOS.map((t) => (
                <button
                  key={t.n}
                  role="tab"
                  aria-selected={count === t.n}
                  className={count === t.n ? 'active' : ''}
                  onClick={() => setCount(t.n)}
                >
                  {t.label} · {t.n}
                </button>
              ))}
            </div>

            <p className="guide-fine" style={{ marginTop: 14 }}>
              {propuesta.length} problemas de {new Set(propuesta.map((pr) => pr.g)).size} temas ·{' '}
              <strong>{minutesLabel(limite)}</strong>. Los temas se sortean cada vez, como en un examen de verdad: no
              se insiste en tus puntos flojos, porque eso mediría otra cosa.
            </p>

            <div className="actions" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
                Otro sorteo
              </button>
              <button className="btn btn-primary" onClick={empezar} disabled={propuesta.length === 0}>
                <IconClock style={{ width: 15, height: 15 }} aria-hidden="true" /> Empezar, {minutesLabel(limite)}
              </button>
            </div>
          </div>

          {anteriores.length > 0 && (
            <div className="card">
              <h3>Simulacros anteriores</h3>
              <ul className="mock-history">
                {anteriores.map((m) => (
                  <li key={m.id}>
                    <span className={`mock-nota${m.nota < 5 ? ' is-fail' : ''}`}>{m.nota}</span>
                    <div className="grow">
                      <div className="title">
                        {m.aciertos} de {m.total} · {notaLabel(m.nota)}
                      </div>
                      <div className="meta">
                        {formatShort(String(m.date).slice(0, 10))} · {minutesLabel(m.minutes)} de {minutesLabel(m.limitMin)}
                        {m.temas?.some((t) => t.ok < t.total)
                          ? ` · flojeó ${m.temas.filter((t) => t.ok < t.total).map((t) => t.g).join(', ')}`
                          : ' · sin fallos'}
                      </div>
                    </div>
                    <button
                      className="icon-btn"
                      aria-label={`Borrar simulacro del ${formatShort(String(m.date).slice(0, 10))}`}
                      title="Borrar"
                      onClick={() => dispatch({ type: 'deleteMock', id: m.id })}
                    >
                      <IconTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {fase === 'haciendo' && (
        <>
          <div className={`card mock-bar${restante <= 300 ? ' is-urgent' : ''}`}>
            <div>
              <div className="stat-lbl">Tiempo restante</div>
              <div className="mock-clock" aria-live="off">
                {clock(restante)}
              </div>
            </div>
            <div className="grow" />
            <button className="btn btn-ghost" onClick={descartar}>
              Descartar
            </button>
            <button className="btn btn-primary" onClick={entregar}>
              Entregar y corregir
            </button>
          </div>

          <div className="card">
            <p className="guide-fine" style={{ marginTop: 0 }}>
              Resuélvelo en papel, como el examen. Cuando entregues verás las soluciones para corregirte.
            </p>
            <ol className="mock-list">
              {examen.map((pr, i) => (
                <li key={pr.id}>
                  <div className="prob-head">
                    <strong>{i + 1}.</strong>
                    <i className={`plan-kind ${(LEVELS[pr.level] || LEVELS[1]).className}`}>
                      {(LEVELS[pr.level] || LEVELS[1]).label}
                    </i>
                    <span className="guide-fine">{pr.g}</span>
                  </div>
                  <p className="prob-q">{pr.q}</p>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {fase === 'corrigiendo' && (
        <>
          <div className="card">
            <h3 style={{ marginBottom: 2 }}>Corrige</h3>
            <p className="guide-summary" style={{ marginTop: 0 }}>
              {restante <= 0
                ? 'Se acabó el tiempo. Corrige lo que te dio tiempo a hacer y cuenta como fallado lo que no.'
                : 'Una por una, con la solución delante. Sé duro: un resultado bien con el camino mal no valdría en el examen.'}
            </p>
            <p className="guide-fine">
              {resultado.corregidos} de {resultado.total} corregidos
            </p>
          </div>

          {items.map((it, i) => {
            const pr = problemaDe(it.problemId)
            if (!pr) return null
            return (
              <div className={`card mock-fix${it.ok === true ? ' is-ok' : it.ok === false ? ' is-fail' : ''}`} key={it.problemId}>
                <div className="prob-head">
                  <strong>{i + 1}.</strong>
                  <span className="guide-fine">{pr.g}</span>
                </div>
                <p className="prob-q">{pr.q}</p>
                <div className="prob-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    aria-expanded={abierto === it.problemId}
                    onClick={() => setAbierto(abierto === it.problemId ? null : it.problemId)}
                  >
                    {abierto === it.problemId ? 'Ocultar solución' : 'Ver solución'}
                  </button>
                </div>
                {abierto === it.problemId && (
                  <div className="prob-solution">
                    {pr.key && (
                      <p className="prob-key">
                        <strong>Respuesta:</strong> {pr.key}
                      </p>
                    )}
                    <pre className="prob-a">{pr.a}</pre>
                  </div>
                )}
                <div className="prob-verdict">
                  <span className="guide-fine">¿Lo sacaste?</span>
                  <button
                    type="button"
                    className={`btn btn-sm ${it.ok === true ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => marcar(it.problemId, true)}
                  >
                    <IconCheck aria-hidden="true" /> Sí
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${it.ok === false ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => marcar(it.problemId, false)}
                  >
                    <IconX aria-hidden="true" /> No
                  </button>
                </div>
              </div>
            )
          })}

          <div className="card actions">
            <button className="btn btn-ghost" onClick={descartar}>
              Descartar
            </button>
            <button className="btn btn-primary" onClick={terminar} disabled={resultado.pendiente > 0}>
              {resultado.pendiente > 0 ? `Quedan ${resultado.pendiente} por corregir` : 'Ver el resultado'}
            </button>
          </div>
        </>
      )}

      {fase === 'hecho' && guardado && (
        <div className="card">
          <div className="guide-label">{notaLabel(guardado.nota)}</div>
          <div className={`mock-final${guardado.nota < 5 ? ' is-fail' : ''}`}>{guardado.nota}</div>
          <p className="guide-summary">
            {guardado.aciertos} de {guardado.total} en {minutesLabel(guardado.minutes)} de los {minutesLabel(guardado.limitMin)} que
            tenías.
          </p>

          <p className="plan-warn plan-warn-block">
            {resultado.peor ? (
              <>
                Donde se te fueron los puntos es en <strong>{resultado.peor.g}</strong> ({resultado.peor.ok} de{' '}
                {resultado.peor.total}). El mapa dice de qué se apoya ese tema: mira ahí antes de volver a insistir en
                los mismos problemas.
              </>
            ) : (
              <>Sin un solo fallo. Repítelo dentro de unos días con otro sorteo para saber si es que lo tienes o es que tuviste suerte con los temas.</>
            )}
          </p>

          <div className="guide-label" style={{ marginTop: 16 }}>
            Por temas
          </div>
          <ul className="mock-topics">
            {resultado.temas.map((t) => (
              <li key={t.g} className={t.ok < t.total ? 'is-fail' : ''}>
                <span>{t.g}</span>
                <strong>
                  {t.ok}/{t.total}
                </strong>
              </li>
            ))}
          </ul>

          <p className="guide-fine">
            Cada problema ha quedado registrado como un intento más, así que la pestaña de práctica y el mapa ya cuentan
            con esto.
          </p>

          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => navigate(`/asignatura/${subjectId}/mapa`)}>
              Ver el mapa
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSeed(Math.floor(Math.random() * 100000))
                usados.current = 0
                setExamen([])
                setItems([])
                setGuardado(null)
                setAbierto(null)
                setFase('antes')
              }}
            >
              Otro simulacro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
