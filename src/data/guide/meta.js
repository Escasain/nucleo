// Metadatos ligeros de la guía de estudio (sin el contenido pesado por
// asignatura, que vive en index.js y se carga bajo demanda).

export const RESOURCE_TYPES = {
  teoria: { label: 'Teoría', group: 'aprender' },
  curso: { label: 'Curso', group: 'aprender' },
  video: { label: 'Vídeo', group: 'aprender' },
  libro: { label: 'Libro', group: 'aprender' },
  practica: { label: 'Práctica', group: 'practicar' },
  herramienta: { label: 'Herramienta', group: 'practicar' }
}

export const RESOURCE_GROUPS = [
  { id: 'aprender', label: 'Para aprender' },
  { id: 'practicar', label: 'Para practicar' }
]

// Cómo evalúa UNIPRO (fuente: universidadunipro.com, Bachelor en
// Ingeniería Informática). Vale para todas las asignaturas.
export const UNIPRO_EVALUATION = {
  continuous: 70,
  final: 30,
  summary:
    'Evaluación continua (70 %): test, actividades prácticas con corrección personalizada y foros a lo largo del bimestre. Prueba de validación final (30 %): examen online en directo de aproximadamente 1 hora.',
  method:
    'Contenidos escritos, recursos audiovisuales, videoclases, ejercicios de entrenamiento y casos prácticos resueltos, con tutor personal.'
}

// Kit general del estudiante: lo que sirve para todas las asignaturas.
export const STUDENT_KIT = [
  {
    title: 'GitHub Student Developer Pack',
    url: 'https://education.github.com/pack',
    note: 'Con tu correo de universidad: GitHub Pro, JetBrains, créditos de nube y decenas de herramientas gratis. Pídelo la primera semana.'
  },
  {
    title: 'JetBrains · licencias gratuitas para estudiantes',
    url: 'https://www.jetbrains.com/community/education/',
    note: 'IntelliJ IDEA Ultimate, PyCharm Professional, DataGrip… gratis mientras estudies.'
  },
  {
    title: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/',
    note: 'Editor universal: Java, Python, C, web, LaTeX, Markdown. Ligero y gratuito.'
  },
  {
    title: 'Git',
    url: 'https://git-scm.com/book/es/v2',
    note: 'Control de versiones desde el día 1 para cada asignatura. Un repositorio por asignatura es un hábito que te salva.'
  },
  {
    title: 'Google Colab',
    url: 'https://colab.research.google.com/',
    note: 'Python científico en el navegador para matemáticas, estadística, IA y datos. Sin instalar nada.'
  },
  {
    title: 'Anki',
    url: 'https://apps.ankiweb.net/',
    note: 'Repaso espaciado como las flashcards de NÚCLEO, pero con app de móvil e imágenes. Úsalo si te quedas corto aquí.'
  },
  {
    title: 'Obsidian',
    url: 'https://obsidian.md/',
    note: 'Apuntes en Markdown enlazados entre sí, con LaTeX para fórmulas. Los ficheros son tuyos.'
  },
  {
    title: 'Zotero',
    url: 'https://www.zotero.org/',
    note: 'Gestor de referencias para todo lo que leas. En el TFB te alegrarás de haber empezado en primero.'
  },
  {
    title: 'DevDocs',
    url: 'https://devdocs.io/',
    note: 'Toda la documentación de lenguajes y bibliotecas en un sitio, con búsqueda instantánea y modo offline.'
  },
  {
    title: 'Stack Overflow en español',
    url: 'https://es.stackoverflow.com/',
    note: 'Para preguntar cuando te atasques. Antes, busca: casi todo está ya respondido.'
  },
  {
    title: 'roadmap.sh',
    url: 'https://roadmap.sh/',
    note: 'Mapas de qué aprender y en qué orden para cada perfil (backend, frontend, DevOps, IA…). Para orientar las optativas y el TFB.'
  },
  {
    title: 'UNED Abierta / OCW UPM',
    url: 'https://iedra.uned.es/',
    note: 'Cursos abiertos en español de universidades públicas. Buen complemento cuando el material de UNIPRO se te quede corto.'
  }
]
