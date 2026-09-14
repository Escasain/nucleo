// ============================================================
// Progreso — el plan contra la realidad
// ------------------------------------------------------------
// El calendario dice lo que deberías estudiar. Esta vista dice lo que
// estudias de verdad, y qué implica: si tus estimaciones se quedan
// cortas, si cumples las horas que te propusiste y si a tu ritmo real
// llegas a cada examen.
// ============================================================
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { usePlanner } from '../modules/study-planner/PlannerProvider.jsx'
import { hoursLabel, buildSchedule } from '../modules/study-planner/planner-engine.js'
import {
  calibrationFor,
  roundFactor,
  weeklyAdherence,
  realPace,
  heatmap,
  heatLevel,
  firstActivityISO,
  startOfWeek
} from '../lib/calibration.js'
import { transcript } from '../lib/stats.js'
import { toISO, parseISO, formatShort, formatLong, minutesLabel } from '../lib/dates.js'
import { TOTAL_ECTS } from '../data/curriculum.js'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default function Progress({ navigate }) {
  const { data } = useStore()
  const { subjects, schedule, state, setPaceFactor, today } = usePlanner()

  const started = useMemo(() => firstActivityISO(data), [data])
  const weeks = useMemo(
    () => weeklyAdherence(data, state, schedule, 6, today),
    [data, state, schedule, today]
  )
  const pace = useMemo(() => realPace(data, 4, today), [data, today])
  const heat = useMemo(() => heatmap(data, 364, today), [data, today])
  const tr = useMemo(() => transcript(data), [data])

  // Qué parte de lo que te propusiste acabas cumpliendo, en las semanas
  // ya cerradas. Solo cuentan desde tu primer registro: antes de empezar
  // a usar la app no cumplías el 0 %, es que no había nada que cumplir, y
  // contarlo proyectaría un desastre a quien acaba de entrar.
  const ratio = useMemo(() => {
    if (!started) return null
    const desde = toISO(startOfWeek(parseISO(started)))
    const past = weeks.filter((w) => w.past && w.plannedH > 0 && w.key >= desde)
    if (!past.length) return null
    return past.reduce((a, w) => a + w.realH, 0) / past.reduce((a, w) => a + w.plannedH, 0)
  }, [weeks, started])

  // Proyección realista: el mismo calendario, pero con las horas
  // semanales escaladas a lo que de verdad cumples. Lo calcula el motor
  // del planificador, no una cuenta aparte: así el reparto entre
  // asignaturas, las ventanas de cada una y las fechas de examen se
  // respetan igual que en el calendario de verdad. Repartir a mano un
  // «ritmo global» por asignatura daría a cada una el total, y dos
  // asignaturas podrían salir ambas como que llegan siendo imposible.
  const realistic = useMemo(() => {
    if (ratio == null || ratio >= 0.98 || !Array.isArray(state.weekHours)) return null
    const scaled = state.weekHours.map((h) => +(h * ratio).toFixed(2))
    return buildSchedule(subjects, { ...state, weekHours: scaled }, today)
  }, [ratio, subjects, state, today])

  const rows = useMemo(
    () =>
      subjects
        .filter((s) => s.units.length > 0)
        .map((s) => ({
          subject: s,
          meta: schedule.meta[s.id],
          cal: calibrationFor(s, state, data),
          applied: state.paceFactor?.[s.id] || null,
          realDeficit: realistic ? realistic.meta[s.id]?.deficit ?? null : null
        })),
    [subjects, schedule, state, data, realistic]
  )

  const anySample = rows.some((r) => r.cal.samples > 0)

  return (
    <div>
      <div className="page-head">
        <h1>Progreso</h1>
        <div className="sub">Lo que el plan supone, frente a lo que llevas estudiado de verdad</div>
      </div>

      {!started && (
        <div className="banner" role="status">
          <div>
            <strong>Todavía no hay nada registrado.</strong> Abre un bloque del{' '}
            <a href="#/calendario">calendario</a> y pulsa «Estudiar»: el reloj cuenta lo que tardas de verdad y esta
            página empieza a tener algo que decir.
          </div>
        </div>
      )}

      <Adherence weeks={weeks} pace={pace} ratio={ratio} />

      <div className="card">
        <h3 style={{ marginBottom: 2 }}>Tus estimaciones frente a la realidad</h3>
        <p className="guide-summary" style={{ marginTop: 0 }}>
          Se comparan solo las unidades que has terminado con el reloj en marcha. Con tres o más, se puede corregir el
          plan entero a tu ritmo.
        </p>
        {rows.length === 0 ? (
          <p className="plan-detail-empty muted">Ninguna asignatura en curso tiene temario cargado.</p>
        ) : (
          <ul className="cal-list">
            {rows.map((r) => (
              <CalibrationRow key={r.subject.id} row={r} onApply={setPaceFactor} navigate={navigate} ratio={ratio} />
            ))}
          </ul>
        )}
        {!anySample && rows.length > 0 && (
          <p className="guide-fine">
            Aún no hay ninguna unidad terminada y cronometrada. Las sesiones sueltas y los pomodoros cuentan para tus
            horas, pero no dicen a qué unidad pertenecen, así que no sirven para calibrar.
          </p>
        )}
      </div>

      <Heatmap heat={heat} />

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Expediente</h3>
        <div className="stats-row">
          <div>
            <div className="stat-num">{tr.passedEcts}</div>
            <div className="stat-lbl">ECTS superados de {TOTAL_ECTS}</div>
            <div className="progress gold" style={{ marginTop: 6 }} role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_ECTS} aria-valuenow={tr.passedEcts} aria-label="ECTS superados">
              <div style={{ width: `${Math.round((tr.passedEcts / TOTAL_ECTS) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="stat-num">{tr.inProgressEcts}</div>
            <div className="stat-lbl">ECTS en curso</div>
          </div>
          <div>
            <div className="stat-num">{tr.average != null ? tr.average.toFixed(2) : '—'}</div>
            <div className="stat-lbl">nota media ponderada</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------- adherencia semanal */

function Adherence({ weeks, pace, ratio }) {
  const max = Math.max(1, ...weeks.map((w) => Math.max(w.plannedH, w.realH)))

  return (
    <div className="card">
      <h3 style={{ marginBottom: 2 }}>Horas previstas y horas hechas</h3>
      <p className="guide-summary" style={{ marginTop: 0 }}>
        Seis semanas. La barra clara es lo que te habías propuesto; la oscura, lo que registraste.
      </p>
      <ul className="adh" role="img" aria-label={weeks.map((w) => `Semana del ${formatShort(w.key)}: ${w.realH} de ${w.plannedH} horas`).join('. ')}>
        {weeks.map((w) => (
          <li key={w.key}>
            <span className="adh-bars">
              <span className="adh-planned" style={{ height: `${Math.round((w.plannedH / max) * 100)}%` }} />
              <span className="adh-real" style={{ height: `${Math.round((w.realH / max) * 100)}%` }} />
            </span>
            <span className="adh-lbl">{formatShort(w.key)}</span>
          </li>
        ))}
      </ul>
      <div className="stats-row" style={{ marginTop: 14 }}>
        <div>
          <div className="stat-num">{pace.hoursPerWeek.toFixed(1).replace('.', ',')} h</div>
          <div className="stat-lbl">
            {pace.weeks > 0 ? `ritmo real · media de ${pace.weeks} semana${pace.weeks === 1 ? '' : 's'}` : 'ritmo real'}
          </div>
        </div>
        <div>
          <div className="stat-num">{ratio == null ? '—' : `${Math.round(ratio * 100)} %`}</div>
          <div className="stat-lbl">de lo previsto, cumplido</div>
        </div>
        <div>
          <div className="stat-num">{pace.weeksWithStudy}</div>
          <div className="stat-lbl">
            {pace.weeks > 0 ? `de ${pace.weeks} semana${pace.weeks === 1 ? '' : 's'} con estudio` : 'semanas con estudio'}
          </div>
        </div>
      </div>
      {ratio != null && ratio < 0.7 && (
        <p className="plan-warn plan-warn-block" style={{ marginTop: 12 }}>
          Estás cumpliendo el {Math.round(ratio * 100)} % de las horas que te propusiste. Un plan que no se cumple no
          avisa de nada: o bajas las horas del calendario a lo que de verdad puedes, o el déficit que ves ahí es
          optimista.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------- calibración por asignatura */

function CalibrationRow({ row, onApply, navigate, ratio }) {
  const { subject, meta, cal, applied, realDeficit } = row
  const [open, setOpen] = useState(false)
  const suggested = roundFactor(cal.factor)
  const pct = suggested == null ? null : Math.round((suggested - 1) * 100)
  // Solo tiene sentido proyectar si queda temario y si cumplir de menos
  // cambia algo respecto a lo que ya dice el calendario.
  const proyecta = realDeficit != null && meta && meta.remainingHours > 0
  const empeora = proyecta && realDeficit > meta.deficit + 0.5

  return (
    <li className="cal-item">
      <div className="cal-head">
        <button type="button" className="plan-linkname" onClick={() => navigate(`/asignatura/${subject.id}`)}>
          <span className="plan-dot" style={{ background: subject.color }} aria-hidden="true" />
          {subject.name}
        </button>
        <span className="cal-badge">
          {cal.samples === 0
            ? 'sin datos'
            : `${cal.samples} unidad${cal.samples === 1 ? '' : 'es'} cronometrada${cal.samples === 1 ? '' : 's'}`}
        </span>
      </div>

      {cal.samples > 0 ? (
        <p className="cal-line">
          Estimabas <strong>{minutesLabel(Math.round(cal.estimatedH * 60))}</strong> y tardaste{' '}
          <strong>{minutesLabel(Math.round(cal.realH * 60))}</strong>
          {pct !== null && pct !== 0 ? (
            <>
              {' '}
              — un <strong className={pct > 0 ? 'is-deficit' : ''}>{Math.abs(pct)} % {pct > 0 ? 'más' : 'menos'}</strong>{' '}
              de lo previsto.
            </>
          ) : (
            ' — clavado.'
          )}
        </p>
      ) : (
        <p className="cal-line muted">Termina alguna unidad con el reloj en marcha para poder compararla.</p>
      )}

      {applied && (
        <p className="cal-line">
          <span className="chip">Plan ajustado ×{String(applied).replace('.', ',')}</span>{' '}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onApply(subject.id, null)}>
            Quitar el ajuste
          </button>
        </p>
      )}

      {cal.reliable && suggested !== applied && suggested !== 1 && (
        <div className="cal-apply">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onApply(subject.id, suggested)}>
            Ajustar el plan ×{String(suggested).replace('.', ',')}
          </button>
          <span className="guide-fine">
            Multiplica las estimaciones que queden sin tocar a mano. Reversible, y no pisa tus ajustes propios.
          </span>
        </div>
      )}

      {proyecta && (
        <button
          type="button"
          className={`cal-pace${empeora ? '' : ' is-ok'}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {empeora
            ? `Cumpliendo el ${Math.round(ratio * 100)} % de tus horas, como hasta ahora, te faltarían ${hoursLabel(realDeficit)} antes del examen.`
            : `Aun cumpliendo solo el ${Math.round(ratio * 100)} % de tus horas, el temario sigue entrando.`}
        </button>
      )}
      {open && proyecta && (
        <p className="guide-fine cal-pace-detail">
          El calendario cuenta con {hoursLabel(meta.remainingHours)} pendientes y{' '}
          {meta.deficit > 0 ? `deja ${hoursLabel(meta.deficit)} fuera` : 'dice que el temario cabe'}, pero dando por
          hecho que cumples tus horas enteras. Rehaciendo ese mismo reparto con el {Math.round(ratio * 100)} % que
          vienes cumpliendo, lo que se queda fuera son {hoursLabel(realDeficit)}.
        </p>
      )}
    </li>
  )
}

