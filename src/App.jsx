import React, { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './lib/store.jsx'
import { useRoute } from './lib/router.jsx'
import Sidebar from './components/Sidebar.jsx'
import { IconMenu } from './components/Icons.jsx'
import Dashboard from './views/Dashboard.jsx'
import Plan from './views/Plan.jsx'
import SubjectDetail from './views/SubjectDetail.jsx'
import Agenda from './views/Agenda.jsx'
import Study from './views/Study.jsx'
import Settings from './views/Settings.jsx'

function Shell() {
  const { route, navigate } = useRoute()
  const { toasts } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  // El menú móvil se cierra con cualquier cambio de ruta (también con
  // el botón «atrás» del navegador) y con la tecla Escape.
  useEffect(() => {
    setMenuOpen(false)
  }, [route.name, route.id, route.subjectId])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Cada vista empieza por su encabezado, no a media página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name, route.id, route.subjectId])

  let view
  if (route.name === 'plan') view = <Plan navigate={navigate} />
  else if (route.name === 'subject') view = <SubjectDetail id={route.id} navigate={navigate} />
  else if (route.name === 'agenda') view = <Agenda navigate={navigate} />
  else if (route.name === 'estudio') view = <Study subjectId={route.subjectId} navigate={navigate} />
  else if (route.name === 'ajustes') view = <Settings />
  else view = <Dashboard navigate={navigate} />

  return (
    <>
      <div className="mobile-topbar">
        <button
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="nucleo-sidebar"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <IconMenu aria-hidden="true" />
        </button>
        <span className="brand">NÚCLEO</span>
      </div>
      {menuOpen && <div className="backdrop-mobile" aria-hidden="true" onClick={() => setMenuOpen(false)} />}
      <div className="app">
        <Sidebar activeName={route.name} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="main" id="contenido">
          {view}
        </main>
      </div>
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
