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
