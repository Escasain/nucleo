// ============================================================
// Lanzador de las pruebas
// ------------------------------------------------------------
// Cada suite imprime sus líneas PASS/FAIL y termina con un resumen.
// Este lanzador las ejecuta todas y, sobre todo, distingue tres cosas
// que no son lo mismo:
//
//   OK        — terminó y no falló nada
//   FALLOS    — terminó y algo falló
//   MURIÓ     — se interrumpió a mitad
//
// La tercera es la que importa. Una suite que revienta a la mitad deja
// impresas las líneas PASS que ya había sacado, así que contarlas sigue
// dando un número razonable y el problema pasa desapercibido. Ya ocurrió
// una vez: una prueba dejó de encontrar un elemento, murió, se llevó por
// delante tres comprobaciones y el recuento bajó de 49 a 46 sin que
// nadie lo mirara.
//
// Por eso aquí manda el código de salida, y el número de comprobaciones
// esperadas se compara con las que realmente se imprimieron.
// ============================================================
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const aqui = dirname(fileURLToPath(import.meta.url))

export function correrSuites(ficheros, { cwd = aqui, env = process.env, etiqueta = '' } = {}) {
  const filas = []
  for (const f of ficheros) {
    const r = spawnSync(process.execPath, [join(cwd, f)], { encoding: 'utf8', env, cwd })
    const salida = `${r.stdout || ''}${r.stderr || ''}`
    const pass = (salida.match(/^PASS\b/gm) || []).length
    const fail = (salida.match(/^FAIL\b/gm) || []).length
    const resumen = salida.match(/^(\d+) PASS · (\d+) FAIL$/m)
    const omitida = /^OMITIDA/m.test(salida)

    let estado
    if (omitida) estado = 'OMITIDA'
    else if (r.status !== 0) estado = 'MURIÓ'
    else if (!resumen) estado = 'MURIÓ' // terminó en 0 pero sin línea de resumen
    else if (fail > 0) estado = 'FALLOS'
    else estado = 'OK'

    // El resumen lo imprime la propia suite al final: si no coincide con
    // lo que hemos contado, es que se cortó entre medias.
    if (estado === 'OK' && resumen && Number(resumen[1]) !== pass) estado = 'MURIÓ'

    filas.push({ f: (etiqueta ? etiqueta : '') + f, pass, fail, estado, salida })
  }
  return filas
}

export function informe(filas) {
  const ancho = Math.max(...filas.map((x) => x.f.length))
  for (const x of filas) {
    const marca = { OK: '·', FALLOS: '✗', 'MURIÓ': '✗', OMITIDA: '–' }[x.estado]
    console.log(
      `${marca} ${x.f.padEnd(ancho)}  ${String(x.pass).padStart(4)} PASS  ${String(x.fail).padStart(3)} FAIL  ${x.estado}`
    )
  }
  for (const x of filas.filter((y) => y.estado === 'FALLOS' || y.estado === 'MURIÓ')) {
    console.log(`\n───── ${x.f} ─────`)
    const lineas = x.salida.split('\n')
    const malas = lineas.filter((l) => l.startsWith('FAIL'))
    console.log(malas.length ? malas.join('\n') : lineas.slice(-14).join('\n'))
  }
  const pass = filas.reduce((a, x) => a + x.pass, 0)
  const fail = filas.reduce((a, x) => a + x.fail, 0)
  const rotas = filas.filter((x) => x.estado === 'MURIÓ').length
  const omitidas = filas.filter((x) => x.estado === 'OMITIDA').length
  console.log(
    `\n${filas.length - omitidas} suites · ${pass} comprobaciones · ${fail} fallos` +
      (rotas ? ` · ${rotas} suite(s) MURIERON a mitad` : '') +
      (omitidas ? ` · ${omitidas} omitida(s)` : '')
  )
  return fail === 0 && rotas === 0
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ficheros = readdirSync(aqui).filter((f) => f.endsWith('.test.mjs') && !f.startsWith('_')).sort()
  process.exit(informe(correrSuites(ficheros)) ? 0 : 1)
}
