// Problemas de Álgebra y Matemática Discreta.
//
// Ni tarjetas ni resumen: problemas para resolver con papel antes de
// mirar nada. Cada uno trae una pista que empuja sin resolver, y una
// solución razonada paso a paso — porque la solución sin el camino no
// enseña nada.
//
//   g     → tema
//   level → 1 básico · 2 medio · 3 nivel de examen
//   q     → enunciado
//   hint  → pista (no da la respuesta)
//   a     → solución razonada
//   key   → respuesta corta, para autocorregirte de un vistazo

export const ALGEBRA_PRACTICE = [
  // ---------- Lógica
  {
    id: 'log1',
    g: 'Lógica',
    level: 1,
    q: 'Demuestra con tablas de verdad que p → q es equivalente a ¬p ∨ q.',
    hint: 'Solo hay cuatro combinaciones de p y q. Construye las dos columnas y compáralas fila a fila.',
    a: `p=V, q=V → p→q es V; ¬p∨q = F∨V = V.
p=V, q=F → p→q es F; ¬p∨q = F∨F = F.
p=F, q=V → p→q es V; ¬p∨q = V∨V = V.
p=F, q=F → p→q es V; ¬p∨q = V∨F = V.

Las dos columnas coinciden en las cuatro filas, luego son equivalentes. De paso se ve por qué la implicación con antecedente falso es verdadera: con p falsa, ¬p ya es verdadera y el OR se cumple solo.`,
    key: 'Coinciden en las 4 filas'
  },
  {
    id: 'log2',
    g: 'Lógica',
    level: 2,
    q: 'Niega la proposición ∀x ∃y : P(x, y). Deja la negación pegada al predicado.',
    hint: 'Al pasar la negación por un cuantificador, este cambia de tipo. Hazlo de uno en uno.',
    a: `¬(∀x ∃y P(x,y))
 ≡ ∃x ¬(∃y P(x,y))      (el ∀ negado se vuelve ∃)
 ≡ ∃x ∀y ¬P(x,y)        (el ∃ negado se vuelve ∀)

En palabras: si NO es cierto que todo x tenga algún y que cumpla P, entonces existe algún x para el que NINGÚN y lo cumple.`,
    key: '∃x ∀y ¬P(x, y)'
  },
  {
    id: 'log3',
    g: 'Lógica',
    level: 2,
    q: 'Demuestra que si n² es par, entonces n es par.',
    hint: 'De frente es incómodo. ¿Qué pasa si lo intentas por el contrarrecíproco?',
    a: `Por contrarrecíproco: basta probar que si n es impar, entonces n² es impar.

Sea n impar: n = 2k+1 para algún entero k.
n² = (2k+1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1

Eso es 2·(entero) + 1, luego n² es impar.

Como el contrarrecíproco es equivalente al enunciado original, queda demostrado. Intentarlo directo («n² = 2m, luego n = √(2m)…») no lleva a ningún sitio: ahí es donde se atasca todo el mundo.`,
    key: 'Contrarrecíproco: n impar ⇒ n² impar'
  },
  {
    id: 'log4',
    g: 'Lógica',
    level: 2,
    q: 'Decide si es cierto: «para todo entero n ≥ 0, n² + n + 41 es primo».',
    hint: 'Compruébalo para n = 0, 1, 2, 3… Funciona sospechosamente bien. ¿Hay algún n que rompa la estructura?',
    a: `Es FALSO. Para n = 40:

40² + 40 + 41 = 41·40 + 41 = 41·41 = 1681

que es 41², no primo.

Es el ejemplo clásico de por qué comprobar casos no demuestra un universal: la fórmula da primos para n = 0 hasta 39 seguidos, y aun así el enunciado es falso. Un solo contraejemplo lo tumba entero.`,
    key: 'Falso: n = 40 da 41²'
  },

  // ---------- Inducción
  {
    id: 'ind1',
    g: 'Inducción',
    level: 1,
    q: 'Demuestra por inducción que 1 + 2 + … + n = n(n+1)/2 para todo n ≥ 1.',
    hint: 'Caso base n = 1. En el paso, parte de la suma hasta n+1 y separa el último sumando.',
    a: `Caso base (n = 1): la suma es 1, y la fórmula da 1·2/2 = 1. ✓

Paso inductivo: supongamos cierto para n, es decir 1+…+n = n(n+1)/2.
Entonces

1 + … + n + (n+1) = n(n+1)/2 + (n+1)
                  = (n+1)·(n/2 + 1)
                  = (n+1)(n+2)/2

que es justo la fórmula para n+1. ✓

Por el principio de inducción, vale para todo n ≥ 1.`,
    key: 'Base 1=1; paso: n(n+1)/2 + (n+1) = (n+1)(n+2)/2'
  },
  {
    id: 'ind2',
    g: 'Inducción',
    level: 2,
    q: 'Demuestra que 3 divide a n³ − n para todo entero n ≥ 0.',
    hint: 'Desarrolla (n+1)³ − (n+1) y busca dentro el caso n.',
    a: `Caso base (n = 0): 0³ − 0 = 0, y 3 | 0. ✓

Paso: supongamos 3 | (n³ − n).

(n+1)³ − (n+1) = n³ + 3n² + 3n + 1 − n − 1
               = (n³ − n) + 3n² + 3n
               = (n³ − n) + 3(n² + n)

El primer sumando es múltiplo de 3 por hipótesis; el segundo lo es porque tiene factor 3. La suma de dos múltiplos de 3 es múltiplo de 3. ✓

(Sin inducción también sale: n³ − n = (n−1)·n·(n+1), tres enteros consecutivos, y entre tres consecutivos siempre hay un múltiplo de 3.)`,
    key: '(n³−n) + 3(n²+n)'
  },
  {
    id: 'ind3',
    g: 'Inducción',
    level: 3,
    q: 'Demuestra que 2ⁿ > n² para todo n ≥ 5.',
    hint: 'El caso base no es n = 1: el enunciado es falso para n = 2, 3 y 4. En el paso necesitarás que 2n + 1 < n².',
    a: `Caso base (n = 5): 2⁵ = 32 > 25 = 5². ✓

Paso: supongamos 2ⁿ > n² con n ≥ 5.

2^(n+1) = 2·2ⁿ > 2n²        (por hipótesis)

Basta ver que 2n² ≥ (n+1)², es decir 2n² ≥ n² + 2n + 1, o sea n² ≥ 2n + 1.
Para n ≥ 5: n² = n·n ≥ 5n = 2n + 3n ≥ 2n + 15 > 2n + 1. ✓

Luego 2^(n+1) > (n+1)². ✓

Lo importante del ejercicio es que el caso base no siempre es 1: aquí el enunciado falla en 2, 3 y 4, y empieza a valer en 5.`,
    key: 'Base n=5; el paso necesita n² ≥ 2n+1'
  },
  {
    id: 'ind4',
    g: 'Inducción',
    level: 3,
    q: 'Demuestra que todo entero n ≥ 2 se puede escribir como producto de números primos.',
    hint: 'Si n no es primo, se parte en dos factores más pequeños. ¿Te basta con suponerlo cierto solo para n−1?',
    a: `Aquí la inducción normal no sirve: los factores de n pueden estar muy por debajo de n−1. Hace falta inducción FUERTE.

Caso base (n = 2): 2 es primo, luego es producto de un primo. ✓

Paso (fuerte): supongamos que todo k con 2 ≤ k < n se escribe como producto de primos.

· Si n es primo, ya está.
· Si n no es primo, entonces n = a·b con 2 ≤ a, b < n. Por hipótesis fuerte, a y b son productos de primos; pegando ambas descomposiciones, n también lo es. ✓

Este es el ejemplo canónico de para qué existe la inducción fuerte.`,
    key: 'Inducción fuerte: n = a·b con a, b < n'
  },

  // ---------- Matrices y sistemas
  {
    id: 'mat1',
    g: 'Matrices',
    level: 1,
    q: 'Calcula el determinante de A = [[2, 1, 0], [1, 3, 1], [0, 1, 2]] y di si A es invertible.',
    hint: 'Desarrolla por la primera fila; el cero te ahorra un menor entero.',
    a: `Desarrollando por la primera fila:

det A = 2·det[[3,1],[1,2]] − 1·det[[1,1],[0,2]] + 0
      = 2·(3·2 − 1·1) − 1·(1·2 − 1·0)
      = 2·5 − 2
      = 8

Como det A = 8 ≠ 0, A es invertible. Y además su rango es 3 y el sistema Ax = b tiene solución única para cualquier b.`,
    key: 'det A = 8, invertible'
  },
  {
    id: 'mat2',
    g: 'Matrices',
    level: 1,
    q: 'Con A = [[1, 1], [0, 1]] y B = [[1, 0], [1, 1]], calcula AB y BA. ¿Qué concluyes?',
    hint: 'Fila por columna, con cuidado del orden.',
    a: `AB = [[1·1+1·1, 1·0+1·1], [0·1+1·1, 0·0+1·1]] = [[2, 1], [1, 1]]
BA = [[1·1+0·0, 1·1+0·1], [1·1+1·0, 1·1+1·1]] = [[1, 1], [1, 2]]

AB ≠ BA: el producto de matrices NO es conmutativo.

Consecuencia práctica que se olvida siempre: (A+B)² = A² + AB + BA + B², y no A² + 2AB + B².`,
    key: 'AB = [[2,1],[1,1]] ≠ BA = [[1,1],[1,2]]'
  },
  {
    id: 'mat3',
    g: 'Sistemas',
    level: 2,
    q: 'Halla el rango de M = [[1, 2, 3], [2, 4, 6], [1, 0, 1]] por eliminación gaussiana.',
    hint: 'Mira la segunda fila antes de ponerte a operar.',
    a: `F2 es exactamente 2·F1, así que no aporta información nueva.

F2 ← F2 − 2·F1 → (0, 0, 0)
F3 ← F3 − F1   → (0, −2, −2)

Queda:
[1,  2,  3]
[0, −2, −2]
[0,  0,  0]

Dos filas no nulas ⇒ rango(M) = 2.

La matriz es 3×3 pero su rango es 2: el número de filas no dice nada por sí solo, y por eso clasificar un sistema «por el número de ecuaciones» falla.`,
    key: 'rango = 2'
  },
  {
    id: 'mat4',
    g: 'Sistemas',
    level: 3,
    q: 'Clasifica según el parámetro a el sistema:\nx + y + z = 1\nx + a·y + z = 2\nx + y + a·z = 3',
    hint: 'Resta la primera ecuación a las otras dos: se simplifica mucho antes de calcular ningún determinante.',
    a: `E2 − E1:  (a−1)·y = 1
E3 − E1:  (a−1)·z = 2

· Si a ≠ 1: y = 1/(a−1), z = 2/(a−1), y de E1 sale x = 1 − y − z.
  Solución única → sistema compatible determinado.

· Si a = 1: las dos ecuaciones quedan 0 = 1 y 0 = 2, ambas imposibles.
  Sistema incompatible.

Así que: a ≠ 1 → compatible determinado; a = 1 → incompatible. Nunca es indeterminado.

Comprobación con Rouché para a = 1: la matriz de coeficientes tiene las tres filas iguales (rango 1), pero la ampliada tiene rango 2 por los términos independientes 1, 2, 3. Rangos distintos ⇒ incompatible. ✓`,
    key: 'a ≠ 1: determinado · a = 1: incompatible'
  },

  // ---------- Programación lineal
  {
    id: 'pl1',
    g: 'Programación lineal',
    level: 2,
    q: 'Maximiza Z = 3x + 2y sujeto a: x + y ≤ 4, x + 3y ≤ 6, x ≥ 0, y ≥ 0.',
    hint: 'Dibuja la región y calcula Z solo en los vértices. El óptimo está en uno de ellos.',
    a: `Vértices de la región factible:

(0, 0)  → Z = 0
(4, 0)  → Z = 12      (corte de x+y=4 con y=0; cumple x+3y=4 ≤ 6 ✓)
(0, 2)  → Z = 4       (corte de x+3y=6 con x=0; cumple x+y=2 ≤ 4 ✓)
(3, 1)  → Z = 11      (corte de x+y=4 con x+3y=6)

El máximo es Z = 12 en (4, 0).

Detalle que se pregunta a menudo: en el óptimo, x+y = 4 está saturada (se cumple con igualdad) y x+3y = 4 < 6 tiene holgura. La segunda restricción no limita nada ahí.`,
    key: 'Z = 12 en (4, 0)'
  },
  {
    id: 'pl2',
    g: 'Programación lineal',
    level: 2,
    q: 'En el problema anterior, ¿cuánto puede subir el coeficiente de y en Z antes de que el óptimo deje de estar en (4,0)?',
    hint: 'Compara Z(4,0) con Z(3,1) en función del coeficiente c.',
    a: `Con Z = 3x + c·y:

Z(4, 0) = 12
Z(3, 1) = 9 + c

El vértice (4,0) deja de ser el mejor cuando 9 + c > 12, es decir c > 3.

Así que mientras c ≤ 3 el óptimo sigue en (4,0); a partir de c > 3 se desplaza a (3,1). En c = 3 exactamente hay empate: toda la arista entre los dos vértices es óptima.

Esto es análisis de sensibilidad, y es lo que de verdad se usa: no basta con el óptimo, interesa cuánto aguanta antes de cambiar.`,
    key: 'c ≤ 3 (empate en c = 3)'
  },

  // ---------- Aritmética modular
  {
    id: 'ari1',
    g: 'Aritmética',
    level: 2,
    q: 'Calcula mcd(1071, 462) con el algoritmo de Euclides y exprésalo como combinación 1071x + 462y.',
    hint: 'Ve guardando cada división; luego recorre los restos hacia atrás sustituyendo.',
    a: `Euclides:
1071 = 2·462 + 147
462  = 3·147 + 21
147  = 7·21 + 0

mcd(1071, 462) = 21.

Hacia atrás (Bézout):
21 = 462 − 3·147
   = 462 − 3·(1071 − 2·462)
   = 462 − 3·1071 + 6·462
   = 7·462 − 3·1071

Luego 1071·(−3) + 462·(7) = 21. Comprobación: −3213 + 3234 = 21. ✓`,
    key: 'mcd = 21 = 1071·(−3) + 462·7'
  },
  {
    id: 'ari2',
    g: 'Aritmética',
    level: 2,
    q: 'Halla el inverso de 7 módulo 26, o justifica que no existe.',
    hint: 'Primero comprueba que puede existir. Luego Euclides extendido, o tantea múltiplos de 7 que acaben en 1 módulo 26.',
    a: `Primero: mcd(7, 26) = 1, luego el inverso existe.

Euclides extendido:
26 = 3·7 + 5
7  = 1·5 + 2
5  = 2·2 + 1

Hacia atrás:
1 = 5 − 2·2
  = 5 − 2·(7 − 5) = 3·5 − 2·7
  = 3·(26 − 3·7) − 2·7 = 3·26 − 11·7

Luego −11·7 ≡ 1 (mod 26), y −11 ≡ 15 (mod 26).

7⁻¹ ≡ 15 (mod 26). Comprobación: 7·15 = 105 = 4·26 + 1. ✓`,
    key: '7⁻¹ ≡ 15 (mod 26)'
  },
  {
    id: 'ari3',
    g: 'Aritmética',
    level: 3,
    q: 'Resuelve la congruencia 6x ≡ 4 (mod 10). ¿Cuántas soluciones distintas hay módulo 10?',
    hint: 'No dividas los dos lados por 2 sin más. Mira qué le pasa al módulo.',
    a: `d = mcd(6, 10) = 2, y 2 | 4, luego SÍ hay solución, y habrá exactamente d = 2 soluciones distintas módulo 10.

Al dividir hay que dividir también el módulo:
6x ≡ 4 (mod 10)  →  3x ≡ 2 (mod 5)

Ahora mcd(3,5)=1: 3⁻¹ ≡ 2 (mod 5) porque 3·2 = 6 ≡ 1.
x ≡ 2·2 = 4 (mod 5)

Módulo 10 eso son dos clases: x ≡ 4 y x ≡ 9.

Comprobación: 6·4 = 24 ≡ 4 ✓ · 6·9 = 54 ≡ 4 ✓

El error típico es pasar de 6x ≡ 4 (mod 10) a 3x ≡ 2 (mod 10) dejando el módulo quieto: eso pierde soluciones.`,
    key: 'x ≡ 4 y x ≡ 9 (mod 10)'
  },
  {
    id: 'ari4',
    g: 'Aritmética',
    level: 3,
    q: 'Calcula el último dígito de 7¹⁰⁰.',
    hint: 'El último dígito en decimal es el resto módulo 10. Busca el ciclo de las potencias de 7.',
    a: `Potencias de 7 módulo 10:
7¹ ≡ 7
7² = 49 ≡ 9
7³ ≡ 63 ≡ 3
7⁴ ≡ 21 ≡ 1   ← vuelve al 1

El ciclo tiene longitud 4. Como 100 = 4·25, tenemos

7¹⁰⁰ = (7⁴)²⁵ ≡ 1²⁵ = 1 (mod 10)

El último dígito es 1.

Vía Euler: φ(10) = 4 y mcd(7,10)=1, luego 7⁴ ≡ 1 directamente, sin tantear.`,
    key: '1'
  },

  // ---------- Conjuntos, funciones y relaciones
  {
    id: 'cj1',
    g: 'Conjuntos',
    level: 1,
    q: 'Sea A = {1, 2, 3, 4}. ¿Cuántos elementos tiene P(A)? ¿Cuántos subconjuntos de A tienen exactamente 2 elementos?',
    hint: 'Para el primero, piensa qué decisión tomas con cada elemento. Para el segundo, es una combinación.',
    a: `|P(A)| = 2⁴ = 16. Cada elemento entra o no entra: cuatro decisiones binarias.

Subconjuntos de tamaño 2: C(4,2) = 4!/(2!·2!) = 6.
Son {1,2}, {1,3}, {1,4}, {2,3}, {2,4}, {3,4}.

Comprobación de coherencia: 1 + 4 + 6 + 4 + 1 = 16, que es la fila 4 del triángulo de Pascal. ✓`,
    key: '|P(A)| = 16 · subconjuntos de 2: 6'
  },
  {
    id: 'cj2',
    g: 'Conjuntos',
    level: 2,
    q: 'Sea A = {1, {1}, {1,2}}. Di si son verdaderas: (a) 1 ∈ A · (b) {1} ∈ A · (c) {1} ⊆ A · (d) {1,2} ⊆ A · (e) 2 ∈ A',
    hint: '∈ mira los elementos de A tal cual están escritos; ⊆ pregunta si TODOS los elementos del de la izquierda están en A.',
    a: `Los elementos de A son tres: 1, {1} y {1,2}.

(a) 1 ∈ A → VERDADERO, 1 es uno de los tres elementos.
(b) {1} ∈ A → VERDADERO, el conjunto {1} también es elemento de A.
(c) {1} ⊆ A → VERDADERO: el único elemento de {1} es 1, y 1 ∈ A.
(d) {1,2} ⊆ A → FALSO: exigiría que 2 ∈ A, y 2 no es elemento de A (lo que sí está es el conjunto {1,2} entero).
(e) 2 ∈ A → FALSO, por lo mismo.

Que (b) y (c) sean las dos verdaderas a la vez, por razones distintas, es lo que hace que este ejercicio se falle tanto.`,
    key: 'V, V, V, F, F'
  },
  {
    id: 'cj3',
    g: 'Funciones',
    level: 2,
    q: 'Sea f: ℤ → ℤ definida por f(n) = 2n + 3. ¿Es inyectiva? ¿Sobreyectiva? ¿Y si el codominio fuera el conjunto de los impares?',
    hint: 'Inyectiva: supón f(a) = f(b) y despeja. Sobreyectiva: intenta resolver f(n) = m para un m cualquiera.',
    a: `Inyectiva: si 2a + 3 = 2b + 3 entonces 2a = 2b y a = b. SÍ es inyectiva.

Sobreyectiva sobre ℤ: habría que resolver 2n + 3 = m, o sea n = (m−3)/2, que solo es entero si m es impar. Con m = 4 no hay preimagen. NO es sobreyectiva.

Si el codominio son los impares: todo impar m se escribe m = 2k+1, y n = (m−3)/2 = k−1 es entero. SÍ es sobreyectiva, y al ser también inyectiva, es BIYECTIVA.

Moraleja: la sobreyectividad no es una propiedad de la fórmula, depende del codominio que declares.`,
    key: 'Inyectiva sí; sobre ℤ no; sobre los impares, biyectiva'
  },
  {
    id: 'cj4',
    g: 'Relaciones',
    level: 2,
    q: 'En ℤ se define a R b ⟺ a − b es múltiplo de 4. Comprueba que es de equivalencia y describe sus clases.',
    hint: 'Hay que verificar las tres propiedades. Para las clases, piensa en los restos posibles.',
    a: `Reflexiva: a − a = 0 = 4·0, múltiplo de 4. ✓
Simétrica: si a − b = 4k, entonces b − a = 4(−k), también múltiplo. ✓
Transitiva: si a − b = 4k y b − c = 4j, entonces a − c = 4(k+j). ✓

Es de equivalencia.

Las clases son los restos al dividir entre 4, o sea cuatro:
[0] = {…, −4, 0, 4, 8, …}
[1] = {…, −3, 1, 5, 9, …}
[2] = {…, −2, 2, 6, 10, …}
[3] = {…, −1, 3, 7, 11, …}

Son disjuntas y su unión es ℤ: eso es exactamente lo que garantiza el teorema de que toda relación de equivalencia induce una partición. Este conjunto de clases es ℤ₄.`,
    key: 'Es de equivalencia; 4 clases, los restos mod 4'
  },

  // ---------- Grafos
  {
    id: 'gr1',
    g: 'Grafos',
    level: 2,
    q: '¿Existe un grafo simple con 5 vértices cuyos grados sean 4, 3, 3, 2, 1?',
    hint: 'Suma los grados y recuerda qué relación tienen con el número de aristas.',
    a: `Suma de grados = 4+3+3+2+1 = 13, que es IMPAR.

Por el lema del apretón de manos, la suma de los grados es siempre 2·(nº de aristas), o sea par, porque cada arista suma 1 a cada uno de sus dos extremos.

Un total impar es imposible ⇒ ese grafo NO existe.

Corolario que conviene tener a mano: el número de vértices de grado impar es siempre par.`,
    key: 'No: la suma de grados (13) es impar'
  },
  {
    id: 'gr2',
    g: 'Grafos',
    level: 1,
    q: 'Un grafo conexo tiene grados 2, 2, 3, 3, 4. ¿Tiene circuito euleriano? ¿Y camino euleriano?',
    hint: 'Cuenta cuántos vértices tienen grado impar.',
    a: `Hay exactamente dos vértices de grado impar (los dos de grado 3).

· Circuito euleriano (empieza y acaba en el mismo sitio): exige que TODOS los grados sean pares. Aquí no ⇒ NO hay.
· Camino euleriano (puede acabar en otro sitio): exige exactamente 0 o 2 vértices de grado impar. Aquí hay 2 ⇒ SÍ hay, y además tiene que empezar en uno de los de grado 3 y acabar en el otro.

Ojo con no aplicar este criterio a los ciclos hamiltonianos: para esos no hay criterio sencillo.`,
    key: 'Circuito no; camino sí, entre los dos de grado 3'
  },
  {
    id: 'gr3',
    g: 'Grafos',
    level: 2,
    q: 'Un árbol tiene 12 vértices. ¿Cuántas aristas tiene? Si le añades una arista cualquiera, ¿qué pasa?',
    hint: 'Un árbol está justo en la frontera entre estar conectado y no tener ciclos.',
    a: `Un árbol con n vértices tiene siempre n − 1 aristas: 11 en este caso.

Al añadir una arista entre dos vértices que ya estaban conectados por un único camino, ese camino más la arista nueva forman EXACTAMENTE un ciclo. Deja de ser árbol.

Simétricamente, si quitas cualquier arista de un árbol, se desconecta en dos componentes. Por eso se dice que un árbol es «mínimamente conexo» y «máximamente acíclico» a la vez.

Cuenta rápida útil en los exámenes: si te dan un grafo conexo con n vértices y más de n−1 aristas, seguro que tiene un ciclo.`,
    key: '11 aristas; añadir una crea exactamente un ciclo'
  },
  {
    id: 'gr4',
    g: 'Grafos',
    level: 3,
    q: 'Sea A la matriz de adyacencia de un grafo. ¿Qué representa el elemento (i, j) de A³? Justifícalo.',
    hint: 'Escribe el elemento (i,j) de A² como un sumatorio y mira qué cuenta cada término.',
    a: `(A²)ᵢⱼ = Σₖ Aᵢₖ · Aₖⱼ. Cada sumando vale 1 solo cuando hay arista i→k Y arista k→j, es decir cuando k es un paso intermedio válido. Luego (A²)ᵢⱼ cuenta los caminos de longitud 2 de i a j.

Repitiendo el argumento, (A³)ᵢⱼ cuenta los caminos de longitud exactamente 3 de i a j (recorridos, es decir pueden repetir vértices o aristas).

Consecuencias que se preguntan:
· (A³)ᵢᵢ cuenta los recorridos cerrados de longitud 3 desde i, o sea los triángulos que pasan por i, contados 2 veces (una por sentido).
· La traza de A³ dividida entre 6 da el número de triángulos del grafo.`,
    key: 'Caminos de longitud exactamente 3 entre i y j'
  },
  {
    id: 'gr5',
    g: 'Grafos',
    level: 3,
    q: 'El grafo bipartito completo K₂,₃ (dos vértices a un lado, tres al otro, todas las aristas cruzadas). ¿Tiene ciclo hamiltoniano?',
    hint: 'En un grafo bipartito, un ciclo alterna lados. ¿Qué implica eso sobre el tamaño de los dos lados?',
    a: `NO lo tiene.

En un grafo bipartito, cualquier ciclo alterna entre los dos lados, así que usa el mismo número de vértices de cada uno. Un ciclo hamiltoniano tendría que usar los 5 vértices, con 2 de un lado y 3 del otro: imposible, porque exigiría 2 = 3.

Regla general: un grafo bipartito con lados de distinto tamaño NO puede tener ciclo hamiltoniano.

Y sin embargo K₂,₃ sí tiene camino euleriano (sus grados son 3, 3, 2, 2, 2: dos impares). Es un buen recordatorio de que los dos conceptos no tienen nada que ver.`,
    key: 'No: los lados tienen tamaños distintos (2 ≠ 3)'
  },
  {
    id: 'gr6',
    g: 'Grafos',
    level: 2,
    q: 'Aplica Kruskal a un grafo con aristas: AB=1, BC=4, AC=3, CD=2, BD=5. Da el árbol de expansión mínima y su peso.',
    hint: 'Ordena las aristas por peso y ve añadiendo la más barata que no cierre un ciclo.',
    a: `Aristas ordenadas: AB=1, CD=2, AC=3, BC=4, BD=5.

1. AB (1) → se añade. Componentes: {A,B}, {C}, {D}
2. CD (2) → se añade. Componentes: {A,B}, {C,D}
3. AC (3) → une las dos componentes, se añade. Todo conectado.

Ya tenemos 3 aristas para 4 vértices (n−1), así que paramos. Las siguientes (BC, BD) cerrarían ciclo.

Árbol de expansión mínima: {AB, CD, AC}, peso total 1 + 2 + 3 = 6.

Kruskal es voraz y aun así demostrablemente óptimo, que es lo raro y lo que hace este tema interesante.`,
    key: '{AB, CD, AC}, peso 6'
  }
]
