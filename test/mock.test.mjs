// El simulacro: cómo se monta el examen, cuánto dura y cómo se lee el
// resultado.
import { rng, shuffle, buildMock, mockMinutes, mockResult, byTopic, notaLabel, MINUTES_BY_LEVEL }
  from '../src/lib/mockExam.js'
import { PRACTICE } from '../src/data/practice/index.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

// ---------- azar reproducible
const a = rng(7), b = rng(7)
check('la misma semilla da la misma serie',
  [a(), a(), a()].join() === [b(), b(), b()].join())
check('semillas distintas dan series distintas', rng(7)() !== rng(8)())
check('los valores caen en [0, 1)', Array.from({ length: 200 }, (_, i) => rng(i + 1)()).every((v) => v >= 0 && v < 1))
check('una semilla de cero no se cuelga ni se queda en cero', rng(0)() > 0)

// ---------- barajar
const lista = ['a', 'b', 'c', 'd', 'e']
const barajada = shuffle(lista, rng(3))
check('barajar no pierde ni inventa elementos',
  [...barajada].sort().join() === [...lista].sort().join(), barajada.join())
check('barajar no toca el original', lista.join() === 'a,b,c,d,e')
check('barajar es reproducible', shuffle(lista, rng(3)).join() === barajada.join())
// Fisher-Yates reparte uniforme; `sort(() => r - 0.5)` no. Se comprueba
// que ningún elemento se quede pegado a una posición.
const veces = {}
for (let s = 1; s <= 4000; s++) shuffle(['a', 'b', 'c', 'd'], rng(s)).forEach((x, i) => { veces[x + i] = (veces[x + i] || 0) + 1 })
const frec = Object.values(veces)
check('el reparto es uniforme', frec.length === 16 && Math.min(...frec) > 850 && Math.max(...frec) < 1150,
  `${Math.min(...frec)}–${Math.max(...frec)}`)

// ---------- montar el examen
const P = PRACTICE.algebra
const temasTotales = new Set(P.map((p) => p.g)).size

const ex = buildMock(P, {}, 'algebra', { count: 6, seed: 11 })
check('trae los problemas pedidos', ex.length === 6, String(ex.length))
check('sin repetir ninguno', new Set(ex.map((p) => p.id)).size === ex.length)
check('todos son problemas de verdad de la asignatura', ex.every((p) => P.includes(p)))
check('cubre seis temas distintos', new Set(ex.map((p) => p.g)).size === 6,
  String(new Set(ex.map((p) => p.g)).size))
check('se entrega en el orden del temario',
  ex.map((p) => P.indexOf(p)).every((v, i, arr) => i === 0 || arr[i - 1] < v),
  ex.map((p) => P.indexOf(p)).join())

check('con la misma semilla sale el mismo examen',
  buildMock(P, {}, 'algebra', { count: 6, seed: 11 }).map((p) => p.id).join() === ex.map((p) => p.id).join())

// CLAVE: sin barajar los temas, seis problemas cogerían siempre los seis
// primeros del temario y Grafos no saldría jamás.
const temasVistos = new Set()
for (let s = 1; s <= 40; s++) buildMock(P, {}, 'algebra', { count: 6, seed: s }).forEach((p) => temasVistos.add(p.g))
check('a lo largo de varios sorteos entran todos los temas',
  temasVistos.size === temasTotales, `${temasVistos.size} de ${temasTotales}`)
check('incluido el último del temario', temasVistos.has('Grafos'))

// Dentro de un tema, primero lo difícil.
const unSoloTema = P.filter((p) => p.g === 'Grafos')
const soloGrafos = buildMock(unSoloTema, {}, 'algebra', { count: 1, seed: 5 })
check('dentro de un tema elige primero el nivel más alto', soloGrafos[0].level === 3, String(soloGrafos[0].level))

// A IGUALDAD DE NIVEL, lo que no tengas ya resuelto limpio. Entre los dos
// de nivel 3 de Grafos, si uno está resuelto elige el otro.
const n3 = unSoloTema.filter((p) => p.level === 3)
const unoLimpio = { [`algebra:${n3[0].id}`]: { ok: 1, fail: 0, last: 'ok' } }
check('a igual nivel evita el que ya sacaste a la primera',
  buildMock(unSoloTema, unoLimpio, 'algebra', { count: 1, seed: 5 })[0].id === n3[1].id,
  buildMock(unSoloTema, unoLimpio, 'algebra', { count: 1, seed: 5 })[0].id)

// CLAVE (hallazgo de Codex en el PR #9): evitar lo ya resuelto NO puede
// bajar la dificultad. Con los dos de nivel 3 resueltos, el examen sigue
// preguntando de nivel 3 en lugar de caer al fácil sin tocar.
const n3Resueltos = Object.fromEntries(n3.map((p) => [`algebra:${p.id}`, { ok: 1, fail: 0, last: 'ok' }]))
check('no ablanda el examen para quien ya ha practicado',
  buildMock(unSoloTema, n3Resueltos, 'algebra', { count: 1, seed: 5 })[0].level === 3,
  String(buildMock(unSoloTema, n3Resueltos, 'algebra', { count: 1, seed: 5 })[0].level))

