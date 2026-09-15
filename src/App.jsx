import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { StoreProvider, useStore } from './lib/store.jsx'
import { PlannerProvider } from './modules/study-planner/PlannerProvider.jsx'
import { useRoute } from './lib/router.jsx'
import Sidebar from './components/Sidebar.jsx'
import SearchModal from './components/SearchModal.jsx'
import HelpModal from './components/HelpModal.jsx'
import { IconMenu, IconSearch } from './components/Icons.jsx'
import Dashboard from './views/Dashboard.jsx'
import Plan from './views/Plan.jsx'
import SubjectDetail from './views/SubjectDetail.jsx'
import Agenda from './views/Agenda.jsx'
import StudyOverview from './modules/study-planner/StudyOverview.jsx'
import Study from './views/Study.jsx'
import Progress from './views/Progress.jsx'
import Focus from './views/Focus.jsx'
// El simulacro carga los problemas de la asignatura: fuera del bundle
// principal, igual que la pestaña de práctica.
const MockExam = lazy(() => import('./views/MockExam.jsx'))
import Settings from './views/Settings.jsx'

const GO_KEYS = { i: '/', p: '/plan', c: '/calendario', a: '/agenda', e: '/estudio', r: '/progreso', j: '/ajustes' }

function isTyping(e) {
  const t = e.target
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
}

function Shell() {
  const { route, navigate } = useRoute()
  const { toasts } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [help, setHelp] = useState(false)

  // El menú móvil se cierra con cualquier cambio de ruta (también con
  // el botón «atrás» del navegador) y con la tecla Escape.
  useEffect(() => {
    setMenuOpen(false)
  }, [route.name, route.id, route.subjectId])

  // Cada vista empieza por su encabezado, no a media página. El día
  // seleccionado del calendario no cuenta: cambia dentro de la misma
  // vista y saltar arriba perdería de vista el detalle.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name, route.id, route.subjectId, route.unitId])

  // Atajos globales: ? ayuda · Ctrl/⌘+K buscar · G + letra navegar · Esc cerrar
  const openSearch = useCallback(() => setSearch(true), [])
  useEffect(() => {
    let pendingG = 0
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearch(true)
        return
      }
      if (e.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === '?') {
        e.preventDefault()
        setHelp(true)
        return
      }
      const now = Date.now()
      if (e.key.toLowerCase() === 'g') {
        pendingG = now
        return
      }
      if (pendingG && now - pendingG < 1200 && GO_KEYS[e.key.toLowerCase()]) {
        e.preventDefault()
        navigate(GO_KEYS[e.key.toLowerCase()])
      }
      pendingG = 0
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  let view
  if (route.name === 'plan') view = <Plan navigate={navigate} />
  else if (route.name === 'subject') view = <SubjectDetail key={route.id} id={route.id} tab={route.tab} navigate={navigate} />
  else if (route.name === 'calendario') view = <StudyOverview navigate={navigate} selectedDay={route.day} />
  else if (route.name === 'agenda') view = <Agenda navigate={navigate} />
  else if (route.name === 'estudio') view = <Study subjectId={route.subjectId} navigate={navigate} />
  else if (route.name === 'progreso') view = <Progress navigate={navigate} />
  else if (route.name === 'sesion')
    // La key fuerza remontar al cambiar de unidad: si no, encadenar dos
    // sesiones seguidas arrastraría el cronómetro y la pantalla de
    // «sesión registrada» de la anterior. Además hace que al salir se
    // guarde el rato de la que dejas, como en cualquier otra salida.
    view = (
      <Focus
        key={`${route.subjectId}/${route.unitId}`}
        subjectId={route.subjectId}
        unitId={route.unitId}
        navigate={navigate}
      />
    )
  // La key fuerza remontar al cambiar de asignatura: si no, encadenar dos
  // simulacros arrastraría el examen y el reloj del anterior.
  else if (route.name === 'simulacro')
    view = (
      <Suspense fallback={<div className="card empty">Montando el examen…</div>}>
        <MockExam key={route.subjectId} subjectId={route.subjectId} navigate={navigate} />
      </Suspense>
    )
  else if (route.name === 'ajustes') view = <Settings onHelp={() => setHelp(true)} />
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
        <button type="button" aria-label="Buscar" onClick={openSearch} style={{ marginLeft: 'auto' }}>
          <IconSearch aria-hidden="true" />
        </button>
      </div>
      {menuOpen && <div className="backdrop-mobile" aria-hidden="true" onClick={() => setMenuOpen(false)} />}
      <div className="app">
        <Sidebar
          activeName={route.name}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSearch={openSearch}
          onHelp={() => setHelp(true)}
        />
        <main className="main" id="contenido">
          {view}
        </main>
      </div>
      {search && <SearchModal onClose={() => setSearch(false)} navigate={navigate} />}
      {help && <HelpModal onClose={() => setHelp(false)} />}
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
      <PlannerProvider>
        <Shell />
      </PlannerProvider>
    </StoreProvider>
  )
}
