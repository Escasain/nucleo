# NÚCLEO · Estudio de tarde

Portal personal de seguimiento del **Bachelor en Ingeniería Informática (UNIPRO)**.

**App:** https://nucleo-psi-cyan.vercel.app/

La build usa rutas relativas (`base: './'` en `vite.config.js`), así que el mismo artefacto sirve en la raíz de un dominio o en un subdirectorio. El enrutado es por hash, así que no hace falta configurar reescrituras en el servidor.

## Qué hace

- **Plan de estudios completo** — los 3 años con sus bloques bimestrales (septiembre, noviembre, marzo, mayo), llaves entre asignaturas y estado de cada una: pendiente, matriculada, cursando, aprobada, suspensa o reconocida.
- **Guía de estudio por asignatura** — para las 30 asignaturas del plan: qué es y para qué sirve, cómo abordarla, temario orientativo, recursos seleccionados para aprender (cursos, vídeos, libros, documentación) y para practicar (jueces online, ejercicios), y el laboratorio o entorno de prácticas recomendado con herramientas gratuitas y un plan de prácticas paso a paso. Más de 360 recursos en español e inglés, con un clic para guardarlos entre tus propios recursos. Incluye cómo evalúa UNIPRO (70 % continua + 30 % prueba final) y un kit general del estudiante.
- **Seguimiento por asignatura** — registro de clases vistas y sesiones de estudio, notas finales, apuntes y evaluaciones (exámenes, entregas, tareas) con fechas límite.
- **Recursos por asignatura** — cualquier enlace externo (vídeos, documentación, campus virtual) y, si activas el paso opcional 7 de [SETUP.md](SETUP.md), apuntes de tu propio Drive con el Picker de Google.
- **Agenda** — todas las entregas y exámenes del curso en una vista única, con avisos de retraso.
- **Herramientas de estudio** — flashcards con repaso espaciado (sistema Leitner) por asignatura y temporizador pomodoro que registra tus minutos de estudio.
- **Tus datos, en tu Drive** — todo se guarda como `nucleo-data.json` en la carpeta `NÚCLEO` de tu Google Drive, con caché local para funcionar offline y exportación/importación JSON como copia de seguridad.
- **Calendario de estudio** — reparte el temario pendiente entre los días que puedes estudiar, hasta la fecha del examen. Ajustas las horas de cada día y el calendario se recoloca al instante; marcas una unidad como hecha y libera su tiempo para el resto. Si el temario no cabe antes de la prueba, te dice cuántas horas faltan por asignatura. Resumen en Inicio, calendario completo en su propia pestaña **Calendario** del menú, y el temario con sus fechas en cada asignatura › Calendario. Al tocar un día se abre su detalle: qué bloques tocan, de qué asignatura y de qué tipo, con sus horas, para marcarlos como hechos o cambiar el tiempo de ese día.
- **Panel «Hoy»** — bloque bimestral en curso, horario de hoy, tarjetas por repasar, entregas próximas y atrasadas, objetivo semanal y racha de días estudiando.
- **Horario semanal y calendario mensual** — bloques fijos de estudio que aparecen cada día en Inicio; vista de mes con evaluaciones y sesiones.
- **Progreso del temario** — marca cada tema estudiado desde la guía; el porcentaje se ve en la asignatura, en el plan y en Inicio.
- **Calculadora de nota UNIPRO** — 70 % continua + 30 % prueba final; te dice qué necesitas en la prueba final para aprobar o para un 7.
- **Expediente** — ECTS superados sobre 180, en curso, y nota media ponderada por créditos.
- **Estadísticas de estudio** — minutos por día (últimos 7 días) y por asignatura, objetivo semanal configurable.
- **Búsqueda global (Ctrl+K)**, **ayuda con atajos (?)**, tutorial de bienvenida, aviso de copia de seguridad e impresión de la guía.
- **PWA** — instalable en el móvil («Añadir a pantalla de inicio»), funciona sin conexión.

## Puesta en marcha

