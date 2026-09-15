// ============================================================
// Cómo se abre el navegador
// ------------------------------------------------------------
// Estaba clavada la ruta del binario de Chromium en las diecisiete
// suites — la ruta del contenedor donde se escribieron. Fuera de él ese
// fichero no existe, así que en la CI todas morían nada más arrancar
// (hallazgo de Codex en el PR #12).
//
// Lo normal es dejar que Playwright encuentre el suyo, que es lo que
// hace `npx playwright install chromium`. La ruta solo se usa si existe
// de verdad, para seguir funcionando en entornos que traen el navegador
// puesto por otra vía.
// ============================================================
import { existsSync } from 'node:fs'
import { chromium } from 'playwright'

const PROPIO = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium'
export const ejecutable = existsSync(PROPIO) ? PROPIO : undefined

export function lanzar(opciones = {}) {
  return chromium.launch({ executablePath: ejecutable, ...opciones })
}

// ============================================================
// Vigilar la consola
// ------------------------------------------------------------
// Cada suite se había escrito su propio filtro: nueve variantes de la
// misma idea, y por tanto nueve sitios donde olvidarse de un caso. Así
// fue como tres suites se quedaron sin filtrar los errores de
// certificado y empezaron a fallar en cuanto la consola pasó a ser una
// comprobación de verdad.
// ============================================================

// Fallos de red del ENTORNO, no de la app: sin salida a internet las
// fuentes de Google no cargan, y detrás de un proxy que reescribe TLS el
// navegador rechaza su certificado. Ninguno dice nada del código.
const RUIDO = /ERR_(CONNECTION|NAME_NOT_RESOLVED|NAME|BLOCKED|CERT|FAILED|INTERNET|ABORTED)/

export const esRuidoDeRed = (texto) => RUIDO.test(String(texto))

/**
 * Apunta en `errores` lo que la página se queje por consola, saltándose
 * el ruido de red. `avisos` incluye también los warning.
 */
export function vigilarConsola(pagina, errores, { avisos = false } = {}) {
  pagina.on('console', (m) => {
    const tipo = m.type()
    if (tipo !== 'error' && !(avisos && tipo === 'warning')) return
    if (esRuidoDeRed(m.text())) return
    errores.push(`[${tipo}] ${m.text()}`)
  })
  pagina.on('pageerror', (e) => errores.push(`[pageerror] ${e.message}`))
}
