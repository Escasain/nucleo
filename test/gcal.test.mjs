import { toGoogleEvents, startTimeFor, resourcesForUnit } from '../src/modules/study-planner/calendarExport.js'
import { GUIDE } from '../src/data/guide/index.js'
const out = []
const check = (n, ok, x='') => { out.push(`${ok?'PASS':'FAIL'}  ${n}${x?' :: '+x:''}`); if (!ok) process.exitCode = 1 }

// formato para la API de Google Calendar
const ev = [
  { uid:'nucleo-algebra-t9a-2026-10-24-1', start:new Date(2026,9,24,11,30), end:new Date(2026,9,24,12,30), allDay:false, summary:'AMD · T9', description:'x' },
  { uid:'nucleo-examen-algebra-2026-11-06', start:new Date(2026,10,6), end:new Date(2026,10,6), allDay:true, summary:'Examen', description:'y' }
]
const g = toGoogleEvents(ev, 'Europe/Madrid')
check('id válido para Calendar (base32hex)', /^[a-v0-9]+$/.test(g[0].id), g[0].id)
check('evento con hora usa dateTime + timeZone', g[0].start.dateTime === '2026-10-24T11:30:00' && g[0].start.timeZone === 'Europe/Madrid', JSON.stringify(g[0].start))
check('fin correcto', g[0].end.dateTime === '2026-10-24T12:30:00', JSON.stringify(g[0].end))
check('día completo usa date', g[1].start.date === '2026-11-06', JSON.stringify(g[1].start))
check('día completo: fin exclusivo (día siguiente)', g[1].end.date === '2026-11-07', JSON.stringify(g[1].end))
check('conserva resumen y descripción', g[0].summary === 'AMD · T9' && g[0].description === 'x')

// la franja del horario semanal manda sobre la hora por defecto
const planner = { startTimes: ['18:00','18:00','18:00','18:00','18:00','10:00','10:00'] }
check('sin franja usa la hora por defecto (martes)', startTimeFor('2026-09-15', planner, []) === '18:00')
check('sin franja usa la hora por defecto (sábado)', startTimeFor('2026-09-19', planner, []) === '10:00')
const slots = [{ weekday: 1, start: '20:00', end: '22:00' }]
check('con franja en el horario, manda la franja', startTimeFor('2026-09-15', planner, slots) === '20:00')
check('la franja solo afecta a su día', startTimeFor('2026-09-16', planner, slots) === '18:00')
check('franja mal formada se ignora', startTimeFor('2026-09-15', planner, [{ weekday:1, start:'malo' }]) === '18:00')

// recursos por unidad
const g1 = GUIDE.algebra
const rGrafos = resourcesForUnit(g1, { t:'T9 · Grafos: definiciones y adyacencia', kind:'tema' })
check('recursos de grafos mencionan grafos', rGrafos.some(r => /grafo/i.test(r.title + r.note)), rGrafos.map(r=>r.title).join(' | '))
const rLab = resourcesForUnit(g1, { t:'Laboratorio 1', kind:'lab' })
check('un laboratorio propone herramientas', rLab.length === 3 && rLab.some(r => r.type === 'herramienta'), rLab.map(r=>`${r.type}:${r.title}`).join(' | '))
check('nunca devuelve más de los pedidos', resourcesForUnit(g1, { t:'x', kind:'tema' }, 2).length === 2)
check('sin guía no revienta', resourcesForUnit(null, { t:'x', kind:'tema' }).length === 0)

console.log(out.join('\n'))
console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`)
