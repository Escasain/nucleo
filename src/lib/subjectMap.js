// ============================================================
// El mapa de una asignatura, cruzado con lo que llevas hecho
// ------------------------------------------------------------
// El planificador dice CUÁNDO estudiar cada unidad; la práctica dice
// CÓMO va cada tema. Lo que faltaba es la tercera pregunta, que es la
// que uno se hace cuando algo no entra: ¿de qué se apoya esto?
//
// Un tema que se resiste casi nunca está roto por dentro. Lo que está
// flojo es algo anterior que se dio por sabido, y por eso insistir
// justo donde te has atascado es la peor inversión posible. Estas
// funciones cruzan el mapa con tus datos para poder decirlo con
// nombres concretos en lugar de con un consejo genérico.
//
// Funciones puras: entra el mapa y tus datos, sale la lectura.
// ============================================================

/**
 * Nivel de cada tema: cuántos temas hay, como mucho, por debajo de él.
 * Camino más largo, no el más corto, para que un tema nunca aparezca
 * dibujado por encima de algo de lo que depende.
 *
 * Tolera ids inexistentes y ciclos — el mapa no los tiene y hay una
 * prueba que lo vigila, pero esto no debe colgarse por un dato mal
 * escrito.
 */
export function levelsOf(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const memo = new Map()
  const visiting = new Set()
  const level = (id) => {
    if (memo.has(id)) return memo.get(id)
    if (visiting.has(id)) return 0 // ciclo: corta aquí
    visiting.add(id)
    let lvl = 0
    for (const dep of byId.get(id)?.needs || []) {
      if (byId.has(dep)) lvl = Math.max(lvl, level(dep) + 1)
    }
    visiting.delete(id)
    memo.set(id, lvl)
    return lvl
  }
  const out = new Map()
  for (const n of nodes) out.set(n.id, level(n.id))
  return out
}

/** Los temas agrupados por nivel, cada fila en el orden del temario. */
export function layoutMap(nodes) {
  const levels = levelsOf(nodes)
  const rows = []
  for (const n of nodes) {
    const l = levels.get(n.id) || 0
    while (rows.length <= l) rows.push([])
    rows[l].push(n)
  }
  return rows
}

/**
 * Cómo llevas cada tema, cruzando tres fuentes:
 *
 *   - las unidades del planificador que has marcado como hechas,
 *   - tu acierto a la primera en los problemas de ese tema,
 *   - y, a través de `needs`, en qué estado están sus cimientos.
 *
 * «Sólido» pide las dos cosas: haber terminado las unidades y que los
 * problemas salgan. Terminar el temario sin que salgan los problemas
 * es justo el caso que esta pantalla existe para hacer visible, así
 * que no puede contar como sólido.
 *
 * `byTopic` es el que devuelve practiceStats(); si no hay problemas de
 * la asignatura se pasa null y el mapa funciona igual, solo que sin
 * esa mitad de la información.
 */
export function mapStatus(nodes, doneUnits, byTopic) {
  const done = doneUnits instanceof Set ? doneUnits : new Set(doneUnits || [])
  const levels = levelsOf(nodes)
  const rows = nodes.map((node) => {
    const units = node.units || []
    const doneCount = units.filter((u) => done.has(u)).length
    const topic = byTopic ? byTopic.find((t) => t.g === node.g) : null
    // El acierto a la primera solo significa algo con más de un
    // intento: con uno, un fallo daría un 0 % que no dice nada.
    const tried = topic ? topic.done : 0
    const okFirst = topic ? topic.okFirst : 0
    const rate = tried > 0 ? okFirst / tried : null
    const complete = units.length > 0 && doneCount === units.length
    // El listón es más alto que el de Práctica (que avisa por debajo del
    // 70 %) a propósito: allí solo se señala un tema flojo, aquí se
    // manda a alguien a rehacer trabajo anterior. Eso hay que acertarlo.
    const weak = tried >= 2 && rate < 0.5
    // Y lo simétrico, que es lo que de verdad autoriza a decir «esto lo
    // tienes»: haber terminado el temario es haberlo leído, no haberlo
    // comprobado. Donde hay problemas hacen falta al menos dos intentos
    // que salgan más de la mitad de las veces; donde no los hay (un tema
    // sin `g`) el temario es toda la evidencia disponible y con eso basta.
    // Entre medias — cero intentos, o uno solo — no es flojo pero tampoco
    // está comprobado, y el mapa no puede llamarlo firme.
    const proven = node.g ? tried >= 2 && rate >= 0.5 : complete
    return {
      node,
      level: levels.get(node.id) || 0,
      units: units.length,
      doneUnits: doneCount,
      ratio: units.length ? doneCount / units.length : 0,
      started: doneCount > 0,
      complete,
      tried,
      okFirst,
      rate,
      weak,
      proven,
      solid: complete && proven
    }
  })
  // Segunda pasada: los cimientos de cada uno, ya con el estado de todos.
  const byId = new Map(rows.map((r) => [r.node.id, r]))
  for (const r of rows) {
    r.needs = (r.node.needs || []).map((id) => byId.get(id)).filter(Boolean)
    r.shaky = r.needs.filter((d) => !d.solid)
  }
  return rows
}

