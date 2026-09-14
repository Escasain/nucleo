// ============================================================
// Exportar el plan de estudio al calendario
// ------------------------------------------------------------
// Convierte los días del planificador en eventos con una descripción
// útil: qué toca, cómo abordarlo y qué recursos de la guía vienen al
// caso. De ahí salen dos formatos:
//
//   toICS(events)           → fichero .ics (Google, Apple, Outlook…)
//   toGoogleEvents(events)  → cuerpos para la API de Google Calendar
//
// El .ics es lo que usa la app hoy. toGoogleEvents queda listo para
// cuando se añada el scope de Calendar al OAuth.
// ============================================================
import { toISO, parseISO } from '../../lib/dates.js'
import { dow, hoursLabel } from './planner-engine.js'
import { UNIT_KINDS } from './studyPlanData.js'

const KIND_TEXT = {
  base: 'Repaso previo que hace falta para seguir el tema.',
  tema: 'Teoría del temario oficial.',
  lab: 'Laboratorio: trabajo práctico, normalmente entregable.',
  repaso: 'Repaso y práctica cronometrada, como en el examen.'
}

// Qué tipo de recurso encaja mejor con cada tipo de unidad.
const KIND_PREFERS = {
  base: ['video', 'curso', 'teoria'],
  tema: ['teoria', 'curso', 'video', 'libro'],
  lab: ['herramienta', 'practica', 'curso'],
  repaso: ['practica', 'herramienta', 'libro']
}

