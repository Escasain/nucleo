// Plan de estudios — Bachelor en Ingeniería Informática (UNIPRO)
// Bloques bimestrales: septiembre, noviembre, marzo, mayo.

export const BLOCKS = {
  sep: { id: 'sep', label: 'Septiembre', month: 8, color: 'var(--block-sep)' },
  nov: { id: 'nov', label: 'Noviembre', month: 10, color: 'var(--block-nov)' },
  mar: { id: 'mar', label: 'Marzo', month: 2, color: 'var(--block-mar)' },
  may: { id: 'may', label: 'Mayo', month: 4, color: 'var(--block-may)' }
}

// Créditos: todas 6 ECTS salvo Deontología y Comunicación (3) y el TFB (12).
export const TOTAL_ECTS = 180
export function ectsOf(subject) {
  return subject.ects ?? 6
}

// status inicial por defecto: 'pendiente'. Estados posibles:
// 'pendiente' | 'matriculada' | 'cursando' | 'aprobada' | 'suspensa' | 'reconocida'
export const CURRICULUM = [
  // ---------- AÑO 1 ----------
  { id: 'algebra', year: 1, block: 'sep', name: 'Álgebra y Matemática Discreta' },
  { id: 'fisica', year: 1, block: 'sep', name: 'Fundamentos Físicos de la Informática' },
  { id: 'tec-comp', year: 1, block: 'nov', name: 'Tecnología de Computadores' },
  {
    id: 'fund-prog', year: 1, block: 'nov', name: 'Fundamentos de Programación',
    keyFor: 'prog-avanzada', note: 'Llave de «Programación Avanzada»'
  },
  { id: 'fund-empresa', year: 1, block: 'nov', name: 'Fundamentos de Empresa', english: true },
  { id: 'calculo', year: 1, block: 'mar', name: 'Cálculo y Métodos Numéricos' },
  { id: 'estadistica', year: 1, block: 'mar', name: 'Estadística' },
  { id: 'ipo', year: 1, block: 'mar', name: 'Interacción Persona-Ordenador' },
  { id: 'algoritmia', year: 1, block: 'may', name: 'Algoritmia y Complejidad' },
  { id: 'estructura-datos', year: 1, block: 'may', name: 'Estructura de Datos (Java)' },

  // ---------- AÑO 2 ----------
  { id: 'deontologia', year: 2, block: 'sep', name: 'Deontología y Legislación', english: true, ects: 3 },
  {
    id: 'so1', year: 2, block: 'sep', name: 'Sistemas Operativos I',
    keyFor: 'so-avanzados', note: 'Llave de «Sistemas Operativos Avanzados»'
  },
  { id: 'redes', year: 2, block: 'sep', name: 'Redes de Ordenadores' },
  { id: 'comunicacion', year: 2, block: 'nov', name: 'Comunicación y Liderazgo', english: true, ects: 3 },
  { id: 'ing-software', year: 2, block: 'nov', name: 'Ingeniería de Software' },
  {
    id: 'so-avanzados', year: 2, block: 'nov', name: 'Sistemas Operativos Avanzados',
    requiresKey: 'so1'
  },
  {
    id: 'bbdd', year: 2, block: 'mar', name: 'Bases de Datos',
    keyFor: 'bbdd-avanzadas', note: 'Llave de «Bases de Datos Avanzadas»'
  },
  { id: 'gestion-proyectos', year: 2, block: 'mar', name: 'Gestión de Proyectos' },
  {
    id: 'prog-avanzada', year: 2, block: 'mar', name: 'Programación Avanzada',
    requiresKey: 'fund-prog'
  },
  { id: 'estructura-comp', year: 2, block: 'may', name: 'Estructura de Computadores' },
  { id: 'ia', year: 2, block: 'may', name: 'Inteligencia Artificial e Ingeniería del Conocimiento' },

  // ---------- AÑO 3 ----------
  { id: 'apps-red', year: 3, block: 'sep', name: 'Desarrollo de Aplicaciones en Red' },
  { id: 'ing-requisitos', year: 3, block: 'sep', name: 'Ingeniería de Requisitos' },
  { id: 'seguridad', year: 3, block: 'sep', name: 'Seguridad de los Sistemas de Información' },
  {
    id: 'bbdd-avanzadas', year: 3, block: 'nov', name: 'Bases de Datos Avanzadas',
    requiresKey: 'bbdd'
  },
  { id: 'algoritmos-avanzados', year: 3, block: 'nov', name: 'Diseño Avanzado de Algoritmos' },
  { id: 'procesos-sw', year: 3, block: 'mar', name: 'Procesos de Ingeniería del Software' },
  {
    id: 'optativa1', year: 3, block: 'mar', name: 'Optativa I: Informática Gráfica y Visualización',
    optional: true
  },
  {
    id: 'optativa2', year: 3, block: 'mar', name: 'Optativa II: Aprendizaje Automático y Minería de Datos',
    optional: true
  },
  { id: 'tfb', year: 3, block: 'mar', name: 'Trabajo de Fin de Bachelor', semestral: true, ects: 12 }
]

