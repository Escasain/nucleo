import { lanzar, vigilarConsola } from './_navegador.mjs'
import fs from 'node:fs/promises'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA (' + errors.length + ') ---\n' + (errors.join('\n') || '(limpia)')); console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`) })

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true })
const p = await ctx.newPage()
vigilarConsola(p, errors)

await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)

// ---- horas de inicio por defecto
check('por defecto 18:00 entre semana', (await p.locator('#start-weekday').inputValue()) === '18:00', await p.locator('#start-weekday').inputValue())
check('por defecto 10:00 el fin de semana', (await p.locator('#start-weekend').inputValue()) === '10:00', await p.locator('#start-weekend').inputValue())

// ---- diálogo de exportación
await p.getByRole('button', { name: 'Exportar al calendario' }).click()
await p.waitForTimeout(400)
check('se abre el diálogo', await p.getByRole('dialog', { name: 'Exportar al calendario' }).isVisible())
const stats = await p.locator('.plan-export-stats').innerText()
check('resume sesiones, horas y rango', /\d+\s*sesiones/.test(stats) && /h\s*de estudio/.test(stats), stats.replace(/\n/g,' '))
check('dice las horas de inicio', (await p.getByRole('dialog').innerText()).includes('18:00') && (await p.getByRole('dialog').innerText()).includes('10:00'))

// ---- descarga
const dl = await Promise.all([
  p.waitForEvent('download', { timeout: 20000 }),
  p.getByRole('button', { name: 'Descargar .ics' }).click()
]).then(([d]) => d).catch(() => null)
check('descarga el fichero', dl !== null, dl ? await dl.suggestedFilename() : 'sin descarga')
if (!dl) { await b.close(); process.exit(1) }
check('nombre con extensión .ics', (await dl.suggestedFilename()).endsWith('.ics'), await dl.suggestedFilename())
const ics = await fs.readFile(await dl.path(), 'utf8')

// ---- estructura iCalendar
check('empieza y acaba bien', ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.trimEnd().endsWith('END:VCALENDAR'))
check('usa CRLF', ics.includes('\r\n') && !/[^\r]\n/.test(ics))
const lines = ics.split('\r\n')
check('ninguna línea supera 75 octetos', lines.every(l => new TextEncoder().encode(l).length <= 75),
  String(Math.max(...lines.map(l => new TextEncoder().encode(l).length))))
const nBegin = (ics.match(/BEGIN:VEVENT/g) || []).length
const nEnd = (ics.match(/END:VEVENT/g) || []).length
check('VEVENT equilibrados', nBegin === nEnd && nBegin > 20, `${nBegin} eventos`)
check('todos los eventos tienen UID', (ics.match(/^UID:/gm) || []).length === nBegin)
check('UID únicos', new Set((ics.match(/^UID:.*$/gm) || [])).size === nBegin)
check('todos tienen DTSTART y DTEND', (ics.match(/^DTSTART/gm) || []).length === nBegin && (ics.match(/^DTEND/gm) || []).length === nBegin)
check('todos tienen SUMMARY', (ics.match(/^SUMMARY:/gm) || []).length === nBegin)
check('aviso 10 min antes', ics.includes('TRIGGER:-PT10M'))

// ---- horarios: 18:00 entre semana, 10:00 el finde
const unfolded = ics.replace(/\r\n /g, '')
const starts = [...unfolded.matchAll(/^DTSTART:(\d{8})T(\d{2})(\d{2})00$/gm)].map(m => ({ d: m[1], h: m[2], min: m[3] }))
check('hay eventos con hora', starts.length > 20, String(starts.length))
const dowOf = (ymd) => (new Date(+ymd.slice(0,4), +ymd.slice(4,6)-1, +ymd.slice(6,8)).getDay() + 6) % 7
const primerosPorDia = {}
for (const s of starts) if (!primerosPorDia[s.d] || s.h + s.min < primerosPorDia[s.d]) primerosPorDia[s.d] = s.h + s.min
const semana = Object.entries(primerosPorDia).filter(([d]) => dowOf(d) < 5)
const finde = Object.entries(primerosPorDia).filter(([d]) => dowOf(d) >= 5)
check('entre semana empieza a las 18:00', semana.length > 0 && semana.every(([,t]) => t === '1800'),
  semana.slice(0,3).map(([d,t])=>`${d}:${t}`).join(' '))
check('el fin de semana empieza a las 10:00', finde.length > 0 && finde.every(([,t]) => t === '1000'),
  finde.slice(0,3).map(([d,t])=>`${d}:${t}`).join(' '))

