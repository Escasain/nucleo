// ============================================================
// Las conexiones de una asignatura
// ------------------------------------------------------------
// La misma lista que la vista general, pero mirada desde dentro de una
// asignatura: aquí ya sabes dónde estás, así que cada puente enseña
// solo el otro lado.
// ============================================================
import React, { useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { subjectById } from '../data/curriculum.js'
import { bridgesFor, sortBridges } from '../lib/bridges.js'
import Bridge from './Bridge.jsx'

export default function SubjectBridges({ subjectId }) {
  const { data } = useStore()
  const subjects = useMemo(() => data.subjects || {}, [data.subjects])
  const list = useMemo(() => sortBridges(bridgesFor(subjectId), subjects), [subjectId, subjects])
  const subject = subjectById(subjectId)

  if (list.length === 0) {
    return (
      <div className="card empty">
        <div className="big">Ninguna conexión todavía</div>
        Esta asignatura aún no aparece en ningún puente.
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <h3 style={{ marginBottom: 2 }}>
          Conexiones <span className="guide-count">{list.length}</span>
        </h3>
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Ideas de {subject ? subject.name : 'esta asignatura'} que también salen en otra, a veces con otro nombre y
          otra notación. Lo que puedes trasladar tal cual, y dónde deja de valer el parecido — que es la parte que
          suele costar un examen.
        </p>
        <p className="guide-fine">
          Están todas juntas y a lo ancho del grado en <a href="#/conexiones">Conexiones</a>.
        </p>
      </div>

      <div className="bridge-list">
        {list.map((b) => (
          <Bridge key={b.id} bridge={b} subjects={subjects} from={subjectId} />
        ))}
      </div>
    </>
  )
}