// Y un tema nunca se queda fuera por tenerlo todo resuelto.
const todoResuelto = Object.fromEntries(unSoloTema.map((p) => [`algebra:${p.id}`, { ok: 1, fail: 0, last: 'ok' }]))
check('si en un tema no queda otra cosa, repite antes que dejarlo fuera',
  buildMock(unSoloTema, todoResuelto, 'algebra', { count: 1, seed: 5 }).length === 1)
// Uno recuperado (lo sacaste, pero no a la primera) no cuenta como limpio.
const recuperado = Object.fromEntries(n3.map((p) => [`algebra:${p.id}`, { ok: 1, fail: 1, last: 'ok' }]))
check('recuperado no cuenta como ya resuelto',
  buildMock(unSoloTema, recuperado, 'algebra', { count: 1, seed: 5 })[0].id === n3[0].id)

// Pedir más de lo que hay no inventa problemas ni se cuelga.
const todos = buildMock(P, {}, 'algebra', { count: 999, seed: 2 })
check('pedir más problemas de los que hay devuelve todos', todos.length === P.length, String(todos.length))
check('y sigue sin repetir', new Set(todos.map((p) => p.id)).size === P.length)
check('sin problemas, el examen viene vacío', buildMock([], {}, 'algebra', { count: 6, seed: 1 }).length === 0)

// TC también monta examen.
const exTC = buildMock(PRACTICE['tec-comp'], {}, 'tec-comp', { count: 6, seed: 4 })
check('TC también monta examen', exTC.length === 6 && new Set(exTC.map((p) => p.g)).size === 6)

// ---------- duración
check('la duración es la suma por nivel',
  mockMinutes([{ level: 1 }, { level: 3 }]) === MINUTES_BY_LEVEL[1] + MINUTES_BY_LEVEL[3])
check('un nivel desconocido no da NaN', Number.isFinite(mockMinutes([{ level: 9 }])))
check('un examen vacío dura cero', mockMinutes([]) === 0)
check('un examen de seis dura algo razonable', mockMinutes(ex) >= 60 && mockMinutes(ex) <= 120, String(mockMinutes(ex)))

// ---------- resultado
const items = (...oks) => oks.map((ok, i) => ({ problemId: `p${i}`, g: i < 2 ? 'Uno' : 'Dos', ok }))

const sinCorregir = mockResult(items(null, null, null, null))
check('sin corregir no hay nota', sinCorregir.nota === null)
check('y lo dice', sinCorregir.pendiente === 4)

const aMedias = mockResult(items(true, false, null, null))
check('a medias avisa de lo que falta', aMedias.pendiente === 2)
check('la nota va sobre lo corregido, no sobre el total', aMedias.nota === 5, String(aMedias.nota))

const todoBien = mockResult(items(true, true, true, true))
check('todo acertado da un 10', todoBien.nota === 10)
check('y no señala ningún punto flojo', todoBien.peor === null)
check('nada pendiente', todoBien.pendiente === 0)

const todoMal = mockResult(items(false, false, false, false))
check('todo fallado da un 0', todoMal.nota === 0)
check('y sí señala dónde', todoMal.peor !== null)

const mixto = mockResult(items(true, false, false, false))
check('cuenta los aciertos', mixto.aciertos === 1)
check('la nota sale sobre 10', mixto.nota === 2.5, String(mixto.nota))
check('señala el tema donde más puntos se fueron', mixto.peor.g === 'Dos', mixto.peor.g)
check('agrupa por temas', mixto.temas.length === 2)
check('con sus cifras', mixto.temas.find((t) => t.g === 'Uno').ok === 1)

// Empate en fallos: manda el que peor proporción tenga.
const empate = mockResult([
  { problemId: 'a', g: 'Uno', ok: false },
  { problemId: 'b', g: 'Uno', ok: true },
  { problemId: 'c', g: 'Uno', ok: true },
  { problemId: 'd', g: 'Dos', ok: false }
])
check('a igual número de fallos, el tema con peor proporción', empate.peor.g === 'Dos', empate.peor.g)

check('byTopic respeta el orden de aparición', byTopic(items(true, true, false, false))[0].g === 'Uno')
check('un examen vacío no revienta', mockResult([]).nota === null && mockResult([]).total === 0)

// ---------- cómo se llama esa nota
check('menos de 5 es suspenso', notaLabel(4.9) === 'suspenso')
check('5 justo es aprobado', notaLabel(5) === 'aprobado')
check('7 es notable', notaLabel(7) === 'notable')
check('9 es sobresaliente', notaLabel(9) === 'sobresaliente')
check('sin nota no se inventa una etiqueta', notaLabel(null) === '—')

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
