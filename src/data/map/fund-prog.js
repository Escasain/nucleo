// ============================================================
// Mapa de Fundamentos de Programación
// ------------------------------------------------------------
// Programar es la asignatura más acumulativa que hay: cada tema usa
// todo lo anterior sin avisar. Un bucle que no sale no suele ser un
// problema de bucles, es que los tipos no están claros; un método que
// «no devuelve lo que debería» casi nunca es el método.
//
// Por eso aquí las flechas importan más que en ninguna otra: el error
// se manifiesta arriba y vive abajo.
// ============================================================
export const FUND_PROG_MAP = [
  {
    id: 'bases',
    t: 'Bases',
    g: 'Bases',
    units: ['b1', 't1a', 't1b'],
    needs: [],
    gist: 'Qué es un algoritmo, qué hace el compilador y qué hace la JVM, y por dónde empieza un programa. Poco código y mucho de saber dónde mirar cuando algo falla.'
  },
  {
    id: 'tipos',
    t: 'Tipos',
    g: 'Tipos',
    units: ['t2a', 't2b', 't2c', 'l1'],
    needs: ['bases'],
    why: {
      bases:
        'Saber si un error es de compilación o de ejecución es lo que te dice si el problema está en el tipo que escribiste o en el valor que llegó. Sin esa distinción, los errores de tipos se depuran a ciegas.'
    },
    gist: 'Qué puede guardar cada variable y qué pasa al mezclarlas. La división entera y el casting que trunca salen de aquí, y se pagan durante todo el curso.'
  },
  {
    id: 'control',
    t: 'Control',
    g: 'Control',
    units: ['t3a', 't3b', 't3c', 'l2'],
    needs: ['tipos'],
    why: {
      tipos:
        'La condición de un if o de un while es una expresión booleana, y se construye con los operadores del tema anterior. Un bucle que no termina suele ser una condición mal montada, no un problema de bucles.'
    },
    gist: 'Decidir y repetir: condicionales, bucles y cuándo usar cada uno. Aquí es donde un programa deja de ser una lista de instrucciones.'
  },
  {
    id: 'metodos',
    t: 'Métodos',
    g: 'Métodos',
    units: ['t4a', 't4b', 't4c', 'l3'],
    needs: ['control'],
    why: {
      control:
        'Un método encapsula un trozo de lógica, y esa lógica son condicionales y bucles. Y la recursividad es un bucle disfrazado: el caso base hace de condición de parada, así que si no tienes claro cuándo para un while, tampoco verás cuándo parar una recursión.'
    },
    gist: 'Partir el programa en piezas con nombre. El paso por valor y el ámbito viven aquí, y son la mitad de los «no me cambia la variable».'
  },
  {
    id: 'vectores',
    t: 'Vectores',
    g: 'Vectores',
    units: ['t5a', 't5b', 't5c'],
    needs: ['control'],
    why: {
      control:
        'Un array no se usa sin un bucle: recorrerlo, buscar en él y ordenarlo son tres bucles con distinta condición. El error por uno — usar <= en vez de < — es un error de condición de bucle que se manifiesta como una excepción de índice.'
    },
    gist: 'Guardar muchos valores del mismo tipo y recorrerlos. Tamaño fijo, índices desde cero, y de ahí la excepción más habitual del tema.'
  },
  {
    id: 'cadenas',
    t: 'Cadenas',
    g: 'Cadenas',
    units: ['t6', 'l4'],
    needs: ['vectores'],
    why: {
      vectores:
        'Una cadena es una secuencia indexada, igual que un array: charAt es el equivalente de v[i] y los índices también empiezan en 0. La diferencia que hay que tener clara es que el array se puede modificar y la cadena no.'
    },
    gist: 'Texto. Inmutabilidad y equals frente a == son los dos conceptos que hay que tener automatizados; el resto es consultar la biblioteca.'
  },
  {
    id: 'objetos',
    t: 'Objetos',
    g: 'Objetos',
    units: ['t7a', 't7b', 't7c', 'l5'],
    needs: ['metodos'],
    why: {
      metodos:
        'Un objeto es estado más métodos que operan sobre ese estado, así que un método de instancia es el método del tema anterior con acceso a los atributos. Y el constructor es un método con reglas especiales: si no tienes claro qué es un parámetro, this.nombre = nombre no se entiende.'
    },
    gist: 'Juntar datos y comportamiento en una misma pieza. Es la puerta a Programación Avanzada y a Estructura de Datos, así que conviene que quede bien.'
  },
  {
    id: 'excepciones',
    t: 'Excepciones',
    g: 'Excepciones',
    units: ['t8a', 't8b', 't9', 'l6'],
    needs: ['control', 'metodos'],
    why: {
      control:
        'Una excepción es un salto en el flujo: interrumpe el bloque donde salta y se lleva por delante las líneas que quedaban. Si no ves el flujo normal, no vas a ver el interrumpido.',
      metodos:
        'La excepción sube por la pila de llamadas hasta que alguien la atiende. Para entender por qué un fallo en lo hondo aparece en main hay que tener clara la cadena de llamadas.'
    },
    gist: 'Qué hacer cuando algo va mal en ejecución, cómo leer y escribir ficheros, y cómo depurar. La parte que separa un programa que funciona de uno que además aguanta.'
  }
]
