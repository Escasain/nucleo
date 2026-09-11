// Utilidades de fechas (todas en local, formato ISO corto YYYY-MM-DD)

export function todayISO() {
  return toISO(new Date())
}

export function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatShort(iso) {
  const d = parseISO(iso)
  if (!d) return ''
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

export function formatLong(iso) {
  const d = parseISO(iso)
  if (!d) return ''
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function monthShort(iso) {
  const d = parseISO(iso)
  return d ? MONTHS_SHORT[d.getMonth()] : ''
}

export function dayNum(iso) {
  const d = parseISO(iso)
  return d ? d.getDate() : ''
}

export function daysUntil(iso) {
  const d = parseISO(iso)
  if (!d) return null
  const now = parseISO(todayISO())
  return Math.round((d - now) / 86400000)
}

export function isOverdue(iso) {
  const n = daysUntil(iso)
  return n !== null && n < 0
}

export function relativeLabel(iso) {
  const n = daysUntil(iso)
  if (n === null) return ''
  if (n < -1) return `hace ${-n} días`
  if (n === -1) return 'ayer'
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  if (n <= 14) return `en ${n} días`
  return formatShort(iso)
}

export function minutesLabel(min) {
  if (!min) return '0 min'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}
