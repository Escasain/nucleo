// ============================================================
// Mapa de Tecnología de Computadores
// ------------------------------------------------------------
// Esta asignatura es la más acumulativa de las dos: cada tema es
// literalmente el anterior puesto a trabajar. Un secuencial es un
// combinacional realimentado, una RAM es una rejilla de biestables y
// el procesador es todo lo anterior junto. Por eso el mapa importa
// aquí más que en ninguna otra: lo que no se entiende casi nunca está
// donde te has atascado.
//
// Mismas claves que en Álgebra: units, g, needs y why.
// ============================================================
export const TEC_COMP_MAP = [
  {
    id: 'numeracion',
    t: 'Numeración',
    g: 'Numeración',
    units: ['b1', 't1a', 't1b', 't1c', 't1d'],
    needs: [],
    gist: 'Los mismos números escritos en otra base, y cómo caben en un número fijo de bits. De aquí salen el complemento a dos y el IEEE 754.'
  },
  {
    id: 'boole',
    t: 'Boole y Karnaugh',
    g: 'Boole',
    units: ['b2', 't2a', 't2b', 't3a', 't3b'],
    needs: [],
    gist: 'El álgebra de los ceros y unos, y cómo escribir una función lógica con las menos puertas posibles. El mapa de Karnaugh no es otro método: es absorción hecha visible.'
  },
  {
    id: 'combinacionales',
    t: 'Combinacionales',
    g: 'Combinacionales',
    units: ['l1', 't4a', 't4b', 't4c', 'l2'],
    needs: ['boole', 'numeracion'],
    why: {
      boole:
        'Un multiplexor o un comparador no son más que funciones lógicas con nombre propio. Si no simplificas, diseñas circuitos con el triple de puertas y no ves por qué el del libro es más corto.',
      numeracion:
        'El sumador de n bits suma en binario, y el restador resta sumando el complemento a dos. Sin tener eso automatizado, el circuito se queda en una caja negra que copias.'
    },
    gist: 'Bloques cuya salida depende solo de las entradas de ahora: decodificadores, multiplexores, sumadores y la ALU.'
  },
  {
    id: 'secuenciales',
    t: 'Secuenciales',
    g: 'Secuenciales',
    units: ['t5a', 't5b', 't5c', 'l3', 'l4'],
    needs: ['combinacionales'],
    why: {
      combinacionales:
        'Un circuito secuencial es lógica combinacional más memoria realimentada: la parte que calcula el estado siguiente es exactamente un combinacional. Diseñar un contador es rellenar una tabla y simplificar D₀, D₁ y D₂.'
    },
    gist: 'Circuitos con memoria: la salida depende también de dónde estabas. Biestables, registros, contadores y máquinas de estados.'
  },
  {
    id: 'tecnologia',
    t: 'Tecnología',
    units: ['t8a', 't8b', 'l5'],
    needs: ['combinacionales'],
    why: {
      combinacionales:
        'Los niveles lógicos, los retardos y el fan-out son las condiciones reales bajo las que funciona el circuito que has diseñado sobre el papel. Y una FPGA es, por dentro, tablas de verdad programables.'
    },
    gist: 'De qué está hecha realmente una puerta, y cómo se programa hardware en lugar de fabricarlo.'
  },
  {
    id: 'memoria',
    t: 'Memoria',
    g: 'Memoria',
    units: ['t6a', 't6b'],
    needs: ['secuenciales'],
    why: {
      secuenciales:
        'Una celda de RAM es un biestable, y lo que elige en cuál de todas escribes es un decodificador. La memoria es este tema y el anterior puestos en rejilla.'
    },
    gist: 'Organización, direccionamiento y expansión. Con n líneas de dirección hay 2ⁿ posiciones, no n.'
  },
  {
    id: 'arquitectura',
    t: 'Arquitectura',
    g: 'Arquitectura',
    units: ['t7a', 't7b'],
    needs: ['combinacionales', 'secuenciales', 'memoria'],
    why: {
      combinacionales: 'La ALU del procesador es el combinacional que montaste en el laboratorio 2, sin más.',
      secuenciales:
        'La unidad de control es una máquina de estados: cada estado activa unas señales y decide cuál viene después.',
      memoria:
        'El ciclo de instrucción es un ida y vuelta con la memoria — buscar, decodificar, ejecutar, escribir — y el contador de programa dice por dónde va.'
    },
    gist: 'Cómo se juntan ALU, registros, memoria y control para ejecutar instrucciones una detrás de otra.'
  }
]
