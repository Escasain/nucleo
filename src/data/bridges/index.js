// Puentes: la misma idea vista desde varias asignaturas.
//
// Estudiar tres asignaturas a la vez por tu cuenta da la sensación de
// estar dándote contra tres paredes distintas. Casi nunca lo son. La
// lógica de Álgebra, las puertas de Tecnología y el `if` de Java son
// literalmente el mismo álgebra escrita en tres notaciones, y verlo
// convierte tres temas en uno.
//
// Cada puente tiene una parte que no suele escribirse en ningún sitio y
// que es la que más vale: DÓNDE DEJA DE VALER la analogía. Una analogía
// a medias hace más daño que ninguna, porque se aplica con confianza
// justo en el caso en que falla — y ese caso es el que cae en el examen.
//
//   t      → cómo se llama el puente
//   idea   → la idea desnuda, sin asignatura encima
//   ends   → dónde te la encuentras: { s: asignatura, node: tema del
//            mapa, as: con qué notación, how: qué forma toma allí }
//   same   → qué se traslada de verdad, sin matices
//   breaks → dónde se rompe. Lo importante.
//   check  → algo concreto que puedes comprobar en diez minutos
//   later  → asignaturas posteriores donde vuelve a salir
//
// Módulo pesado solo por el texto: impórtalo bajo demanda. Para saber
// si una asignatura tiene puentes está meta.js, que no carga nada.

