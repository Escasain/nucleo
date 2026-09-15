// ============================================================
// Simulacro de examen
// ------------------------------------------------------------
// La app ya planifica, explica, hace practicar y enseña de qué se apoya
// cada tema. Lo que no contestaba nada es la pregunta que de verdad
// quita el sueño en noviembre: **¿aprobaría si el examen fuera mañana?**
//
// Practicar y examinarse no miden lo mismo. Practicando eliges el
// problema, te tomas el tiempo que haga falta y tienes la pista a un
// clic. En el examen te toca lo que te toca, el reloj corre y no hay
// pista. Un tema puede salir en la práctica y caerse en el examen, y esa
// diferencia es información.
//
// Funciones puras: entran los problemas y tus intentos, sale el examen.
// ============================================================

/** Minutos que se conceden por problema según su nivel. */
export const MINUTES_BY_LEVEL = { 1: 8, 2: 12, 3: 18 }

/**
 * Generador reproducible. Un simulacro tiene que poder repetirse igual
 * para poder probarlo, y el azar de `Math.random()` no se puede fijar.
 * xorshift32: corto, sin dependencias y de sobra para barajar.
 */
export function rng(seed) {
  let x = Math.floor(seed) || 1
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return ((x >>> 0) % 100000) / 100000
  }
}

/**
 * Baraja de verdad (Fisher-Yates). Con `sort(() => random() - 0.5)` el
 * comparador no es transitivo: el resultado depende del algoritmo de
 * ordenación y las primeras posiciones salen sesgadas — justo lo que
 * aquí se quiere evitar, porque decide qué temas entran en el examen.
 */
export function shuffle(list, random) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Monta el examen.
 *
 * Tres reglas, por orden de importancia:
 *
 *   1. Cubrir temario. Va tema por tema en vueltas, con los temas
 *      barajados: un examen pregunta de todo y no cabe todo, así que
 *      muestrea. Sin barajar, un simulacro de seis problemas cogería
 *      siempre los seis primeros temas y Grafos no saldría jamás.
 *      Todos los temas entran con el mismo peso, también los que llevas
 *      bien: un simulacro que solo insista en tus puntos flojos mide
 *      otra cosa distinta de un examen.
 *   2. Dentro de un tema, primero lo difícil. La etiqueta «examen» está
 *      puesta precisamente para esto.
 *   3. A igualdad, primero lo que no tengas ya resuelto limpio. Repetir
 *      un problema que te salió a la primera no mide nada — pero si en
 *      un tema no queda otra cosa, se usa igual antes que dejar el tema
 *      fuera: la regla 1 manda.
 */
export function buildMock(problems, attempts, subjectId, { count = 6, seed = 1 } = {}) {
  const random = rng(seed)
  const porTema = new Map()
  for (const pr of problems) {
    if (!porTema.has(pr.g)) porTema.set(pr.g, [])
    porTema.get(pr.g).push(pr)
  }

  const yaLimpio = (pr) => {
    const a = attempts[`${subjectId}:${pr.id}`]
    return Boolean(a && a.last === 'ok' && !a.fail)
  }
  // Un desempate estable pero distinto en cada simulacro: sin él, dos
  // simulacros seguidos del mismo temario saldrían idénticos.
  const desempate = new Map(problems.map((pr) => [pr.id, random()]))
  for (const lista of porTema.values()) {
    lista.sort(
      (a, b) =>
        Number(yaLimpio(a)) - Number(yaLimpio(b)) ||
        (b.level || 1) - (a.level || 1) ||
        desempate.get(a.id) - desempate.get(b.id)
    )
  }

  // Temas barajados con la misma semilla, para que dos simulacros no
  // pregunten de lo mismo.
  const temas = shuffle([...porTema.keys()], random)
  const out = []
  for (let vuelta = 0; out.length < count; vuelta++) {
    let cogidoAlguno = false
    for (const g of temas) {
      if (out.length >= count) break
      const pr = porTema.get(g)[vuelta]
      if (!pr) continue
      out.push(pr)
      cogidoAlguno = true
    }
    if (!cogidoAlguno) break // no quedan problemas: el examen es más corto
  }
  // El examen se entrega en el orden del temario aunque se haya montado
  // por temas barajados: se responde mejor de lo conocido a lo nuevo.
  const orden = new Map(problems.map((pr, i) => [pr.id, i]))
  return out.sort((a, b) => orden.get(a.id) - orden.get(b.id))
}

/** Duración del examen: la suma de lo que se concede a cada problema. */
export function mockMinutes(problems) {
  return problems.reduce((a, pr) => a + (MINUTES_BY_LEVEL[pr.level] || MINUTES_BY_LEVEL[1]), 0)
}

/**
 * Resultado por tema. Un examen no se corrige solo con la nota: lo que
 * sirve para la siguiente semana es en qué tema se fueron los puntos.
 */
export function byTopic(items) {
  const out = []
  for (const it of items) {
    let t = out.find((x) => x.g === it.g)
    if (!t) {
      t = { g: it.g, total: 0, ok: 0 }
      out.push(t)
    }
    t.total++
    if (it.ok) t.ok++
  }
  return out
}

/**
 * La lectura del simulacro.
 *
 * La nota va sobre 10 para que se pueda comparar con la de UNIPRO, y se
 * calcula sobre los problemas corregidos: mientras queden sin corregir,
 * `pendiente` avisa y no se da veredicto — una nota a medias engaña más
 * que no dar ninguna.
 *
 * `peor` es el tema que más puntos se llevó, y solo se nombra si falló
 * al menos uno: señalar un «punto flojo» cuando has sacado todo sería
 * inventar un problema.
 */
export function mockResult(items) {
  const corregidos = items.filter((it) => it.ok === true || it.ok === false)
  const pendiente = items.length - corregidos.length
  const aciertos = corregidos.filter((it) => it.ok).length
  const temas = byTopic(corregidos)
  const fallados = temas.filter((t) => t.ok < t.total)
  const peor = fallados.sort((a, b) => b.total - b.ok - (a.total - a.ok) || a.ok / a.total - b.ok / b.total)[0] || null
  return {
    total: items.length,
    corregidos: corregidos.length,
    pendiente,
    aciertos,
    nota: corregidos.length > 0 ? +((aciertos / corregidos.length) * 10).toFixed(1) : null,
    temas,
    peor
  }
}

/** Cómo se llama a esa nota en UNIPRO. */
export function notaLabel(nota) {
  if (nota == null) return '—'
  if (nota < 5) return 'suspenso'
  if (nota < 7) return 'aprobado'
  if (nota < 9) return 'notable'
  return 'sobresaliente'
}