/**
 * Qué decirle a alguien que abre el mapa. Tres lecturas, por orden de
 * lo que más cambia una tarde de estudio:
 *
 *   weak     — un tema que se te está resistiendo, y qué cimiento suyo
 *              no está firme — que incluye los que tienes leídos pero
 *              sin comprobar con un solo problema: decirle a alguien
 *              «los cimientos aguantan, insiste aquí» sin haberlo
 *              comprobado es justo el autoengaño que esto deshace. Esto es el consejo de verdad: volver
 *              atrás en lugar de insistir donde duele. Van de abajo
 *              arriba, no por lo mal que vaya cada uno: si flojean un
 *              tema y su cimiento, arreglar el de abajo suele arreglar
 *              los dos, y al revés no pasa nunca.
 *   blocked  — has entrado en algo cuyos cimientos no están cerrados.
 *              Cuenta también haberlo TERMINADO así, que es el caso
 *              más serio y el que pasa desapercibido: el tema figura
 *              como hecho y el hueco sigue ahí, esperando al examen.
 *   next     — lo siguiente que puedes coger con todo lo previo hecho.
 *
 * Todo puede venir vacío, y entonces no hay nada que decir: es mejor
 * no decir nada que rellenar con un consejo que no se apoya en datos.
 */
export function diagnose(rows) {
  const weak = rows
    .filter((r) => r.weak)
    .sort((a, b) => a.level - b.level || a.rate - b.rate)
    .map((r) => ({ row: r, because: r.shaky }))

  const blocked = rows
    .filter((r) => r.started && r.needs.some((d) => !d.complete))
    .map((r) => ({ row: r, missing: r.needs.filter((d) => !d.complete) }))
    // Primero el que ya das por cerrado: es el hueco que no se ve.
    .sort((a, b) => Number(b.row.complete) - Number(a.row.complete))

  // Terminar lo empezado va antes que abrir un tema nuevo: dejar temas a
  // medias es justo lo que produce los huecos que esta pantalla señala.
  const libres = rows.filter((r) => !r.complete && r.needs.every((d) => d.complete))
  const next = libres.find((r) => r.started) || libres[0] || null

  return { weak, blocked, next }
}

// ============================================================
// Geometría del dibujo
// ------------------------------------------------------------
// Todo va en un viewBox: el SVG escala solo, no hace falta medir nada
// en el navegador y en el móvil se ve entero sin desbordar. Aquí
// porque es aritmética pura y así se puede probar sin montar React.
// ============================================================
export const NODE_W = 128
export const NODE_H = 54
const GAP_X = 18
export const GAP_Y = 46

/** Parte la etiqueta en dos líneas como mucho, sin cortar palabras. */
export function wrapLabel(text, max = 14) {
  const lines = []
  let cur = ''
  for (const word of String(text).split(/\s+/)) {
    if (!cur) cur = word
    else if (cur.length + 1 + word.length <= max) cur += ` ${word}`
    else {
      lines.push(cur)
      cur = word
    }
  }
  if (cur) lines.push(cur)
  if (lines.length <= 2) return lines
  return [lines[0], `${lines[1]}…`]
}

/** Coloca cada tema en su nivel, centrando cada fila. */
export function placeNodes(rows) {
  const width = Math.max(...rows.map((r) => r.length * NODE_W + (r.length - 1) * GAP_X))
  const pos = new Map()
  rows.forEach((row, level) => {
    const total = row.length * NODE_W + (row.length - 1) * GAP_X
    const left = (width - total) / 2
    row.forEach((r, i) => {
      pos.set(r.node.id, { x: left + i * (NODE_W + GAP_X), y: level * (NODE_H + GAP_Y) })
    })
  })
  return { pos, width, height: rows.length * NODE_H + (rows.length - 1) * GAP_Y }
}