// Estado inicial del expediente de Carlos — curso 2026/27 (año académico 1)
export const INITIAL_SUBJECT_STATE = {
  'algebra': { status: 'cursando', enrolledCourse: '2026-27' },
  'tec-comp': { status: 'cursando', enrolledCourse: '2026-27' },
  'fund-prog': { status: 'matriculada', enrolledCourse: '2026-27' },
  'ipo': { status: 'matriculada', enrolledCourse: '2026-27' },
  'estructura-datos': { status: 'matriculada', enrolledCourse: '2026-27' },
  'fund-empresa': { status: 'reconocida' }
}

export const STATUS_META = {
  pendiente: { label: 'Pendiente', color: 'var(--st-pendiente)' },
  matriculada: { label: 'Matriculada', color: 'var(--st-matriculada)' },
  cursando: { label: 'Cursando', color: 'var(--st-cursando)' },
  aprobada: { label: 'Aprobada', color: 'var(--st-aprobada)' },
  suspensa: { label: 'Suspensa', color: 'var(--st-suspensa)' },
  reconocida: { label: 'Reconocida', color: 'var(--st-reconocida)' }
}

export function subjectById(id) {
  return CURRICULUM.find((s) => s.id === id)
}

// Fecha aproximada de inicio de un bloque para un año académico dado
// (año académico 1 = 2026/27). sep/nov caen en el año natural de inicio,
// mar/may en el siguiente.
export function blockStartDate(academicYear, blockId) {
  const b = BLOCKS[blockId]
  const startYear = 2026 + (academicYear - 1)
  const year = b.month >= 8 ? startYear : startYear + 1
  return new Date(year, b.month, 1)
}

// Curso académico (etiqueta «2026/27») al que pertenece una fecha.
// Empieza en septiembre.
export function academicYearOf(date = new Date()) {
  const y = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1
  return { start: y, label: `${y}/${String(y + 1).slice(-2)}` }
}

// Año del plan (1, 2 o 3) que cursa el alumno en una fecha, contando
// desde el curso 2026/27. Fuera de rango devuelve null.
export function planYearOf(date = new Date()) {
  const n = academicYearOf(date).start - 2026 + 1
  return n >= 1 && n <= 3 ? n : null
}

// Bloque bimestral en curso para una fecha (aproximado: sep–oct,
// nov–dic, mar–abr, may–jun). Entre bloques devuelve el siguiente con
// upcoming=true.
const BLOCK_ORDER = ['sep', 'nov', 'mar', 'may']
export function blockOf(date = new Date()) {
  const { start } = academicYearOf(date)
  const ranges = [
    { id: 'sep', from: new Date(start, 8, 1), to: new Date(start, 10, 0) },
    { id: 'nov', from: new Date(start, 10, 1), to: new Date(start + 1, 0, 0) },
    { id: 'mar', from: new Date(start + 1, 2, 1), to: new Date(start + 1, 4, 0) },
    { id: 'may', from: new Date(start + 1, 4, 1), to: new Date(start + 1, 6, 0) }
  ]
  const current = ranges.find((r) => date >= r.from && date <= r.to)
  if (current) return { ...BLOCKS[current.id], from: current.from, to: current.to, upcoming: false }
  const next = ranges.find((r) => date < r.from) || { ...ranges[0], from: new Date(start + 1, 8, 1), to: new Date(start + 1, 10, 0) }
  return { ...BLOCKS[next.id], from: next.from, to: next.to, upcoming: true }
}
export function blockRanges(startYear) {
  return BLOCK_ORDER.map((id) => {
    const r = {
      sep: [new Date(startYear, 8, 1), new Date(startYear, 10, 0)],
      nov: [new Date(startYear, 10, 1), new Date(startYear + 1, 0, 0)],
      mar: [new Date(startYear + 1, 2, 1), new Date(startYear + 1, 4, 0)],
      may: [new Date(startYear + 1, 4, 1), new Date(startYear + 1, 6, 0)]
    }[id]
    return { ...BLOCKS[id], from: r[0], to: r[1] }
  })
}
