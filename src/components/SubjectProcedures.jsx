// ============================================================
// Cómo se hace — los procedimientos de una asignatura
// ------------------------------------------------------------
// El hueco que cierra esta pantalla: los conceptos te dan las palabras
// y la práctica te da problemas resueltos, pero entre las dos cosas
// falta la receta. Quien va a clase la coge por imitación; quien
// estudia solo se queda mirando el enunciado sin saber por dónde
// empezar, y lo confunde con no haber entendido la teoría.
//
// El orden de cada ficha es deliberado. Primero «cuándo se usa», que
// es lo que de verdad se examina: reconocer qué método pide un
// enunciado. Después los pasos con sus notas. Luego la trampa, con el
// peso visual más alto. Y el ejemplo al final y plegado, porque tenerlo
// delante convierte el procedimiento en lectura — igual que en la
// pestaña de práctica con las soluciones.
// ============================================================
import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { proceduresFor } from '../data/procedures/index.js'
import { groupProcedures, sortProcedures, procedureStatus, stuckOn } from '../lib/procedures.js'

export default function SubjectProcedures({ subjectId }) {
  const { data } = useStore()
  const list = proceduresFor(subjectId)
  // El `|| {}` crea un objeto nuevo en cada render, y eso invalidaría
  // los useMemo de abajo siempre. Ya pasó una vez en el mapa.
  const attempts = useMemo(() => data.practice || {}, [data.practice])
  const [open, setOpen] = useState({}) // id → true si el ejemplo está desplegado
  const [byTopic, setByTopic] = useState(false)

  const stuck = useMemo(() => stuckOn(subjectId, attempts), [subjectId, attempts])
  const ordered = useMemo(
    () => (list ? sortProcedures(list, attempts, subjectId) : []),
    [list, attempts, subjectId]
  )

  if (!list) {
    return (
      <div className="card empty">
        <div className="big">Todavía no hay procedimientos de esta asignatura</div>
        Se añaden en <code>src/data/procedures/</code> y aparecen aquí sin tocar nada más.
      </div>
    )
  }

  // Por temas se respeta el orden del fichero, que va de lo básico a lo
  // que se apoya en ello. Sin agrupar manda lo que estás fallando.
  const groups = byTopic ? groupProcedures(list) : [{ g: null, items: ordered }]

  return (
    <div className="howto">
      <div className="card">
        <h3 style={{ marginBottom: 2 }}>
          Cómo se hace <span className="guide-count">{list.length}</span>
        </h3>
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Lo que haces con el bolígrafo cuando ya has leído el enunciado. Lo que más vale de cada ficha no son los
          pasos: es saber <strong>cuándo</strong> toca ese método, porque casi nadie suspende por no saber hacer una
          inducción, se suspende por no ver que el enunciado pedía una.
        </p>

        {stuck && (
          <p className="plan-warn plan-warn-block" style={{ marginTop: 12 }}>
            Ahora mismo se te está atragantando <strong>{stuck.procedure.t}</strong>: llevas {stuck.status.failed}{' '}
            {stuck.status.failed === 1 ? 'problema fallado' : 'problemas fallados'} de los que lo usan. Ahí no falta
            teoría, falta el método.
          </p>
        )}

        <p className="guide-fine">
          Los problemas para aplicarlo están en <a href={`#/asignatura/${subjectId}/practica`}>Práctica</a>.
        </p>

        <div className="tabs" role="tablist" aria-label="Orden de los procedimientos" style={{ marginTop: 14 }}>
          <button role="tab" aria-selected={!byTopic} className={!byTopic ? 'active' : ''} onClick={() => setByTopic(false)}>
            Lo que te falta
          </button>
          <button role="tab" aria-selected={byTopic} className={byTopic ? 'active' : ''} onClick={() => setByTopic(true)}>
            Por temas
          </button>
        </div>
      </div>

      {groups.map((grp) => (
        <React.Fragment key={grp.g || '_'}>
          {grp.g && (
            <div className="card howto-topic">
              <div className="guide-label">{grp.g}</div>
            </div>
          )}
          {grp.items.map((p) => {
            const st = procedureStatus(p, attempts, subjectId)
            const shown = !!open[p.id]
            return (
              <article className={`howto-card card${st.failed > 0 ? ' is-weak' : ''}`} key={p.id}>
                <div className="howto-head">
                  <h3 className="howto-t">{p.t}</h3>
                  {!byTopic && <span className="howto-g">{p.g}</span>}
                  {st.failed > 0 && (
                    <span className="howto-weak">
                      {st.failed} {st.failed === 1 ? 'fallado' : 'fallados'}
                    </span>
                  )}
                </div>

                <div className="howto-when">
                  <div className="guide-label">Cuándo se usa</div>
                  <p>{p.when}</p>
                </div>

                <div className="guide-label">Los pasos</div>
                <ol className="howto-steps">
                  {p.steps.map((s, i) => (
                    <li key={i}>
                      <p className="howto-step">{s.s}</p>
                      {s.note && <p className="howto-note">{s.note}</p>}
                    </li>
                  ))}
                </ol>

                <div className="howto-trap">
                  <div className="guide-label">Dónde se tuerce</div>
                  <p>{p.trap}</p>
                </div>

                <div className="howto-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    aria-expanded={shown}
                    onClick={() => setOpen((o) => ({ ...o, [p.id]: !shown }))}
                  >
                    {shown ? 'Ocultar el ejemplo' : 'Ver un ejemplo'}
                  </button>
                  <span className="guide-fine">Inténtalo antes en papel: verlo hecho no es haberlo hecho.</span>
                </div>

                {shown && (
                  <div className="howto-ex">
                    <p className="howto-ex-q">{p.ex.q}</p>
                    <ol className="howto-walk">
                      {p.ex.walk.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {st.linked > 0 && (
                  <p className="howto-linked">
                    <strong>{st.linked}</strong> {st.linked === 1 ? 'problema lo usa' : 'problemas lo usan'} en{' '}
                    <a href={`#/asignatura/${subjectId}/practica`}>Práctica</a>
                    {st.done > 0 && ` · has hecho ${st.done}`}
                  </p>
                )}
              </article>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}
