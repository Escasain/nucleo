import React, { useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { isConfigured, isPickerConfigured } from '../lib/driveSync.js'
import { IconDrive } from '../components/Icons.jsx'

function relativeDays(iso) {
  if (!iso) return 'nunca'
  const d = Math.floor((Date.now() - Date.parse(iso)) / 86400000)
  if (d <= 0) return 'hoy'
  if (d === 1) return 'ayer'
  return `hace ${d} días`
}

export default function Settings({ onHelp }) {
  const { data, dispatch, syncStatus, connectDrive, disconnectDrive, exportJSON, importJSON, toast } = useStore()
  const fileRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const goalHours = Math.round(((Number(data.settings?.weeklyGoalMin) || 0) / 60) * 2) / 2
  const configured = isConfigured()
  const connected = syncStatus === 'synced' || syncStatus === 'syncing'
  const connecting = syncStatus === 'connecting'

  return (
    <div>
      <div className="page-head">
        <h1>Ajustes</h1>
        <div className="sub">Sincronización, copias de seguridad y datos</div>
      </div>

      <div className="card">
        <h3>
          <IconDrive style={{ width: 17, height: 17, verticalAlign: '-3px', marginRight: 8 }} aria-hidden="true" />
          Google Drive
        </h3>
        {!configured && (
          <div className="banner">
            <div>
              <strong>Falta configurar el Client ID de Google.</strong> Sigue la guía{' '}
              <a href="https://github.com/Escasain/nucleo/blob/main/SETUP.md" target="_blank" rel="noreferrer">
                SETUP.md
              </a>{' '}
              del repositorio (10 minutos, gratuito) y pega tu ID en <code>src/config.js</code>. Mientras tanto, tus
              datos se guardan en este navegador.
            </div>
          </div>
        )}
        {configured && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
            Tus datos se guardan como <code>nucleo-data.json</code> dentro de la carpeta <strong>NÚCLEO</strong> de tu
            Drive. La app solo puede ver los ficheros que ella crea y los que tú selecciones con el Picker.
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {!connected ? (
            <button className="btn btn-primary" disabled={!configured || connecting} onClick={connectDrive}>
              {connecting ? 'Conectando…' : 'Conectar con Drive'}
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={disconnectDrive}>
              Desconectar
            </button>
          )}
        </div>
        {syncStatus === 'error' && (
          <p style={{ fontSize: 13, color: 'var(--st-suspensa)', marginBottom: 0 }}>
            La última sincronización falló. Tus datos siguen guardados en este navegador; vuelve a conectar cuando
            puedas.
          </p>
        )}
        {configured && !isPickerConfigured() && (
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', marginBottom: 0 }}>
            El botón «Desde Drive» de cada asignatura necesita además el App ID del proyecto (paso 7 de SETUP.md).
            Mientras tanto puedes añadir recursos por enlace.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Objetivo de estudio</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Horas de estudio a la semana que quieres alcanzar. Cuentan los pomodoros y las sesiones con duración marcadas
          como hechas. Orientación: en UNIPRO cada asignatura de 6 ECTS son unas 150 h en el bimestre, unas 8–10 h
          semanales por asignatura cursada.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 260 }}>
          <label htmlFor="weekly-goal" style={{ margin: 0 }}>
            Horas/semana
          </label>
          <input
            id="weekly-goal"
            type="number"
            min="0"
            max="80"
            step="0.5"
            value={goalHours}
            onChange={(e) => {
              const h = Math.max(0, Math.min(80, Number(e.target.value) || 0))
              dispatch({ type: 'setSettings', patch: { weeklyGoalMin: Math.round(h * 60) } })
            }}
            style={{ width: 90 }}
          />
        </div>
      </div>

      <div className="card">
        <h3>Copia de seguridad</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Exporta todos tus datos (expediente, sesiones, recursos, flashcards, horario…) a un fichero JSON, o restaura
          una copia anterior. Última copia exportada: <strong>{relativeDays(data.settings?.lastExportAt)}</strong>.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportJSON}>
            Exportar JSON
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current && fileRef.current.click()}>
            Importar JSON
          </button>
          <span className="sr-only" id="import-help">
            Sustituye los datos actuales por los de la copia seleccionada
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            aria-describedby="import-help"
            aria-label="Seleccionar copia de seguridad"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0]
              if (f) importJSON(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3>Ayuda</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Guía de uso, atajos de teclado y cómo se calcula la nota en UNIPRO.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onHelp}>
            Ver ayuda y atajos
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              dispatch({ type: 'setSettings', patch: { onboardingDone: false } })
              toast('El tutorial volverá a aparecer en Inicio')
            }}
          >
            Volver a ver el tutorial
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Zona peligrosa</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Borra todos los datos de este navegador y vuelve al expediente inicial. Si tienes Drive conectado, se
          sobrescribirá también allí en la siguiente sincronización. Exporta una copia antes.
        </p>
        {!confirmReset ? (
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
            Borrar todos los datos…
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>¿Seguro? No se puede deshacer.</span>
            <button
              className="btn btn-danger"
              onClick={() => {
                dispatch({ type: 'reset' })
                setConfirmReset(false)
                toast('Datos borrados')
              }}
            >
              Sí, borrar todo
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Acerca de</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: 0 }}>
          NÚCLEO · «Estudio de tarde» — portal personal de seguimiento del Bachelor en Ingeniería Informática (UNIPRO).
          Instalable como app (PWA): en el móvil, «Añadir a pantalla de inicio».
        </p>
      </div>
    </div>
  )
}
