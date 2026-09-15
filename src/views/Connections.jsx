// ============================================================
// Conexiones — la misma idea en varias asignaturas
// ------------------------------------------------------------
// Estudiar tres asignaturas a la vez y por tu cuenta da la sensación de
// estar dándote contra tres paredes distintas. Casi nunca lo son: la
// lógica de Álgebra, las puertas de Tecnología y el if de Java son el
// mismo álgebra escrita de tres maneras, y verlo convierte tres temas
// en uno.
//
// El resto de la app va hacia dentro de cada asignatura. Esta vista es
// la única que va a lo ancho, y por eso vive fuera de las asignaturas.
// ============================================================
import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { subjectById } from '../data/curriculum.js'
import { BRIDGES } from '../data/bridges/index.js'
import { bridgesFor, bridgeReach, sortBridges, subjectsInBridges } from '../lib/bridges.js'
import Bridge from '../components/Bridge.jsx'

export default function Connections() {
  const { data } = useStore()
  // El `|| {}` crea un objeto nuevo en cada render, y eso invalidaría
  // los useMemo de abajo siempre. Se estabiliza aquí una sola vez.
  const subjects = useMemo(() => data.subjects || {}, [data.subjects])
  const [filter, setFilter] = useState('todas')

  const filters = useMemo(() => {
    const ids = subjectsInBridges()
    return [
      { id: 'todas', label: 'Todas' },
      ...ids.map((id) => {
        const s = subjectById(id)
        // El nombre completo no cabe en una pestaña: se queda con lo
        // que hay antes de la primera «y», que es como las llama todo
        // el mundo de viva voz.
        return { id, label: s ? s.name.split(' y ')[0] : id }
      })
    ]
  }, [])

  const visible = useMemo(() => {
    const base = filter === 'todas' ? BRIDGES : bridgesFor(filter)
    return sortBridges(base, subjects)
  }, [filter, subjects])

  const live = useMemo(
    () => BRIDGES.filter((b) => bridgeReach(b, subjects).live >= 2).length,
    [subjects]
  )

  return (
    <div>
      <div className="page-head">
        <h1>Conexiones</h1>
        <div className="sub">La misma idea, vista desde varias asignaturas</div>
      </div>

      <div className="card">
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Tres asignaturas a la vez parecen tres paredes distintas, y casi nunca lo son. Aquí está lo que se repite:
          qué es la misma idea de verdad, qué puedes trasladar tal cual de una a otra y —lo que no suele escribirse en
          ningún sitio— dónde deja de valer el parecido. Una analogía a medias hace más daño que ninguna, porque la
          aplicas con confianza justo en el caso en que falla.
        </p>
        {live > 0 && (
          <p className="guide-fine" style={{ marginTop: 10 }}>
            {live === BRIDGES.length
              ? `Ahora mismo los ${live} unen dos asignaturas que tienes entre manos.`
              : live === 1
                ? 'Hay uno que une dos asignaturas que tienes entre manos ahora mismo. Sale el primero.'
                : `Hay ${live} que unen dos asignaturas que tienes entre manos ahora mismo. Salen los primeros.`}
          </p>
        )}

        <div className="tabs" role="tablist" aria-label="Filtrar por asignatura" style={{ marginTop: 14 }}>
          {filters.map((f) => (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={filter === f.id}
              className={filter === f.id ? 'active' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card empty">
          <div className="big">Ningún puente por aquí todavía</div>
          Esa asignatura aún no aparece en ninguna conexión.
        </div>
      ) : (
        <div className="bridge-list">
          {visible.map((b) => (
            <Bridge key={b.id} bridge={b} subjects={subjects} />
          ))}
        </div>
      )}
    </div>
  )
}
