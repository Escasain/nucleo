# NÚCLEO · Estudio de tarde

Portal personal de seguimiento del **Bachelor en Ingeniería Informática (UNIPRO)**.

**App:** https://escasain.github.io/nucleo/

La build usa rutas relativas (`base: './'` en `vite.config.js`), así que el mismo artefacto sirve tanto en la raíz de un dominio (Vercel, Netlify) como en un subdirectorio (GitHub Pages). El enrutado es por hash, así que no hace falta configurar reescrituras en el servidor.

## Qué hace

- **Plan de estudios completo** — los 3 años con sus bloques bimestrales (septiembre, noviembre, marzo, mayo), llaves entre asignaturas y estado de cada una: pendiente, matriculada, cursando, aprobada, suspensa o reconocida.
- **Seguimiento por asignatura** — registro de clases vistas y sesiones de estudio, notas finales, apuntes y evaluaciones (exámenes, entregas, tareas) con fechas límite.
- **Recursos por asignatura** — cualquier enlace externo (vídeos, documentación, campus virtual) y, si activas el paso opcional 7 de [SETUP.md](SETUP.md), apuntes de tu propio Drive con el Picker de Google.
- **Agenda** — todas las entregas y exámenes del curso en una vista única, con avisos de retraso.
- **Herramientas de estudio** — flashcards con repaso espaciado (sistema Leitner) por asignatura y temporizador pomodoro que registra tus minutos de estudio.
- **Tus datos, en tu Drive** — todo se guarda como `nucleo-data.json` en la carpeta `NÚCLEO` de tu Google Drive, con caché local para funcionar offline y exportación/importación JSON como copia de seguridad.
- **PWA** — instalable en el móvil («Añadir a pantalla de inicio»).

## Puesta en marcha

1. **Conexión con Google Drive** (una vez): sigue [SETUP.md](SETUP.md) para crear tu OAuth Client ID gratuito y pégalo en `src/config.js`. Sin esto la app funciona igualmente en modo local: los datos se guardan en el navegador y puedes exportarlos a JSON desde Ajustes.
2. **Desarrollo local**:

   ```bash
   npm install
   npm run dev        # http://localhost:5173
   ```

3. **Deploy**: cada push a `main` construye y publica automáticamente en GitHub Pages (workflow en `.github/workflows/deploy.yml`).

   La primera vez hay que activar Pages a mano: **Settings → Pages → Source: GitHub Actions**. El token del workflow no tiene permiso para activarlo por su cuenta. Después, **Actions → Deploy a GitHub Pages → Run workflow** publica el sitio.

   Si además lo despliegas en Vercel, no hay que configurar nada: detecta Vite y publica `dist/`. Recuerda añadir ese dominio a los orígenes autorizados de Google ([SETUP.md](SETUP.md), paso 4.3).

## Stack

Vite + React 18, sin más dependencias. CSS propio con el sistema de diseño **«Estudio de tarde»** (Fraunces + Figtree, paleta linen/pine/moss). Google Identity Services + Drive API v3 (ámbito mínimo `drive.file`). Service worker propio para la parte offline.

## Estructura

```
src/
  config.js            ← pega aquí tu Google Client ID
  data/curriculum.js   ← plan de estudios UNIPRO (3 años)
  lib/
    store.jsx          ← estado global + persistencia (local y Drive)
    driveSync.js       ← OAuth, lectura/escritura en Drive, Picker
    router.jsx         ← rutas por hash
    dates.js
  views/               ← Dashboard, Plan, SubjectDetail, Agenda, Study, Settings
  components/          ← Sidebar, Modal, Checkbox, Icons
  styles/global.css    ← sistema de diseño
```
