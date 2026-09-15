// Conceptos clave, trampas, dudas y autoexplicación, en el navegador.
import { lanzar, vigilarConsola } from './navegador.mjs'
const BASE = process.env.BASE || 'http://127.0.0.1:5173/'
const out = [], errors = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

const b = await lanzar()
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
const p = await ctx.newPage()
vigilarConsola(p, errors)
const store = () => p.evaluate(() => JSON.parse(localStorage.getItem('nucleo.data')))

// Al cambiar de asignatura el componente no se remonta, así que la
// sección puede venir ya abierta de la anterior. Se abre solo si hace
// falta, en vez de dar por hecho en qué estado está.
async function abrir(nombre, selector) {
  if ((await p.locator(selector).count()) === 0) {
    await p.getByRole('button', { name: nombre }).click()
    await p.waitForTimeout(500)
  }
}

await p.clock.install({ time: new Date() })

// ---------- la pestaña vive en la URL
await p.goto(BASE + '#/asignatura/algebra/notas', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
check('enlace profundo a una pestaña', (await p.locator('[role="tab"][aria-selected="true"]').innerText()).includes('Notas y dudas'),
  await p.locator('[role="tab"][aria-selected="true"]').innerText())
await p.goto(BASE + '#/asignatura/algebra/no-existe', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
check('pestaña desconocida cae en la primera', (await p.locator('[role="tab"][aria-selected="true"]').innerText()).includes('Guía'))
await p.goto(BASE + '#/asignatura/algebra', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
await p.getByRole('tab', { name: 'Recursos' }).click()
await p.waitForTimeout(400)
check('cambiar de pestaña cambia la URL', p.url().endsWith('#/asignatura/algebra/recursos'), p.url())

// ---------- conceptos clave
await p.goto(BASE + '#/asignatura/algebra/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const guia = await p.locator('.main').innerText()
check('la guía ofrece los conceptos clave', guia.includes('Conceptos clave'))
check('la guía ofrece las trampas', guia.includes('Dónde se cae todo el mundo'))
check('los conceptos están plegados por defecto', (await p.locator('.concept').count()) === 0)

await abrir(/Conceptos clave/, '.concept')
const nConceptos = await p.locator('.concept').count()
check('despliega los conceptos', nConceptos > 40, String(nConceptos))
check('los agrupa por tema', (await p.locator('.concept-group').count()) >= 6, String(await p.locator('.concept-group').count()))
check('cada concepto tiene definición', (await p.locator('.concept-d').count()) === nConceptos)
check('la mayoría dice para qué sirve', (await p.locator('.concept-why').count()) > nConceptos * 0.8,
  `${await p.locator('.concept-why').count()} de ${nConceptos}`)
check('hay avisos de confusión', (await p.locator('.concept-x').count()) > 0)

// ---------- una tarjeta desde un concepto
const primero = p.locator('.concept').first()
const termino = (await primero.locator('h4').innerText()).trim()
await primero.getByRole('button', { name: /Crear tarjeta de repaso/ }).click()
await p.waitForTimeout(500)
const d1 = await store()
check('crear tarjeta añade una al mazo', (d1.decks.algebra || []).length === 1, String((d1.decks.algebra || []).length))
check('la tarjeta lleva el término delante', d1.decks.algebra[0].front === termino, d1.decks.algebra[0].front)
check('y la definición detrás', d1.decks.algebra[0].back.length > 30, d1.decks.algebra[0].back.slice(0, 60))
check('la tarjeta entra en el repaso de hoy', d1.decks.algebra[0].box === 1 && Boolean(d1.decks.algebra[0].nextReview))
check('el botón pasa a «Ya está»', (await primero.locator('button').innerText()).includes('Ya está'))
check('y queda deshabilitado', await primero.locator('button').isDisabled())

// ---------- crear todas de golpe, sin duplicar la que ya existe
const bulk = p.locator('.concept-bulk .btn')
const rotulo = await bulk.innerText()
check('el botón masivo descuenta la que ya tienes', rotulo.includes(String(nConceptos - 1)), rotulo)
await bulk.click()
await p.waitForTimeout(900)
const d2 = await store()
check('crea una tarjeta por concepto', d2.decks.algebra.length === nConceptos, String(d2.decks.algebra.length))
check('no duplica la que ya estaba', new Set(d2.decks.algebra.map((c) => c.front)).size === nConceptos)
check('desaparece el botón masivo cuando no queda ninguna', (await p.locator('.concept-bulk').count()) === 0)

// ---------- trampas
await abrir(/Dónde se cae todo el mundo/, '.pitfall')
const nTrampas = await p.locator('.pitfall').count()
check('despliega las trampas', nTrampas >= 10, String(nTrampas))
check('cada trampa tiene lo que se hace mal', (await p.locator('.pitfall-wrong').count()) === nTrampas)
check('y lo que es', (await p.locator('.pitfall-right').count()) === nTrampas)

// ---------- TC también tiene los suyos
await p.goto(BASE + '#/asignatura/tec-comp/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
await abrir(/Conceptos clave/, '.concept')
check('Tecnología de Computadores tiene sus conceptos', (await p.locator('.concept').count()) > 35,
  String(await p.locator('.concept').count()))
const tcTxt = await p.locator('#key-concepts').innerText()
check('cubre complemento a dos', tcTxt.includes('Complemento a dos'))
check('cubre Karnaugh', tcTxt.includes('Karnaugh'))
check('cubre latch frente a flip-flop', /[Ll]atch frente a flip-flop/.test(tcTxt))

// ---------- una asignatura sin conceptos no enseña la sección
await p.goto(BASE + '#/asignatura/redes/guia', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
check('sin conceptos no hay sección vacía', !(await p.locator('.main').innerText()).includes('Conceptos clave'))

// ---------- autoexplicación al cerrar una sesión
await p.goto(BASE + '#/sesion/algebra/t1a', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(70_000)
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Terminar unidad' }).click()
await p.waitForTimeout(600)
check('al terminar pide explicarlo', (await p.locator('.focus-reflect h3').innerText()).includes('explícatelo'),
  await p.locator('.focus-reflect h3').innerText())
check('no se puede guardar vacío', await p.locator('.focus-reflect').getByRole('button', { name: 'Guardar' }).isDisabled())
await p.locator('#focus-explain').fill('Un cuantificador universal se tumba con un solo contraejemplo.')
await p.locator('#focus-doubt').fill('No veo por qué la implicación con antecedente falso es verdadera.')
await p.locator('.focus-reflect').getByRole('button', { name: 'Guardar' }).click()
await p.waitForTimeout(600)
const d3 = await store()
check('guarda dos apuntes', d3.understanding.length === 2, String(d3.understanding.length))
const expl = d3.understanding.find((n) => n.type === 'explicacion')
const duda = d3.understanding.find((n) => n.type === 'duda')
check('la explicación va atada a la unidad', expl.unitId === 't1a' && expl.subjectId === 'algebra',
  `${expl.subjectId}:${expl.unitId}`)
check('la explicación guarda el título de la unidad', expl.unitTitle.includes('T1'), expl.unitTitle)
check('la duda nace sin resolver', duda.resolved === false)
check('ambos llevan fecha', Boolean(expl.createdAt) && Boolean(duda.createdAt))
check('tras guardar ya deja salir', (await p.locator('.focus-reflect').count()) === 0)

// «Ahora no» no guarda nada
await p.goto(BASE + '#/sesion/algebra/t1b', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.getByRole('button', { name: 'Empezar' }).click()
await p.clock.runFor(70_000)
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Guardar y salir' }).click()
await p.waitForTimeout(500)
await p.locator('.focus-reflect').getByRole('button', { name: 'Ahora no' }).click()
await p.waitForTimeout(400)
check('«Ahora no» no guarda nada', (await store()).understanding.length === 2,
  String((await store()).understanding.length))

// ---------- la duda se ve en Inicio
await p.goto(BASE + '#/', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
const inicio = await p.locator('.main').innerText()
check('Inicio enseña las dudas sin resolver', inicio.includes('Dudas sin resolver'))
check('con su texto', inicio.includes('antecedente falso'))
await p.locator('.doubt-row').first().click()
await p.waitForTimeout(600)
check('desde Inicio se llega a la pestaña de dudas', p.url().endsWith('#/asignatura/algebra/notas'), p.url())

// ---------- resolver una duda y convertirla en tarjeta
check('la duda aparece en la asignatura', (await p.locator('.doubt-list .doubt').count()) === 1)
await p.getByRole('button', { name: 'Resolver' }).first().click()
await p.waitForTimeout(400)
await p.locator('.doubt-answer textarea').fill('Porque la implicación solo afirma que no se da p sin q.')
await p.getByRole('button', { name: 'Resolver' }).click()
await p.waitForTimeout(600)
const d4 = await store()
const resuelta = d4.understanding.find((n) => n.type === 'duda')
check('la duda queda resuelta', resuelta.resolved === true)
check('y guarda la respuesta', resuelta.answer.includes('no se da p sin q'), resuelta.answer)
check('deja de estar abierta', (await p.locator('.doubt-list:not(.is-resolved) .doubt').count()) === 0)

await p.getByRole('button', { name: /Resueltas/ }).click()
await p.waitForTimeout(400)
check('se puede ver el histórico de resueltas', (await p.locator('.doubt-list.is-resolved .doubt').count()) === 1)
const antesTarjetas = (await store()).decks.algebra.length
await p.locator('.doubt-list.is-resolved').getByRole('button', { name: 'Tarjeta' }).click()
await p.waitForTimeout(500)
const d5 = await store()
check('una duda resuelta se convierte en tarjeta', d5.decks.algebra.length === antesTarjetas + 1,
  `${antesTarjetas} → ${d5.decks.algebra.length}`)
const tarjetaDuda = d5.decks.algebra[d5.decks.algebra.length - 1]
check('la tarjeta lleva la duda delante y la respuesta detrás',
  tarjetaDuda.front.includes('antecedente falso') && tarjetaDuda.back.includes('no se da p sin q'),
  tarjetaDuda.front)
check('y no deja crearla dos veces',
  await p.locator('.doubt-list.is-resolved').getByRole('button', { name: 'Ya está' }).isDisabled())

// reabrir la devuelve a pendientes
await p.locator('.doubt-list.is-resolved').getByRole('button', { name: 'Reabrir' }).click()
await p.waitForTimeout(500)
check('reabrir la devuelve a las abiertas', (await p.locator('.doubt-list:not(.is-resolved) .doubt').count()) === 1)

// ---------- apuntar una duda a mano
await p.locator('#new-doubt').fill('¿La inducción fuerte necesita más de un caso base?')
await p.getByRole('button', { name: 'Apuntar' }).click()
await p.waitForTimeout(500)
check('se puede apuntar una duda a mano', (await p.locator('.doubt-list:not(.is-resolved) .doubt').count()) === 2)
check('el campo se vacía tras apuntarla', (await p.locator('#new-doubt').inputValue()) === '')
const suelta = (await store()).understanding.filter((n) => n.type === 'duda').find((n) => !n.unitId)
check('una duda suelta no lleva unidad', suelta && !suelta.unitId)

// ---------- la explicación queda para releerla
check('se pueden releer las explicaciones', (await p.locator('.main').innerText()).includes('Cómo te lo explicaste'))
check('con su texto', (await p.locator('.explain-text').innerText()).includes('contraejemplo'))

// borrar una duda
await p.locator('.doubt-list:not(.is-resolved) .doubt').last().locator('.icon-btn').click()
await p.waitForTimeout(500)
check('se puede borrar una duda', (await p.locator('.doubt-list:not(.is-resolved) .doubt').count()) === 1)

// ---------- la búsqueda global encuentra conceptos
await p.goto(BASE, { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.keyboard.press('Control+k')
await p.waitForTimeout(400)
await p.keyboard.type('complemento a dos')
await p.waitForTimeout(1100)
const res = await p.locator('.search-results .search-item').allInnerTexts()
check('la búsqueda encuentra conceptos', res.some((r) => /Concepto/.test(r) && /[Cc]omplemento a dos/.test(r)),
  res.slice(0, 3).join(' | ') || '(sin resultados)')
await p.locator('.search-results .search-item').filter({ hasText: 'Concepto' }).first().click()
await p.waitForTimeout(700)
check('y lleva a la guía de su asignatura', p.url().includes('#/asignatura/tec-comp/guia'), p.url())

// ---------- la copia de seguridad se lo lleva
const backup = await store()
check('la copia de seguridad incluye las dudas', Array.isArray(backup.understanding) && backup.understanding.length > 0)

// ---------- móvil
await p.setViewportSize({ width: 400, height: 820 })
for (const hash of ['#/asignatura/algebra/guia', '#/asignatura/algebra/notas', '#/']) {
  await p.goto(BASE + hash, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  if (hash.endsWith('guia')) await abrir(/Conceptos clave/, '.concept')
  const w = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  check(`móvil sin desbordamiento ${hash}`, w[0] <= w[1] + 1, `${w[0]} > ${w[1]}`)
}

check('sin errores de consola', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log(out.join('\n'))
console.log(`\n--- CONSOLA (${errors.length}) ---`)
console.log(errors.length ? errors.join('\n') : '(limpia)')
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
await b.close()
