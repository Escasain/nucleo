import { buildEvents, toICS, dayWindows, startTimeFor } from '../src/modules/study-planner/calendarExport.js'
const out = []
const check = (n, ok, x='') => { out.push(`${ok?'PASS':'FAIL'}  ${n}${x?' :: '+x:''}`); if (!ok) process.exitCode = 1 }
const planner = { startTimes: ['18:00','18:00','18:00','18:00','18:00','10:00','10:00'] }
const hhmm = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
const SUBJ = [{ id:'algebra', name:'AMD', short:'AMD', units:[] }]
const mk = (key, items) => [{ key, date: new Date(key.slice(0,4), +key.slice(5,7)-1, +key.slice(8,10)), capacity: 99, items, exams: [] }]
const item = (id, h) => ({ subjectId:'algebra', unitId:id, title:`U ${id}`, kind:'tema', h })

// ---- CODEX: franjas no contiguas
const dosFranjas = [{weekday:0,start:'09:00',end:'10:00'},{weekday:0,start:'18:00',end:'19:00'}]
const w = dayWindows('2026-09-14', planner, dosFranjas)
check('CODEX dos franjas → dos ventanas', w.length === 2, JSON.stringify(w))
const ev = buildEvents({ days: mk('2026-09-14', [item('a',1), item('b',1)]), subjects: SUBJ, planner, weeklySchedule: dosFranjas, guides: {}, includeExams: false })
check('CODEX la 1ª sesión va a las 09:00', hhmm(ev[0].start) === '09:00', hhmm(ev[0].start))
check('CODEX la 2ª va a las 18:00, no encadenada a las 10:00', hhmm(ev[1].start) === '18:00', hhmm(ev[1].start))
check('CODEX ninguna sesión fuera de las franjas',
  ev.every(e => dosFranjas.some(f => hhmm(e.start) >= f.start && hhmm(e.end) <= f.end)),
  ev.map(e => `${hhmm(e.start)}-${hhmm(e.end)}`).join(' '))

// una sesión que no cabe en un hueco se parte
const ev2 = buildEvents({ days: mk('2026-09-14', [item('larga', 1.5)]), subjects: SUBJ, planner, weeklySchedule: dosFranjas, guides: {}, includeExams: false })
check('una sesión larga se parte entre huecos', ev2.length === 2, String(ev2.length))
check('la parte 1 llena el primer hueco', hhmm(ev2[0].start)==='09:00' && hhmm(ev2[0].end)==='10:00')
check('la parte 2 va al segundo hueco', hhmm(ev2[1].start)==='18:00' && hhmm(ev2[1].end)==='18:30')
check('el título indica la parte', ev2[0].summary.includes('(1 de 2)') && ev2[1].summary.includes('(2 de 2)'), ev2[0].summary)
check('UID distintos entre partes', ev2[0].uid !== ev2[1].uid)

// tres franjas, reparto en cadena
const tres = [{weekday:0,start:'08:00',end:'09:00'},{weekday:0,start:'13:00',end:'14:00'},{weekday:0,start:'20:00',end:'21:00'}]
const ev3 = buildEvents({ days: mk('2026-09-14', [item('a',1),item('b',1),item('c',1)]), subjects: SUBJ, planner, weeklySchedule: tres, guides: {}, includeExams: false })
check('tres franjas, tres sesiones, cada una en la suya',
  ev3.map(e=>hhmm(e.start)).join(',') === '08:00,13:00,20:00', ev3.map(e=>hhmm(e.start)).join(','))

// día ajustado a mano con más horas que las franjas: el último hueco absorbe
const ev4 = buildEvents({ days: mk('2026-09-14', [item('a',1),item('b',1),item('c',2)]), subjects: SUBJ, planner, weeklySchedule: dosFranjas, guides: {}, includeExams: false })
// El hueco abierto encadena lo que sobre a continuación, sin solapar.
check('si sobran horas, el último hueco las absorbe encadenando',
  ev4.length === 3 && hhmm(ev4[2].start) === hhmm(ev4[1].end) && hhmm(ev4[2].end) === '21:00',
  ev4.map(e=>`${hhmm(e.start)}-${hhmm(e.end)}`).join(' '))
check('y sin solapes entre sesiones del día',
  ev4.every((e,i) => i===0 || e.start >= ev4[i-1].end),
  ev4.map(e=>`${hhmm(e.start)}-${hhmm(e.end)}`).join(' '))

// sin franjas: hora por defecto y encadenado (comportamiento anterior)
const ev5 = buildEvents({ days: mk('2026-09-15', [item('a',1),item('b',1)]), subjects: SUBJ, planner, weeklySchedule: [], guides: {}, includeExams: false })
check('sin franjas: 18:00 y encadenado', hhmm(ev5[0].start)==='18:00' && hhmm(ev5[1].start)==='19:00', ev5.map(e=>hhmm(e.start)).join(','))
const ev6 = buildEvents({ days: mk('2026-09-19', [item('a',1)]), subjects: SUBJ, planner, weeklySchedule: [], guides: {}, includeExams: false })
check('sábado sin franjas: 10:00', hhmm(ev6[0].start)==='10:00', hhmm(ev6[0].start))
check('startTimeFor sigue coincidiendo con la primera ventana', startTimeFor('2026-09-14', planner, dosFranjas) === '09:00')

// ---- CODEX: DTSTAMP en UTC
const ics = toICS(ev)
const st = /^DTSTAMP:(.+)$/m.exec(ics)[1]
check('CODEX DTSTAMP acaba en Z', st.endsWith('Z'), st)
check('CODEX DTSTAMP con formato UTC completo', /^\d{8}T\d{6}Z$/.test(st), st)
const d = new Date(Date.UTC(+st.slice(0,4), +st.slice(4,6)-1, +st.slice(6,8), +st.slice(9,11), +st.slice(11,13), +st.slice(13,15)))
check('CODEX DTSTAMP es ahora (±2 min)', Math.abs(Date.now() - d.getTime()) < 120000, `${st} vs ${new Date().toISOString()}`)
check('los DTSTART siguen en hora local flotante (sin Z)', /^DTSTART:\d{8}T\d{6}$/m.test(ics))

console.log(out.join('\n'))
console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`)
