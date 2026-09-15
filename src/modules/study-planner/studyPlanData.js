// ============================================================
// Temarios del planificador
// ------------------------------------------------------------
// Solo lo que el resto de la app no sabe: las unidades de trabajo
// con su estimación de horas. El nombre, los créditos, el bloque y
// el año salen de data/curriculum.js, y la fecha de examen de tus
// propias evaluaciones (Agenda). Las claves son los id reales del
// plan de estudios.
//
// Para dar de alta el temario de otra asignatura basta con añadir
// aquí su entrada: no hay que tocar ningún componente.
//
//   kind: 'base'   → repaso previo que hace falta para seguir el tema
//         'tema'   → teoría del temario oficial
//         'lab'    → laboratorio o práctica entregable
//         'repaso' → casos resueltos, simulacros y repaso final
// ============================================================

export const UNIT_KINDS = {
  base: { label: 'base', className: 'is-base' },
  tema: { label: 'teoría', className: 'is-tema' },
  lab: { label: 'laboratorio', className: 'is-lab' },
  repaso: { label: 'repaso', className: 'is-repaso' }
}

// Colores del planificador, tomados de la paleta «Estudio de tarde».
// Se asignan por asignatura porque dos del mismo bloque comparten el
// color de bloque y la leyenda del calendario quedaría ambigua.
export const PLAN_COLORS = [
  'var(--plan-1)',
  'var(--plan-2)',
  'var(--plan-3)',
  'var(--plan-4)',
  'var(--plan-5)'
]

