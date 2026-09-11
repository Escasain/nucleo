// ============================================================
// Sincronización con Google Drive
// - OAuth con Google Identity Services (token en memoria)
// - Los datos viven en Drive: carpeta NÚCLEO / nucleo-data.json
// - Picker de Google para vincular recursos (opcional, scope
//   drive.file: la app solo accede a lo que ella crea o tú elijas)
// ============================================================
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_APP_ID,
  GOOGLE_API_KEY,
  DRIVE_SCOPE,
  DATA_FILE_NAME,
  DRIVE_FOLDER_NAME
} from '../config.js'

const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'
const BOUNDARY = 'nucleo-boundary-7f3a1c'

let tokenClient = null
let accessToken = null
let tokenExpiry = 0
let pendingToken = null

const CONNECTED_KEY = 'nucleo.driveConnected'
const FILE_ID_KEY = 'nucleo.driveFileId'

export function isConfigured() {
  return Boolean(GOOGLE_CLIENT_ID)
}

// El Picker necesita, además del Client ID, el número de proyecto
// (appId) para poder devolver ficheros con el ámbito drive.file.
export function isPickerConfigured() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_APP_ID)
}

function lsGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function lsSet(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* sin localStorage seguimos solo en memoria */
  }
}

export function wasConnected() {
  return lsGet(CONNECTED_KEY) === '1'
}

function rememberConnected(v) {
  lsSet(CONNECTED_KEY, v ? '1' : null)
}

// Cachea la promesa: dos llamadas seguidas no cargan el script dos veces
// ni resuelven antes de tiempo si ya estaba insertándose.
const scriptPromises = new Map()

function loadScript(src) {
  if (scriptPromises.has(src)) return scriptPromises.get(src)
  const p = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    const el = existing || document.createElement('script')
    el.addEventListener('load', () => resolve())
    el.addEventListener('error', () => {
      scriptPromises.delete(src)
      reject(new Error(`No se pudo cargar ${src}`))
    })
    if (!existing) {
      el.src = src
      el.async = true
      document.head.appendChild(el)
    }
  })
  scriptPromises.set(src, p)
  return p
}

async function ensureGis() {
  await loadScript('https://accounts.google.com/gsi/client')
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services no está disponible')
  }
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: () => {} // se sustituye en cada petición
    })
  }
}

// Pide un access token. interactive=false intenta renovar sin diálogo:
// si el navegador bloquea el popup o no hay sesión, falla rápido en vez
// de dejar la app colgada en «Conectando…».
export async function getToken(interactive) {
  if (!isConfigured()) throw new Error('Falta el Client ID de Google (ver SETUP.md)')
  if (accessToken && Date.now() < tokenExpiry - 60000) return accessToken
  if (pendingToken) return pendingToken

  pendingToken = (async () => {
    await ensureGis()
    return new Promise((resolve, reject) => {
      let settled = false
      const timer = setTimeout(
        () => finish(null, new Error('tiempo de espera agotado')),
        interactive ? 120000 : 20000
      )
      function finish(token, err) {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (err) reject(err)
        else resolve(token)
      }
      tokenClient.callback = (resp) => {
        if (resp.error) {
          finish(null, new Error(resp.error_description || resp.error))
          return
        }
        accessToken = resp.access_token
        tokenExpiry = Date.now() + (Number(resp.expires_in) || 3600) * 1000
        rememberConnected(true)
        finish(accessToken)
      }
      tokenClient.error_callback = (err) => {
        finish(null, new Error(err?.type || 'auth_error'))
      }
      try {
        tokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' })
      } catch (e) {
        finish(null, e instanceof Error ? e : new Error('auth_error'))
      }
    })
  })()

  try {
    return await pendingToken
  } finally {
    pendingToken = null
  }
}

export function disconnect() {
  if (accessToken && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(accessToken, () => {})
  }
  accessToken = null
  tokenExpiry = 0
  dataFileId = null
  rememberConnected(false)
  lsSet(FILE_ID_KEY, null)
}

async function driveFetch(url, options = {}, retryOn401 = true) {
  const token = await getToken(false)
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  })
  if (res.status === 401 && retryOn401) {
    // Token caducado o revocado: lo tiramos y pedimos otro una sola vez.
    accessToken = null
    tokenExpiry = 0
    return driveFetch(url, options, false)
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Drive ${res.status}: ${text.slice(0, 200)}`)
  }
  return res
}

// Las comillas simples y las barras invertidas se escapan en las
// consultas de Drive (https://developers.google.com/drive/api/guides/search-files)
function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

async function findByName(name, { mimeType, parentId } = {}) {
  const qParts = [`name = ${quote(name)}`, 'trashed = false']
  if (mimeType) qParts.push(`mimeType = ${quote(mimeType)}`)
  if (parentId) qParts.push(`${quote(parentId)} in parents`)
  const params = new URLSearchParams({
    q: qParts.join(' and '),
    spaces: 'drive',
    fields: 'files(id,name,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '10'
  })
  const res = await driveFetch(`${API}/files?${params}`)
  const data = await res.json()
  return data.files && data.files[0] ? data.files[0] : null
}

async function ensureFolder() {
  const existing = await findByName(DRIVE_FOLDER_NAME, {
    mimeType: 'application/vnd.google-apps.folder'
  })
  if (existing) return existing.id
  const res = await driveFetch(`${API}/files?fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })
  const data = await res.json()
  return data.id
}