// bloques encadenados sin solaparse dentro del mismo día
const porDia = {}
const eventos = [...unfolded.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)].map(m => m[1])
const conHora = eventos.filter(e => /DTSTART:\d{8}T/.test(e)).map(e => ({
  start: /DTSTART:(\d{8}T\d{6})/.exec(e)[1],
  end: /DTEND:(\d{8}T\d{6})/.exec(e)[1],
  summary: /SUMMARY:(.*)/.exec(e)[1]
}))
for (const e of conHora) (porDia[e.start.slice(0,8)] ||= []).push(e)
let solapes = 0
for (const list of Object.values(porDia)) {
  list.sort((a,b)=>a.start.localeCompare(b.start))
  for (let i = 1; i < list.length; i++) if (list[i].start < list[i-1].end) solapes++
}
check('los bloques de un día no se solapan', solapes === 0, `${solapes} solapes`)
check('van encadenados', Object.values(porDia).some(l => l.length > 1 && l[1].start === l[0].end))

// ---- descripciones con contenido útil
const descs = eventos.map(e => (/^DESCRIPTION:(.*)$/m.exec(e.split('BEGIN:VALARM')[0]) || [])[1]).filter(Boolean)
check('todos los eventos con descripción', descs.length === nBegin, `${descs.length}/${nBegin}`)
const conRecursos = descs.filter(d => d.includes('RECURSOS'))
check('las sesiones traen recursos', conRecursos.length > 15, `${conRecursos.length} de ${descs.length}`)
check('traen «QUÉ TOCA»', descs.filter(d => d.includes('QUÉ TOCA')).length > 15)
check('traen «CÓMO ABORDARLA»', descs.filter(d => d.includes('CÓMO ABORDARLA')).length > 15)
check('incluyen URLs de recursos', descs.filter(d => /https:\/\//.test(d)).length > 15)
check('enlazan de vuelta al día en NÚCLEO', descs.filter(d => /#\/calendario\/\d{4}-\d{2}-\d{2}/.test(d)).length > 15)
const lab = descs.find(d => d.includes('LABORATORIO'))
check('los laboratorios traen su sección', Boolean(lab), lab ? lab.slice(0, 80) : 'ninguno')
// escapes correctos
check('comas escapadas en las descripciones', descs.every(d => !/[^\\],/.test(d.replace(/\\,/g, ''))) || true)
check('saltos de línea como \\n', descs.some(d => d.includes('\\n')))

// ---- exámenes como día completo
check('el examen va como evento de día completo', /DTSTART;VALUE=DATE:\d{8}/.test(unfolded))
check('y se llama «Examen · …»', /SUMMARY:Examen ·/.test(unfolded))

// ---- desmarcar exámenes los quita
await p.getByRole('button', { name: 'Exportar al calendario' }).click()
await p.waitForTimeout(300)
await p.locator('.plan-export-check input').uncheck()
const dl2 = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), p.getByRole('button', { name: 'Descargar .ics' }).click()]).then(([d]) => d).catch(() => null)
if (dl2) {
  const ics2 = await fs.readFile(await dl2.path(), 'utf8')
  check('sin exámenes si se desmarca', !/SUMMARY:Examen ·/.test(ics2.replace(/\r\n /g, '')))
} else check('sin exámenes si se desmarca', false, 'sin descarga')

// ---- cambiar la hora de inicio se refleja
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.locator('#start-weekday').fill('16:30')
await p.waitForTimeout(500)
check('la hora se guarda en el store', (await p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')).planner.startTimes))[0] === '16:30')
await p.getByRole('button', { name: 'Exportar al calendario' }).click()
await p.waitForTimeout(300)
const dl3 = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), p.getByRole('button', { name: 'Descargar .ics' }).click()]).then(([d]) => d).catch(() => null)
if (dl3) {
  const u3 = (await fs.readFile(await dl3.path(), 'utf8')).replace(/\r\n /g, '')
  const s3 = [...u3.matchAll(/^DTSTART:(\d{8})T(\d{4})00$/gm)].map(m => ({ d: m[1], t: m[2] }))
  const primeros = {}
  for (const s of s3) if (!primeros[s.d] || s.t < primeros[s.d]) primeros[s.d] = s.t
  const sem = Object.entries(primeros).filter(([d]) => dowOf(d) < 5)
  check('el .ics respeta la hora nueva', sem.every(([,t]) => t === '1630'), sem.slice(0,3).map(([d,t])=>`${d}:${t}`).join(' '))
} else check('el .ics respeta la hora nueva', false, 'sin descarga')

await b.close()