export const STUDY_PLANS = {
  // ---------------------------------------------------------------
  // Álgebra y Matemática Discreta · temario real, unidad por unidad
  // ---------------------------------------------------------------
  algebra: {
    short: 'AMD',
    color: 'var(--plan-1)',
    start: '2026-09-15',
    examHint: '2026-11-06',
    examLabel: 'Prueba final · 6-8 nov',
    units: [
      { id: 'b1', t: 'Base · Notación y conjuntos numéricos', h: 1.5, kind: 'base' },
      { id: 'b2', t: 'Base · Manipulación algebraica', h: 1, kind: 'base' },
      { id: 't1a', t: 'T1 · Variables, cuantificadores y predicados', h: 2, kind: 'tema' },
      { id: 't1b', t: 'T1 · Tablas de verdad y reglas de inferencia', h: 1.5, kind: 'tema' },
      { id: 't1c', t: 'T1 · Métodos de prueba y contraejemplos', h: 2.5, kind: 'tema' },
      { id: 'b3', t: 'Base · Sumatorios y sucesiones', h: 1, kind: 'base' },
      { id: 't2a', t: 'T2 · Principio de inducción', h: 3, kind: 'tema' },
      { id: 't2b', t: 'T2 · Inducción fuerte y recursión', h: 2, kind: 'tema' },
      { id: 'l1', t: 'Laboratorio 1', h: 2, kind: 'lab' },
      { id: 't3a', t: 'T3 · Operaciones con matrices', h: 2, kind: 'tema' },
      { id: 't3b', t: 'T3 · Determinante, inversa y rango', h: 2, kind: 'tema' },
      { id: 'b4', t: 'Base · Sistemas de ecuaciones lineales', h: 1, kind: 'base' },
      { id: 't4', t: 'T4 · Eliminación gaussiana y consistencia', h: 3.5, kind: 'tema' },
      { id: 'l2', t: 'Laboratorio 2', h: 2, kind: 'lab' },
      { id: 'b5', t: 'Base · Rectas, inecuaciones y región factible', h: 1.5, kind: 'base' },
      { id: 't5a', t: 'T5 · Programación lineal, método gráfico', h: 2, kind: 'tema' },
      { id: 't5b', t: 'T5 · Algoritmo simplex', h: 3, kind: 'tema' },
      { id: 't6a', t: 'T6 · Divisibilidad, Euclides y mcd', h: 2, kind: 'tema' },
      { id: 't6b', t: 'T6 · Aritmética modular y congruencias', h: 2, kind: 'tema' },
      { id: 't6c', t: 'T6 · Fermat y aplicaciones criptográficas', h: 1.5, kind: 'tema' },
      { id: 'l3', t: 'Laboratorio 3', h: 2, kind: 'lab' },
      { id: 't7', t: 'T7 · Conjuntos y funciones', h: 2.5, kind: 'tema' },
      { id: 't8', t: 'T8 · Relaciones y representación matricial', h: 3, kind: 'tema' },
      { id: 'l4', t: 'Laboratorio 4', h: 2, kind: 'lab' },
      { id: 't9a', t: 'T9 · Grafos: definiciones y adyacencia', h: 2, kind: 'tema' },
      { id: 't9b', t: 'T9 · Caminos, Euler y Hamilton', h: 1.5, kind: 'tema' },
      { id: 't10', t: 'T10 · Árboles y recorridos', h: 2.5, kind: 'tema' },
      { id: 'l5', t: 'Laboratorio 5', h: 2, kind: 'lab' },
      { id: 'c1', t: 'Caso resuelto 1 · cronometrado', h: 2, kind: 'repaso' },
      { id: 'c2', t: 'Caso resuelto 2 · cronometrado', h: 2, kind: 'repaso' },
      { id: 'c3', t: 'Caso resuelto 3 + repaso final', h: 2.5, kind: 'repaso' }
    ]
  },

  // ---------------------------------------------------------------
  // Tecnología de Computadores · PROVISIONAL
  //
  // Los diez temas salen del temario habitual de la asignatura (el
  // mismo que documenta su guía de estudio en data/guide/year1.js),
  // no de la guía docente de UNIPRO, que no es pública. Las horas son
  // una estimación por peso, calibrada para unas 64 h como en Álgebra,
  // que también son 6 ECTS.
  //
  // Fechas confirmadas por Carlos: la asignatura va del 9 de noviembre
  // al 23 de diciembre de 2026, o sea el bloque de noviembre, no el de
  // septiembre. No se solapa con Álgebra, que cierra el 6-8 de nov.
  //
  // Cuando tengas la guía oficial, sustituye títulos y horas aquí: no
  // hay que tocar ningún componente. La interfaz avisa de que el plan
  // es provisional mientras siga esta marca.
  // ---------------------------------------------------------------
  'tec-comp': {
    short: 'TC',
    color: 'var(--plan-2)',
    start: '2026-11-09',
    examHint: '2026-12-23',
    examLabel: 'Examen por confirmar',
    provisional: true,
    units: [
      { id: 'b1', t: 'Base · Sistemas de numeración y cambios de base', h: 1.5, kind: 'base' },
      { id: 't1a', t: 'T1 · Binario, octal y hexadecimal: conversiones', h: 2, kind: 'tema' },
      { id: 't1b', t: 'T1 · Enteros con signo y complemento a dos', h: 2, kind: 'tema' },
      { id: 't1c', t: 'T1 · Coma flotante IEEE 754', h: 2, kind: 'tema' },
      { id: 't1d', t: 'T1 · Códigos: BCD, Gray, ASCII y detección de errores', h: 1.5, kind: 'tema' },
      { id: 'b2', t: 'Base · Álgebra de Boole: leyes y teoremas', h: 1.5, kind: 'base' },
      { id: 't2a', t: 'T2 · Funciones lógicas y formas canónicas', h: 2, kind: 'tema' },
      { id: 't2b', t: 'T2 · Puertas lógicas y familias', h: 1.5, kind: 'tema' },
      { id: 't3a', t: 'T3 · Simplificación con mapas de Karnaugh', h: 2.5, kind: 'tema' },
      { id: 't3b', t: 'T3 · Quine-McCluskey e implicantes primos', h: 2, kind: 'tema' },
      { id: 'l1', t: 'Laboratorio 1 · Puertas y circuitos combinacionales en Logisim', h: 2.5, kind: 'lab' },
      { id: 't4a', t: 'T4 · Codificadores, decodificadores y multiplexores', h: 2.5, kind: 'tema' },
      { id: 't4b', t: 'T4 · Sumadores, restadores y comparadores', h: 2.5, kind: 'tema' },
      { id: 't4c', t: 'T4 · La unidad aritmético-lógica (ALU)', h: 2, kind: 'tema' },
      { id: 'l2', t: 'Laboratorio 2 · Sumador de 4 bits y ALU', h: 2.5, kind: 'lab' },
      { id: 't5a', t: 'T5 · Biestables: latches y flip-flops', h: 2.5, kind: 'tema' },
      { id: 't5b', t: 'T5 · Registros y contadores', h: 2.5, kind: 'tema' },
      { id: 't5c', t: 'T5 · Máquinas de estados: Moore y Mealy', h: 2.5, kind: 'tema' },
      { id: 'l3', t: 'Laboratorio 3 · Biestables, registros y contadores', h: 2.5, kind: 'lab' },
      { id: 't6a', t: 'T6 · Memorias RAM y ROM: tipos y organización', h: 2, kind: 'tema' },
      { id: 't6b', t: 'T6 · Direccionamiento y expansión de memoria', h: 2, kind: 'tema' },
      { id: 'l4', t: 'Laboratorio 4 · Máquina de estados completa', h: 2.5, kind: 'lab' },
      { id: 't7a', t: 'T7 · Ruta de datos y unidad de control', h: 3, kind: 'tema' },
      { id: 't7b', t: 'T7 · Ciclo de instrucción y juego de instrucciones', h: 2.5, kind: 'tema' },
      { id: 't8a', t: 'T8 · Tecnologías TTL y CMOS: niveles, retardos y consumo', h: 1.5, kind: 'tema' },
      { id: 't8b', t: 'T8 · Dispositivos programables: PLD y FPGA', h: 2, kind: 'tema' },
      { id: 'l5', t: 'Laboratorio 5 · Nand2Tetris: de la puerta NAND a la CPU', h: 2.5, kind: 'lab' },
      { id: 'c1', t: 'Caso resuelto 1 · Conversiones y aritmética binaria', h: 2, kind: 'repaso' },
      { id: 'c2', t: 'Caso resuelto 2 · Diseño combinacional y secuencial', h: 2, kind: 'repaso' },
      { id: 'c3', t: 'Repaso final y simulacro de examen', h: 2.5, kind: 'repaso' }
    ]
  },

  // ---------------------------------------------------------------
  // Sin temario todavía: aparecen en «Más adelante» hasta que lo
  // cargues. En cuanto tengan unidades entran en el calendario.
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // Fundamentos de Programación · PROVISIONAL
  //
  // Los nueve temas salen del temario que ya documenta su guía de
  // estudio en data/guide/year1.js, no de la guía docente de UNIPRO,
  // que no es pública. Las horas son una estimación por peso, calibrada
  // para unas 67 h: son 6 ECTS como Álgebra y como TC.
  //
  // Va en el bloque de noviembre, el mismo que TC. Son dos asignaturas
  // de 6 ECTS en seis semanas y el planificador lo va a enseñar sin
  // adornos en cuanto la marques como cursando: eso no es un defecto
  // del reparto, es el curso que tienes.
  //
  // La asignatura se imparte habitualmente en Java; los problemas y los
  // conceptos lo asumen. Cuando tengas la guía oficial, sustituye
  // títulos y horas aquí: no hay que tocar ningún componente.
  // ---------------------------------------------------------------
  'fund-prog': {
    short: 'FP',
    color: 'var(--plan-3)',
    start: '2026-11-09',
    examHint: '2026-12-23',
    examLabel: 'Examen por confirmar',
    provisional: true,
    units: [
      { id: 'b1', t: 'Base · El entorno: JDK, IDE y tu primer programa', h: 1.5, kind: 'base' },
      { id: 't1a', t: 'T1 · Algoritmos, lenguajes, compilación e interpretación', h: 1.5, kind: 'tema' },
      { id: 't1b', t: 'T1 · Estructura de un programa Java y convenciones', h: 1.5, kind: 'tema' },
      { id: 't2a', t: 'T2 · Tipos primitivos, variables y constantes', h: 2, kind: 'tema' },
      { id: 't2b', t: 'T2 · Operadores, precedencia y conversión de tipos', h: 2, kind: 'tema' },
      { id: 't2c', t: 'T2 · Entrada y salida por consola', h: 1.5, kind: 'tema' },
      { id: 'l1', t: 'Laboratorio 1 · Calculadora por consola', h: 2, kind: 'lab' },
      { id: 't3a', t: 'T3 · Condicionales: if, else if y switch', h: 2, kind: 'tema' },
      { id: 't3b', t: 'T3 · Bucles: while, do-while y for', h: 2.5, kind: 'tema' },
      { id: 't3c', t: 'T3 · Bucles anidados, break y continue', h: 2, kind: 'tema' },
      { id: 'l2', t: 'Laboratorio 2 · Menú con validación de entrada', h: 2.5, kind: 'lab' },
      { id: 't4a', t: 'T4 · Métodos: parámetros, retorno y ámbito', h: 2.5, kind: 'tema' },
      { id: 't4b', t: 'T4 · Paso por valor y sobrecarga', h: 2, kind: 'tema' },
      { id: 't4c', t: 'T4 · Recursividad básica', h: 2.5, kind: 'tema' },
      { id: 'l3', t: 'Laboratorio 3 · Biblioteca de métodos y pruebas', h: 2.5, kind: 'lab' },
      { id: 't5a', t: 'T5 · Vectores: declaración, recorrido y búsqueda', h: 2.5, kind: 'tema' },
      { id: 't5b', t: 'T5 · Ordenación y algoritmos clásicos sobre vectores', h: 2.5, kind: 'tema' },
      { id: 't5c', t: 'T5 · Matrices y arrays bidimensionales', h: 2, kind: 'tema' },
      { id: 't6', t: 'T6 · Cadenas: String, inmutabilidad y métodos', h: 2.5, kind: 'tema' },
      { id: 'l4', t: 'Laboratorio 4 · Procesar texto con vectores y cadenas', h: 2.5, kind: 'lab' },
      { id: 't7a', t: 'T7 · Clases y objetos: atributos y métodos', h: 2.5, kind: 'tema' },
      { id: 't7b', t: 'T7 · Constructores, this y encapsulación', h: 2.5, kind: 'tema' },
      { id: 't7c', t: 'T7 · Arrays de objetos y colaboración entre clases', h: 2.5, kind: 'tema' },
      { id: 'l5', t: 'Laboratorio 5 · Modelar un dominio pequeño con clases', h: 2.5, kind: 'lab' },
      { id: 't8a', t: 'T8 · Errores y excepciones: try, catch, finally', h: 2, kind: 'tema' },
      { id: 't8b', t: 'T8 · Ficheros de texto: leer y escribir', h: 2, kind: 'tema' },
      { id: 't9', t: 'T9 · Depuración, pruebas y estilo', h: 2, kind: 'tema' },
      { id: 'l6', t: 'Laboratorio 6 · Programa completo con ficheros', h: 2.5, kind: 'lab' },
      { id: 'c1', t: 'Caso resuelto 1 · Control de flujo y métodos', h: 2, kind: 'repaso' },
      { id: 'c2', t: 'Caso resuelto 2 · Vectores, cadenas y objetos', h: 2, kind: 'repaso' },
      { id: 'c3', t: 'Repaso final y simulacro de examen', h: 2.5, kind: 'repaso' }
    ]
  },
  ipo: { short: 'IPO', color: 'var(--plan-4)', examLabel: 'Arranca en marzo', units: [] },
  'estructura-datos': { short: 'EDA', color: 'var(--plan-5)', examLabel: 'Arranca en mayo', units: [] }
}

export function planFor(subjectId) {
  return STUDY_PLANS[subjectId] || null
}

export function hasPlan(subjectId) {
  const p = STUDY_PLANS[subjectId]
  return Boolean(p && p.units.length)
}