// Cuerpo multipart (metadatos + contenido) para crear el fichero ya
// con datos dentro, en una sola petición.
function multipartBody(metadata, content) {
  return [
    `--${BOUNDARY}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${BOUNDARY}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    content,
    `--${BOUNDARY}--`,
    ''
  ].join('\r\n')
}

let dataFileId = null

async function verifyFileId(id) {
  try {
    const res = await driveFetch(`${API}/files/${id}?fields=id,trashed`)
    const data = await res.json()
    return data.trashed ? null : data.id
  } catch {
    return null
  }
}

export async function ensureDataFile(initialContent) {
  if (dataFileId) return dataFileId

  // 1) El id que guardamos la última vez (evita buscar en cada arranque)
  const remembered = lsGet(FILE_ID_KEY)
  if (remembered) {
    const ok = await verifyFileId(remembered)
    if (ok) {
      dataFileId = ok
      return dataFileId
    }
    lsSet(FILE_ID_KEY, null)
  }

  // 2) Buscarlo dentro de la carpeta de la app (y, si no, en cualquier sitio)
  const folderId = await ensureFolder()
  const existing =
    (await findByName(DATA_FILE_NAME, { parentId: folderId })) ||
    (await findByName(DATA_FILE_NAME))
  if (existing) {
    dataFileId = existing.id
    lsSet(FILE_ID_KEY, dataFileId)
    return dataFileId
  }

  // 3) Crearlo, ya con contenido, en una sola subida multipart
  const res = await driveFetch(`${UPLOAD}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${BOUNDARY}` },
    body: multipartBody(
      { name: DATA_FILE_NAME, parents: [folderId], mimeType: 'application/json' },
      initialContent ? JSON.stringify(initialContent) : '{}'
    )
  })
  const data = await res.json()
  dataFileId = data.id
  lsSet(FILE_ID_KEY, dataFileId)
  return dataFileId
}

export async function loadFromDrive() {
  const id = await ensureDataFile()
  const res = await driveFetch(`${API}/files/${id}?alt=media`)
  const text = await res.text()
  if (!text || !text.trim()) return null
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && parsed.subjects ? parsed : null
  } catch {
    return null
  }
}

export async function saveToDrive(data) {
  const id = await ensureDataFile(data)
  await driveFetch(`${UPLOAD}/files/${id}?uploadType=media&fields=id`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data)
  })
  return true
}

// ---------- Google Picker (vincular recursos de Drive) ----------
let pickerReady = false

async function ensurePicker() {
  if (pickerReady) return
  await loadScript('https://apis.google.com/js/api.js')
  await new Promise((resolve, reject) => {
    window.gapi.load('picker', {
      callback: resolve,
      onerror: () => reject(new Error('No se pudo cargar el selector de Google')),
      timeout: 15000,
      ontimeout: () => reject(new Error('El selector de Google tardó demasiado'))
    })
  })
  if (!window.google?.picker) throw new Error('El selector de Google no está disponible')
  pickerReady = true
}

// Abre el Picker y devuelve los ficheros elegidos:
// [{ id, name, mimeType, url }]
export async function pickDriveFiles() {
  if (!isPickerConfigured()) {
    throw new Error('El selector necesita el App ID de Google (ver SETUP.md)')
  }
  const token = await getToken(false).catch(() => getToken(true))
  await ensurePicker()
  return new Promise((resolve, reject) => {
    try {
      const picker = window.google.picker
      const view = new picker.DocsView(picker.ViewId.DOCS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
      const builder = new picker.PickerBuilder()
        .setOAuthToken(token)
        // Sin appId, con el ámbito drive.file el Picker no puede
        // conceder acceso a los ficheros elegidos.
        .setAppId(GOOGLE_APP_ID)
        .addView(view)
        .setLocale('es')
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .enableFeature(picker.Feature.MULTISELECT_ENABLED)
        .setCallback((data) => {
          if (data.action === picker.Action.PICKED) {
            resolve(
              (data.docs || []).map((d) => ({
                id: d.id,
                name: d.name,
                mimeType: d.mimeType,
                url: d.url || `https://drive.google.com/open?id=${d.id}`
              }))
            )
          } else if (data.action === picker.Action.CANCEL) {
            resolve([])
          }
        })
      if (GOOGLE_API_KEY) builder.setDeveloperKey(GOOGLE_API_KEY)
      builder.build().setVisible(true)
    } catch (e) {
      reject(e instanceof Error ? e : new Error('No se pudo abrir el selector'))
    }
  })
}
