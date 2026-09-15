import { lanzar, vigilarConsola } from './_navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x='') => { out.push(`${ok?'PASS':'FAIL'}  ${n}${x?' :: '+x:''}`); if (!ok) process.exitCode = 1 }
check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

process.on('exit', () => { console.log(out.join('\n')); console.log('\n--- CONSOLA ('+errors.length+') ---\n'+(errors.join('\n')||'(limpia)')); console.log(`\n${out.filter(x=>x.startsWith('PASS')).length} PASS · ${out.filter(x=>x.startsWith('FAIL')).length} FAIL`) })
const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 400, height: 800 } })
const m = await ctx.newPage()
vigilarConsola(m, errors)

await m.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await m.waitForTimeout(600)
const ov = async () => await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
let o = await ov(); check('móvil: calendario con horas de inicio sin overflow', o.sw <= o.cw+1, `${o.sw}>${o.cw}`)
check('móvil: campos de hora usables', (await m.locator('#start-weekday').evaluate(n => n.getBoundingClientRect().width)) >= 90)
await m.getByRole('button', { name: 'Exportar al calendario' }).click()
await m.waitForTimeout(500)
check('móvil: el diálogo se abre', await m.getByRole('dialog').isVisible())
o = await ov(); check('móvil: diálogo sin overflow', o.sw <= o.cw+1, `${o.sw}>${o.cw}`)
check('móvil: el diálogo cabe en pantalla', (await m.locator('.modal').evaluate(n => n.getBoundingClientRect().height)) <= 800)
await m.locator('.plan-export-help summary').click()
await m.waitForTimeout(300)
check('móvil: la ayuda de importación se despliega', (await m.locator('.plan-export-help ol li').count()) === 3)
o = await ov(); check('móvil: sigue sin overflow con la ayuda abierta', o.sw <= o.cw+1, `${o.sw}>${o.cw}`)
// foco por teclado en los controles nuevos
const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),summary'
for (const [sel,label] of [['.plan-export-help summary','ayuda de importación'],['.plan-export-check input','casilla de exámenes']]) {
  const ok = await m.evaluate(({sel,FOCUSABLE}) => {
    const all=[...document.querySelectorAll(FOCUSABLE)].filter(e=>e.offsetParent!==null)
    const i=all.findIndex(e=>e.matches(sel)); if(i<=0) return false; all[i-1].focus(); return true
  }, {sel,FOCUSABLE})
  if(!ok){ check(`foco: ${label}`, false, 'no situado'); continue }
  await m.keyboard.press('Tab')
  const r = await m.evaluate(sel => { const n=document.activeElement; if(!n||!n.matches(sel)) return {mismatch:n?.className}; const cs=getComputedStyle(n); return { w:cs.outlineWidth, vis:n.matches(':focus-visible') } }, sel)
  check(`foco visible: ${label}`, !r.mismatch && r.vis && parseFloat(r.w)>=1, JSON.stringify(r))
}
await b.close()