1. **Conexión con Google Drive** (una vez): sigue [SETUP.md](SETUP.md) para crear tu OAuth Client ID gratuito y pégalo en `src/config.js`. Sin esto la app funciona igualmente en modo local: los datos se guardan en el navegador y puedes exportarlos a JSON desde Ajustes.
2. **Desarrollo local**:

   ```bash
   npm install
   npm run dev        # http://localhost:5173
   npm run lint       # ESLint (reglas de hooks + JSX)
   npm run build
   ```

3. **Deploy**: el proyecto está conectado a Vercel; cada push a `main` construye y publica solo (detecta Vite y sirve `dist/`). Recuerda añadir el dominio de Vercel a los orígenes autorizados de Google ([SETUP.md](SETUP.md), paso 4.3).

## Sobre el calendario de estudio

El motor reparte el temario pendiente en bloques de media hora. En cada bloque gana la asignatura con más **presión** (horas pendientes ÷ días que quedan hasta su examen), y la presión se recalcula tras cada bloque: así las asignaturas se alternan solas y la que va más justa se lleva más tiempo, sin repartir porcentajes a mano.

De dónde salen los datos:

- **Temario y horas** → `src/modules/study-planner/studyPlanData.js`. Para dar de alta otra asignatura basta con añadir su entrada con las claves del plan (`algebra`, `tec-comp`…): no hay que tocar ningún componente. El de **Álgebra y Matemática Discreta** es el real, unidad por unidad; el de **Tecnología de Computadores** es provisional y la interfaz lo avisa.
- **Fecha de examen** → la evaluación de tipo «examen» más próxima que tengas apuntada en Agenda. Si no hay ninguna, usa una estimación y te invita a apuntar la real.
- **Horas por día** → se siembran de tu horario semanal (Agenda › Horario semanal) y puedes ajustarlas a mano; el botón «Tomar de mi horario semanal» vuelve a seguirlo.

**Exportar al calendario**: el botón «Exportar al calendario» descarga un `.ics` con todas las sesiones planificadas, listo para importar en Google Calendar (o Apple Calendar, Outlook…). Cada evento lleva en la descripción qué toca, el tipo de unidad, cómo abordar la asignatura y los recursos de su guía que encajan con ese tema concreto, además de un enlace de vuelta al día en NÚCLEO. Los exámenes salen como eventos de día completo. Las sesiones empiezan a las **18:00 entre semana** y a las **10:00 los fines de semana**, encadenando los bloques de cada día; si ese día tienes una franja en tu horario semanal, manda esa. Las horas se cambian en «Tus horas».

`calendarExport.js` tiene también `toGoogleEvents()`, que deja los mismos eventos en el formato de la API de Google Calendar para cuando se añada el scope `calendar.events` al OAuth y se puedan sincronizar en vez de exportar.

La vista vive en `#/calendario`, y `#/calendario/2026-09-22` abre directamente el detalle de ese día.

El estado (`weekHours`, `exceptions`, `done`, `hourOverrides`) vive dentro de `data.planner`, así que se guarda con el mismo mecanismo que el resto: localStorage siempre y Google Drive con debounce si está conectado, y entra en la exportación JSON.

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
    stats.js           ← minutos, rachas, expediente, nota UNIPRO
    driveSync.js       ← OAuth, lectura/escritura en Drive, Picker
    router.jsx         ← rutas por hash
    dates.js
  views/               ← Dashboard, Plan, SubjectDetail, Agenda, Study, Settings
  components/          ← Sidebar, Modal, Checkbox, Icons, StudyGuide (carga bajo demanda), SearchModal, HelpModal
  modules/
    study-planner/     ← calendario de estudio
      planner-engine.js    ← buildSchedule() y utilidades de fecha propias
      PlannerProvider.jsx  ← contexto; capa fina sobre el store
      StudyOverview.jsx    ← resumen de Inicio y calendario completo
      SubjectPlan.jsx      ← temario y fechas de una asignatura
      studyPlanData.js     ← temarios y estimaciones de horas
  styles/global.css    ← sistema de diseño
```
