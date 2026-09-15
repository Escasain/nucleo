// ============================================================
// Mapa de Álgebra y Matemática Discreta
// ------------------------------------------------------------
// Qué tema se apoya en cuál, y sobre todo POR QUÉ. La flecha sola no
// enseña nada: lo que enseña es la frase que la acompaña, porque casi
// siempre un tema «que no se entiende» es un tema anterior que se dio
// por sabido.
//
//   units → unidades del planificador (studyPlanData.js)
//   g     → tema de los problemas y los conceptos, si lo tiene
//   needs → temas de los que depende
//   why   → qué aporta cada dependencia, una por una
// ============================================================
export const ALGEBRA_MAP = [
  {
    id: 'logica',
    t: 'Lógica',
    g: 'Lógica',
    units: ['t1a', 't1b', 't1c'],
    needs: [],
    gist: 'El idioma en el que está escrito todo lo demás: proposiciones, cuantificadores y qué significa exactamente que algo esté demostrado.'
  },
  {
    id: 'matrices',
    t: 'Matrices',
    g: 'Matrices',
    units: ['b2', 't3a', 't3b'],
    needs: [],
    gist: 'Una tabla con operaciones propias. El producto no conmuta, y buena parte de los errores del tema salen de olvidarlo.'
  },
  {
    id: 'conjuntos',
    t: 'Conjuntos',
    g: 'Conjuntos',
    units: ['b1', 't7'],
    needs: ['logica'],
    why: {
      logica:
        'Unión, intersección y complemento son ∨, ∧ y ¬ aplicados a «x pertenece a». Demostrar A ∩ (B ∪ C) = (A∩B) ∪ (A∩C) es demostrar una equivalencia lógica, ni más ni menos.'
    },
    gist: 'Pertenencia, inclusión y operaciones. La distinción entre ∈ y ⊆ decide media asignatura.'
  },
  {
    id: 'induccion',
    t: 'Inducción',
    g: 'Inducción',
    units: ['b3', 't2a', 't2b'],
    needs: ['logica'],
    why: {
      logica:
        'El paso inductivo es la implicación P(n) → P(n+1). Si no tienes automatizado qué se supone y qué se concluye en una implicación, el paso acaba convertido en «suponer lo que quieres demostrar».'
    },
    gist: 'Demostrar infinitos casos con dos: uno que arranca y uno que encadena.'
  },
  {
    id: 'sistemas',
    t: 'Sistemas',
    g: 'Sistemas',
    units: ['b4', 't4'],
    needs: ['matrices'],
    why: {
      matrices:
        'Gauss es operar con las filas de la matriz ampliada, y quien decide si hay una solución, ninguna o infinitas es el rango. Sin rango ni determinante, discutir un sistema es adivinar.'
    },
    gist: 'Resolver y, sobre todo, discutir: cuántas soluciones hay antes de calcular ninguna.'
  },
  {
    id: 'funciones',
    t: 'Funciones',
    g: 'Funciones',
    units: ['t7'],
    needs: ['conjuntos'],
    why: {
      conjuntos:
        'Una función es un subconjunto de A×B con una condición encima. Inyectiva y sobreyectiva son frases con cuantificadores sobre esos conjuntos: sin tener claros dominio e imagen, no se distinguen.'
    },
    gist: 'Asignar sin ambigüedad. Inyectiva, sobreyectiva y biyectiva son tres preguntas distintas.'
  },
  {
    id: 'relaciones',
    t: 'Relaciones',
    g: 'Relaciones',
    units: ['t8'],
    needs: ['conjuntos', 'matrices'],
    why: {
      conjuntos:
        'Una relación es un subconjunto de A×A. Reflexiva, simétrica y transitiva son condiciones sobre esos pares, no sobre lo que parezca el dibujo.',
      matrices:
        'La relación se representa con una matriz booleana, y componerla es multiplicarla. La transitividad se comprueba mirando M².'
    },
    gist: 'Qué pares están relacionados y qué propiedades cumple ese conjunto de pares. De ahí salen los órdenes y las equivalencias.'
  },
  {
    id: 'aritmetica',
    t: 'Aritmética',
    g: 'Aritmética',
    units: ['t6a', 't6b', 't6c'],
    needs: ['induccion'],
    why: {
      induccion:
        'Euclides es recursión pura: mcd(a, b) = mcd(b, a mod b). Que eso termine y dé el resultado correcto se demuestra por inducción, y de ahí sale también el teorema de Fermat.'
    },
    gist: 'Divisibilidad, mcd y congruencias. El módulo no es un resto: es una forma de identificar números entre sí.'
  },
  {
    id: 'lineal',
    t: 'Programación lineal',
    g: 'Programación lineal',
    units: ['b5', 't5a', 't5b'],
    needs: ['sistemas'],
    why: {
      sistemas:
        'Cada iteración del simplex es una eliminación gaussiana; lo único que añade es el criterio para elegir el pivote. Si Gauss te cuesta, el simplex se vuelve mecánica sin sentido.'
    },
    gist: 'Maximizar con restricciones. El óptimo está siempre en un vértice, y eso es justo lo que hace que el método funcione.'
  },
  {
    id: 'grafos',
    t: 'Grafos',
    g: 'Grafos',
    units: ['t9a', 't9b', 't10'],
    needs: ['relaciones'],
    why: {
      relaciones:
        'Un grafo no dirigido es una relación simétrica, y su matriz de adyacencia es la matriz de la relación. Los caminos de longitud k salen de Aᵏ: es el mismo producto del tema anterior.'
    },
    gist: 'Vértices y aristas. Buena parte del tema se decide contando grados.'
  }
]
