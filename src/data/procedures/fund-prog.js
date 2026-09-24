// ============================================================
// Cómo se hace — Fundamentos de Programación
// ------------------------------------------------------------
// Programar no se entiende leyendo: se entiende trazando. La diferencia
// entre quien saca la asignatura y quien no suele ser que uno sabe
// simular el código a mano, línea a línea, y el otro lo mira esperando
// entenderlo de golpe. Casi todos los procedimientos de aquí son
// variantes de eso mismo.
//
// Misma forma que en las otras asignaturas:
// id · t · g · when · steps · trap · ex · see
// ============================================================
export const FUND_PROG_PROCEDURES = [
  // ---------- Control
  {
    id: 'traza',
    t: 'Trazar un fragmento de código a mano',
    g: 'Control',
    when: 'Cuando el enunciado pregunta qué imprime, qué vale una variable al final, o por qué el resultado no es el esperado. Es también lo primero que hay que hacer cuando tu propio código no funciona y no sabes por qué.',
    steps: [
      {
        s: 'Dibuja una tabla con una columna por variable y una fila por vuelta.',
        note: 'En la cabeza no cabe. Tres variables y cinco vueltas ya son quince valores, y el fallo siempre está en el que creías recordar.'
      },
      {
        s: 'Anota los valores iniciales antes de entrar en ningún bucle.',
        note: 'Incluidos los que Java pone por defecto. Una variable local sin inicializar no vale 0: no compila, y eso ya es la respuesta.'
      },
      {
        s: 'Ejecuta línea a línea, escribiendo el valor nuevo aunque no cambie.',
        note: 'Saltarte las líneas «que no hacen nada» es justo cómo se pasan por alto los i++ dentro del cuerpo.'
      },
      {
        s: 'En cada bucle, evalúa la condición ANTES de entrar y anota si es cierta o falsa.',
        note: 'Es el paso que casi nadie escribe y donde está la mitad de los fallos: bucles que no entran nunca, o que dan una vuelta de más.'
      },
      {
        s: 'Marca en la tabla dónde se imprime algo y qué se imprime exactamente.',
        note: 'Con los saltos de línea: print y println no dan la misma salida, y el enunciado suele preguntar por la salida literal.'
      },
      {
        s: 'Comprueba la última vuelta y la salida del bucle.',
        note: 'Los errores de off-by-one viven ahí. Si el bucle es i < n, la última vuelta es con i = n−1, y al salir i vale n.'
      }
    ],
    trap: 'Confundir la asignación con la comparación al trazar. En Java `=` asigna y `==` compara; `if (a = b)` ni siquiera compila con enteros, pero con booleanos sí, y entonces cambia el valor de a mientras lo evalúa. Al trazar, lee el operador antes de escribir el valor.',
    ex: {
      q: '¿Qué imprime? int s = 0; for (int i = 1; i <= 4; i++) { s += i; } System.out.println(s);',
      walk: [
        'Inicial: s = 0, i = 1.',
        'i=1: condición 1<=4 cierta → s = 0+1 = 1. i pasa a 2.',
        'i=2: cierta → s = 1+2 = 3. i pasa a 3.',
        'i=3: cierta → s = 3+3 = 6. i pasa a 4.',
        'i=4: cierta → s = 6+4 = 10. i pasa a 5.',
        'i=5: 5<=4 falsa → sale del bucle.',
        'Imprime 10. Nota: i ya no existe fuera del for, está declarada dentro.'
      ]
    },
    see: ['fc1', 'fc2']
  },
  {
    id: 'elegir-bucle',
    t: 'Elegir y escribir el bucle correcto',
    g: 'Control',
    when: 'Cada vez que hay que repetir algo. La elección no es de estilo: un while donde tocaba un do-while cambia el comportamiento cuando la primera comprobación es falsa, y eso es lo que se pregunta.',
    steps: [
      {
        s: 'Pregúntate si sabes de antemano cuántas vueltas son.',
        note: 'Si el número es conocido — recorrer un vector, contar hasta n — es un for. Si depende de algo que pasa dentro, es un while.'
      },
      {
        s: 'Pregúntate si el cuerpo tiene que ejecutarse al menos una vez.',
        note: 'Si sí — pedir un dato hasta que sea válido —, es do-while. Es el único caso en que se usa, y por eso se olvida.'
      },
      {
        s: 'Escribe la condición de PARADA en castellano y después niégala.',
        note: 'Es más fácil acertar así: «paro cuando el usuario escriba 0» → la condición de seguir es `dato != 0`. Escribirla directa es de donde salen los bucles infinitos.'
      },
      {
        s: 'Comprueba que algo dentro del cuerpo hace avanzar la condición.',
        note: 'Si la variable de la condición no se toca dentro, el bucle no termina. Señálala con el dedo en el papel antes de seguir.'
      },
      {
        s: 'Prueba mentalmente los tres casos frontera: cero vueltas, una vuelta y la última.',
        note: 'Un vector vacío, un vector de un elemento y el último índice. Ahí se cae casi todo lo que se cae.'
      }
    ],
    trap: 'Poner un punto y coma tras el for o el while: `while (i < n);` compila y deja el cuerpo vacío, así que el programa se cuelga sin dar ningún error. El compilador no avisa porque es código legal, y a simple vista el bucle parece correcto.',
    ex: {
      q: 'Leer números hasta que el usuario escriba 0, y sumar los leídos.',
      walk: [
        '¿Sé cuántas vueltas? No, depende de lo que escriba → while o do-while.',
        '¿Hay que leer al menos una vez? Sí, hay que leer para saber si es 0 → do-while.',
        'Parada: «cuando escriba 0» → condición de seguir: n != 0.',
        'int s = 0, n; do { n = sc.nextInt(); s += n; } while (n != 0);',
        'El 0 se suma, pero sumar 0 no cambia nada: correcto y más corto que comprobarlo.',
        'Avance: n se reasigna dentro, así que la condición puede volverse falsa. ✓'
      ]
    },
    see: ['fc3', 'fc4']
  },

  // ---------- Tipos
  {
    id: 'comparar',
    t: 'Comparar dos valores sin equivocarte de operador',
    g: 'Tipos',
    when: 'Siempre que haya un if con dos cosas a los lados. Parece trivial y es la fuente de errores más constante de la asignatura, porque el código compila y se ejecuta: simplemente decide mal.',
    steps: [
      {
        s: 'Mira si lo que comparas es un tipo primitivo o un objeto.',
        note: 'int, double, char, boolean son primitivos. String, Integer, arrays y cualquier clase tuya son objetos. La regla cambia por completo entre los dos.'
      },
      {
        s: 'Primitivos: usa ==, y funciona como esperas.',
        note: 'Con char también: \'a\' == 97 es cierto, porque un char es su código.'
      },
      {
        s: 'Objetos: usa equals, nunca ==.',
        note: '== en objetos compara si son la MISMA instancia en memoria, no si valen lo mismo. Con Strings a veces acierta por casualidad (las literales se comparten) y por eso engaña tanto.'
      },
      {
        s: 'Con decimales, no compares por igualdad: compara la diferencia.',
        note: 'Math.abs(a − b) < 1e-9. Los double no representan exactamente 0,1, así que 0.1 + 0.2 == 0.3 es falso, y eso no es un error tuyo.'
      },
      {
        s: 'Antes de llamar a equals, comprueba que el objeto no es null.',
        note: 'Mejor aún: pon la constante delante, "sí".equals(respuesta), que nunca explota aunque respuesta sea null.'
      }
    ],
    trap: 'Comparar dos String con ==. Con literales cortos parece funcionar porque Java reutiliza la misma instancia; en cuanto el texto viene de un Scanner o de una concatenación, la comparación es falsa aunque las dos cadenas se lean igual. Es el fallo que más tiempo hace perder depurando.',
    ex: {
      q: '¿Qué imprime? String a = "hola"; String b = new String("hola"); System.out.println(a == b); System.out.println(a.equals(b));',
      walk: [
        'a apunta al literal "hola" del pool de cadenas.',
        'new String("hola") crea una instancia NUEVA con el mismo contenido.',
        'a == b compara las referencias: son distintas → false.',
        'a.equals(b) compara el contenido carácter a carácter → true.',
        'Imprime: false y luego true.',
        'Moraleja: con Strings, siempre equals.'
      ]
    },
    see: ['ft1', 'ft2', 'fs1']
  },
  {
    id: 'conversiones',
    t: 'Convertir entre tipos sin perder datos por el camino',
    g: 'Tipos',
    when: 'Cuando mezclas enteros y decimales en una operación, cuando lees un dato de teclado y lo necesitas como número, o cuando el resultado de una división sale «mal redondeado» sin motivo aparente.',
    steps: [
      {
        s: 'Identifica el tipo de CADA operando antes de operar.',
        note: 'En Java el tipo del resultado lo deciden los operandos, no la variable donde lo guardas. Es el origen de casi todas las sorpresas.'
      },
      {
        s: 'Si los dos son enteros, la división es entera: el resto se tira.',
        note: '7 / 2 vale 3, no 3,5. Y asignarlo a un double no lo arregla: el 3,5 ya se perdió antes de la asignación.'
      },
      {
        s: 'Para forzar decimales, convierte uno de los dos operandos.',
        note: '(double) 7 / 2 da 3,5. Cuidado con (double) (7 / 2), que primero divide entero y luego convierte: da 3,0.'
      },
      {
        s: 'De más grande a más pequeño hay que hacer cast explícito, y se pierde información.',
        note: '(int) 3.9 vale 3: trunca, no redondea. Para redondear se usa Math.round.'
      },
      {
        s: 'De texto a número se usa Integer.parseInt o Double.parseDouble.',
        note: 'No hay cast de String a int. Y si el texto no es un número, lanza excepción: eso hay que preverlo.'
      }
    ],
    trap: 'Escribir `double media = suma / n;` con suma y n enteros. La división se hace entera antes de asignar, así que la media sale sin decimales y la variable double no lo remedia. El cast hay que ponerlo dentro: `(double) suma / n`.',
    ex: {
      q: '¿Qué vale? int a = 7, b = 2; double x = a / b; double y = (double) a / b; int z = (int) 3.9;',
      walk: [
        'a / b: los dos son int → división entera → 3.',
        'x = 3 convertido a double = 3.0. El 0,5 se perdió antes de asignar.',
        '(double) a convierte a a 7.0; 7.0 / 2 mezcla double e int → double → 3.5.',
        'y = 3.5.',
        '(int) 3.9 trunca la parte decimal → z = 3, no 4.',
        'Para 4 haría falta Math.round(3.9).'
      ]
    },
    see: ['ft3', 'ft4']
  },

  // ---------- Vectores
  {
    id: 'recorrer-vector',
    t: 'Recorrer un vector: buscar, acumular, encontrar el máximo',
    g: 'Vectores',
    when: 'Prácticamente en todo ejercicio con arrays. Los tres patrones se parecen tanto que se mezclan, y cada uno tiene su forma de inicializar y su condición de salida.',
    steps: [
      {
        s: 'Decide cuál de los tres patrones es: acumular, buscar o seleccionar.',
        note: 'Acumular recorre siempre entero. Buscar puede salirse antes. Seleccionar (máximo, mínimo) recorre entero pero guarda un candidato.'
      },
      {
        s: 'Inicializa el acumulador con el valor neutro de la operación.',
        note: '0 para sumar, 1 para multiplicar. Para el máximo NO uses 0: usa v[0], o un vector de negativos te devolverá 0 como máximo.'
      },
      {
        s: 'Recorre con for (int i = 0; i < v.length; i++).',
        note: 'length sin paréntesis en arrays, con paréntesis en String. Y el último índice válido es length−1: llegar a length lanza ArrayIndexOutOfBounds.'
      },
      {
        s: 'Si es una búsqueda, guarda la posición y sal del bucle.',
        note: 'Inicializa la posición a −1 para poder distinguir «no encontrado» de «encontrado en la posición 0», que es un caso real.'
      },
      {
        s: 'Después del bucle, comprueba el caso del vector vacío.',
        note: 'El máximo de un vector vacío no existe: hay que decidir qué devolver y decirlo. El for no entra, así que el error sale más tarde y despistado.'
      }
    ],
    trap: 'Inicializar el máximo a 0 en vez de a v[0]. Con temperaturas bajo cero, saldos negativos o diferencias, el algoritmo devuelve 0 — un valor que no está en el vector — y el error pasa desapercibido porque parece razonable.',
    ex: {
      q: 'Devuelve la posición del máximo de un vector de enteros.',
      walk: [
        'Patrón: seleccionar. Recorro entero y guardo un candidato.',
        'Vector vacío: no hay máximo → devuelvo −1.',
        'if (v.length == 0) return -1;',
        'int pos = 0;  ← el primer elemento, no 0 como valor',
        'for (int i = 1; i < v.length; i++) if (v[i] > v[pos]) pos = i;',
        'return pos;',
        'Empiezo en i = 1 porque el 0 ya es el candidato inicial. Con > (y no >=) me quedo con la primera aparición si hay empate.'
      ]
    },
    see: ['fv1', 'fv2', 'fv3', 'fv4']
  },

  // ---------- Métodos y objetos
  {
    id: 'escribir-metodo',
    t: 'Escribir un método a partir de un enunciado',
    g: 'Métodos',
    when: 'Cuando el enunciado dice «escribe un método que…». La cabecera se escribe antes que el cuerpo: decidir qué entra y qué sale resuelve la mitad del ejercicio y evita el método que imprime cuando debía devolver.',
    steps: [
      {
        s: 'Subraya en el enunciado qué datos entran y qué tiene que salir.',
        note: 'Entra → parámetros. Sale → tipo de retorno. Si no sale nada y solo modifica o imprime, es void.'
      },
      {
        s: 'Escribe la cabecera completa antes del cuerpo.',
        note: 'public static int contarPares(int[] v). Con la cabecera delante, el cuerpo no se desvía: ya sabes qué tienes que devolver.'
      },
      {
        s: 'Distingue «devolver» de «imprimir».',
        note: 'Devolver da un valor al que llama, que puede hacer lo que quiera con él. Imprimir lo escribe en pantalla y se pierde. Si el enunciado dice devuelve, un println no vale.'
      },
      {
        s: 'Escribe el cuerpo y asegúrate de que hay un return en TODOS los caminos.',
        note: 'Si hay un if sin else, el compilador te lo dirá. Si el return está dentro de un for, también: puede que el for no entre.'
      },
      {
        s: 'Prueba con los casos frontera desde main.',
        note: 'Vector vacío, un solo elemento, todos iguales. Esos tres casos cazan casi todo.'
      }
    ],
    trap: 'Creer que modificar un parámetro cambia la variable de fuera. En Java todo se pasa por valor: reasignar un parámetro no afecta al original. Con un array sí puedes cambiar su CONTENIDO (porque se copia la referencia), pero `v = new int[5]` dentro del método no se ve fuera.',
    ex: {
      q: 'Escribe un método que devuelva cuántos números pares hay en un vector.',
      walk: [
        'Entra: un vector de enteros. Sale: un entero (la cuenta).',
        'Cabecera: public static int contarPares(int[] v)',
        'Acumulador: int n = 0; ← patrón de acumular, valor neutro 0.',
        'for (int i = 0; i < v.length; i++) if (v[i] % 2 == 0) n++;',
        'return n;  ← devuelve, no imprime.',
        'Frontera: vector vacío → el for no entra → devuelve 0, que es correcto.',
        'Ojo con los negativos: en Java −3 % 2 vale −1, así que para impares no sirve == 1; con pares y == 0 no hay problema.'
      ]
    },
    see: ['fm1', 'fm2', 'fm3', 'fm4']
  },
  {
    id: 'escribir-clase',
    t: 'Escribir una clase a partir de un enunciado',
    g: 'Objetos',
    when: 'Cuando el enunciado describe una cosa con características y acciones: una cuenta bancaria, un libro, un alumno. Los sustantivos del enunciado son atributos y los verbos son métodos, casi literalmente.',
    steps: [
      {
        s: 'Subraya los sustantivos: son los atributos. Ponlos privados.',
        note: 'private no es burocracia: impide que desde fuera dejen el objeto en un estado imposible, como un saldo negativo o una nota de 12.'
      },
      {
        s: 'Escribe el constructor con los datos que hacen falta para que el objeto nazca válido.',
        note: 'Si un dato empieza siempre igual (un saldo a 0, una lista vacía) no se pide por parámetro: se inicializa dentro.'
      },
      {
        s: 'Añade getters para lo que se consulte desde fuera, y setters solo donde tenga sentido cambiarlo.',
        note: 'Un setter para cada atributo, por defecto, es tirar el encapsulamiento por la ventana. El DNI de un alumno no tiene setter.'
      },
      {
        s: 'Subraya los verbos: son los métodos. Cada uno valida antes de tocar el estado.',
        note: 'ingresar(cantidad) comprueba que la cantidad sea positiva ANTES de sumarla. Esa comprobación es lo que justifica que el atributo sea privado.'
      },
      {
        s: 'Añade toString para poder imprimir el objeto entero de un vistazo.',
        note: 'Sin él, imprimir el objeto muestra la clase y un código en hexadecimal, que no dice nada al depurar.'
      },
      {
        s: 'Prueba desde un main creando dos objetos distintos.',
        note: 'Dos, no uno: es como se detecta haber declarado un atributo static por error, que lo compartirían.'
      }
    ],
    trap: 'Declarar los atributos static «porque así se ven desde main». static significa que el atributo pertenece a la clase, no al objeto: todas las cuentas compartirían el mismo saldo. Los atributos de un objeto no llevan static nunca; a main se llega creando una instancia.',
    ex: {
      q: 'Clase Cuenta con titular y saldo, que permita ingresar y retirar.',
      walk: [
        'Sustantivos: titular (String), saldo (double) → atributos privados.',
        'El saldo empieza a 0, así que no va en el constructor: Cuenta(String titular).',
        'Getters: getTitular(), getSaldo(). Setter: ninguno — el saldo solo cambia por ingresar y retirar.',
        'Verbos: ingresar(double c) → if (c > 0) saldo += c;',
        'retirar(double c) → if (c > 0 && c <= saldo) { saldo -= c; return true; } return false;',
        'retirar devuelve boolean para que quien llama sepa si se pudo.',
        'toString(): titular + ": " + saldo + " €".'
      ]
    },
    see: ['fo1', 'fo2', 'fo3']
  },

  // ---------- Excepciones
  {
    id: 'excepciones',
    t: 'Decidir qué hacer con una excepción',
    g: 'Excepciones',
    when: 'Cuando el programa puede recibir algo que no controlas: un dato de teclado, un fichero, una división. También cuando el compilador te obliga con «unreported exception», que es su forma de decir que ese error hay que tratarlo o declararlo.',
    steps: [
      {
        s: 'Distingue si es comprobada o no comprobada.',
        note: 'Las comprobadas (IOException) el compilador te obliga a tratarlas. Las no comprobadas (NullPointer, ArrayIndexOutOfBounds, ArithmeticException) son casi siempre errores tuyos de lógica.'
      },
      {
        s: 'Si es un error tuyo, no lo captures: arréglalo.',
        note: 'Envolver un ArrayIndexOutOfBounds en un try-catch esconde el bug en vez de quitarlo. Ese índice está mal calculado y hay que corregir el cálculo.'
      },
      {
        s: 'Si es una situación externa que puedes manejar aquí, captúrala con try-catch.',
        note: 'El try lleva solo las líneas que pueden fallar. Meter medio método dentro hace que no sepas qué falló.'
      },
      {
        s: 'Si no sabes qué hacer con ella aquí, propágala con throws.',
        note: 'Es una decisión legítima: quien te llamó tendrá más contexto para decidir. Lo que no vale es capturarla y dejar el catch vacío.'
      },
      {
        s: 'En el catch, haz algo de verdad: avisar, reintentar o dar un valor por defecto.',
        note: 'Un catch vacío convierte un error visible en un error silencioso, que es mucho peor. Como mínimo, imprime el mensaje.'
      },
      {
        s: 'Captura de lo más concreto a lo más general.',
        note: 'Si pones catch (Exception) el primero, los catch siguientes son inalcanzables y no compila.'
      }
    ],
    trap: 'El catch vacío. `catch (Exception e) { }` compila, silencia el problema y hace que el programa siga con datos basura. Cuando aparezca el fallo de verdad será tres métodos más allá y sin ninguna pista de dónde empezó.',
    ex: {
      q: 'Leer un entero por teclado insistiendo hasta que el usuario escriba uno válido.',
      walk: [
        'Un texto no numérico lanza InputMismatchException: es externa y la puedo manejar aquí → try-catch.',
        'Hace falta repetir hasta acertar, y al menos una lectura → bucle con do-while.',
        'int n = 0; boolean ok = false;',
        'do { try { n = sc.nextInt(); ok = true; } catch (InputMismatchException e) { System.out.println("Eso no es un número"); sc.next(); } } while (!ok);',
        'El sc.next() del catch es imprescindible: sin él, el dato erróneo se queda en el buffer y el bucle gira infinitamente.',
        'El catch hace algo (avisa y limpia), no está vacío. ✓'
      ]
    },
    see: ['fe1', 'fe2', 'fe3']
  },

  // ---------- Bases
  {
    id: 'leer-error',
    t: 'Leer un error del compilador',
    g: 'Bases',
    when: 'La primera vez que el código no compila, que es varias veces al día. Aprender a leer estos mensajes ahorra más tiempo que cualquier otra cosa de la asignatura, y no se enseña en ninguna clase.',
    steps: [
      {
        s: 'Ve al PRIMER error de la lista, no al último.',
        note: 'Un punto y coma olvidado genera diez errores en cascada. Casi siempre, arreglar el primero hace desaparecer el resto.'
      },
      {
        s: 'Mira el número de línea, y también la anterior.',
        note: 'El compilador señala dónde se dio cuenta, no dónde está el fallo. Un `;` que falta se detecta en la línea siguiente.'
      },
      {
        s: 'Traduce el mensaje: los cinco habituales siempre quieren decir lo mismo.',
        note: '«cannot find symbol» → nombre mal escrito o variable fuera de su ámbito. «incompatible types» → falta un cast o el método devuelve otra cosa. «missing return statement» → hay un camino sin return.'
      },
      {
        s: 'Distingue error de compilación de error en ejecución.',
        note: 'Si el programa llegó a arrancar, el problema no es de sintaxis: es lógica, y ahí toca trazar, no releer.'
      },
      {
        s: 'Recompila después de cada arreglo, no de cinco.',
        note: 'Arreglar en bloque hace imposible saber cuál era el fallo de verdad y cuál te acabas de inventar.'
      }
    ],
    trap: 'Empezar por el error de más abajo porque parece «el importante». La lista está en orden de aparición y los de abajo suelen ser consecuencia de los de arriba. Corrige el primero, recompila, y mira qué queda.',
    ex: {
      q: '«cannot find symbol: variable total» en la línea 12.',
      walk: [
        'Tres causas posibles, en este orden de probabilidad:',
        '1. Está escrita distinto: Total, totla, total_.',
        '2. Está declarada dentro de un bloque ({ }) y la línea 12 está fuera: se acabó su ámbito.',
        '3. No está declarada, o la declaración está DESPUÉS de la línea 12.',
        'Miro la declaración: si está dentro de un for y la uso al salir, es el caso 2.',
        'Arreglo: declararla antes del bucle, no dentro.',
        'Recompilo antes de tocar nada más.'
      ]
    },
    see: ['fb1', 'fb2', 'fb3']
  }
]
