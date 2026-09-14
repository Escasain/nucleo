// Conceptos clave y trampas de Álgebra y Matemática Discreta.
//
// No es un resumen del temario: es el vocabulario que bloquea. Cuando
// una asignatura «no se entiende» casi siempre es que hay cuatro
// palabras cuyo significado exacto se da por sabido y no lo está.
//
//   t  → término
//   g  → grupo (tema al que pertenece)
//   d  → qué es, en una frase que no use el propio término
//   why→ para qué sirve o dónde te lo vas a encontrar
//   x  → con qué se confunde (opcional)

export const ALGEBRA = {
  concepts: [
    // ---------- Lógica
    {
      t: 'Proposición',
      g: 'Lógica',
      d: 'Un enunciado que es verdadero o falso, sin término medio y sin depender de nada.',
      why: 'Es la pieza mínima con la que se construye todo lo demás. «7 es primo» lo es; «hace frío» no, porque no tiene un valor de verdad definido.',
      x: 'Con un predicado: «x > 3» no es una proposición hasta que dices cuánto vale x.'
    },
    {
      t: 'Predicado',
      g: 'Lógica',
      d: 'Una proposición con huecos: en cuanto rellenas las variables, se vuelve verdadera o falsa.',
      why: 'P(x): «x es par» no vale ni verdadero ni falso por sí solo. P(4) sí. Cuantificar es la otra forma de cerrar el hueco.'
    },
    {
      t: 'Cuantificador universal (∀)',
      g: 'Lógica',
      d: '«Para todo». Afirma que el predicado se cumple sin excepción en todo el conjunto.',
      why: 'La asimetría que más se usa en los exámenes: para tumbar un ∀ basta UN contraejemplo; para probarlo hay que cubrir todos los casos.'
    },
    {
      t: 'Cuantificador existencial (∃)',
      g: 'Lógica',
      d: '«Existe al menos uno». Afirma que hay algún elemento que cumple el predicado.',
      why: 'Exactamente al revés que el ∀: para probarlo basta enseñar uno; para tumbarlo hay que descartarlos todos.'
    },
    {
      t: 'Implicación (p → q)',
      g: 'Lógica',
      d: 'Solo es falsa en un caso: cuando p es verdadera y q falsa. En todos los demás es verdadera.',
      why: 'Si p es falsa, la implicación es verdadera pase lo que pase («vacuamente cierta»). Chirría, pero es la definición y hay que operar con ella.',
      x: 'Con causalidad. «p → q» no dice que p cause q, solo que no se da p sin q.'
    },
    {
      t: 'Recíproco y contrarrecíproco',
      g: 'Lógica',
      d: 'De p → q: el recíproco es q → p; el contrarrecíproco es ¬q → ¬p.',
      why: 'El contrarrecíproco SÍ es equivalente al original, y por eso se puede demostrar en su lugar cuando es más cómodo. El recíproco NO lo es.',
      x: 'Confundirlos es el error clásico: «todo cuadrado es rectángulo» no implica «todo rectángulo es cuadrado».'
    },
    {
      t: 'Tautología y contradicción',
      g: 'Lógica',
      d: 'Tautología: verdadera en toda su tabla de verdad. Contradicción: falsa en toda su tabla.',
      why: 'Probar que una equivalencia es tautología es una forma mecánica de demostrarla sin ingenio.'
    },
    {
      t: 'Modus ponens y modus tollens',
      g: 'Lógica',
      d: 'Ponens: de p → q y p, concluyes q. Tollens: de p → q y ¬q, concluyes ¬p.',
      why: 'Son las dos reglas de inferencia que vas a usar en casi toda demostración, aunque no las nombres.'
    },
    {
      t: 'Demostración por reducción al absurdo',
      g: 'Lógica',
      d: 'Supones lo contrario de lo que quieres probar y derivas una contradicción.',
      why: 'La vía estándar para «no existe…» y para irracionalidad de √2. Si lo contrario es imposible, lo tuyo es cierto.'
    },
    {
      t: 'Contraejemplo',
      g: 'Lógica',
      d: 'Un caso concreto que cumple la hipótesis y no la conclusión.',
      why: 'Es una demostración completa de que algo es falso. No hace falta explicar por qué falla en general: basta el caso.'
    },

    // ---------- Inducción
    {
      t: 'Principio de inducción',
      g: 'Inducción',
      d: 'Si algo vale para el primer caso, y de valer para n se deduce que vale para n+1, entonces vale para todos.',
      why: 'El efecto dominó: tiras la primera ficha y garantizas que cada una tira a la siguiente. Sin las dos partes no hay demostración.'
    },
    {
      t: 'Hipótesis de inducción',
      g: 'Inducción',
      d: 'Lo que supones cierto para n mientras demuestras el caso n+1.',
      why: 'Usarla NO es suponer lo que quieres probar. Lo que quieres probar es «vale para todo n»; la hipótesis solo asume un caso concreto para saltar al siguiente.',
      x: 'Con circularidad. Es la duda que bloquea a casi todo el mundo la primera vez.'
    },
    {
      t: 'Inducción fuerte',
      g: 'Inducción',
      d: 'Igual que la inducción normal, pero supones cierto para TODOS los casos hasta n, no solo para n.',
      why: 'Necesaria cuando el caso n+1 no depende del anterior sino de otros bastante más atrás: factorización en primos, Fibonacci, recursiones que parten el problema por la mitad.'
    },
    {
      t: 'Definición recursiva',
      g: 'Inducción',
      d: 'Definir algo en términos de sí mismo, con uno o más casos base que cierran la recursión.',
      why: 'Es la cara gemela de la inducción: lo que se define por recursión se demuestra por inducción con la misma estructura.'
    },

    // ---------- Matrices y sistemas
    {
      t: 'Producto de matrices',
      g: 'Matrices',
      d: 'Cada elemento del resultado es el producto escalar de una fila de la primera por una columna de la segunda.',
      why: 'Por eso las dimensiones tienen que encajar (m×n por n×p) y por eso NO es conmutativo: AB y BA suelen ser distintas, y a veces una ni existe.'
    },
    {
      t: 'Determinante',
      g: 'Matrices',
      d: 'Un número asociado a una matriz cuadrada que vale 0 exactamente cuando la matriz no es invertible.',
      why: 'Es el interruptor que decide casi todo: si det ≠ 0 el sistema tiene solución única, hay inversa y las filas son independientes.',
      x: 'No es lineal: det(A+B) no es det(A)+det(B). Sí cumple det(AB) = det(A)·det(B).'
    },
    {
      t: 'Rango',
      g: 'Matrices',
      d: 'El número de filas (o de columnas, es el mismo) realmente independientes entre sí.',
      why: 'Mide cuánta información distinta tiene la matriz. Filas que son combinación de otras no suman rango, y por eso no aportan ecuaciones nuevas.'
    },
    {
      t: 'Independencia lineal',
      g: 'Matrices',
      d: 'Un conjunto de vectores es independiente si ninguno se puede escribir como combinación de los demás.',
      why: 'Es la idea de fondo del rango, de la base y de por qué unos sistemas tienen solución única y otros infinitas.'
    },
    {
      t: 'Eliminación gaussiana',
      g: 'Sistemas',
      d: 'Ir restando múltiplos de unas filas a otras hasta dejar la matriz escalonada, con ceros bajo la diagonal.',
      why: 'Es el método universal: resuelve el sistema, y de paso te da el rango (filas no nulas que quedan) y el determinante.'
    },
    {
      t: 'Teorema de Rouché-Frobenius',
      g: 'Sistemas',
      d: 'Compara el rango de la matriz de coeficientes con el de la ampliada y con el número de incógnitas.',
      why: 'Resuelve la clasificación de un tirón: rangos distintos → incompatible; iguales y = nº incógnitas → única; iguales y < nº incógnitas → infinitas.'
    },
    {
      t: 'Sistema compatible indeterminado',
      g: 'Sistemas',
      d: 'Tiene infinitas soluciones porque sobran incógnitas respecto a la información independiente disponible.',
      why: 'Las soluciones se escriben con parámetros. El número de parámetros es incógnitas menos rango: eso es el «grado de libertad».'
    },

    // ---------- Programación lineal
    {
      t: 'Región factible',
      g: 'Programación lineal',
      d: 'El conjunto de puntos que cumplen todas las restricciones a la vez.',
      why: 'Con restricciones lineales siempre es un polígono (o poliedro) convexo, y eso es lo que hace que el problema sea fácil.'
    },
    {
      t: 'El óptimo está en un vértice',
      g: 'Programación lineal',
      d: 'Si el problema tiene solución, hay al menos un vértice de la región factible donde se alcanza.',
      why: 'Es la razón de ser de todo el tema: convierte un problema con infinitos puntos en revisar una lista finita de esquinas.'
    },
    {
      t: 'Método simplex',
      g: 'Programación lineal',
      d: 'Recorrer vértices vecinos, saltando siempre al que mejora la función objetivo, hasta que ninguno mejora.',
      why: 'Es la versión sistemática de lo anterior, para cuando hay demasiadas variables para dibujar la región.'
    },
    {
      t: 'Restricción saturada (activa)',
      g: 'Programación lineal',
      d: 'Una restricción que en el punto óptimo se cumple con igualdad, no con holgura.',
      why: 'Te dice qué recurso es el cuello de botella. Las que sobran no limitan y podrías relajarlas sin ganar nada.'
    },

    // ---------- Aritmética modular
    {
      t: 'Máximo común divisor y algoritmo de Euclides',
      g: 'Aritmética',
      d: 'El mayor número que divide a ambos. Euclides lo encuentra restando (o tomando restos) repetidamente.',
      why: 'Es la operación más rentable del tema: de ella salen el inverso modular, Bézout y la criptografía.'
    },
    {
      t: 'Identidad de Bézout',
      g: 'Aritmética',
      d: 'Existen enteros x e y tales que ax + by = mcd(a, b).',
      why: 'El algoritmo de Euclides extendido te da esos x e y, y con ellos el inverso modular. Sin esto, RSA no se puede calcular.'
    },
    {
      t: 'Congruencia (a ≡ b mod m)',
      g: 'Aritmética',
      d: 'a y b dejan el mismo resto al dividir entre m; o dicho de otro modo, m divide a a − b.',
      why: 'Permite trabajar con «las horas de un reloj»: sumar, restar y multiplicar sin salir del rango 0…m−1.',
      x: 'Dividir los dos lados de una congruencia NO siempre vale: 6 ≡ 2 (mod 4) pero 3 ≢ 1 (mod 4).'
    },
    {
      t: 'Inverso modular',
      g: 'Aritmética',
      d: 'El número a⁻¹ tal que a · a⁻¹ ≡ 1 (mod m).',
      why: 'Es lo que sustituye a la división en aritmética modular. Existe solo si mcd(a, m) = 1; si no, no hay inverso y punto.'
    },
    {
      t: 'Pequeño teorema de Fermat',
      g: 'Aritmética',
      d: 'Si p es primo y a no es múltiplo de p, entonces a^(p−1) ≡ 1 (mod p).',
      why: 'Reduce potencias enormes a exponentes pequeños. Es lo que hace que elevar a 65537 en RSA sea viable.'
    },
    {
      t: 'Función φ de Euler',
      g: 'Aritmética',
      d: 'Cuántos números del 1 al n son primos con n.',
      why: 'Generaliza Fermat a módulos no primos: a^φ(n) ≡ 1 (mod n). Es la pieza que hace funcionar RSA con n = p·q.'
    },

    // ---------- Conjuntos y funciones
    {
      t: 'Pertenencia (∈) frente a inclusión (⊆)',
      g: 'Conjuntos',
      d: '∈ relaciona un elemento con un conjunto; ⊆ relaciona dos conjuntos.',
      why: 'Con {1, {1}} tienes que 1 ∈ A y {1} ∈ A, pero también {1} ⊆ A. Distinguirlo evita la mitad de los errores del tema.',
      x: 'Es la confusión número uno de la teoría de conjuntos, y se arrastra hasta relaciones y grafos.'
    },
    {
      t: 'Conjunto potencia',
      g: 'Conjuntos',
      d: 'El conjunto de TODOS los subconjuntos de un conjunto, incluidos el vacío y él mismo.',
      why: 'Si A tiene n elementos, su conjunto potencia tiene 2ⁿ: cada elemento entra o no entra, y eso es un bit.'
    },
    {
      t: 'Función inyectiva, sobreyectiva y biyectiva',
      g: 'Funciones',
      d: 'Inyectiva: no repite imágenes. Sobreyectiva: cubre todo el conjunto de llegada. Biyectiva: las dos.',
      why: 'Solo las biyectivas tienen inversa. Y es lo que permite comparar tamaños de conjuntos infinitos.'
    },
    {
      t: 'Relación binaria',
      g: 'Relaciones',
      d: 'Un subconjunto del producto cartesiano A × B: una lista de qué pares están relacionados.',
      why: 'Toda relación se puede escribir como matriz de ceros y unos o como grafo, y ahí es donde se vuelve manejable.'
    },
    {
      t: 'Relación de equivalencia',
      g: 'Relaciones',
      d: 'Reflexiva, simétrica y transitiva a la vez.',
      why: 'Toda relación de equivalencia parte el conjunto en clases disjuntas, y toda partición viene de una. Es lo que hay debajo de la aritmética modular.'
    },
    {
      t: 'Relación de orden parcial',
      g: 'Relaciones',
      d: 'Reflexiva, antisimétrica y transitiva.',
      why: '«Parcial» porque puede haber elementos incomparables: en la relación «divide a», ni 2 divide a 3 ni 3 divide a 2.',
      x: 'Antisimétrica no es «no simétrica»: significa que si a R b y b R a, entonces a = b.'
    },

    // ---------- Grafos
    {
      t: 'Grado de un vértice',
      g: 'Grafos',
      d: 'Cuántas aristas tocan ese vértice.',
      why: 'La suma de todos los grados es el doble del número de aristas, porque cada arista se cuenta en sus dos extremos («lema del apretón de manos»). De ahí sale que el número de vértices de grado impar siempre es par.'
    },
    {
      t: 'Matriz de adyacencia',
      g: 'Grafos',
      d: 'Una tabla n×n con un 1 cuando hay arista entre dos vértices y un 0 cuando no.',
      why: 'La potencia k-ésima de esa matriz cuenta caminos de longitud k. Es el puente entre grafos y matrices.'
    },
    {
      t: 'Camino euleriano',
      g: 'Grafos',
      d: 'Recorre todas las ARISTAS exactamente una vez.',
      why: 'Tiene criterio y es fácil: existe circuito euleriano si el grafo es conexo y todos los grados son pares; camino, si hay exactamente dos impares.',
      x: 'Con el hamiltoniano. Euleriano = aristas; hamiltoniano = vértices.'
    },
    {
      t: 'Ciclo hamiltoniano',
      g: 'Grafos',
      d: 'Pasa por todos los VÉRTICES exactamente una vez y vuelve al inicio.',
      why: 'No hay criterio simple para decidir si existe: es un problema NP-completo. Esa diferencia con el euleriano es justo lo que suele preguntarse.'
    },
    {
      t: 'Árbol',
      g: 'Grafos',
      d: 'Un grafo conexo sin ciclos.',
      why: 'Con n vértices tiene siempre exactamente n−1 aristas. Quitar una arista lo desconecta; añadir cualquiera crea exactamente un ciclo. Está al borde justo entre conexo y mínimo.'
    },
    {
      t: 'Árbol de expansión mínima',
      g: 'Grafos',
      d: 'El árbol que conecta todos los vértices del grafo con el menor peso total posible.',
      why: 'Kruskal y Prim lo construyen siendo voraces, y funciona: es uno de los pocos sitios donde la estrategia obvia es demostrablemente óptima.'
    },
    {
      t: 'Recorrido en anchura y en profundidad',
      g: 'Grafos',
      d: 'Anchura: por niveles, con una cola. Profundidad: hasta el fondo y vuelta atrás, con una pila.',
      why: 'La anchura da el camino más corto en número de aristas; la profundidad detecta ciclos y componentes. La estructura de datos es la única diferencia real entre los dos.'
    }
  ],

  pitfalls: [
    {
      t: 'Probar un ∀ con ejemplos',
      wrong: 'Comprobar que se cumple para n = 1, 2, 3 y darlo por demostrado.',
      right: 'Los ejemplos no prueban un universal, solo lo hacen plausible. Para probarlo hace falta inducción o un argumento general; para tumbarlo, en cambio, basta UN contraejemplo.'
    },
    {
      t: 'Demostrar el recíproco sin darse cuenta',
      wrong: 'Te piden p → q y acabas argumentando q → p.',
      right: 'Solo el contrarrecíproco (¬q → ¬p) es equivalente. Antes de empezar, escribe explícitamente qué supones y qué concluyes.'
    },
    {
      t: 'Creer que la inducción es circular',
      wrong: '«Estoy suponiendo lo que quiero demostrar».',
      right: 'Supones un caso concreto (n) para probar el siguiente (n+1). Lo que demuestras es el enlace entre fichas, no la afirmación global — esa la da el efecto dominó junto con el caso base.'
    },
    {
      t: 'Saltarse el caso base',
      wrong: 'Hacer un paso inductivo impecable y no comprobar n = 1.',
      right: 'Sin caso base no hay nada. Se puede «demostrar» inductivamente que todos los números son iguales si nadie tira la primera ficha.'
    },
    {
      t: 'Operar con matrices como con números',
      wrong: 'AB = BA, o (A+B)² = A² + 2AB + B².',
      right: 'El producto de matrices no conmuta, así que (A+B)² = A² + AB + BA + B². Tampoco existe «dividir»: hay inversa, y solo si det ≠ 0.'
    },
    {
      t: 'Dividir los dos lados de una congruencia',
      wrong: 'De 6 ≡ 2 (mod 4) deducir 3 ≡ 1 (mod 4).',
      right: 'Es falso. Dividir solo vale si el factor es primo con el módulo; si no, hay que dividir también el módulo por el mcd.'
    },
    {
      t: 'Dar por hecho que el inverso modular existe',
      wrong: 'Buscar a⁻¹ mod m sin comprobar nada.',
      right: 'Solo existe si mcd(a, m) = 1. Comprobarlo primero con Euclides ahorra páginas de cuentas que no llevan a ningún sitio.'
    },
    {
      t: 'Mezclar ∈ y ⊆',
      wrong: 'Escribir {1} ∈ {1, 2} o 1 ⊆ {1, 2}.',
      right: '1 ∈ {1,2} y {1} ⊆ {1,2}. Un elemento pertenece; un conjunto se incluye. Con conjuntos de conjuntos hay que ir despacio.'
    },
    {
      t: 'Confundir antisimétrica con no simétrica',
      wrong: 'Descartar una relación de orden porque «hay pares en los dos sentidos».',
      right: 'Antisimétrica permite a R b y b R a: exige que entonces a = b. La igualdad es a la vez simétrica y antisimétrica.'
    },
    {
      t: 'Euleriano y hamiltoniano',
      wrong: 'Aplicar el criterio de los grados pares para decidir si hay ciclo hamiltoniano.',
      right: 'Ese criterio es solo para el euleriano (aristas). Para el hamiltoniano (vértices) no hay criterio simple: es NP-completo.'
    },
    {
      t: 'Contar mal las aristas de un árbol',
      wrong: 'Suponer que un árbol con n vértices tiene n aristas.',
      right: 'Tiene n−1. Comprobarlo es la forma más rápida de detectar que te has dejado un ciclo o has desconectado algo.'
    },
    {
      t: 'Clasificar un sistema por el número de ecuaciones',
      wrong: '«Tres ecuaciones y tres incógnitas, luego solución única».',
      right: 'Lo que decide es el rango, no el número de filas. Tres ecuaciones donde una es suma de las otras dos aportan rango 2 y dejan infinitas soluciones.'
    }
  ]
}
