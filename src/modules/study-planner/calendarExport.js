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

/** A qué hora empieza el estudio ese día. Manda tu horario semanal. */
export function startTimeFor(dateISO, planner, weeklySchedule) {
  const i = dow(parseISO(dateISO))
  const slots = (weeklySchedule || [])
    .filter((s) => Number(s.weekday) === i && /^\d{2}:\d{2}$/.test(s.start || ''))
    .sort((a, b) => a.start.localeCompare(b.start))
  if (slots.length) return slots[0].start
  const t = planner.startTimes?.[i]
  return /^\d{2}:\d{2}$/.test(t || '') ? t : '18:00'
}

/**
 * Convierte el calendario del planificador en eventos.
 * Los bloques de un día se encadenan a partir de la hora de inicio.
 */
export function buildEvents({ days, subjects, planner, weeklySchedule, guides, appUrl, includeExams = true }) {
  const events = []
  for (const day of days) {
    let offset = 0
    let seq = 0
    const start = startTimeFor(day.key, planner, weeklySchedule)

    for (const item of day.items) {
      const subject = subjects.find((s) => s.id === item.subjectId)
      if (!subject) continue
      const mins = Math.round(item.h * 60)
      const from = addMinutes(day.key, start, offset)
      const to = addMinutes(day.key, start, offset + mins)
      offset += mins
      // El índice evita colisiones: una unidad puede volver a aparecer
      // el mismo día en bloques no contiguos, y dos eventos con el
      // mismo UID se pisarían al importar.
      seq += 1
      events.push({
        uid: `nucleo-${item.subjectId}-${item.unitId}-${day.key}-${seq}`,
        start: from,
        end: to,
        allDay: false,
        summary: `${subject.short} · ${item.title}`,
        description: describeBlock({
          item,
          subject,
          guide: guides?.[item.subjectId],
          dayKey: day.key,
          appUrl
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
  const now = stampLocal(new Date())
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
