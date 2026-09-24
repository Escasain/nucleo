// ============================================================
// Cómo se hace — Tecnología de Computadores
// ------------------------------------------------------------
// La asignatura tiene fama de teórica y se aprueba con seis o siete
// procedimientos mecánicos. El problema no es entender qué es el
// complemento a 2: es que nadie escribe en qué orden se hacen los pasos
// ni dónde se tuerce cada uno, y a mano, con prisa, se tuercen siempre
// en el mismo sitio.
//
// Misma forma que en Álgebra: id · t · g · when · steps · trap · ex · see
// ============================================================
export const TEC_COMP_PROCEDURES = [
  // ---------- Numeración
  {
    id: 'cambio-base',
    t: 'Cambiar un número de base',
    g: 'Numeración',
    when: 'En cuanto aparece un subíndice (₂, ₁₆) o las palabras binario, octal o hexadecimal. Es el procedimiento más usado de la asignatura: casi todos los demás empiezan pasando algo a binario.',
    steps: [
      {
        s: 'De base 10 a base b: divide entre b repetidamente y guarda los restos.',
        note: 'El resultado se lee de abajo arriba, del último resto al primero. Leerlo al derecho da un número distinto y es el error más repetido del tema.'
      },
      {
        s: 'De base b a base 10: multiplica cada dígito por b elevado a su posición y suma.',
        note: 'Las posiciones se cuentan desde la derecha y empezando en 0, no en 1.'
      },
      {
        s: 'Entre binario y hexadecimal, no pases por decimal: agrupa de 4 en 4.',
        note: 'Se agrupa desde la derecha, y si el último grupo queda corto se rellena con ceros a la izquierda. Con octal es igual pero de 3 en 3.'
      },
      {
        s: 'Si hay parte fraccionaria, se hace aparte: multiplica por b y ve tomando las partes enteras.',
        note: 'Aquí se lee de arriba abajo, al revés que la parte entera. Y puede no terminar nunca: 0,1 en decimal es periódico en binario.'
      },
      {
        s: 'Comprueba volviendo a la base de partida.',
        note: 'Treinta segundos que detectan el 90 % de los fallos de este tema.'
      }
    ],
    trap: 'Leer los restos en el orden en que salieron. Salen del dígito menos significativo al más significativo, así que el número es la lista de restos al revés. Escríbelos en una columna y léela de abajo arriba.',
    ex: {
      q: 'Pasa 156 a binario y a hexadecimal.',
      walk: [
        '156 : 2 = 78 resto 0 · 78 : 2 = 39 resto 0 · 39 : 2 = 19 resto 1 · 19 : 2 = 9 resto 1',
        '9 : 2 = 4 resto 1 · 4 : 2 = 2 resto 0 · 2 : 2 = 1 resto 0 · 1 : 2 = 0 resto 1',
        'Leyendo de abajo arriba: 10011100₂.',
        'A hexadecimal, agrupando de 4 en 4 desde la derecha: 1001 1100 → 9 C → 9C₁₆.',
        'Comprobación: 9·16 + 12 = 144 + 12 = 156. ✓'
      ]
    },
    see: ['num1', 'num2']
  },
  {
    id: 'complemento-2',
    t: 'Representar y operar enteros en complemento a 2',
    g: 'Numeración',
    when: 'Siempre que haya números con signo y un número fijo de bits: «representa −45 en 8 bits», «haz esta resta en binario», «¿hay desbordamiento?». Los procesadores reales restan así, de modo que aparece también en los problemas de arquitectura.',
    steps: [
      {
        s: 'Fíjate en cuántos bits te dan; todo el procedimiento depende de eso.',
        note: 'Sin el ancho, la pregunta no tiene respuesta. En 8 bits el rango es −128 a +127, no −127 a +128: hay un negativo más que positivos.'
      },
      {
        s: 'Para un negativo: escribe el positivo en binario con ese ancho.',
        note: 'Completando con ceros a la izquierda hasta llenar los bits. Si el positivo ya no cabe, el negativo tampoco y hay que decirlo.'
      },
      {
        s: 'Invierte todos los bits y suma 1.',
        note: 'Los dos pasos, siempre. Invertir sin sumar es complemento a 1, que es otra representación y da un número distinto.'
      },
      {
        s: 'Para restar, suma el complemento a 2 del sustraendo y tira el acarreo que se sale.',
        note: 'El acarreo final se descarta, no se arrastra. Eso es lo que hace que el mismo sumador sirva para sumar y restar.'
      },
      {
        s: 'Comprueba el desbordamiento mirando los signos, no el acarreo.',
        note: 'Hay desbordamiento si los dos operandos tienen el mismo signo y el resultado sale con el contrario. Sumar un positivo y un negativo nunca desborda.'
      }
    ],
    trap: 'Usar el acarreo de salida como señal de desbordamiento. En complemento a 2 no lo es: se descarta y muchas operaciones correctas lo producen. La señal es el cambio de signo imposible — dos positivos que dan negativo, o dos negativos que dan positivo.',
    ex: {
      q: 'Calcula 5 − 9 en 8 bits, complemento a 2.',
      walk: [
        '5 = 00000101. 9 = 00001001.',
        'Complemento a 2 de 9: invierto → 11110110; sumo 1 → 11110111 (que es −9).',
        '00000101 + 11110111 = 1 00001100 → descarto el acarreo: 11111100.',
        'El bit de signo es 1 → es negativo. Para leerlo: invierto (00000011) y sumo 1 → 00000100 = 4.',
        'Resultado: −4. ✓ Y no hay desbordamiento: los operandos tenían signos distintos.'
      ]
    },
    see: ['num3']
  },
  {
    id: 'ieee754',
    t: 'Pasar un real a IEEE 754',
    g: 'Numeración',
    when: 'Cuando piden representar un número con decimales en coma flotante, o explicar por qué 0,1 + 0,2 no da 0,3 exacto. Suele valer muchos puntos porque casi nadie completa los tres campos.',
    steps: [
      {
        s: 'Anota el signo y trabaja con el valor absoluto.',
        note: 'El bit de signo es 0 para positivo y 1 para negativo, y va aparte: no forma parte de la mantisa ni del exponente.'
      },
      {
        s: 'Pasa el número a binario, parte entera y parte fraccionaria por separado.',
        note: 'La entera por divisiones, la fraccionaria por multiplicaciones. Si la fraccionaria no termina, la cortas donde llegue la mantisa.'
      },
      {
        s: 'Normaliza: desplaza la coma hasta dejar 1,algo × 2^e.',
        note: 'El exponente e es cuántas posiciones has movido la coma: positivo si la moviste a la izquierda, negativo si a la derecha.'
      },
      {
        s: 'Suma el sesgo al exponente y pásalo a binario.',
        note: '127 en simple precisión, 1023 en doble. El sesgo existe para poder comparar exponentes sin tratar el signo aparte.'
      },
      {
        s: 'La mantisa son los bits DESPUÉS de la coma, rellenando con ceros a la derecha.',
        note: 'El 1 de delante no se guarda: se sabe que está. Guardarlo desplaza toda la mantisa y da otro número.'
      },
      {
        s: 'Monta los tres campos en orden: signo, exponente, mantisa.',
        note: '1 + 8 + 23 en simple precisión. Cuenta los bits antes de entregar.'
      }
    ],
    trap: 'Incluir el 1 implícito dentro de la mantisa. En los números normalizados ese 1 nunca se almacena, y meterlo es el fallo que más veces convierte un ejercicio bien planteado en un cero.',
    ex: {
      q: 'Representa −6,5 en IEEE 754 de simple precisión.',
      walk: [
        'Signo: negativo → 1.',
        '6,5 en binario: 6 = 110 y 0,5 = 0,1 → 110,1.',
        'Normalizo: 110,1 = 1,101 × 2².',
        'Exponente: 2 + 127 = 129 = 10000001.',
        'Mantisa: los bits tras la coma de 1,101 → 101, rellenado a 23 bits: 10100000000000000000000.',
        'Resultado: 1 10000001 10100000000000000000000.'
      ]
    },
    see: ['num4']
  },

  // ---------- Álgebra de Boole y combinacionales
  {
    id: 'karnaugh',
    t: 'Simplificar con un mapa de Karnaugh',
    g: 'Boole',
    when: 'Cuando hay que simplificar una función de 2 a 4 variables, o cuando piden «el circuito con el mínimo número de puertas». A partir de 5 variables el mapa deja de ser práctico y se usan las propiedades del álgebra.',
    steps: [
      {
        s: 'Construye el mapa con las variables en código Gray en los bordes.',
        note: '00, 01, 11, 10 — no 00, 01, 10, 11. Todo el método se basa en que dos casillas vecinas se diferencien en un solo bit; con el orden natural no funciona.'
      },
      {
        s: 'Rellena con los unos de la tabla de verdad, y con X las combinaciones que el enunciado declare imposibles.',
        note: 'Las X son regalos: cuentan como uno si te conviene para agrandar un grupo y como cero si no. No agruparlas nunca deja la solución sin simplificar del todo.'
      },
      {
        s: 'Agrupa unos en bloques de tamaño potencia de 2, lo más grandes posible.',
        note: 'Los grupos pueden solaparse y dan la vuelta por los bordes: la primera columna es vecina de la última, y la primera fila de la última. Es lo que más se olvida.'
      },
      {
        s: 'Cubre todos los unos usando los grupos menos numerosos que puedas.',
        note: 'Un grupo grande ahorra una variable en el término: uno de 4 casillas quita dos variables, uno de 8 quita tres.'
      },
      {
        s: 'Escribe un término por grupo, con las variables que NO cambian dentro de él.',
        note: 'Si en el grupo una variable vale siempre 1 va tal cual; si vale siempre 0 va negada; si cambia, desaparece. Suma los términos.'
      },
      {
        s: 'Comprueba el resultado en dos o tres filas de la tabla original.',
        note: 'Especialmente en una fila que valga 0: los errores de Karnaugh suelen producir funciones que valen 1 de más.'
      }
    ],
    trap: 'No agrupar por los bordes. El mapa es una superficie cerrada: la casilla de arriba a la izquierda es vecina de la de arriba a la derecha y de la de abajo a la izquierda. Los cuatro vértices de un mapa de 4 variables forman un grupo válido de 4, y casi nadie lo ve.',
    ex: {
      q: 'Simplifica F(A,B,C) = Σm(0, 2, 4, 6).',
      walk: [
        'Los minitérminos 0, 2, 4, 6 son 000, 010, 100, 110.',
        'En los cuatro, C vale 0; A y B toman todos los valores.',
        'Forman un único grupo de 4 casillas.',
        'En ese grupo A cambia y B cambia; solo C se mantiene, y en 0.',
        'F = C̄. De ocho filas de tabla a un inversor.'
      ]
    },
    see: ['bool3', 'bool4', 'bool5']
  },
  {
    id: 'tabla-a-circuito',
    t: 'De enunciado a tabla de verdad y a circuito',
    g: 'Combinacionales',
    when: 'Cuando describen en castellano lo que tiene que hacer un circuito: una alarma con tres sensores, un display, un comparador. Es el ejercicio típico de la primera parte del examen y se resuelve siempre con la misma secuencia.',
    steps: [
      {
        s: 'Define las entradas y las salidas con nombre, y di qué significa un 1 en cada una.',
        note: '«A = 1 si la puerta está abierta». Sin esto, a mitad del problema ya no sabes si 1 era abierta o cerrada, y la tabla sale invertida.'
      },
      {
        s: 'Escribe la tabla de verdad completa: 2ⁿ filas, en orden binario.',
        note: 'Completa de verdad. Saltarse las filas «que no pueden pasar» sin marcarlas como indiferentes hace que luego no puedas aprovecharlas en Karnaugh.'
      },
      {
        s: 'Rellena la salida fila a fila leyendo el enunciado, no la intuición.',
        note: 'Una fila cada vez. La prisa aquí se paga con un circuito entero mal.'
      },
      {
        s: 'Saca la suma de productos: un término por cada fila con salida 1.',
        note: 'En cada término, la variable va negada si en esa fila vale 0. Si hay muchos más unos que ceros, sale más corto por producto de sumas.'
      },
      {
        s: 'Simplifica con Karnaugh y dibuja el circuito.',
        note: 'Cada término es una AND, la suma final es una OR, y las variables negadas llevan su inversor. Cuenta las puertas: es lo que suele puntuar.'
      }
    ],
    trap: 'Diseñar directamente el circuito «pensándolo», saltándose la tabla. Funciona en los casos fáciles y falla justo en los del examen, que llevan una condición rara metida en una frase subordinada. La tabla obliga a leer el enunciado entero.',
    ex: {
      q: 'Una alarma suena si hay dos o más de los tres sensores A, B, C activados.',
      walk: [
        'Entradas A, B, C; salida S = 1 suena.',
        'Tabla: S = 1 en 011, 101, 110 y 111; 0 en las otras cuatro.',
        'Suma de productos: S = ĀBC + AB̄C + ABC̄ + ABC.',
        'Karnaugh: los unos se agrupan de dos en dos por parejas solapadas.',
        'S = AB + AC + BC. Tres AND y una OR de tres entradas, sin inversores.'
      ]
    },
    see: ['comb1', 'comb2', 'comb3']
  },

  // ---------- Secuenciales
  {
    id: 'secuencial',
    t: 'Diseñar un circuito secuencial',
    g: 'Secuenciales',
    when: 'Cuando el circuito tiene que recordar algo: contadores, detectores de secuencia, semáforos. La señal en el enunciado es cualquier palabra que implique historia — «después de», «mientras no», «cuando haya recibido».',
    steps: [
      {
        s: 'Decide los estados y dale a cada uno un nombre que diga qué recuerda.',
        note: '«He visto 1, 0» es un nombre útil; «S2» no. Con nombres descriptivos el diagrama sale casi solo y las transiciones se comprueban leyendo.'
      },
      {
        s: 'Dibuja el diagrama de estados: de cada estado sale una flecha por cada valor posible de la entrada.',
        note: 'Por cada valor, sin excepción. Un estado al que le falta una flecha es un circuito que se cuelga, y es el fallo estructural más habitual.'
      },
      {
        s: 'Codifica los estados en binario y monta la tabla de transiciones.',
        note: 'Con n biestables cubres 2ⁿ estados. Las combinaciones sobrantes se marcan como indiferentes y ayudan a simplificar.'
      },
      {
        s: 'Deduce las entradas de cada biestable con su tabla de excitación.',
        note: 'Cada tipo tiene la suya: en un D, la entrada es directamente el estado siguiente; en un JK hay que mirar la transición. Elegir bien el tipo ahorra la mitad de la lógica.'
      },
      {
        s: 'Simplifica cada función con Karnaugh y dibuja.',
        note: 'Una función por cada entrada de biestable, más las de las salidas.'
      },
      {
        s: 'Recorre el diagrama con una secuencia de prueba.',
        note: 'Incluyendo el arranque: qué hace el circuito en el primer ciclo si no se ha inicializado.'
      }
    ],
    trap: 'Confundir Moore con Mealy a mitad del problema. En Moore la salida depende solo del estado y se escribe dentro del círculo; en Mealy depende del estado y de la entrada, y va sobre la flecha. Empezar con uno y terminar con otro produce salidas adelantadas o atrasadas un ciclo.',
    ex: {
      q: 'Detector de la secuencia 11 en una entrada serie (Moore).',
      walk: [
        'Estados: A = «no he visto ningún 1», B = «he visto un 1», C = «he visto dos 1 seguidos».',
        'Transiciones: A con 0 → A, con 1 → B. B con 0 → A, con 1 → C. C con 0 → A, con 1 → C.',
        'Salida (Moore): 0 en A y B, 1 en C.',
        'Codifico A=00, B=01, C=10; sobra 11 → indiferente.',
        'Con biestables D: D1 y D0 salen de la tabla de transiciones y se simplifican con Karnaugh.',
        'Prueba con 0 1 1 0 1: A → A → B → C(salida 1) → A → B. ✓'
      ]
    },
    see: ['sec1', 'sec2', 'sec3', 'sec4']
  },

  // ---------- Memoria y arquitectura
  {
    id: 'cache',
    t: 'Localizar un bloque en la caché',
    g: 'Memoria',
    when: 'Cuando dan un tamaño de caché, un tamaño de bloque y una dirección, y preguntan en qué línea cae, si es acierto o fallo, o cuántos bits tiene cada campo. Con directa, asociativa o asociativa por conjuntos el procedimiento es el mismo: cambia solo el número de conjuntos.',
    steps: [
      {
        s: 'Apunta los tres datos en potencias de 2: tamaño de bloque, número de líneas y vías.',
        note: 'Todo el problema es contar bits, y en potencias de 2 se cuentan solos. Si un dato viene en KB, pásalo a bytes antes de nada.'
      },
      {
        s: 'Bits de desplazamiento = log₂(bytes por bloque).',
        note: 'Es la parte baja de la dirección: qué byte dentro del bloque. No interviene en decidir dónde va el bloque.'
      },
      {
        s: 'Número de conjuntos = líneas totales / vías. Bits de índice = log₂(conjuntos).',
        note: 'En directa, vías = 1 y hay tantos conjuntos como líneas. En totalmente asociativa hay un solo conjunto, así que no hay bits de índice.'
      },
      {
        s: 'Bits de etiqueta = lo que queda de la dirección.',
        note: 'etiqueta = ancho de dirección − índice − desplazamiento. Si la suma no cuadra, hay un log mal.'
      },
      {
        s: 'Parte la dirección concreta en los tres campos y localiza el conjunto.',
        note: 'Pasa la dirección a binario y corta por los cortes que acabas de calcular. Es acierto si alguna vía de ese conjunto tiene esa etiqueta y el bit de válido a 1.'
      }
    ],
    trap: 'Usar el número de líneas donde va el número de conjuntos. En una caché asociativa de 4 vías con 64 líneas hay 16 conjuntos, no 64: el índice son 4 bits, no 6. Los dos bits de diferencia se van a la etiqueta y toda la respuesta cambia.',
    ex: {
      q: 'Caché de 8 KB, bloques de 32 B, asociativa de 4 vías, direcciones de 32 bits. ¿Cómo se parte la dirección?',
      walk: [
        'Líneas totales = 8192 / 32 = 256.',
        'Conjuntos = 256 / 4 = 64.',
        'Desplazamiento = log₂(32) = 5 bits.',
        'Índice = log₂(64) = 6 bits.',
        'Etiqueta = 32 − 6 − 5 = 21 bits.',
        'Dirección: [21 etiqueta | 6 índice | 5 desplazamiento]. Suma 32. ✓'
      ]
    },
    see: ['mem1', 'mem2']
  },
  {
    id: 'rendimiento',
    t: 'Calcular tiempo de CPU, CPI y ganancia',
    g: 'Arquitectura',
    when: 'Cuando el enunciado da frecuencias, ciclos por instrucción o porcentajes de mejora y pregunta cuál máquina es más rápida o cuánto se gana. Es aritmética, y se falla por mezclar unidades, no por no saber la fórmula.',
    steps: [
      {
        s: 'Escribe la fórmula base: T = nº instrucciones × CPI × tiempo de ciclo.',
        note: 'Y recuerda que tiempo de ciclo = 1 / frecuencia. Trabajar en segundos y hercios evita la mitad de los errores.'
      },
      {
        s: 'Si hay varios tipos de instrucción, calcula el CPI medio ponderando por su frecuencia de uso.',
        note: 'CPI medio = Σ (porcentaje × CPI del tipo). Los porcentajes tienen que sumar 1, no 100, al multiplicar.'
      },
      {
        s: 'Para comparar dos máquinas, calcula los dos tiempos y divide.',
        note: 'La ganancia es tiempo_viejo / tiempo_nuevo. Si sale menor que 1, la «mejora» empeora, y eso a veces es la respuesta correcta.'
      },
      {
        s: 'Si mejoras solo una parte, aplica Amdahl: la parte que no tocas no mejora.',
        note: 'Ganancia global = 1 / ((1−f) + f/k), con f la fracción de tiempo afectada y k la mejora local. Es la fracción de TIEMPO, no de instrucciones.'
      },
      {
        s: 'Comprueba el orden de magnitud antes de dar el resultado.',
        note: 'Si acelerar 10× una parte que ocupa el 20 % te sale una ganancia de 5, hay algo mal: el techo de Amdahl ahí es 1,25.'
      }
    ],
    trap: 'Aplicar Amdahl con la fracción de instrucciones en vez de la fracción de tiempo. Si las multiplicaciones son el 30 % de las instrucciones pero el 60 % del tiempo, f es 0,6. Usar 0,3 da una ganancia optimista que no se parece a la real.',
    ex: {
      q: 'Una mejora acelera 4× una parte que ocupa el 40 % del tiempo. ¿Cuánto gana el programa?',
      walk: [
        'f = 0,4 (fracción de TIEMPO afectada), k = 4.',
        'Ganancia = 1 / ((1 − 0,4) + 0,4/4) = 1 / (0,6 + 0,1) = 1 / 0,7.',
        '≈ 1,43×.',
        'Es decir: acelerar 4× una parte da un 43 % de mejora global, no un 400 %.',
        'Techo: aunque esa parte tardase 0, la ganancia máxima sería 1/0,6 ≈ 1,67×.'
      ]
    },
    see: ['arq1', 'arq2', 'arq3']
  }
]
