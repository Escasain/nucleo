// ============================================================
// Un puente entre asignaturas
// ------------------------------------------------------------
// El orden de las secciones no es casual. Primero la idea desnuda,
// luego dónde te la encuentras, luego lo que se traslada — y al final,
// con el mayor peso visual de la tarjeta, dónde deja de valer. Una
// analogía a medias se aplica con confianza justo en el caso en que
// falla, así que ese apartado no puede quedar como una nota al pie.
// ============================================================
import React from 'react'
import { subjectById } from '../data/curriculum.js'
import { endStatus, otherEnds } from '../lib/bridges.js'
import { hasMap } from '../data/map/meta.js'

const STATUS_HINT = {
  activa: 'La estás dando',
  hecha: 'Ya aprobada',
  lejos: 'Aún no la has empezado'
}

function endHref(subjectId) {
  return hasMap(subjectId) ? `#/asignatura/${subjectId}/mapa` : `#/asignatura/${subjectId}`
}

/**
 * @param from  Desde qué asignatura se mira, si se mira desde alguna.
 *              Cambia qué extremos se enseñan: dentro de una
 *              asignatura, repetirle al lector dónde está es ruido.
 */
export default function Bridge({ bridge, subjects, from = null }) {
  const ends = from ? otherEnds(bridge, from) : bridge.ends
  const later = bridge.later || []

  return (
    <article className="bridge card">
      <h3 className="bridge-t">{bridge.t}</h3>
      <p className="bridge-idea">{bridge.idea}</p>

      <div className="guide-label">
        {from ? 'Dónde más te lo encuentras' : 'Dónde te lo encuentras'}
      </div>
      <ul className="bridge-ends">
        {ends.map((e, i) => {
          const subject = subjectById(e.s)
          const st = endStatus(e.s, subjects)
          return (
            <li key={`${e.s}-${e.node}-${i}`} className={`bridge-end is-${st}`}>
              <div className="bridge-end-head">
                <a className="bridge-end-name" href={endHref(e.s)}>
                  {subject ? subject.name : e.s}
                </a>
                <code className="bridge-as">{e.as}</code>
                <span className="bridge-end-state">{STATUS_HINT[st]}</span>
              </div>
              <p className="bridge-how">{e.how}</p>
            </li>
          )
        })}
      </ul>

      <div className="guide-label">Lo que se traslada</div>
      <p className="bridge-same">{bridge.same}</p>

      <div className="bridge-breaks">
        <div className="guide-label">Dónde deja de valer</div>
        <p>{bridge.breaks}</p>
      </div>

      <div className="bridge-check">
        <div className="guide-label">Compruébalo</div>
        <p>{bridge.check}</p>
      </div>

      {later.length > 0 && (
        <p className="bridge-later">
          <strong>Vuelve a salir en</strong>{' '}
          {later.map((l, i) => {
            const subject = subjectById(l.s)
            return (
              <span key={l.s}>
                {i > 0 && ' · '}
                <a href={`#/asignatura/${l.s}`}>{subject ? subject.name : l.s}</a>: {l.how}
              </span>
            )
          })}
        </p>
      )}
    </article>
  )
}