/* ------------------------------------------- mapa de calor */

function Heatmap({ heat }) {
  const cols = `repeat(${heat.weeks.length}, 11px)`
  // En pantallas estrechas el mapa no cabe entero: se abre mostrando
  // las últimas semanas, que son las que dicen algo.
  const scroller = useRef(null)
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [heat.weeks.length])
  const labels = useMemo(() => {
    const out = []
    let last = -1
    heat.weeks.forEach((w, i) => {
      const first = w.find(Boolean)
      if (!first) return
      const m = Number(first.key.slice(5, 7)) - 1
      // Una etiqueta por mes, y nunca en las dos últimas columnas para
      // que no se salga del ancho de la rejilla.
      if (m !== last && i < heat.weeks.length - 2) {
        out.push({ i, label: MONTHS[m] })
        last = m
      }
    })
    return out
  }, [heat.weeks])

  return (
    <div className="card">
      <h3 style={{ marginBottom: 2 }}>Un año de estudio</h3>
      <p className="guide-summary" style={{ marginTop: 0 }}>
        {heat.days > 0
          ? `${heat.days} ${heat.days === 1 ? 'día' : 'días'} con estudio · ${minutesLabel(heat.total)} en total`
          : 'Cada cuadro es un día. Se irán encendiendo según registres tiempo.'}
      </p>
      <div className="heat-scroll" ref={scroller}>
        <div className="heat-inner">
          <div className="heat-months" style={{ gridTemplateColumns: cols }}>
            {labels.map((l) => (
              <span key={l.i} style={{ gridColumn: l.i + 1 }}>
                {l.label}
              </span>
            ))}
          </div>
          <div
            className="heat"
            style={{ gridTemplateColumns: cols }}
            role="img"
            aria-label={`Mapa de estudio del último año: ${heat.days} ${heat.days === 1 ? 'día' : 'días'} con actividad, ${minutesLabel(heat.total)} en total`}
          >
            {heat.weeks.map((week, wi) => (
              <div className="heat-week" key={wi}>
                {week.map((cell, di) => (
                  <span
                    key={di}
                    className={`heat-cell l${cell ? heatLevel(cell.min, heat.max) : 0}${cell ? '' : ' is-empty'}`}
                    title={cell ? `${formatLong(cell.key)} · ${minutesLabel(cell.min)}` : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="heat-legend">
        menos
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`heat-cell l${l}`} />
        ))}
        más
      </div>
    </div>
  )
}
