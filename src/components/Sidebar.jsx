import React from 'react'
import { useStore } from '../lib/store.jsx'
import { IconHome, IconBook, IconCalendar, IconCards, IconGear, IconSearch, IconHelp, IconPlanner, IconChart } from './Icons.jsx'

const LINKS = [
  { hash: '#/', name: 'dashboard', label: 'Inicio', Icon: IconHome },
  { hash: '#/plan', name: 'plan', label: 'Plan de estudios', Icon: IconBook },
  { hash: '#/calendario', name: 'calendario', label: 'Calendario', Icon: IconPlanner },
  { hash: '#/agenda', name: 'agenda', label: 'Agenda', Icon: IconCalendar },
  { hash: '#/estudio', name: 'estudio', label: 'Estudio', Icon: IconCards },
  { hash: '#/progreso', name: 'progreso', label: 'Progreso', Icon: IconChart },
  { hash: '#/ajustes', name: 'ajustes', label: 'Ajustes', Icon: IconGear }
]

const SYNC_LABEL = {
  unconfigured: ['', 'Modo local'],
  local: ['warn', 'Sin conectar a Drive'],
  connecting: ['warn', 'Conectando…'],
  syncing: ['warn', 'Guardando en Drive…'],
  synced: ['ok', 'Sincronizado con Drive'],
  error: ['err', 'Error de sincronización']
}

export default function Sidebar({ activeName, open, onClose, onSearch, onHelp }) {
  const { syncStatus } = useStore()
  const [dotClass, label] = SYNC_LABEL[syncStatus] || ['', '']

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="nucleo-sidebar">
      <div className="brand">
        NÚCLEO
        <small>Estudio de tarde</small>
      </div>
      <button type="button" className="sidebar-search" onClick={onSearch} aria-label="Buscar (Ctrl+K)">
        <IconSearch aria-hidden="true" />
        <span>Buscar</span>
        <span className="kbd" aria-hidden="true">
          Ctrl K
        </span>
      </button>
      <nav className="nav" aria-label="Navegación principal">
        {LINKS.map(({ hash, name, label: l, Icon }) => {
          const active = activeName === name || (name === 'plan' && activeName === 'subject')
          return (
            <a
              key={name}
              href={hash}
              className={active ? 'active' : ''}
              aria-current={active ? 'page' : undefined}
              onClick={onClose}
            >
              <Icon aria-hidden="true" />
              {l}
            </a>
          )
        })}
      </nav>
      <button type="button" className="sidebar-help" onClick={onHelp} aria-label="Ayuda (tecla ?)">
        <IconHelp aria-hidden="true" />
        Ayuda y atajos
      </button>
      <div className="sync-state" role="status">
        <span className={`sync-dot ${dotClass}`} aria-hidden="true" />
        {label}
      </div>
    </aside>
  )
}
