// Fundamentos de Programación: la tercera asignatura entera, y sin
// haber tocado un solo componente.
import { chromium } from 'playwright'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await b.newContext({ viewport: { width: 1280, height: 1050 } })
const p = await ctx.newPage()
p.on('console', (m) => { if (m.type() === 'error' && !/ERR_(CONNECTION|NAME|BLOCKED|CERT|FAILED)/.test(m.text())) errors.push(m.text()) })
p.on('pageerror', (e) => errors.push('pageerror: ' + String(e)))

// ---------- entra en el planificador
await p.goto(BASE + '#/asignatura/fund-prog/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(1400)
const plan = await p.locator('.plan-stack').innerText()
check('FP ya tiene temario', !plan.includes('Todavía no hay temario'), plan.split('\n')[0])
check('con sus 31 unidades', (await p.locator('.plan-unit, .row-item').count()) >= 25,
  String(await p.locator('.plan-unit, .row-item').count()))
check('dice sus fechas', plan.includes('9 nov') && plan.includes('23 dic'), plan.split('\n')[0])
check('y avisa de que el temario es provisional', /provisional/i.test(plan))

// ---------- las cuatro capas
await p.goto(BASE + '#/asignatura/fund-prog/mapa', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('tiene mapa', (await p.locator('.smap-node').count()) === 8,
  String(await p.locator('.smap-node').count()))
check('con sus dependencias', (await p.locator('.smap-edge').count()) === 8,
  String(await p.locator('.smap-edge').count()))
await p.locator('.smap-node').filter({ hasText: 'Excepciones' }).click()
await p.waitForTimeout(400)
check('un tema con dos cimientos los enseña', (await p.locator('.smap-why li').count()) === 2)
check('y explica qué le aporta cada uno',
  (await p.locator('.smap-why li p').first().innerText()).length > 80)
check('la explicación es de programar, no genérica',
  (await p.locator('.smap-why').innerText()).includes('pila de llamadas'))

await p.goto(BASE + '#/asignatura/fund-prog/practica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const probs = await p.locator('.prob').count()
check('tiene problemas', probs === 29, String(probs))
check('de los ocho temas', (await p.locator('.prob-list').count()) === 8,
  String(await p.locator('.prob-list').count()))
check('y de nivel examen', (await p.locator('.plan-kind.is-l3').count()) > 0)
await p.locator('.prob').first().getByRole('button', { name: 'Ver solución' }).click()
await p.waitForTimeout(400)
check('la solución viene razonada', (await p.locator('.prob-a').innerText()).length > 200,
  String((await p.locator('.prob-a').innerText()).length))
check('y trae respuesta corta', (await p.locator('.prob-key').count()) === 1)

// Los conceptos clave viven dentro de la guía de estudio.
await p.goto(BASE + '#/asignatura/fund-prog/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(1400)
await p.getByRole('button', { name: /Conceptos clave/ }).click()
await p.waitForTimeout(500)
check('tiene conceptos clave', (await p.locator('.concept-group').count()) === 8,
  String(await p.locator('.concept-group').count()))
check('y sus trampas', (await p.locator('.guide-toggle').count()) >= 2)
const guia = await p.locator('body').innerText()
check('con vocabulario de Java', guia.includes('Inmutabilidad') || guia.includes('Paso por valor'), '')

await p.goto(BASE + '#/simulacro/fund-prog', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('se puede hacer un simulacro', (await p.getByRole('button', { name: /^Empezar,/ }).count()) === 1)
const resumen = await p.locator('.mock .guide-fine').first().innerText()
check('que cubre seis temas', /6 problemas de 6 temas/.test(resumen), resumen)

await p.goto(BASE + '#/repaso/fund-prog', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
check('tiene ficha de repaso', (await p.locator('.review-traps li').count()) === 12,
  String(await p.locator('.review-traps li').count()))
check('con sus trampas de Java', (await p.locator('.review-traps').innerText()).includes('=='))
check('y la fecha sin confirmar, que es lo que dice su temario',
  (await p.locator('.review .guide-fine').first().innerText()).includes('Examen por confirmar'),
  await p.locator('.review .guide-fine').first().innerText())

// ---------- noviembre ahora lleva dos asignaturas
await p.goto(BASE + '#/calendario', { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)
const leyenda = await p.locator('body').innerText()
check('el calendario reparte también FP', leyenda.includes('FP'), '')
check('junto a TC, que va el mismo bloque', leyenda.includes('TC'))

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

await b.close()
console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
