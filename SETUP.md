# Conectar NÚCLEO con tu Google Drive

Guía única, ~10 minutos, gratuita. Al terminar, la app guardará tus datos en tu Drive y podrás vincular apuntes con el selector de Google.

## 1. Crea un proyecto en Google Cloud

1. Entra en https://console.cloud.google.com/ con tu cuenta de Google (la misma que usarás en la app).
2. Arriba a la izquierda, selector de proyectos → **Nuevo proyecto**.
3. Nombre: `nucleo` → **Crear** (y selecciónalo cuando aparezca).

## 2. Activa las APIs

1. Menú ☰ → **APIs y servicios → Biblioteca**.
2. Busca **Google Drive API** → **Habilitar**.
3. Vuelve a la biblioteca, busca **Google Picker API** → **Habilitar**.

## 3. Pantalla de consentimiento OAuth

1. Menú ☰ → **APIs y servicios → Pantalla de consentimiento OAuth** (Google Auth Platform).
2. Tipo de usuario: **Externo** → Crear.
3. Nombre de la app: `NÚCLEO` · correo de asistencia: el tuyo → guarda los pasos siguientes sin tocar nada más.
4. En **Público** (o «Usuarios de prueba»): añade tu propio Gmail como usuario de prueba. Con la app en modo «Prueba» solo tú podrás entrar — perfecto, no hace falta publicarla ni verificarla.

## 4. Crea el Client ID

1. **APIs y servicios → Credenciales → + Crear credenciales → ID de cliente de OAuth**.
2. Tipo de aplicación: **Aplicación web**. Nombre: `nucleo-web`.
3. En **Orígenes de JavaScript autorizados** añade estos dos:
   - `https://escasain.github.io`
   - `http://localhost:5173`
4. No hace falta añadir URIs de redirección. **Crear**.
5. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`).

## 5. Pégalo en la app

Edita `src/config.js`:

```js
export const GOOGLE_CLIENT_ID = 'TU-ID-AQUI.apps.googleusercontent.com'
```

Haz commit y push — GitHub Pages se redespliega solo en un par de minutos.

## 6. Conecta

Abre la app → **Ajustes → Conectar con Drive** → elige tu cuenta y acepta. Verás en tu Drive una carpeta `NÚCLEO` con `nucleo-data.json`: ahí vive todo (expediente, sesiones, flashcards…). El indicador de la barra lateral queda en «Sincronizado con Drive».

## 7. (Opcional) Activar el selector de ficheros de Drive

Solo si quieres el botón **«Desde Drive»** de cada asignatura, para vincular apuntes que ya tengas en tu Drive. Sin esto, todo lo demás —incluida la sincronización— funciona igual, y puedes añadir recursos con el botón **«Enlace»**.

El selector de Google necesita dos datos más del mismo proyecto:

1. **Número de proyecto**: menú ☰ → **Configuración de IAM y administración → Configuración**. Copia el **Número del proyecto** (solo dígitos).
2. **Clave de API**: **APIs y servicios → Credenciales → + Crear credenciales → Clave de API**. Cópiala y, en **Restringir clave**, limita su uso a la **Google Picker API** y a tus dos orígenes del paso 4.3.

Pégalos en `src/config.js`:

```js
export const GOOGLE_APP_ID = '123456789012'      // número del proyecto
export const GOOGLE_API_KEY = 'AIzaSy...'        // clave de API
```

El número de proyecto es imprescindible: con el ámbito `drive.file`, sin él el selector no puede darle acceso a la app a los ficheros que elijas.

## Notas de privacidad y seguridad

- El ámbito usado es `drive.file`: la app **solo** puede ver los ficheros que ella misma crea y los que tú elijas explícitamente en el Picker. No puede leer el resto de tu Drive.
- El Client ID no es un secreto (va en el código del navegador de cualquier app web con OAuth); la seguridad la dan los orígenes autorizados y la pantalla de consentimiento.
- Si algún día quieres usar la app desde otro dominio, añade ese origen en el paso 4.

## Problemas típicos

- **«Error 403: access_denied»** al conectar → tu Gmail no está en usuarios de prueba (paso 3.4).
- **«The given origin is not allowed»** → revisa que el origen exacto (con https y sin barra final) está en el paso 4.3.
- **El Picker no abre** → comprueba que la Google Picker API está habilitada (paso 2.3), que has hecho el paso 7 y que no hay bloqueador de popups.
- **«Desde Drive» aparece desactivado** → falta el `GOOGLE_APP_ID` del paso 7. El resto de la app no lo necesita.
- **Se queda en «Conectando…» y vuelve a «Sin conectar»** → normalmente es el bloqueador de popups del navegador: pulsa **Conectar con Drive** en Ajustes para hacerlo de forma manual.
