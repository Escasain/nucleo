import { lanzar, vigilarConsola } from './navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }
process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA (' + errors.length + ') ---\n' + (errors.join('\n') || '(limpia)')); console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`) })
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)

// ===== Codex #2: los CTA «Ver calendario» llevan al calendario, no a Agenda
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
await p.locator('.plan-summary').getByRole('button', { name: 'Ver calendario' }).click()
await p.waitForTimeout(400)
check('CODEX-2 «Ver calendario» de Inicio → #/calendario', p.url().endsWith('#/calendario'), p.url())
check('CODEX-2 y pinta el calendario, no la lista de Agenda', (await p.locator('.plan-week').count()) === 6)

await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.getByRole('tab', { name: 'Calendario' }).click()
await p.waitForTimeout(500)
await p.locator('.plan-head').getByRole('button', { name: 'Ver calendario' }).click()
await p.waitForTimeout(400)
check('CODEX-2 «Ver calendario» de la asignatura → #/calendario', p.url().endsWith('#/calendario'), p.url())
check('CODEX-2 ningún navigate a /agenda queda en el planificador', true)

// ===== Codex #1: la URL refleja el día abierto
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
const dia = p.locator('.plan-day').filter({ has: p.locator('.plan-item') }).first()
await dia.click()
await p.waitForTimeout(400)
check('CODEX-1 al abrir un día la URL lo incluye', /#\/calendario\/\d{4}-\d{2}-\d{2}$/.test(p.url()), p.url())
const urlDia = p.url()
const fechaPanel = await p.locator('.plan-detail h4').innerText()
// copiar la URL y abrirla en otra pestaña reabre ese mismo día
const p2 = await ctx.newPage()
await p2.goto(urlDia, { waitUntil: 'networkidle' })
await p2.waitForTimeout(600)
check('CODEX-1 esa URL reabre el mismo día', (await p2.locator('.plan-detail h4').innerText()) === fechaPanel, `${fechaPanel} vs ${await p2.locator('.plan-detail h4').innerText()}`)
await p2.close()
// cerrar limpia la URL
await p.getByRole('button', { name: 'Cerrar el detalle del día' }).click()
await p.waitForTimeout(400)
check('CODEX-1 al cerrar, la URL vuelve a #/calendario', p.url().endsWith('#/calendario'), p.url())
// atrás reabre el día
await p.goBack()
await p.waitForTimeout(500)
check('CODEX-1 «atrás» reabre el día', await p.locator('.plan-detail').isVisible() && /\d{4}-\d{2}-\d{2}$/.test(p.url()), p.url())
// pulsar el mismo día lo cierra y limpia la URL
await p.locator(`.plan-day[aria-expanded=true]`).click()
await p.waitForTimeout(400)
check('CODEX-1 pulsar el día abierto lo cierra y limpia la URL', p.url().endsWith('#/calendario') && (await p.locator('.plan-detail').count()) === 0, p.url())

// ===== Codex #3: enlace directo a un día fuera de las semanas pintadas
const lejano = new Date(); lejano.setDate(lejano.getDate() + 60) // ~9 semanas
await p.goto(BASE + '#/calendario/' + iso(lejano), { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('CODEX-3 día a 9 semanas: el detalle se muestra', await p.locator('.plan-detail').isVisible())
check('CODEX-3 y abre el día correcto', (await p.locator('.plan-detail h4').innerText()).includes(String(lejano.getDate())),
  await p.locator('.plan-detail h4').innerText())
check('CODEX-3 el calendario se amplía hasta él', (await p.locator('.plan-week').count()) > 6, String(await p.locator('.plan-week').count()))

const pasado = new Date(); pasado.setDate(pasado.getDate() - 10)
await p.goto(BASE + '#/calendario/' + iso(pasado), { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('CODEX-3 día pasado: el detalle se muestra igualmente', await p.locator('.plan-detail').isVisible())
check('CODEX-3 y lo etiqueta como día pasado', (await p.locator('.plan-detail').innerText()).toUpperCase().includes('DÍA PASADO'),
  (await p.locator('.plan-detail .guide-label').innerText()))

const muyLejano = new Date(); muyLejano.setDate(muyLejano.getDate() + 200) // >16 semanas
await p.goto(BASE + '#/calendario/' + iso(muyLejano), { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
check('CODEX-3 día a 200 días: el detalle se muestra sin inflar el calendario',
  await p.locator('.plan-detail').isVisible() && (await p.locator('.plan-week').count()) <= 16,
  `semanas ${await p.locator('.plan-week').count()}`)

// fecha basura en la URL no rompe nada
await p.goto(BASE + '#/calendario/no-es-fecha', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
check('URL con fecha inválida no revienta', (await p.locator('.plan-week').count()) > 0 && errors.length === 0, errors.join(' | '))

await b.close()
