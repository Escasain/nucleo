// ============================================================
// Configuración de NÚCLEO
// ============================================================
// Para conectar con Google Drive necesitas un OAuth Client ID
// propio (gratuito). Sigue la guía en SETUP.md y pega aquí tu ID.
// Mientras esté vacío, la app funciona igualmente en modo local
// (los datos se guardan en este navegador).

export const GOOGLE_CLIENT_ID = ''
// Ejemplo: '123456789012-abc123def456.apps.googleusercontent.com'

// (Opcional) Selector de ficheros de Google «Picker», para vincular
// apuntes que ya tengas en Drive. Necesita dos datos más del mismo
// proyecto de Google Cloud (paso 7 de SETUP.md). Si los dejas vacíos,
// todo lo demás sigue funcionando y el botón «Desde Drive» queda
// desactivado; puedes añadir recursos por enlace igualmente.
export const GOOGLE_APP_ID = ''
// Número del proyecto de Google Cloud. Ejemplo: '123456789012'
export const GOOGLE_API_KEY = ''
// Clave de API del mismo proyecto. Ejemplo: 'AIzaSy...'

// Ámbito mínimo: la app solo ve los ficheros que ella crea
// y los que tú elijas con el selector de Google.
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

export const DATA_FILE_NAME = 'nucleo-data.json'
export const DRIVE_FOLDER_NAME = 'NÚCLEO'

export const APP_VERSION = 1
