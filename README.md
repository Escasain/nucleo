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
- **Sesión de estudio enfocada** — desde cualquier bloque del calendario (o buscando la unidad con Ctrl+K) se abre una pantalla con lo único que hace falta al sentarse: qué unidad toca, los temas de la guía que cubre, el material que encaja con ella y un cronómetro. Al terminar registra los minutos reales **atados a esa unidad del temario** y, si quieres, la marca como hecha.
- **Progreso: el plan contra la realidad** — las horas que te propusiste frente a las que registraste, semana a semana; cuánto tardas de verdad en cada unidad frente a lo estimado, con un botón para **corregir el plan entero a tu ritmo** (reversible, y sin pisar los ajustes que hayas hecho a mano); si a tu ritmo real llegas a cada examen o cuántas horas te faltarían; y un mapa de calor de un año de estudio.
- **Conceptos clave y trampas** — dentro de la guía de cada asignatura: el vocabulario que bloquea, definido sin usar el propio término, con para qué sirve y con qué se confunde; y «dónde se cae todo el mundo», los errores que se repiten examen tras examen con lo que se hace mal y lo que es. Cada concepto se convierte en tarjeta de repaso de un clic, o todos de golpe: ahí estaba el verdadero coste de las flashcards. Disponible en Álgebra y Matemática Discreta y en Tecnología de Computadores; añadir otra asignatura es crear su fichero en `src/data/concepts/`.
- **Práctica con solución razonada** — una pestaña por asignatura con problemas para resolver en papel: 28 en Álgebra y 21 en Tecnología de Computadores, por tema y con su nivel (básico, medio, examen). La pista empuja sin dar la respuesta y la solución viene paso a paso, las dos detrás de un clic para que el ejercicio no se convierta en lectura. Te autocorriges, los fallados se filtran aparte para volver sobre ellos, y el panel te dice en qué tema flojeas de verdad. Al fallar puedes apuntar qué te faltaba y pasa a tus dudas.
- **Explícatelo con tus palabras** — al cerrar una sesión de estudio, dos campos: qué has entendido y qué te ha quedado a medias. Contarlo es lo que separa haber leído un tema de haberlo entendido, y si te atascas al escribirlo ahí está el agujero. Queda guardado por unidad para releerlo antes del examen.
- **Dudas** — lo que no entiendes se apunta antes de que se te olvide que no lo entendías; aparece en Inicio hasta que la resuelves, y al resolverla se convierte en tarjeta de repaso con tu propia respuesta detrás.
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
   npm test           # pruebas sin navegador (no instala nada)
   ```

   Las de navegador van aparte porque necesitan Playwright, que **no es
   una dependencia del proyecto**: la app no arrastra ni una por tener
   pruebas. Una vez, `npm i -D playwright && npx playwright install
   chromium`, y luego `npm run test:e2e`. Todo junto —lo mismo que corre
   la CI en cada PR— es `npm run test:all`. Detalles en
   [test/README.md](test/README.md).

3. **Deploy**: el proyecto está conectado a Vercel; cada push a `main` construye y publica solo (detecta Vite y sirve `dist/`). Recuerda añadir el dominio de Vercel a los orígenes autorizados de Google ([SETUP.md](SETUP.md), paso 4.3).

## Sobre el calendario de estudio

El motor reparte el temario pendiente en bloques de media hora. En cada bloque gana la asignatura con más **presión** (horas pendientes ÷ días que quedan hasta su examen), y la presión se recalcula tras cada bloque: así las asignaturas se alternan solas y la que va más justa se lleva más tiempo, sin repartir porcentajes a mano.

De dónde salen los datos:

- **Temario y horas** → `src/modules/study-planner/studyPlanData.js`. Para dar de alta otra asignatura basta con añadir su entrada con las claves del plan (`algebra`, `tec-comp`…): no hay que tocar ningún componente. El de **Álgebra y Matemática Discreta** es el real, unidad por unidad; el de **Tecnología de Computadores** es provisional y la interfaz lo avisa.
- **Fecha de examen** → la evaluación de tipo «examen» más próxima que tengas apuntada en Agenda. Si no hay ninguna, usa una estimación y te invita a apuntar la real.
- **Horas por día** → se siembran de tu horario semanal (Agenda › Horario semanal) y puedes ajustarlas a mano; el botón «Tomar de mi horario semanal» vuelve a seguirlo.

**Exportar al calendario**: el botón «Exportar al calendario» descarga un `.ics` con todas las sesiones planificadas, listo para importar en Google Calendar (o Apple Calendar, Outlook…). Cada evento lleva en la descripción qué toca, el tipo de unidad, cómo abordar la asignatura y los recursos de su guía que encajan con ese tema concreto, además de un enlace de vuelta al día en NÚCLEO. Los exámenes salen como eventos de día completo. Las sesiones se colocan en las franjas de tu horario semanal de la Agenda, usando **todas** las de ese día: con «lunes 09:00-10:00» y «lunes 18:00-19:00», la segunda sesión va a las 18:00, no encadenada a las 10:00, y una sesión que no cabe en un hueco se parte y sigue en el siguiente. Si ese día no tienes franjas, empiezan a las **18:00 entre semana** y a las **10:00 los fines de semana** y se encadenan. Las horas se cambian en «Tus horas».

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
  data/concepts/       ← conceptos clave y trampas por asignatura (carga bajo demanda)
  data/practice/       ← problemas con pista y solución por asignatura (carga bajo demanda)
  lib/
    store.jsx          ← estado global + persistencia (local y Drive)
    stats.js           ← minutos, rachas, expediente, nota UNIPRO
    calibration.js     ← plan contra realidad: calibración, adherencia, ritmo, mapa de calor
    driveSync.js       ← OAuth, lectura/escritura en Drive, Picker
    router.jsx         ← rutas por hash
    dates.js
  views/               ← Dashboard, Plan, SubjectDetail, Agenda, Study, Progress, Focus,
                         MockExam, Review, Settings
  components/          ← Sidebar, Modal, Checkbox, Icons, StudyGuide y KeyConcepts (carga bajo demanda),
                         Understanding, Practice, SubjectMap, SearchModal, HelpModal
  lib/subjectMap.js    ← niveles del mapa y diagnóstico de temas flojos
  lib/mockExam.js      ← cómo se monta y se corrige un simulacro
test/                  ← las pruebas; `npm test` no necesita navegador ni instalar nada
  data/map/            ← mapa de dependencias entre temas (carga bajo demanda)
  modules/
    study-planner/     ← calendario de estudio
      planner-engine.js    ← buildSchedule() y utilidades de fecha propias
      PlannerProvider.jsx  ← contexto; capa fina sobre el store
      StudyOverview.jsx    ← resumen de Inicio y calendario completo
      SubjectPlan.jsx      ← temario y fechas de una asignatura
      studyPlanData.js     ← temarios y estimaciones de horas
  styles/global.css    ← sistema de diseño
```
