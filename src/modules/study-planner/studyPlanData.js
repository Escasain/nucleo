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
  // Estructura inventada para que la asignatura entre en el reparto.
  // Sustituye temas y horas cuando tengas el temario real; la interfaz
  // avisa de que estos datos no son definitivos.
  // ---------------------------------------------------------------
  'tec-comp': {
    short: 'TC',
    color: 'var(--plan-2)',
    start: '2026-09-15',
    examHint: '2026-11-06',
    examLabel: 'Prueba final · fecha por confirmar',
    provisional: true,
    units: [
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `tc${i + 1}`,
        t: `Tema ${i + 1} · por definir`,
        h: 3,
        kind: 'tema'
      })),
      { id: 'tcl1', t: 'Laboratorio 1', h: 2, kind: 'lab' },
      { id: 'tcl2', t: 'Laboratorio 2', h: 2, kind: 'lab' },
      { id: 'tcr', t: 'Repaso y simulacro', h: 3, kind: 'repaso' }
    ]
  },

  // ---------------------------------------------------------------
  // Sin temario todavía: aparecen en «Más adelante» hasta que lo
  // cargues. En cuanto tengan unidades entran en el calendario.
  // ---------------------------------------------------------------
  'fund-prog': { short: 'FP', color: 'var(--plan-3)', examLabel: 'Arranca en noviembre', units: [] },
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
