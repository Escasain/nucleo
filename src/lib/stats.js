// Cálculos derivados del estado: minutos de estudio, rachas, expediente.
import { CURRICULUM, TOTAL_ECTS, ectsOf } from '../data/curriculum.js'
import { toISO, todayISO } from './dates.js'

// Minutos registrados por día (pomodoros + sesiones con duración hechas)
export function minutesByDay(data) {
  const map = {}
  for (const p of data.pomodoro) {
    if (!p.date) continue
    map[p.date] = (map[p.date] || 0) + (Number(p.minutes) || 0)
  }
  for (const s of data.sessions) {
    if (!s.date || !s.done || !s.durationMin) continue
    map[s.date] = (map[s.date] || 0) + (Number(s.durationMin) || 0)
  }
  return map
}

export function lastNDays(n) {
  const out = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    out.push(toISO(x))
  }
  return out
}

// Minutos de la semana en curso (lunes a hoy)
export function weekMinutes(data) {
  const byDay = minutesByDay(data)
  const now = new Date()
  const dow = (now.getDay() + 6) % 7 // lunes = 0
  let total = 0
  for (let i = 0; i <= dow; i++) {
    const x = new Date(now)
    x.setDate(now.getDate() - i)
    total += byDay[toISO(x)] || 0
  }
  return total
}

// Días seguidos (hasta hoy o ayer) con al menos un minuto registrado
export function streak(data) {
  const byDay = minutesByDay(data)
  const today = todayISO()
  const d = new Date()
  if (!byDay[today]) d.setDate(d.getDate() - 1)
  let n = 0
  for (;;) {
    const iso = toISO(d)
    if (!byDay[iso]) break
    n++
    d.setDate(d.getDate() - 1)
    if (n > 3650) break
  }
  return n
}

// Minutos por asignatura (todo el histórico)
export function minutesBySubject(data) {
  const map = {}
  for (const p of data.pomodoro) {
    const k = p.subjectId || '_'
    map[k] = (map[k] || 0) + (Number(p.minutes) || 0)
  }
  for (const s of data.sessions) {
    if (!s.done || !s.durationMin) continue
    const k = s.subjectId || '_'
    map[k] = (map[k] || 0) + (Number(s.durationMin) || 0)
  }
  return map
}

// Expediente: ECTS superados, en curso, nota media ponderada por ECTS
export function transcript(data) {
  let passed = 0
  let inProgress = 0
  let gradeSum = 0
  let gradeEcts = 0
  let nPassed = 0
  for (const s of CURRICULUM) {
    const st = data.subjects[s.id] || {}
    const e = ectsOf(s)
    if (st.status === 'aprobada' || st.status === 'reconocida') {
      passed += e
      nPassed++
      const g = parseFloat(String(st.grade ?? '').replace(',', '.'))
      if (st.status === 'aprobada' && Number.isFinite(g)) {
        gradeSum += g * e
        gradeEcts += e
      }
    } else if (st.status === 'cursando' || st.status === 'matriculada') {
      inProgress += e
    }
  }
  return {
    passedEcts: passed,
    inProgressEcts: inProgress,
    totalEcts: TOTAL_ECTS,
    nPassed,
    average: gradeEcts > 0 ? gradeSum / gradeEcts : null
  }
}

// Nota UNIPRO: 70 % evaluación continua + 30 % prueba final
export const UNIPRO_WEIGHTS = { continuous: 0.7, final: 0.3 }
export function uniproGrade(cont, fin) {
  const c = parseFloat(String(cont ?? '').replace(',', '.'))
  const f = parseFloat(String(fin ?? '').replace(',', '.'))
  if (!Number.isFinite(c) || !Number.isFinite(f)) return null
  return Math.round((c * UNIPRO_WEIGHTS.continuous + f * UNIPRO_WEIGHTS.final) * 100) / 100
}
// Qué hace falta en la prueba final para llegar a `target` con esa continua
export function neededFinal(cont, target = 5) {
  const c = parseFloat(String(cont ?? '').replace(',', '.'))
  if (!Number.isFinite(c)) return null
  const need = (target - c * UNIPRO_WEIGHTS.continuous) / UNIPRO_WEIGHTS.final
  return Math.round(need * 100) / 100
}
