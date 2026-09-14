// ============================================================
// Exportar el plan a un fichero .ics
// ------------------------------------------------------------
// La guía de estudio es un chunk aparte y pesa; se carga solo al
// pulsar el botón, no al abrir el calendario.
// ============================================================
import React, { useState } from 'react'
import { usePlanner } from './PlannerProvider.jsx'
import { buildEvents, toICS, startTimeFor } from './calendarExport.js'
import { hoursLabel } from './planner-engine.js'
import { formatShort } from '../../lib/dates.js'
import { useStore } from '../../lib/store.jsx'
import Modal from '../../components/Modal.jsx'
import { IconCalendar } from '../../components/Icons.jsx'

export default function ExportCalendar() {
  const { schedule, subjects, state, weeklySchedule, today } = usePlanner()
  const { toast } = useStore()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [withExams, setWithExams] = useState(true)

  const withWork = schedule.days.filter((d) => d.items.length || d.exams.length)
  const nBlocks = withWork.reduce((a, d) => a + d.items.length, 0)
  const nExams = withWork.reduce((a, d) => a + d.exams.length, 0)
  const totalH = withWork.reduce((a, d) => a + d.items.reduce((b, i) => b + i.h, 0), 0)
  const first = withWork[0]
  const last = withWork[withWork.length - 1]

  async function download() {
    setBusy(true)
    try {
      // Los recursos de cada evento salen de la guía de la asignatura.
      const { GUIDE } = await import('../../data/guide/index.js')
      const events = buildEvents({
        days: schedule.days,
        subjects,
        planner: state,
        weeklySchedule,
        guides: GUIDE,
        appUrl: window.location.href.split('#')[0],
        includeExams: withExams
      })
      if (!events.length) {
        toast('No hay nada planificado que exportar')
        setBusy(false)
        return
      }
      const blob = new Blob([toICS(events)], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nucleo-estudio-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.ics`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        a.remove()
        URL.revokeObjectURL(url)
      }, 0)
      toast(`${events.length} eventos exportados`)
      setOpen(false)
    } catch (e) {
      toast(`No se pudo exportar: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  if (!nBlocks && !nExams) return null

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        <IconCalendar style={{ width: 14, height: 14 }} aria-hidden="true" /> Exportar al calendario
      </button>

      {open && (
        <Modal title="Exportar al calendario" onClose={() => setOpen(false)}>
          <p className="plan-sub" style={{ marginTop: 0 }}>
            Se descarga un fichero <code>.ics</code> con tus sesiones de estudio. Cada evento lleva en la descripción
            qué toca, cómo abordarlo y los recursos de la guía que vienen al caso.
          </p>

          <div className="plan-export-stats">
            <div>
              <strong>{nBlocks}</strong>
              <span>sesiones</span>
            </div>
            <div>
              <strong>{hoursLabel(totalH)}</strong>
              <span>de estudio</span>
            </div>
            <div>
              <strong>{first && last ? `${formatShort(first.key)} – ${formatShort(last.key)}` : '—'}</strong>
              <span>rango</span>
            </div>
          </div>

          <p className="guide-fine">
            Empiezan a las {startTimeFor(first?.key || '2026-01-05', state, weeklySchedule)} entre semana y a las{' '}
            {state.startTimes[5]} los fines de semana, encadenando los bloques de cada día. Cambia las horas en «Tus
            horas».
          </p>

          <label className="plan-export-check">
            <input type="checkbox" checked={withExams} onChange={(e) => setWithExams(e.target.checked)} />
            Incluir los exámenes como eventos de día completo ({nExams})
          </label>

          <details className="plan-export-help">
            <summary>Cómo importarlo en Google Calendar</summary>
            <ol>
              <li>Abre Google Calendar en el ordenador.</li>
              <li>
                Rueda dentada → <strong>Configuración</strong> → <strong>Importar y exportar</strong>.
              </li>
              <li>Elige el fichero, selecciona en qué calendario quieres los eventos e importa.</li>
            </ol>
            <p>
              Consejo: créate antes un calendario nuevo llamado «NÚCLEO». Si un día replanificas y vuelves a importar,
              te basta con vaciar ese calendario en vez de ir borrando eventos sueltos.
            </p>
          </details>

          <div className="actions">
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={download} disabled={busy}>
              {busy ? 'Preparando…' : 'Descargar .ics'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
