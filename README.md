# NÚCLEO · Estudio de tarde

Portal personal de seguimiento del **Bachelor en Ingeniería Informática (UNIPRO)**.

**App:** https://escasain.github.io/nucleo/

La build usa rutas relativas (`base: './'` en `vite.config.js`), así que el mismo artefacto sirve tanto en la raíz de un dominio (Vercel, Netlify) como en un subdirectorio (GitHub Pages). El enrutado es por hash, así que no hace falta configurar reescrituras en el servidor.

## Qué hace

- **Plan de estudios completo** — los 3 años con sus bloques bimestrales (septiembre, noviembre, marzo, mayo), llaves entre asignaturas y estado de cada una: pendiente, matriculada, cursando, aprobada, suspensa o reconocida.
- **Guía de estudio por asignatura** — para las 30 asignaturas del plan: qué es y para qué sirve, cómo abordarla, temario orientativo, recursos seleccionados para aprender (cursos, vídeos, libros, documentación) y para practicar (jueces online, ejercicios), y el laboratorio o entorno de prácticas recomendado con herramientas gratuitas y un plan de prácticas paso a paso. Más de 360 recursos en español e inglés, con un clic para guardarlos entre tus propios recursos. Incluye cómo evalúa UNIPRO (70 % continua + 30 % prueba final) y un kit general del estudiante.
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

## Sobre la guía de estudio

El temario de cada asignatura es **orientativo**: se basa en el plan publicado por UNIPRO (Bachelor en Ingeniería Informática, título oficial andorrano de 180 ECTS) y en las guías docentes públicas de estas mismas asignaturas en universidades del mismo grupo (UNIR) y otras (UGR, URJC), que coinciden en las unidades. Contrasta el orden y los nombres exactos con la guía docente de tu campus; si algo difiere, edita `src/data/guide/yearN.js` y haz push: se redespliega solo.

Los recursos son gratuitos salvo los libros de referencia (que suelen ser la bibliografía básica) y se han elegido por calidad, no por cantidad. Cada uno lleva una nota de para qué sirve y en qué idioma está.

## Stack

Vite + React 18, sin más dependencias. CSS propio con el sistema de diseño **«Estudio de tarde»** (Fraunces + Figtree, paleta linen/pine/moss). Google Identity Services + Drive API v3 (ámbito mínimo `drive.file`). Service worker propio para la parte offline.

## Estructura

```
src/
  config.js            ← pega aquí tu Google Client ID
  data/curriculum.js   ← plan de estudios UNIPRO (3 años)
  data/guide/          ← guía de estudio: temario, recursos y laboratorio por asignatura
    year1.js, year2.js, year3.js, meta.js (kit del estudiante, evaluación)
  lib/
    store.jsx          ← estado global + persistencia (local y Drive)
    driveSync.js       ← OAuth, lectura/escritura en Drive, Picker
    router.jsx         ← rutas por hash
    dates.js
  views/               ← Dashboard, Plan, SubjectDetail, Agenda, Study, Settings
  components/          ← Sidebar, Modal, Checkbox, Icons, StudyGuide (carga bajo demanda)
  styles/global.css    ← sistema de diseño
```
