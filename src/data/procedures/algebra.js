// ============================================================
// Cómo se hace — Álgebra y Matemática Discreta
// ------------------------------------------------------------
// No es teoría ni son problemas: es lo que haces con el bolígrafo
// cuando ya has leído el enunciado. El campo que más vale es «when»:
// casi nadie falla un examen de esta asignatura por no saber hacer una
// inducción, se falla por no reconocer que el enunciado pedía una.
//
//   id    → identificador estable
//   t     → nombre del procedimiento
//   g     → tema (el mismo que en práctica, conceptos y mapa)
//   when  → cómo reconoces en el enunciado que toca este método
//   steps → los pasos, y en cada uno dónde se tuerce (note)
//   trap  → el error que comete media clase
//   ex    → un ejemplo mínimo, con el método aplicado paso a paso
//   see   → ids de problemas de práctica donde se usa (opcional)
// ============================================================
export const ALGEBRA_PROCEDURES = [
  // ---------- Lógica
  {
    id: 'elegir-demostracion',
    t: 'Elegir la forma de la demostración',
    g: 'Lógica',
    when: 'Siempre que el enunciado diga «demuestra», «prueba» o «razona si es cierto». Antes de escribir una sola línea hay que decidir con qué se va a atacar, porque las cuatro formas empiezan con una frase distinta y arrancar con la equivocada cuesta media hoja.',
    steps: [
      {
        s: 'Escribe la afirmación en la forma «si p, entonces q», aunque el enunciado no la traiga así.',
        note: 'Casi todo se puede reescribir así. «Todo número par al cuadrado es par» es «si n es par, entonces n² es par». Si no consigues separar p de q, todavía no has entendido qué te piden.'
      },
      {
        s: 'Si sospechas que es falsa, no demuestres: busca un contraejemplo.',
        note: 'Un solo caso que cumpla p y no q liquida el enunciado. Perder diez minutos intentando demostrar algo falso es el error más caro que hay.'
      },
      {
        s: 'Si q es una igualdad o una construcción, ve directo: supón p y opera hasta llegar a q.',
        note: 'La demostración directa es la primera opción por defecto. Solo se abandona cuando te atascas, no antes.'
      },
      {
        s: 'Si q tiene un «no», un «nunca» o un «distinto de», prueba el contrarrecíproco: supón ¬q y llega a ¬p.',
        note: 'Es la misma afirmación, no una parecida. Suele ser mucho más cómoda porque partir de una negación te da algo concreto con lo que operar.'
      },
      {
        s: 'Si ni así, reducción al absurdo: supón p y ¬q a la vez, y busca una contradicción.',
        note: 'Es la red de seguridad. Tiene coste: la contradicción hay que encontrarla, y si no aparece te quedas sin nada escrito.'
      },
      {
        s: 'Cierra diciendo qué has probado, no solo dónde has llegado.',
        note: 'Una línea: «luego si n es par, n² es par». El corrector busca esa frase.'
      }
    ],
    trap: 'Demostrar el recíproco creyendo que has demostrado el original. De «p → q» el contrarrecíproco «¬q → ¬p» SÍ es equivalente; el recíproco «q → p» NO lo es, y es el que sale solo cuando uno se despista. Antes de entregar, comprueba de qué partiste y adónde llegaste.',
    ex: {
      q: 'Demuestra que si n² es par, entonces n es par.',
      walk: [
        'p: n² es par. q: n es par.',
        'La directa pide sacar información de «n² es par», que es incómoda: habría que factorizar.',
        'q tiene forma de propiedad simple, así que probamos el contrarrecíproco: ¬q → ¬p, es decir, si n es impar entonces n² es impar.',
        'n impar ⇒ n = 2k+1 ⇒ n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, que es impar.',
        'Queda probado ¬q → ¬p, que es equivalente al enunciado. Luego si n² es par, n es par.'
      ]
    },
    see: ['log3', 'log4']
  },
  {
    id: 'negar',
    t: 'Negar una proposición con cuantificadores',
    g: 'Lógica',
    when: 'Cuando el enunciado pide negar algo, o cuando vas a demostrar por contrarrecíproco o por absurdo: en los dos casos lo primero que necesitas es la negación bien escrita. También aparece disfrazado en «¿qué haría falta para que esto fuera falso?».',
    steps: [
      {
        s: 'Pon la negación delante de todo y empújala hacia dentro de una en una, sin saltarte ningún cuantificador.',
        note: 'Hacerlo de golpe es de donde salen los errores. Un símbolo por línea, aunque parezca lento.'
      },
      {
        s: 'Cada cuantificador que atraviesa la negación cambia de tipo: ∀ pasa a ∃ y ∃ pasa a ∀.',
        note: 'El orden de los cuantificadores NO se toca. ∀x∃y pasa a ∃x∀y, nunca a ∀y∃x.'
      },
      {
        s: 'Al llegar al predicado, aplica De Morgan: ¬(A ∧ B) es ¬A ∨ ¬B, y ¬(A ∨ B) es ¬A ∧ ¬B.',
        note: 'El «y» se convierte en «o» y al revés. Olvidarlo deja una negación que dice algo distinto de lo que crees.'
      },
      {
        s: 'Si aparece una implicación, reescríbela antes: ¬(A → B) es A ∧ ¬B.',
        note: 'No es «A → ¬B». Negar una implicación no deja una implicación: deja un caso concreto en el que falla.'
      },
      {
        s: 'Léela en castellano y comprueba que dice justo lo contrario.',
        note: 'Si la original y la negada te suenan compatibles, algo has perdido por el camino.'
      }
    ],
    trap: 'Negar «∀x P(x)» como «∀x ¬P(x)». Eso es «ningún x cumple P», que es mucho más fuerte que lo contrario de «todos lo cumplen». Lo contrario de «todos» es «al menos uno no», no «ninguno».',
    ex: {
      q: 'Niega: ∀ε>0 ∃δ>0 : (|x−a| < δ → |f(x)−f(a)| < ε).',
      walk: [
        '¬(∀ε>0 ∃δ>0 : …) ≡ ∃ε>0 ¬(∃δ>0 : …)',
        '≡ ∃ε>0 ∀δ>0 ¬(|x−a| < δ → |f(x)−f(a)| < ε)',
        'La implicación negada se abre: ≡ ∃ε>0 ∀δ>0 : |x−a| < δ ∧ |f(x)−f(a)| ≥ ε',
        'En palabras: hay un ε para el que, por pequeño que hagas δ, se cuela un x cercano cuya imagen se va lejos.'
      ]
    },
    see: ['log2']
  },

  // ---------- Inducción
  {
    id: 'induccion',
    t: 'Demostrar por inducción',
    g: 'Inducción',
    when: 'Cuando la afirmación depende de un natural n y quieres probarla para todos: sumatorios con fórmula cerrada, divisibilidad de una expresión en n, desigualdades a partir de cierto punto, o cualquier cosa definida de forma recursiva. La pista de fábrica es que aparezca «para todo n ≥ …».',
    steps: [
      {
        s: 'Escribe explícitamente qué es P(n), la propiedad, con n como variable.',
        note: 'Sin esta línea el resto es humo. P(n) es una afirmación entera, no un número ni una fórmula suelta.'
      },
      {
        s: 'Caso base: comprueba P del primer valor que pide el enunciado, haciendo la cuenta.',
        note: 'Si el enunciado dice n ≥ 3, la base es 3, no 1. Y hay que operar los dos lados, no escribir «se cumple trivialmente».'
      },
      {
        s: 'Hipótesis: supón P(k) cierto para un k cualquiera y escríbelo entero.',
        note: 'Escribirlo entero no es burocracia: es la única expresión que te está permitido usar después, y tenerla a la vista te dice qué tienes que hacer aparecer.'
      },
      {
        s: 'Paso: escribe P(k+1) y manipula hasta que la hipótesis aparezca dentro.',
        note: 'El truco casi siempre es el mismo: separa el último término para que quede «lo de P(k)» + «lo nuevo». Ahí sustituyes por la hipótesis.'
      },
      {
        s: 'Señala dónde has usado la hipótesis y remata la cuenta.',
        note: 'Escribe «(por hipótesis de inducción)» encima del igual. Es lo que el corrector busca para dar el punto del paso.'
      },
      {
        s: 'Concluye: base + paso ⇒ cierto para todo n desde la base.',
        note: 'Sin esta frase la demostración está inacabada aunque la cuenta esté bien.'
      }
    ],
    trap: 'Partir de P(k+1) y operar los dos lados a la vez hasta llegar a «0 = 0». Eso demuestra que si P(k+1) es cierto entonces 0=0, que no dice nada. Hay que salir de un lado y llegar al otro, usando la hipótesis por el camino.',
    ex: {
      q: 'Demuestra que 1 + 2 + … + n = n(n+1)/2 para todo n ≥ 1.',
      walk: [
        'P(n): la suma de los n primeros naturales vale n(n+1)/2.',
        'Base, n=1: la suma es 1; la fórmula da 1·2/2 = 1. Coinciden.',
        'Hipótesis: supongo 1 + 2 + … + k = k(k+1)/2.',
        'Paso: 1 + 2 + … + k + (k+1) = [k(k+1)/2] + (k+1)  ← aquí entra la hipótesis',
        '= (k+1)·(k/2 + 1) = (k+1)(k+2)/2, que es la fórmula para k+1.',
        'Base y paso ⇒ cierto para todo n ≥ 1.'
      ]
    },
    see: ['ind1', 'ind2', 'ind3', 'ind4']
  },

  // ---------- Matrices y sistemas
  {
    id: 'gauss',
    t: 'Resolver y clasificar un sistema por Gauss',
    g: 'Sistemas',
    when: 'Cualquier sistema lineal, y también cuando el enunciado no pide resolverlo sino «discutirlo según el parámetro». Es el mismo procedimiento: se escalona igual, solo que al final se mira dónde el parámetro anula un pivote.',
    steps: [
      {
        s: 'Monta la matriz ampliada (A | b), con las incógnitas en el mismo orden en todas las filas.',
        note: 'Si en alguna ecuación falta una incógnita, ahí va un 0. Saltárselo descoloca la columna y arrastra el error hasta el final.'
      },
      {
        s: 'Escalona hacia abajo: usa el primer pivote para hacer ceros en su columna, luego el segundo, y así.',
        note: 'Solo tres operaciones valen: intercambiar filas, multiplicar una fila por un número distinto de cero, y sumarle a una fila un múltiplo de otra. Nada de operar columnas.'
      },
      {
        s: 'Cuenta pivotes en A y en (A | b) y compara con el número de incógnitas.',
        note: 'rg(A) < rg(A|b) → incompatible. Iguales y = nº incógnitas → solución única. Iguales y < nº incógnitas → infinitas, con tantos parámetros como la diferencia.'
      },
      {
        s: 'Si hay parámetro, mira qué valores anulan un pivote y estudia esos casos aparte.',
        note: 'Es el único sitio donde el sistema cambia de comportamiento. Para el resto de valores vale el caso general que ya tienes escalonado.'
      },
      {
        s: 'Si es compatible, sustituye hacia atrás desde la última ecuación.',
        note: 'Con infinitas soluciones, las incógnitas sin pivote son los parámetros libres: les pones nombre (λ, μ) y expresas las demás en función de ellos.'
      }
    ],
    trap: 'Dividir una fila entre una expresión con el parámetro sin comprobar antes que no sea cero. Si divides entre (a−2) estás suponiendo a ≠ 2, y a = 2 es justo el caso que el enunciado quería que estudiaras. Divide solo por números; el caso que anula el pivote se trata aparte.',
    ex: {
      q: 'Discute según a: x + y = 1 · x + ay = 2.',
      walk: [
        'Ampliada: [1 1 | 1 ; 1 a | 2].',
        'F2 ← F2 − F1: [1 1 | 1 ; 0 a−1 | 1].',
        'Si a ≠ 1: el segundo pivote es a−1 ≠ 0, rg(A) = rg(A|b) = 2 = nº incógnitas → solución única, y = 1/(a−1), x = 1 − y.',
        'Si a = 1: la segunda fila queda [0 0 | 1], que dice 0 = 1 → incompatible.',
        'No hay tercer caso: el sistema nunca tiene infinitas soluciones.'
      ]
    },
    see: ['mat3', 'mat4']
  },
  {
    id: 'inversa',
    t: 'Invertir una matriz por Gauss-Jordan',
    g: 'Matrices',
    when: 'Cuando piden la inversa, y también cuando piden resolver A·X = B con A cuadrada: es la misma cuenta. Si la matriz es 2×2, la fórmula directa es más rápida; a partir de 3×3, Gauss-Jordan se equivoca menos que los adjuntos.',
    steps: [
      {
        s: 'Comprueba primero que el determinante no sea cero.',
        note: 'Si es cero no hay inversa y todo el trabajo siguiente sobra. Un minuto de determinante ahorra diez de Gauss.'
      },
      {
        s: 'Escribe (A | I) con la identidad del mismo tamaño a la derecha.',
        note: 'La barra es solo mental: las operaciones se aplican a la fila entera, a los dos lados a la vez. Operar solo la mitad izquierda es el fallo número uno.'
      },
      {
        s: 'Haz ceros debajo de la diagonal, de izquierda a derecha.',
        note: 'Si te sale un cero en un pivote, intercambia con una fila de abajo. Solo si no queda ninguna es que la matriz no es invertible.'
      },
      {
        s: 'Normaliza los pivotes a 1 y haz ceros también encima.',
        note: 'Aquí se diferencia Jordan de Gauss a secas: hay que dejar la identidad limpia, no una triangular.'
      },
      {
        s: 'Cuando la izquierda sea I, la derecha es A⁻¹. Comprueba multiplicando.',
        note: 'A·A⁻¹ = I es una comprobación de treinta segundos que detecta cualquier error de signo.'
      }
    ],
    trap: 'Tratar el producto de matrices como si conmutara. A·B y B·A no son lo mismo, y al despejar importa el lado: de A·X = B sale X = A⁻¹·B, no X = B·A⁻¹. Multiplica siempre por el mismo lado en los dos miembros.',
    ex: {
      q: 'Invierte A = [2 1 ; 1 1].',
      walk: [
        'det = 2·1 − 1·1 = 1 ≠ 0, luego existe inversa.',
        '(A | I) = [2 1 | 1 0 ; 1 1 | 0 1].',
        'F1 ↔ F2 para tener un 1 arriba: [1 1 | 0 1 ; 2 1 | 1 0].',
        'F2 ← F2 − 2F1: [1 1 | 0 1 ; 0 −1 | 1 −2].',
        'F2 ← −F2: [1 1 | 0 1 ; 0 1 | −1 2]. F1 ← F1 − F2: [1 0 | 1 −1 ; 0 1 | −1 2].',
        'A⁻¹ = [1 −1 ; −1 2]. Comprobación: A·A⁻¹ = [2−1 −2+2 ; 1−1 −1+2] = I.'
      ]
    },
    see: ['mat1', 'mat2']
  },

  // ---------- Aritmética
  {
    id: 'euclides',
    t: 'Euclides y la identidad de Bézout',
    g: 'Aritmética',
    when: 'Cuando piden el máximo común divisor de números grandes, cuando hay que escribir mcd(a,b) como combinación de a y b, o cuando hace falta el inverso de a módulo m — que es el mismo algoritmo leído al revés.',
    steps: [
      {
        s: 'Divide el mayor entre el menor y quédate con el resto.',
        note: 'Anota cada división entera en una línea: a = q·b + r. Esas líneas son las que después vas a recorrer hacia atrás.'
      },
      {
        s: 'Repite con el divisor y el resto hasta que el resto sea 0.',
        note: 'El último resto no nulo es el mcd. Pasarse una división y quedarse con el cero es un despiste clásico.'
      },
      {
        s: 'Si piden Bézout, despeja el resto en cada línea, de la penúltima hacia arriba.',
        note: 'r = a − q·b en cada paso. Vas sustituyendo sin llegar a operar los números: el objetivo es que al final queden solo a y b.'
      },
      {
        s: 'Agrupa hasta dejar mcd = x·a + y·b.',
        note: 'No multipliques lo que va con a y con b hasta el último paso, o pierdes de vista quién es quién.'
      },
      {
        s: 'Comprueba sustituyendo los valores.',
        note: 'Es una suma: si no da el mcd, hay un signo mal, y los signos alternos son justo lo que más se tuerce aquí.'
      }
    ],
    trap: 'Usar Bézout cuando el mcd no divide al término independiente. La ecuación ax + by = c tiene solución entera solo si mcd(a,b) divide a c. Si no lo divide, no hay nada que despejar, y la respuesta correcta es decirlo.',
    ex: {
      q: 'Calcula mcd(78, 21) y escríbelo como combinación de 78 y 21.',
      walk: [
        '78 = 3·21 + 15',
        '21 = 1·15 + 6',
        '15 = 2·6 + 3',
        '6 = 2·3 + 0 → el mcd es 3.',
        'Hacia atrás: 3 = 15 − 2·6',
        '= 15 − 2·(21 − 15) = 3·15 − 2·21',
        '= 3·(78 − 3·21) − 2·21 = 3·78 − 11·21.',
        'Comprobación: 234 − 231 = 3. ✓'
      ]
    },
    see: ['ari1', 'ari2']
  },
  {
    id: 'congruencia',
    t: 'Resolver una congruencia lineal',
    g: 'Aritmética',
    when: 'Cuando aparece «≡ … (mód m)» con una incógnita, y también en los problemas de calendario, de repartos con resto o de criptografía elemental, que son congruencias con otra ropa.',
    steps: [
      {
        s: 'Calcula d = mcd(a, m) y mira si divide a b.',
        note: 'Si no lo divide, no hay solución y ahí acaba el ejercicio. Si lo divide, habrá exactamente d soluciones distintas módulo m.'
      },
      {
        s: 'Divide toda la congruencia entre d, el módulo incluido.',
        note: 'El módulo también se divide. Dejarlo intacto es el error que convierte una respuesta correcta en incompleta.'
      },
      {
        s: 'Ahora a y m son coprimos: busca el inverso de a con Bézout.',
        note: 'De 1 = x·a + y·m, el coeficiente x es el inverso de a módulo m, porque el término con m desaparece al reducir.'
      },
      {
        s: 'Multiplica los dos lados por el inverso y reduce.',
        note: 'Reduce a un representante entre 0 y m−1; dejar un número negativo o enorme no está mal pero se penaliza como sin terminar.'
      },
      {
        s: 'Si d > 1, devuelve las d soluciones sumando múltiplos del módulo reducido.',
        note: 'x₀, x₀ + m/d, x₀ + 2m/d, … hasta completar d valores dentro del módulo original.'
      }
    ],
    trap: 'Dividir la congruencia entre un número sin dividir también el módulo. En los enteros 6 ≡ 2 (mód 4) es cierto, pero dividir entre 2 dejando el módulo da 3 ≡ 1 (mód 4), que es falso. El módulo va en el mismo saco.',
    ex: {
      q: 'Resuelve 6x ≡ 9 (mód 15).',
      walk: [
        'mcd(6,15) = 3, y 3 divide a 9 → hay solución, y habrá 3 módulo 15.',
        'Divido todo entre 3: 2x ≡ 3 (mód 5).',
        'Inverso de 2 módulo 5: 2·3 = 6 ≡ 1, luego el inverso es 3.',
        'x ≡ 3·3 = 9 ≡ 4 (mód 5).',
        'Módulo 15 eso son tres soluciones: x = 4, 9, 14.'
      ]
    },
    see: ['ari3', 'ari4']
  },

  // ---------- Conjuntos, relaciones, funciones
  {
    id: 'igualdad-conjuntos',
    t: 'Demostrar una igualdad de conjuntos',
    g: 'Conjuntos',
    when: 'Cuando piden probar A = B con A y B escritos con uniones, intersecciones y complementos. También cuando piden solo una inclusión: es la mitad de este mismo procedimiento.',
    steps: [
      {
        s: 'Decide la vía: doble inclusión, o cadena de equivalencias lógicas.',
        note: 'La doble inclusión nunca falla y siempre puntúa. La cadena es más corta pero exige que cada paso sea una equivalencia, no una implicación.'
      },
      {
        s: 'Doble inclusión, primera mitad: toma x ∈ A y razona hasta x ∈ B.',
        note: 'Traduce la pertenencia a lógica en cuanto la tengas: x ∈ A∩B es «x∈A ∧ x∈B», x ∈ A∪B es un «o», x ∈ Aᶜ es un «no».'
      },
      {
        s: 'Segunda mitad: toma x ∈ B y razona hasta x ∈ A.',
        note: 'Hay que hacerla de verdad. «Análogamente» solo vale si el argumento es literalmente simétrico, y casi nunca lo es.'
      },
      {
        s: 'Concluye A ⊆ B y B ⊆ A, luego A = B.',
        note: 'La frase final es parte de la demostración, no un adorno.'
      },
      {
        s: 'Si sospechas que la igualdad es falsa, busca un contraejemplo con conjuntos de dos o tres elementos.',
        note: 'Con A = {1}, B = {2}, C = {1,2} se tumba casi cualquier igualdad falsa en menos de un minuto.'
      }
    ],
    trap: 'Confundir ∈ con ⊆ al escribir. {1} ∈ {1,2} es falso; {1} ⊆ {1,2} es cierto; 1 ∈ {1,2} es cierto. Con conjuntos de conjuntos esto decide el ejercicio entero, y es donde se pierden más puntos de todo el tema.',
    ex: {
      q: 'Demuestra que (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ.',
      walk: [
        '⊆) Sea x ∈ (A∪B)ᶜ. Entonces x ∉ A∪B, es decir, no (x∈A ∨ x∈B).',
        'Por De Morgan: x ∉ A y x ∉ B, o sea x ∈ Aᶜ y x ∈ Bᶜ, luego x ∈ Aᶜ ∩ Bᶜ.',
        '⊇) Sea x ∈ Aᶜ ∩ Bᶜ. Entonces x ∉ A y x ∉ B.',
        'Si estuviera en A∪B tendría que estar en uno de los dos: contradicción. Luego x ∈ (A∪B)ᶜ.',
        'Las dos inclusiones ⇒ los conjuntos son iguales.'
      ]
    },
    see: ['cj1', 'cj2', 'cj3']
  },
  {
    id: 'equivalencia',
    t: 'Probar que una relación es de equivalencia y dar las clases',
    g: 'Relaciones',
    when: 'Cuando definen una relación con una fórmula («aRb si a−b es múltiplo de 3») y piden clasificarla. El mismo esquema sirve para orden: cambian las propiedades que hay que comprobar, no la forma de comprobarlas.',
    steps: [
      {
        s: 'Reflexiva: comprueba que aRa para todo a, sustituyendo b por a en la definición.',
        note: 'Es mecánico y casi siempre sale. Si no sale, ya tienes la respuesta y el resto sobra.'
      },
      {
        s: 'Simétrica: supón aRb y llega a bRa.',
        note: 'Hay que partir de la definición escrita, no de la intuición. Muchas relaciones «parecen» simétricas y no lo son.'
      },
      {
        s: 'Transitiva: supón aRb y bRc a la vez, y llega a aRc.',
        note: 'Las dos hipótesis se usan juntas; el truco casi siempre es sumarlas o encadenarlas. Es la propiedad que más se cae.'
      },
      {
        s: 'Si falla alguna, da un contraejemplo concreto con números.',
        note: 'Decir «no es transitiva» sin ejemplo no puntúa. Tres números bastan.'
      },
      {
        s: 'Para las clases: fija un elemento y describe todos los que se relacionan con él.',
        note: '[a] = {x : xRa}. Luego mira cuántas clases distintas salen: ese es el conjunto cociente, y las clases nunca se solapan.'
      }
    ],
    trap: 'Dar por reflexiva una relación que no está definida para todos los elementos, o confundir «no es simétrica» con «es antisimétrica». Que aRb no implique bRa no significa que no puedan darse los dos a la vez alguna vez: son cosas distintas y se preguntan juntas a propósito.',
    ex: {
      q: 'En ℤ, aRb si a − b es múltiplo de 3. ¿Es de equivalencia? Da las clases.',
      walk: [
        'Reflexiva: a − a = 0 = 3·0, múltiplo de 3. ✓',
        'Simétrica: si a − b = 3k, entonces b − a = 3(−k), también múltiplo. ✓',
        'Transitiva: si a − b = 3k y b − c = 3m, sumando: a − c = 3(k+m). ✓',
        'Es de equivalencia.',
        'Clases: [0] = {…,−3,0,3,6,…}, [1] = {…,−2,1,4,…}, [2] = {…,−1,2,5,…}.',
        'Tres clases, que son los tres restos posibles al dividir entre 3. ℤ/3ℤ.'
      ]
    },
    see: ['cj4']
  },
  {
    id: 'inyectiva-sobreyectiva',
    t: 'Decidir si una función es inyectiva o sobreyectiva',
    g: 'Funciones',
    when: 'Siempre que pregunten si una función es biyectiva, si tiene inversa, o cuando haya que contar aplicaciones entre conjuntos finitos. También sale en combinatoria disfrazado de «de cuántas formas».',
    steps: [
      {
        s: 'Mira bien cuáles son el dominio y el codominio antes de nada.',
        note: 'La misma fórmula cambia de respuesta según los conjuntos: x² no es inyectiva en ℝ y sí lo es en ℝ⁺. Media clase falla aquí, no en la cuenta.'
      },
      {
        s: 'Inyectiva: supón f(a) = f(b) y opera hasta a = b.',
        note: 'Si en el camino tienes que sacar una raíz o dividir por algo que puede anularse, ahí está el contraejemplo esperándote.'
      },
      {
        s: 'Sobreyectiva: toma un y cualquiera del codominio y despeja x.',
        note: 'Sobreyectiva es que la ecuación f(x) = y tenga solución EN EL DOMINIO para todo y del codominio. Si la solución se sale, no lo es.'
      },
      {
        s: 'Si falla, da el contraejemplo con números.',
        note: 'Para inyectiva: dos valores distintos con la misma imagen. Para sobreyectiva: un y concreto que nadie alcanza.'
      },
      {
        s: 'Si es biyectiva, construye la inversa despejando x en función de y.',
        note: 'Y comprueba con un valor: f⁻¹(f(3)) tiene que dar 3.'
      }
    ],
    trap: 'Concluir «es sobreyectiva porque he despejado x» sin mirar si ese x pertenece al dominio. En f: ℕ → ℕ, f(n) = 2n, se despeja n = y/2 sin problema, pero para y = 3 eso no es un natural: no es sobreyectiva.',
    ex: {
      q: 'f: ℝ → ℝ, f(x) = 2x + 1. ¿Es biyectiva?',
      walk: [
        'Inyectiva: si 2a + 1 = 2b + 1, entonces 2a = 2b y a = b. ✓',
        'Sobreyectiva: dado y ∈ ℝ, despejo x = (y−1)/2, que es un real para cualquier y. ✓',
        'Es biyectiva, luego tiene inversa: f⁻¹(y) = (y−1)/2.',
        'Comprobación: f(3) = 7 y f⁻¹(7) = 3. ✓',
        'Ojo: la misma fórmula de ℤ en ℤ sería inyectiva pero NO sobreyectiva, porque (y−1)/2 no siempre es entero.'
      ]
    }
  },

  // ---------- Grafos
  {
    id: 'grafos-recorridos',
    t: 'Decidir si un grafo tiene camino euleriano o hamiltoniano',
    g: 'Grafos',
    when: 'Cuando el enunciado habla de recorrer todas las aristas (barrer calles, repartir correo) o de visitar todos los vértices (viajante, rutas). La diferencia entre las dos palabras decide el problema entero y el enunciado casi nunca las nombra.',
    steps: [
      {
        s: 'Traduce el enunciado: ¿hay que pasar por todas las ARISTAS o por todos los VÉRTICES?',
        note: 'Aristas → Euler. Vértices → Hamilton. Puentes, calles y tuberías son aristas; ciudades, personas y habitaciones son vértices.'
      },
      {
        s: 'Comprueba primero que el grafo es conexo.',
        note: 'Si está partido en trozos no hay ni recorrido ni ciclo, y te ahorras el resto. Se ve de un vistazo.'
      },
      {
        s: 'Para Euler, cuenta los vértices de grado impar.',
        note: 'Cero impares → hay ciclo euleriano (empiezas y acabas donde quieras). Exactamente dos → hay camino, y obligatoriamente empieza en uno de ellos y acaba en el otro. Cuatro o más → no hay.'
      },
      {
        s: 'Para Hamilton no hay criterio: hay que construirlo o argumentar por qué no puede existir.',
        note: 'Esta asimetría es lo importante del tema. Para Euler basta contar; para Hamilton hay que trabajar. Si el enunciado parece pedir «una regla», suele ser Euler.'
      },
      {
        s: 'Si construyes el recorrido, escríbelo como lista y compruébalo.',
        note: 'Euler: cuenta que salen tantas aristas como tiene el grafo, sin repetir. Hamilton: que aparezca cada vértice una vez y una sola.'
      }
    ],
    trap: 'Usar un criterio de grados para Hamilton. Los teoremas que existen (Dirac, Ore) solo dan condición suficiente: si se cumplen hay ciclo, pero si no se cumplen no dicen nada. Concluir «no es hamiltoniano porque no cumple Dirac» es un error de lógica, no de grafos.',
    ex: {
      q: 'Un grafo con vértices A,B,C,D y aristas AB, AC, AD, BC, BD, CD. ¿Euleriano? ¿Hamiltoniano?',
      walk: [
        'Es K₄: conexo, y cada vértice tiene grado 3.',
        'Euler: los cuatro vértices son de grado impar → no hay ni ciclo ni camino euleriano.',
        'Hamilton: hay que construirlo. A → B → C → D → A recorre los cuatro vértices una vez y cierra. ✓',
        'Es hamiltoniano y no euleriano: la prueba de que son propiedades independientes.'
      ]
    },
    see: ['gr1', 'gr2', 'gr3']
  },

  // ---------- Programación lineal
  {
    id: 'lineal-grafico',
    t: 'Resolver un problema de programación lineal por el método gráfico',
    g: 'Programación lineal',
    when: 'Cuando hay dos variables y un enunciado con recursos limitados: maximizar beneficio, minimizar coste, «no se dispone de más de…». Con dos incógnitas el método gráfico es más rápido y más difícil de equivocar que el simplex.',
    steps: [
      {
        s: 'Nombra las variables y escribe qué representan, con sus unidades.',
        note: 'Media hoja de errores se evita aquí. «x = kilos de A fabricados al día», no «x = A».'
      },
      {
        s: 'Escribe la función objetivo y todas las restricciones, incluidas x ≥ 0, y ≥ 0.',
        note: 'Las de no negatividad se olvidan siempre y son las que cierran la región. Sin ellas te salen vértices imposibles.'
      },
      {
        s: 'Dibuja cada restricción como recta y sombrea el semiplano que cumple.',
        note: 'Para saber qué lado, prueba el punto (0,0) en la desigualdad: si la cumple, es el lado del origen. Si la recta pasa por el origen, prueba otro punto.'
      },
      {
        s: 'Marca la región factible y calcula las coordenadas exactas de sus vértices.',
        note: 'Cada vértice es el corte de dos rectas: resuelve el sistema, no lo leas del dibujo. Del dibujo salen decimales que no son.'
      },
      {
        s: 'Evalúa la función objetivo en todos los vértices y quédate con el mejor.',
        note: 'El óptimo de un problema lineal está siempre en un vértice. Si dos vértices empatan, todo el segmento entre ellos es óptimo y hay que decirlo.'
      },
      {
        s: 'Devuelve la respuesta en las palabras del enunciado.',
        note: '«Fabricar 4 de A y 6 de B, con un beneficio de 68 €», no «(4,6), z=68».'
      }
    ],
    trap: 'Dar como óptimo un punto del interior de la región porque «se ve más alto». En un problema lineal la función objetivo no tiene máximos interiores: crece siempre en la misma dirección, así que el óptimo se apoya en el borde y, salvo empate, en un vértice.',
    ex: {
      q: 'Maximiza z = 3x + 2y con x + y ≤ 4, x ≤ 3, x ≥ 0, y ≥ 0.',
      walk: [
        'Región: triángulo/cuadrilátero limitado por los ejes, x + y = 4 y x = 3.',
        'Vértices: (0,0), (3,0), (3,1) — corte de x=3 con x+y=4 — y (0,4).',
        'z(0,0) = 0 · z(3,0) = 9 · z(3,1) = 11 · z(0,4) = 8.',
        'El máximo es 11 en (3,1).',
        'Respuesta: x = 3, y = 1, con z = 11.'
      ]
    },
    see: ['pl1', 'pl2']
  }
]
