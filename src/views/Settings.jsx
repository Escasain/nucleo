import React, { useRef } from 'react'
import { useStore } from '../lib/store.jsx'
import { isConfigured, isPickerConfigured } from '../lib/driveSync.js'
import { IconDrive } from '../components/Icons.jsx'

export default function Settings() {
  const { syncStatus, connectDrive, disconnectDrive, exportJSON, importJSON } = useStore()
  const fileRef = useRef(null)
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
        <h3>Copia de seguridad</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Exporta todos tus datos (expediente, sesiones, recursos, flashcards…) a un fichero JSON, o restaura una copia
          anterior.
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
        <h3>Acerca de</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: 0 }}>
          NÚCLEO · «Estudio de tarde» — portal personal de seguimiento del Bachelor en Ingeniería Informática (UNIPRO).
          Instalable como app (PWA): en el móvil, «Añadir a pantalla de inicio».
        </p>
      </div>
    </div>
  )
}