const STOP = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o', 'u', 'con', 'sin', 'por', 'para',
  'que', 'una', 'uno', 'unos', 'unas', 'sus', 'su', 'al', 'a', 'en', 'lab', 'laboratorio',
  'caso', 'resuelto', 'base', 'tema', 'final', 'cronometrado'
])

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function tokens(s) {
  return norm(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
}

/**
 * Recursos de la guía que mejor encajan con una unidad concreta.
 * Puntúa por palabras compartidas con el título y desempata con el
 * tipo de recurso que pide esa clase de unidad.
 */
export function resourcesForUnit(guide, unit, max = 3) {
  if (!guide) return []
  const want = tokens(unit.t)
  const prefers = KIND_PREFERS[unit.kind] || KIND_PREFERS.tema
  const pool = [
    ...guide.resources.map((r) => ({ ...r, _tool: false })),
    ...(unit.kind === 'lab' || unit.kind === 'repaso'
      ? guide.lab.tools.map((t) => ({ ...t, type: 'herramienta', lang: 'es', _tool: true }))
      : [])
  ]
  const scored = pool.map((r) => {
    const hay = tokens(`${r.title} ${r.note}`)
    const overlap = want.filter((w) => hay.includes(w)).length
    const kindBonus = prefers.indexOf(r.type)
    return { r, score: overlap * 10 + (kindBonus >= 0 ? 3 - kindBonus : 0) }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, max).map((x) => x.r)
}

/** Temas del temario de la guía relacionados con la unidad. */
export function topicsForUnit(guide, unit, max = 2) {
  if (!guide) return []
  const want = tokens(unit.t)
  if (!want.length) return []
  return guide.topics
    .map((t) => ({ t, score: want.filter((w) => tokens(t).includes(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.t)
}

/**
 * Descripción larga del evento: qué toca, por qué, cómo abordarlo y
 * dónde mirar. Es lo que lees en el móvil cuando salta el aviso.
 */
export function describeBlock({ item, subject, guide, dayKey, appUrl }) {
  const kind = UNIT_KINDS[item.kind] || UNIT_KINDS.tema
  const unit = { t: item.title, kind: item.kind }
  const lines = []

  lines.push(`${subject.name} · ${hoursLabel(item.h)} · ${kind.label}`)
  lines.push('')
  lines.push('QUÉ TOCA')
  lines.push(item.title)
  if (KIND_TEXT[item.kind]) lines.push(KIND_TEXT[item.kind])

  const topics = topicsForUnit(guide, unit)
  if (topics.length) {
    lines.push('')
    lines.push('EN EL TEMARIO')
    for (const t of topics) lines.push(`· ${t}`)
  }

  if (guide?.approach) {
    lines.push('')
    lines.push('CÓMO ABORDARLA')
    lines.push(guide.approach)
  }

  const res = resourcesForUnit(guide, unit)
  if (res.length) {
    lines.push('')
    lines.push('RECURSOS')
    for (const r of res) {
      lines.push(`· ${r.title}${r.url ? ` — ${r.url}` : ''}`)
      if (r.note) lines.push(`  ${r.note}`)
    }
  }

  if (item.kind === 'lab' && guide?.lab) {
    lines.push('')
    lines.push('LABORATORIO')
    if (guide.lab.intro) lines.push(guide.lab.intro)
    for (const s of guide.lab.steps.slice(0, 2)) lines.push(`· ${s}`)
  }

  if (appUrl) {
    lines.push('')
    lines.push(`Ver el día en NÚCLEO: ${appUrl}#/calendario/${dayKey}`)
  }
  return lines.join('\n')
}

function addMinutes(dateISO, hhmm, minutes) {
  const d = parseISO(dateISO)
  const [h, m] = hhmm.split(':').map(Number)
  d.setHours(h, m + minutes, 0, 0)
  return d
}

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** A qué hora empieza el estudio ese día. Manda tu horario semanal. */
export function startTimeFor(dateISO, planner, weeklySchedule) {
  return dayWindows(dateISO, planner, weeklySchedule)[0].start
}

/**
 * Huecos reales de ese día, en orden.
 *
 * Si tienes franjas en el horario semanal se usan todas, no solo la
 * primera: con «lunes 09:00-10:00» y «lunes 18:00-19:00» la segunda
 * sesión va a las 18:00, no encadenada a las 10:00. Si no hay franjas
 * —o si ese día llevas más horas de las que suman— el último hueco se
 * queda abierto y el resto se encadena a partir de él.
 */
export function dayWindows(dateISO, planner, weeklySchedule, plannedMinutes = 0) {
  const i = dow(parseISO(dateISO))
  const slots = (weeklySchedule || [])
    .filter(
      (s) =>
        Number(s.weekday) === i && /^\d{2}:\d{2}$/.test(s.start || '') && /^\d{2}:\d{2}$/.test(s.end || '')
    )
    .map((s) => ({ start: s.start, minutes: toMin(s.end) - toMin(s.start) }))
    .filter((s) => s.minutes > 0)
    .sort((a, b) => a.start.localeCompare(b.start))

  if (!slots.length) {
    const t = planner.startTimes?.[i]
    return [{ start: /^\d{2}:\d{2}$/.test(t || '') ? t : '18:00', minutes: Infinity }]
  }
  // Un día ajustado a mano puede llevar más horas de las que suman las
  // franjas: el último hueco absorbe lo que sobre.
  const total = slots.reduce((a, w) => a + w.minutes, 0)
  if (plannedMinutes > total) slots[slots.length - 1] = { ...slots[slots.length - 1], minutes: Infinity }
  return slots
}

/**
 * Convierte el calendario del planificador en eventos.
 * Los bloques de un día se encadenan a partir de la hora de inicio.
 */
export function buildEvents({ days, subjects, planner, weeklySchedule, guides, appUrl, includeExams = true }) {
  const events = []
  for (const day of days) {
    let seq = 0
    const plannedMinutes = day.items.reduce((a, i) => a + Math.round(i.h * 60), 0)
    const windows = dayWindows(day.key, planner, weeklySchedule, plannedMinutes)
    let wi = 0
    let used = 0

    for (const item of day.items) {
      const subject = subjects.find((s) => s.id === item.subjectId)
      if (!subject) continue
      const description = describeBlock({
        item,
        subject,
        guide: guides?.[item.subjectId],
        dayKey: day.key,
        appUrl
      })

      // Una sesión puede no caber entera en un hueco: se parte y sigue
      // en el siguiente, en vez de desbordarse fuera de tu horario.
      let left = Math.round(item.h * 60)
      const parts = []
      while (left > 0 && wi < windows.length) {
        const w = windows[wi]
        const free = w.minutes - used
        if (free <= 0) {
          wi += 1
          used = 0
          continue
        }
        const take = Math.min(free, left)
        parts.push({ start: addMinutes(day.key, w.start, used), end: addMinutes(day.key, w.start, used + take) })
        used += take
        left -= take
        if (used >= w.minutes) {
          wi += 1
          used = 0
        }
      }

      parts.forEach((part, idx) => {
        // El índice evita colisiones: una unidad puede volver a
        // aparecer el mismo día en bloques no contiguos, y dos eventos
        // con el mismo UID se pisarían al importar.
        seq += 1
        events.push({
          uid: `nucleo-${item.subjectId}-${item.unitId}-${day.key}-${seq}`,
          start: part.start,
          end: part.end,
          allDay: false,
          summary:
            parts.length > 1
              ? `${subject.short} · ${item.title} (${idx + 1} de ${parts.length})`
              : `${subject.short} · ${item.title}`,
          description
        })
      })
    }

    if (includeExams) {
      for (const s of day.exams) {
        events.push({
          uid: `nucleo-examen-${s.id}-${day.key}`,
          start: parseISO(day.key),
          end: parseISO(day.key),
          allDay: true,
          summary: `Examen · ${s.name}`,
          description: [`Prueba final de ${s.name}.`, s.examLabel].filter(Boolean).join('\n')
        })
      }
    }
  }
  return events
}

/* ----------------------------------------------------------- iCalendar */

const pad = (n) => String(n).padStart(2, '0')
const stampLocal = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
// RFC 5545 §3.8.7.2: DTSTAMP va siempre en UTC. Las horas de estudio,
// en cambio, se quedan en hora local flotante a propósito.
const stampUTC = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes()
  )}${pad(d.getUTCSeconds())}Z`
const stampDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`

function esc(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// RFC 5545: ninguna línea pasa de 75 octetos; las continuaciones van
// con un espacio delante.
function fold(line) {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const out = []
  let cur = ''
  let len = 0
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length
    if (len + n > (out.length === 0 ? 75 : 74)) {
      out.push(cur)
      cur = ''
      len = 0
    }
    cur += ch
    len += n
  }
  if (cur) out.push(cur)
  return out.join('\r\n ')
}

/** Serializa los eventos a un fichero .ics con hora local flotante. */
export function toICS(events, { name = 'NÚCLEO · Estudio', alarmMinutes = 10 } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NUCLEO//Planificador de estudio//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(name)}`
  ]
  const now = stampUTC(new Date())
  for (const e of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${esc(e.uid)}`)
    lines.push(`DTSTAMP:${now}`)
    if (e.allDay) {
      const end = new Date(e.end)
      end.setDate(end.getDate() + 1) // DTEND es exclusivo
      lines.push(`DTSTART;VALUE=DATE:${stampDate(e.start)}`)
      lines.push(`DTEND;VALUE=DATE:${stampDate(end)}`)
    } else {
      lines.push(`DTSTART:${stampLocal(e.start)}`)
      lines.push(`DTEND:${stampLocal(e.end)}`)
    }
    lines.push(`SUMMARY:${esc(e.summary)}`)
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
    if (!e.allDay && alarmMinutes > 0) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:-PT${alarmMinutes}M`, `DESCRIPTION:${esc(e.summary)}`, 'END:VALARM')
    }
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

/* ------------------------------------------- API de Google Calendar */

/**
 * Mismos eventos en el formato de la API de Calendar. Todavía no se
 * usa: queda preparado para cuando el OAuth incluya el scope
 * https://www.googleapis.com/auth/calendar.events
 */
export function toGoogleEvents(events, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const isoLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  return events.map((e) => ({
    // id de Calendar: solo minúsculas y dígitos base32hex
    id: e.uid.replace(/[^a-z0-9]/g, '').slice(0, 60),
    summary: e.summary,
    description: e.description,
    start: e.allDay ? { date: toISO(e.start) } : { dateTime: isoLocal(e.start), timeZone },
    end: e.allDay
      ? { date: toISO(new Date(e.end.getFullYear(), e.end.getMonth(), e.end.getDate() + 1)) }
      : { dateTime: isoLocal(e.end), timeZone },
    source: { title: 'NÚCLEO', url: 'https://nucleo-psi-cyan.vercel.app/' }
  }))
}
