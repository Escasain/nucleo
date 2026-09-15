# Pruebas

```bash
npm test          # las que no necesitan navegador  (rápido, sin instalar nada)
npm run test:e2e  # las de navegador                (necesita Playwright)
npm run test:all  # lint + build + las dos          (lo mismo que hace la CI)
```

## Qué hay aquí

**`*.test.mjs`** — lógica pura, sin React y sin navegador. Se ejecutan
con Node a secas: `npm test` no instala nada.

| suite | de qué va |
| --- | --- |
| `engine` | el reparto del calendario: presión, huecos, exámenes |
| `calibration` | plan contra realidad: cuánto te cuestan de verdad las unidades |
| `windows` | las ventanas de cada asignatura dentro de su bloque |
| `gcal` | la exportación a Google Calendar y al `.ics` |
| `practice` | los problemas y sus estadísticas |
| `map` | el mapa de temas: niveles, dependencias y coherencia de los datos |
| `mock` | el simulacro: cómo se monta el examen y cómo se lee el resultado |
| `java` | **compila y ejecuta** cada fragmento de Java que la app publica |

**`pw/*.mjs`** — el recorrido real en un navegador, con Playwright. Los
que empiezan por `_` son ayudantes compartidos, no suites: el lanzador
los salta (`_navegador.mjs` abre el navegador y vigila la consola con un
único criterio para las diecisiete).
Comprueban lo que la lógica pura no puede: que las pantallas se pinten,
que los datos lleguen a `localStorage`, que en el móvil no desborde, que
el teclado funcione y que la consola quede limpia.

## Playwright no es una dependencia

La app no arrastra ni una dependencia de más por tener pruebas de
navegador: `npm install` sigue trayendo solo `react` y `react-dom`. Para
las de navegador, una vez:

```bash
npm i -D playwright && npx playwright install chromium
```

## Tres estados, no dos

El lanzador distingue **OK**, **FALLOS** y **MURIÓ**, y el tercero es el
que importa. Una suite que revienta a la mitad deja impresas las líneas
`PASS` que ya había sacado, así que contarlas sigue dando un número
razonable y el problema pasa desapercibido.

Ya ocurrió: al cargar el temario de Fundamentos de Programación, una
prueba que usaba esa asignatura como ejemplo de «asignatura sin temario»
dejó de encontrar el mensaje, murió ahí y se llevó por delante las tres
comprobaciones siguientes. El recuento bajó de 49 a 46 y nadie lo miró.

Por eso ahora manda el código de salida, y el resumen que imprime cada
suite se compara con las líneas realmente contadas.

## Escribir una prueba nueva

Copia la forma de cualquiera: una función `check(nombre, condición,
detalle)` que va acumulando líneas, y un resumen `N PASS · M FAIL` al
final. Sin marco de pruebas, sin configuración y sin dependencias.

Dos costumbres que se han ganado el sitio a base de disgustos:

- **No claves números que dependan de los datos.** «Hay dos asignaturas
  con temario» dejó de ser cierto al añadir la tercera. Léelo de los
  datos.
- **Pon el porqué en el nombre.** `check('recuperado no cuenta como ya
  resuelto')` explica qué se rompe si falla; `check('caso 3')` no.