export const BRIDGES = [
  {
    id: 'boole',
    t: 'La misma álgebra, en tres notaciones',
    idea:
      'Verdadero y falso con tres operaciones —y, o, no— y una lista fija de leyes. Quien decide qué significan esas leyes es la tabla de verdad, no el símbolo con el que se escriban.',
    ends: [
      {
        s: 'algebra',
        node: 'logica',
        as: '∧  ∨  ¬  →',
        how: 'Lógica proposicional: tablas de verdad, equivalencias y demostraciones.'
      },
      {
        s: 'tec-comp',
        node: 'boole',
        as: 'AND  OR  NOT',
        how: 'Lo mismo pero dibujado: puertas, y Karnaugh para simplificar antes de construir el circuito.'
      },
      {
        s: 'fund-prog',
        node: 'control',
        as: '&&  ||  !',
        how: 'Lo mismo pero ejecutándose: la condición de un if o de un while.'
      }
    ],
    same:
      'Las leyes son idénticas, no parecidas. De Morgan ¬(p∧q) ≡ ¬p∨¬q es la misma ley que !(a && b) equivale a (!a || !b), y es la misma que la puerta NAND. Lo importante en la práctica: si simplificas una condición enrevesada con Karnaugh, la condición simplificada es correcta en Java. Puedes usar la herramienta de una asignatura para arreglar el código de otra.',
    breaks:
      'Dos sitios, y los dos muerden.\n\nUno: el cortocircuito. En un circuito las dos entradas de una puerta están siempre ahí; en Java, && no evalúa la parte derecha si la izquierda ya decide el resultado. Por eso «v != null && v.length > 0» funciona y con los dos lados cambiados de orden revienta. Como valores, p∧q conmuta; como código, && no conmuta en cuanto uno de los lados puede fallar. Si quieres el comportamiento de la puerta, el operador es & y evalúa siempre los dos.\n\nDos: en Java no existe →. La implicación hay que escribirla como !p || q, y es justo la traducción que todo el mundo se salta.',
    check:
      'Coge la condición más enrevesada que tengas escrita. Hazle la tabla de verdad con sus cuatro u ocho filas, simplifícala con Karnaugh y reescribe el if con el resultado. Si las dos tablas coinciden fila a fila, el if nuevo es correcto — y casi siempre sale la mitad de largo.'
  },
  {
    id: 'bases',
    t: 'Contar en otra base, y qué pasa cuando no cabe',
    idea:
      'Un número no es su escritura. 255, FF y 11111111 son el mismo número; la base solo decide cuántos símbolos usas para escribirlo.',
    ends: [
      {
        s: 'tec-comp',
        node: 'numeracion',
        as: 'binario, hexadecimal, complemento a dos',
        how: 'Cómo se representa un número con un número fijo de bits, y qué pasa con los negativos.'
      },
      {
        s: 'algebra',
        node: 'aritmetica',
        as: 'a ≡ b (mod n)',
        how: 'Congruencias: identificar números que dejan el mismo resto.'
      },
      {
        s: 'fund-prog',
        node: 'tipos',
        as: 'byte, int, long',
        how: 'Cuántos bits tiene cada tipo y, por tanto, hasta dónde sabe contar.'
      }
    ],
    same:
      'El complemento a dos ES aritmética modular. Un int de 32 bits cuenta módulo 2³². Lo único que cambia entre lo que haces en Álgebra y lo que hace la máquina es qué representante se elige de cada clase de equivalencia: en Álgebra se suele coger 0…n-1, y el int coge -2³¹…2³¹-1. Misma aritmética, distinto representante.',
    breaks:
      'Por eso Integer.MAX_VALUE + 1 no da error: da Integer.MIN_VALUE. No es un fallo de Java, es el representante que le toca a esa clase.\n\nDonde sí se rompe de verdad es en el resto. En Álgebra, -7 mod 3 es 2, porque se coge el representante no negativo. En Java, -7 % 3 da -1, porque % conserva el signo del dividendo. No son la misma operación aunque se lean igual, y si necesitas el resto «de libro» hay que corregirlo a mano: ((a % n) + n) % n.',
    check:
      'Suma 100 + 100 en ocho bits, a mano, en complemento a dos. Sale 11001000, que como byte con signo vale -56. Ahora escribe (byte)(100 + 100) y verás que la máquina dice exactamente lo mismo. No se ha equivocado: ha hecho la aritmética modular que tú acabas de hacer en el papel.',
    later: [
      {
        s: 'estructura-comp',
        how: 'La ALU hace exactamente esta aritmética, y los flags de acarreo y desbordamiento son la señal de que el resultado no cabía.'
      }
    ]
  },
  {
    id: 'induccion',
    t: 'Un caso base y un paso: inducción y recursión',
    idea:
      'Para cubrir infinitos casos basta con uno que arranque y una regla que encadene cada caso con el anterior.',
    ends: [
      {
        s: 'algebra',
        node: 'induccion',
        as: 'caso base + hipótesis de inducción',
        how: 'Demostrar una propiedad para todo n sin comprobarla una por una.'
      },
      {
        s: 'fund-prog',
        node: 'metodos',
        as: 'caso base + llamada recursiva',
        how: 'Calcular algo para n llamándose a sí mismo con n-1.'
      }
    ],
    same:
      'No se parecen: son lo mismo escrito dos veces. El caso base de la demostración es el if que corta la recursión. El paso inductivo es la línea que llama al método con n-1. Si tu método recursivo se queda sin caso base, lo que te falta es exactamente lo que le faltaría a la demostración: por dónde empezar.',
    breaks:
      'La inducción no cuesta nada y la recursión sí. Una demostración puede recorrer los naturales enteros sin despeinarse; un método con cien mil llamadas encadenadas revienta con StackOverflowError, porque cada llamada ocupa sitio de verdad en la pila.\n\nY hay algo que la inducción da por hecho: prueba que el resultado es correcto CUANDO el proceso termina. Que termine hay que argumentarlo aparte, y es justo lo que se olvida. Un método recursivo con el caso base bien puesto pero que no se acerca a él en cada llamada es correcto sobre el papel y no acaba nunca.',
    check:
      'Demuestra por inducción que 1+2+…+n = n(n+1)/2. Luego escribe el método recursivo que hace esa suma. Pon las dos cosas una al lado de la otra: el caso base y el paso son las mismas dos líneas, una en castellano y otra en Java.',
    later: [
      {
        s: 'algoritmia',
        how: 'El coste de un algoritmo recursivo sale de una recurrencia, y una recurrencia se resuelve —y se justifica— por inducción.'
      }
    ]
  },
  {
    id: 'equivalencia',
    t: 'Relación de equivalencia y el equals que escribes',
    idea:
      'Decidir cuándo dos cosas distintas cuentan como la misma es una operación con reglas, no una opinión.',
    ends: [
      {
        s: 'algebra',
        node: 'relaciones',
        as: 'reflexiva, simétrica, transitiva',
        how: 'Las tres propiedades que convierten una relación cualquiera en una equivalencia, y las clases que salen de ella.'
      },
      {
        s: 'algebra',
        node: 'aritmetica',
        as: 'a ≡ b (mod n)',
        how: 'El ejemplo de equivalencia que más vas a usar: los restos módulo n.'
      },
      {
        s: 'fund-prog',
        node: 'objetos',
        as: 'equals() y hashCode()',
        how: 'Cuándo tu programa debe tratar dos objetos como el mismo.'
      }
    ],
    same:
      'El contrato de equals en Java ES la definición de relación de equivalencia, con los mismos tres nombres: reflexiva (x.equals(x) es cierto), simétrica y transitiva. No es una analogía cómoda, es que la documentación lo pide así. Y las clases de equivalencia de Álgebra son exactamente los grupos de objetos que tu programa tratará como intercambiables.',
    breaks:
      'Java añade dos cosas que la matemática no tiene.\n\nUna condición extra: si dos objetos son iguales, sus hashCode deben coincidir. Al revés no hace falta, y no puede hacer falta.\n\nY el tiempo. Una relación matemática no cambia. Si metes un objeto en un HashSet y luego modificas un campo que entra en su hashCode, el objeto sigue dentro pero el conjunto ya no lo encuentra: la relación se rompió a mitad, con el objeto ya guardado. Es el motivo de que lo que se usa como clave convenga que sea inmutable.',
    check:
      'Coge el último equals que hayas escrito y pásale las tres propiedades a mano, con dos o tres objetos concretos. La que más se cae es la simetría, en cuanto comparas un objeto con otro de una subclase: a.equals(b) da true y b.equals(a) da false.',
    later: [
      {
        s: 'estructura-datos',
        how: 'Las tablas hash viven de ese contrato: si equals y hashCode no van de la mano, un HashMap pierde objetos que están dentro.'
      }
    ]
  },
  {
    id: 'funciones',
    t: 'Función matemática y método: no todo método es una función',
    idea: 'Una función asigna a cada entrada una salida, siempre la misma, y no hace nada más.',
    ends: [
      {
        s: 'algebra',
        node: 'funciones',
        as: 'dominio, codominio, inyectiva',
        how: 'Fijar los conjuntos de partida y llegada, y preguntarse si la asignación repite o cubre.'
      },
      {
        s: 'fund-prog',
        node: 'metodos',
        as: 'parámetros y tipo de retorno',
        how: 'Declarar qué entra y qué sale: es lo mismo que fijar los conjuntos.'
      }
    ],
    same:
      'El dominio es el tipo de los parámetros y el codominio el tipo de retorno; declararlos es lo que en Álgebra llamabas fijar los conjuntos. E inyectiva sigue significando lo mismo: dos entradas distintas no pueden dar la misma salida. Ahí está, de paso, por qué hashCode no puede ser inyectivo: hay infinitos objetos posibles y solo 2³² valores de salida, así que por fuerza hay colisiones. Eso no es un defecto de Java, es el principio del palomar.',
    breaks:
      'Dos diferencias, y las dos hacen daño.\n\nUna: un método puede devolver cosas distintas con los mismos argumentos, si por dentro lee un campo, la hora o un Scanner. Math.abs(-3) es una función; sc.nextInt() no lo es en absoluto, aunque se escriba igual.\n\nDos: una función total está definida para todo el dominio, y un método puede lanzar una excepción para parte de sus entradas. Cuando eso pasa no es una función sino una función parcial, y la excepción es la forma que tiene Java de decir «este valor no estaba en el dominio».',
    check:
      'Elige tres métodos que hayas escrito y decide cuáles son funciones de verdad. Para cada uno que no lo sea, di qué es lo que lo saca: un campo que lee, algo que escribe fuera, o una entrada para la que no sabe qué devolver.',
    later: [
      {
        s: 'prog-avanzada',
        how: 'Las lambdas y los streams se apoyan en que una función no tenga efectos: cuando los tiene, el resultado pasa a depender del orden.'
      }
    ]
  },
  {
    id: 'matrices',
    t: 'Matriz en papel y array de dos dimensiones',
    idea: 'Una tabla de números a la que se llega por fila y columna.',
    ends: [
      {
        s: 'algebra',
        node: 'matrices',
        as: 'aᵢⱼ, producto, transpuesta',
        how: 'Operar con la tabla entera como si fuera un solo objeto.'
      },
      {
        s: 'fund-prog',
        node: 'vectores',
        as: 'int[][] a;  a[i][j]',
        how: 'La misma tabla, recorrida a mano con bucles anidados.'
      }
    ],
    same:
      'a[i][j] es aᵢⱼ. Y el bucle triple del producto es la definición de producto de matrices leída en voz alta: el índice sobre el que sumas es justo el que desaparece del resultado. Si tienes clara la definición, el bucle se escribe solo; si el bucle no te sale, lo que no tenías claro era la definición.',
    breaks:
      'Tres cosas cambian.\n\nEl índice empieza en 0, no en 1: la fila i de Álgebra es a[i-1] en Java, y ahí se va medio examen.\n\nNo hay producto como operador: a * b con dos int[][] ni siquiera compila. Las operaciones que en Álgebra son un símbolo, aquí son un método que tienes que escribir.\n\nY un int[][] no es una matriz sino un array de arrays: nada impide que a[0] tenga tres elementos y a[1] tenga siete. Si tu producto falla con un caso raro, comprueba primero que eso fuera una matriz.',
    check:
      'Multiplica dos matrices 2×2 a mano y escribe después el triple bucle. Antes de ejecutarlo, señala en el código cuál de los tres índices es el que se suma. Si no lo ves ahí, tampoco lo tenías en el papel.',
    later: [
      {
        s: 'optativa1',
        how: 'Rotar, escalar y proyectar son productos de matrices, y el orden importa precisamente porque el producto no conmuta.'
      }
    ]
  },
  {
    id: 'estado',
    t: 'Acordarse de lo anterior: biestable y variable',
    idea:
      'Un sistema que no responde solo a la entrada de ahora, sino también a lo que traía de antes. Eso es tener estado.',
    ends: [
      {
        s: 'tec-comp',
        node: 'secuenciales',
        as: 'biestables, registros, máquina de estados',
        how: 'El circuito guarda algo entre un flanco de reloj y el siguiente.'
      },
      {
        s: 'fund-prog',
        node: 'control',
        as: 'la variable que sobrevive a la iteración',
        how: 'El acumulador, el contador o la bandera que el bucle arrastra de una vuelta a la siguiente.'
      }
    ],
    same:
      'El acumulador de un bucle es un registro. La tabla de transición de una máquina de estados y la cabecera de un while dicen lo mismo: dado el estado de ahora y la entrada, cuál es el estado siguiente. Cuando un bucle no te sale, dibujarlo como máquina de estados suele enseñarte el caso que te faltaba, porque la tabla obliga a rellenar todas las casillas.',
    breaks:
      'El reloj. En un circuito secuencial todos los biestables toman su valor nuevo a la vez, en el flanco, y todos miran los valores viejos: dos registros cruzados intercambian su contenido y ya está.\n\nEn Java las asignaciones ocurren en orden, una detrás de otra. Por eso a = b; b = a; no intercambia nada: cuando llegas a la segunda línea, a ya vale lo que valía b, y los dos acaban iguales. Esa es exactamente la razón de que en software haga falta una variable auxiliar y en hardware no.',
    check:
      'Dibuja dos biestables que se pasen el valor el uno al otro y sigue dos flancos de reloj. Luego escribe esas dos asignaciones en Java y sigue las dos líneas. El resultado es distinto, y la diferencia entera está en el flanco.'
  },
  {
    id: 'memoria',
    t: 'Direcciones en Tecnología, referencias en Java',
    idea:
      'Una variable puede guardar un dato o guardar dónde está el dato. No es lo mismo, y de esa diferencia depende casi todo.',
    ends: [
      {
        s: 'tec-comp',
        node: 'memoria',
        as: 'dirección y contenido',
        how: 'Celdas numeradas: en una celda puede haber un dato o el número de otra celda.'
      },
      {
        s: 'fund-prog',
        node: 'vectores',
        as: 'int[] b = a;',
        how: 'Asignar un array no copia los números: copia por dónde se llega a ellos.'
      },
      {
        s: 'fund-prog',
        node: 'objetos',
        as: '==  frente a  equals',
        how: 'Comparar la dirección o comparar el contenido.'
      }
    ],
    same:
      'El dibujo de Tecnología —una celda con una dirección dentro, y una flecha a otra celda— es literalmente lo que pasa con un array o un objeto. int[] b = a; copia la flecha, no los números: si tocas b[0], a[0] cambia, porque nunca hubo dos arrays. Y == entre objetos compara direcciones, que es la razón de que comparar Strings con == funcione unas veces y otras no.',
    breaks:
      'En Tecnología la dirección es un número con el que operas: le sumas cuatro y estás en la palabra siguiente. En Java no puedes verla ni sumarle nada, y además no es fija: la máquina virtual puede mover el objeto de sitio cuando le convenga.\n\nAsí que el modelo de celdas contiguas sirve perfectamente para entender qué se copia y qué no, y no sirve en absoluto para razonar sobre dónde está cada cosa ni sobre qué hay al lado.',
    check:
      'Escribe int[] a = {1,2,3}; int[] b = a; b[0] = 9; y, antes de ejecutar nada, dibújalo como lo dibujarías en Tecnología: dos variables, una flecha, un bloque de tres celdas. El dibujo te dice cuánto vale a[0] sin necesidad de ejecutarlo.',
    later: [
      {
        s: 'estructura-comp',
        how: 'Se vuelve sobre esto con la jerarquía de memoria y la caché, y lo que hoy es un dibujo pasa a explicar por qué un recorrido es mucho más rápido que otro.'
      }
    ]
  },
  {
    id: 'conjuntos',
    t: 'Un conjunto guardado en ocho bits',
    idea:
      'Un subconjunto de algo finito es exactamente una respuesta de sí o no para cada elemento, ni más ni menos.',
    ends: [
      {
        s: 'algebra',
        node: 'conjuntos',
        as: '∪  ∩  complementario',
        how: 'Operaciones entre conjuntos y las leyes que cumplen.'
      },
      {
        s: 'tec-comp',
        node: 'boole',
        as: 'OR, AND, NOT bit a bit',
        how: 'Las mismas operaciones aplicadas a cada posición de una palabra.'
      }
    ],
    same:
      'Numera los elementos del universal y pon un bit por cada uno. La unión es un OR, la intersección un AND, el complementario un NOT y la diferencia simétrica un XOR. Las leyes de conjuntos y las de Boole son la misma lista porque son la misma álgebra: De Morgan aparece en las dos con el mismo enunciado, y demostrarlo en una lo demuestra en la otra.',
    breaks:
      'Solo funciona con un universal finito y ordenado. Un conjunto no tiene orden ni tamaño máximo; una máscara de ocho bits fija cuántos elementos puede haber como mucho y, de propina, les da una posición que el conjunto no tenía.\n\nY el cardinal deja de ser gratis: |A| se escribe de un plumazo, pero en bits hay que contar los unos.',
    check:
      'Coge el universal {0,…,7}. Escribe A = {1,3,4} y B = {0,3} como dos bytes, calcula A ∪ B y A ∩ B con OR y AND, y traduce el resultado de vuelta a conjunto. Comprueba de paso De Morgan sobre los bits: sale sola.',
    later: [
      {
        s: 'bbdd',
        how: 'El álgebra relacional que hay debajo de SQL es álgebra de conjuntos: UNION, INTERSECT y EXCEPT son esas mismas operaciones.'
      }
    ]
  }
]
