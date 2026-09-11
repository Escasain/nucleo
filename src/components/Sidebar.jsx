import React from 'react'
import { useStore } from '../lib/store.jsx'
import { IconHome, IconBook, IconCalendar, IconCards, IconGear } from './Icons.jsx'

const LINKS = [
  { hash: '#/', name: 'dashboard', label: 'Inicio', Icon: IconHome },
  { hash: '#/plan', name: 'plan', label: 'Plan de estudios', Icon: IconBook },
  { hash: '#/agenda', name: 'agenda', label: 'Agenda', Icon: IconCalendar },
  { hash: '#/estudio', name: 'estudio', label: 'Estudio', Icon: IconCards },
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

export default function Sidebar({ activeName, open, onClose }) {
  const { syncStatus } = useStore()
  const [dotClass, label] = SYNC_LABEL[syncStatus] || ['', '']

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="nucleo-sidebar">
      <div className="brand">
        NÚCLEO
        <small>Estudio de tarde</small>
      </div>
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
      <div className="sync-state" role="status">
        <span className={`sync-dot ${dotClass}`} aria-hidden="true" />
        {label}
      </div>
    </aside>
  )
}
