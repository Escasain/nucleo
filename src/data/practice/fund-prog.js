// ============================================================
// Fundamentos de Programación · problemas
// ------------------------------------------------------------
// En esta asignatura «hacer el problema» es teclearlo y ejecutarlo: la
// mitad de los enunciados piden trazar qué imprime un fragmento, y esa
// mitad se corrige sola en cuanto lo compilas. Hazlo primero a mano y
// luego compruébalo — el objetivo es que puedas predecirlo, no que la
// máquina te lo diga.
//
// Java, que es como se imparte la asignatura.
// ============================================================
export const FUND_PROG_PRACTICE = [
  // ---------- Bases
  {
    id: 'fb1',
    g: 'Bases',
    level: 1,
    q: '¿Qué hace exactamente javac y qué hace la JVM? ¿Por qué el mismo fichero .class funciona en Windows y en Linux sin recompilar?',
    hint: 'Son dos traducciones, no una. Piensa qué idioma habla cada máquina.',
    key: 'javac traduce a bytecode; la JVM traduce el bytecode a la máquina concreta',
    a: 'javac coge tu .java y lo traduce a BYTECODE, que es el idioma de una máquina que no existe: la JVM. El resultado es un .class.\n\nLa JVM es un programa que sí es distinto en cada sistema operativo, y su trabajo es ejecutar ese bytecode traduciéndolo a las instrucciones reales del procesador.\n\nPor eso el .class viaja: no está escrito para Windows ni para Linux, sino para la JVM, y de la diferencia se encarga la JVM de cada sitio. El precio es que necesitas tener una instalada.'
  },
  {
    id: 'fb2',
    g: 'Bases',
    level: 2,
    q: 'Este programa compila sin una queja, pero al ejecutarlo dice que no encuentra el método main. ¿Por qué?\n\npublic class App {\n    public static void Main(String[] args) {\n        System.out.println("Hola");\n    }\n}',
    hint: 'Compila, así que la sintaxis está bien. El problema es quién busca qué.',
    key: 'Main con mayúscula: la JVM busca main, exactamente',
    a: 'El método se llama Main, con M mayúscula. Java distingue mayúsculas de minúsculas, así que para el compilador eso es un método estático más, perfectamente válido, que nadie llama.\n\nLa JVM, al arrancar, busca un método con la firma EXACTA:\n\n    public static void main(String[] args)\n\nNo lo encuentra y aborta. Y este es el motivo de que el error aparezca al ejecutar y no al compilar: no hay nada mal escrito, simplemente no hay puerta de entrada.\n\nLa misma historia con String[] args cambiado por otra cosa, o con main sin static.'
  },
  {
    id: 'fb3',
    g: 'Bases',
    level: 3,
    q: 'Clasifica cada uno como error de compilación o excepción en ejecución, y di cuál:\n\n(a) int x = "hola";\n(b) int[] v = new int[3]; v[3] = 1;\n(c) int a = 5, b = 0; System.out.println(a / b);\n(d) System.out.println("hola")   // sin punto y coma',
    hint: 'Pregúntate en cada uno si el compilador tiene toda la información para saber que va a fallar.',
    key: '(a) y (d) compilación; (b) ArrayIndexOutOfBounds y (c) ArithmeticException en ejecución',
    a: '(a) COMPILACIÓN. Los tipos no encajan y eso se ve sin ejecutar nada: incompatible types: String cannot be converted to int.\n\n(b) EJECUCIÓN — ArrayIndexOutOfBoundsException. El array tiene índices 0, 1 y 2. El compilador no se mete en si un índice se sale: aquí es evidente, pero en general el índice sale de una variable y no hay forma de saberlo antes.\n\n(c) EJECUCIÓN — ArithmeticException: / by zero. Fíjate en que el divisor está en una variable: por eso es de ejecución. Con literales (5 / 0) el compilador sí se da cuenta y protesta antes.\n\n(d) COMPILACIÓN. Falta el punto y coma; es sintaxis pura.\n\nLa regla: si el compilador tiene delante toda la información para saber que está mal, es de compilación. Si depende de lo que valgan las cosas en ese momento, es de ejecución.'
  },

  // ---------- Tipos
  {
    id: 'ft1',
    g: 'Tipos',
    level: 1,
    q: '¿Qué imprime?\n\nint a = 7, b = 2;\nSystem.out.println(a / b);\nSystem.out.println(a % b);\nSystem.out.println((double) a / b);',
    hint: 'Mira el TIPO de cada operación antes de mirar el valor.',
    key: '3, 1 y 3.5',
    a: '3\n1\n3.5\n\na / b son dos int, así que la división es entera: 7 entre 2 da 3 y el 0.5 se pierde. No se redondea, se corta.\n\na % b es el resto de esa división entera: 1.\n\n(double) a / b: el casting se aplica primero a la a, que pasa a valer 7.0. Al ser uno de los dos double, la división ya es decimal: 3.5.\n\nOjo con dónde va el paréntesis: (double)(a / b) daría 3.0, porque primero divide enteros y luego convierte el 3.'
  },
  {
    id: 'ft2',
    g: 'Tipos',
    level: 2,
    q: 'suma vale 7 y n vale 2, los dos int. ¿Qué vale media, y por qué?\n\ndouble media = suma / n;\n\nArréglalo.',
    hint: 'El tipo de la izquierda no cambia lo que pasa a la derecha.',
    key: '3.0; se arregla con (double) suma / n',
    a: 'media vale 3.0.\n\nEl error de lectura es pensar que, como el resultado va a un double, la división se hará en decimal. No: la parte derecha se evalúa entera y por su cuenta. suma / n son dos int, la división es entera y da 3. Ese 3 se convierte a 3.0 al asignarlo — cuando el 0.5 ya se ha perdido.\n\nSe arregla forzando que la división sea decimal:\n\n    double media = (double) suma / n;    // 3.5\n\nBasta con uno de los dos. También vale suma / (double) n, o multiplicar por 1.0.\n\nEste es el error más frecuente de todos en primer curso, y el más traicionero, porque el programa no falla: solo da un número ligeramente distinto.'
  },
  {
    id: 'ft3',
    g: 'Tipos',
    level: 2,
    q: "¿Qué imprime System.out.println('A' + 1); ? ¿Y qué habría que escribir para que imprimiera la letra B?",
    hint: 'Un char, por debajo, es un número. ¿Qué tipo tiene la suma?',
    key: "66; para la letra hace falta (char) ('A' + 1)",
    a: "Imprime 66.\n\nEn una operación aritmética el char se promociona a int, así que 'A' + 1 es una suma de enteros: 65 + 1 = 66. El resultado ya no es un char, es un int, y println imprime el número.\n\nPara recuperar la letra hay que volver a convertirlo:\n\n    System.out.println((char) ('A' + 1));   // B\n\nEl paréntesis interior importa: sin él estarías convirtiendo solo la 'A'.\n\nDe esto mismo salen los trucos habituales con letras: 'c' - 'a' da la posición de la letra en el alfabeto, y sirve para recorrerlo con un for."
  },
  {
    id: 'ft4',
    g: 'Tipos',
    level: 3,
    q: 'Escribe un método boolean casiIgual(double a, double b) que decida si dos decimales pueden considerarse iguales, y explica por qué no se usa == .',
    hint: 'Los double son aproximaciones. ¿Cuánto de lejos es «lejos»?',
    key: 'Math.abs(a - b) < 1e-9',
    a: 'static boolean casiIgual(double a, double b) {\n    return Math.abs(a - b) < 1e-9;\n}\n\nPor qué no vale ==: un double guarda el número en binario con un número fijo de bits, y decimales como 0.1 no tienen representación exacta en binario, igual que 1/3 no la tiene en decimal. Así que 0.1 + 0.2 no da exactamente 0.3, sino 0.30000000000000004.\n\nEso hace que 0.1 + 0.2 == 0.3 sea FALSE, y no es un fallo de Java: pasa en cualquier lenguaje con coma flotante.\n\nLa tolerancia (1e-9 aquí) se elige según la magnitud de lo que compares. Si manejas números muy grandes, una diferencia absoluta pequeña ya no significa lo mismo y se compara la diferencia RELATIVA.\n\nY para dinero no se usa double en absoluto: se usan céntimos enteros, o BigDecimal.'
  },

  // ---------- Control
  {
    id: 'fc1',
    g: 'Control',
    level: 1,
    q: 'Escribe un bucle que imprima los números del 1 al 20 que sean múltiplos de 3, y di cuáles son.',
    hint: 'Múltiplo de 3 es «el resto de dividir entre 3 es cero».',
    key: '3, 6, 9, 12, 15, 18',
    a: 'for (int i = 1; i <= 20; i++) {\n    if (i % 3 == 0) {\n        System.out.println(i);\n    }\n}\n\nImprime 3, 6, 9, 12, 15 y 18.\n\nDos formas más, que conviene reconocer:\n\n    for (int i = 3; i <= 20; i += 3)     // sin condición dentro\n\nrecorre solo los que interesan y es más directo; y\n\n    for (int i = 1; i <= 20 / 3; i++) System.out.println(i * 3);\n\nque es la misma idea contando cuántos hay.\n\nFíjate en el <= del primero: con < se quedaría en 18 igualmente aquí, pero por casualidad. Decide siempre el límite a conciencia.'
  },
  {
    id: 'fc2',
    g: 'Control',
    level: 2,
    q: '¿Qué imprime, exactamente y en qué orden?\n\nint i = 0;\nwhile (i < 3) {\n    for (int j = 0; j < 2; j++) {\n        if (j == 1) continue;\n        System.out.println(i + "-" + j);\n    }\n    i++;\n}',
    hint: 'El continue, ¿a qué bucle afecta?',
    key: '0-0, 1-0, 2-0',
    a: '0-0\n1-0\n2-0\n\nEl continue afecta SOLO al bucle más interno que lo contiene, que es el for. Cuando j vale 1, salta el println y pasa a la siguiente vuelta del for — que ya no existe, porque j++ lo lleva a 2 y la condición falla.\n\nAsí que de cada vuelta del while solo sale la línea con j = 0. El while da sus tres vueltas normales (i = 0, 1, 2) porque el i++ está fuera del for.\n\nLa trampa que esconde: si el i++ estuviera DENTRO del for, i avanzaría dos veces por vuelta. Y si el continue estuviera en el while en vez de en el for, se saltaría el i++ y el bucle no acabaría nunca.'
  },
  {
    id: 'fc3',
    g: 'Control',
    level: 2,
    q: 'Este bucle no termina nunca. Di en qué valor se queda atascado y por qué.\n\nint n = 10;\nwhile (n > 0) {\n    if (n % 2 == 0) {\n        n--;\n    }\n}',
    hint: 'Traza los primeros valores de n a mano. ¿Cuándo deja de cambiar?',
    key: 'Se queda en 9: con n impar no entra en el if y no avanza',
    a: 'Se queda atascado en 9.\n\nTraza: n = 10 es par, entra en el if y baja a 9. En la siguiente vuelta n = 9 es impar, NO entra en el if, y por tanto n no cambia. La condición n > 0 sigue siendo cierta, así que vuelve a comprobar 9, que sigue siendo impar… para siempre.\n\nEl fallo de diseño es tener el avance del contador dentro de un if: el bucle solo progresa cuando esa condición se cumple, y nadie garantiza que se cumpla siempre.\n\nArreglado:\n\n    while (n > 0) {\n        if (n % 2 == 0) System.out.println(n);\n        n--;                    // fuera del if: siempre avanza\n    }\n\nRegla práctica: si un programa se queda colgado, mira el avance del contador antes que ninguna otra cosa.'
  },
  {
    id: 'fc4',
    g: 'Control',
    level: 3,
    q: 'Escribe un menú por consola que se repita hasta que el usuario escriba 0, y que no reviente si teclea algo que no es un número.',
    hint: '¿Qué bucle enseña el menú antes de preguntar? ¿Y cómo compruebas que hay un número sin leerlo?',
    key: 'do-while con Scanner y hasNextInt()',
    a: 'Scanner sc = new Scanner(System.in);\nint opcion;\ndo {\n    System.out.println("1) Alta   2) Listar   0) Salir");\n    while (!sc.hasNextInt()) {          // hay algo, pero no es un entero\n        System.out.println("Eso no es un número.");\n        sc.next();                      // lo descarta y vuelve a preguntar\n    }\n    opcion = sc.nextInt();\n\n    switch (opcion) {\n        case 1: System.out.println("Alta"); break;\n        case 2: System.out.println("Listar"); break;\n        case 0: System.out.println("Adiós"); break;\n        default: System.out.println("Opción no válida");\n    }\n} while (opcion != 0);\n\nTres decisiones y su porqué:\n\n1. do-while, no while: el menú hay que enseñarlo ANTES de poder preguntar. Con un while normal habría que duplicar la impresión antes del bucle.\n\n2. hasNextInt() en lugar de try/catch: pregunta si lo siguiente es un entero SIN consumirlo. Si no lo es, hay que descartarlo con sc.next(); si no lo haces, el texto sigue ahí y el bucle no acaba nunca.\n\n3. El default del switch: una opción no prevista no puede pasar en silencio.'
  },

  // ---------- Métodos
  {
    id: 'fm1',
    g: 'Métodos',
    level: 1,
    q: 'Escribe un método int maximo(int a, int b, int c) que devuelva el mayor de los tres, sin usar Math.max.',
    hint: 'Quédate con un candidato y compáralo con el resto.',
    key: 'Un candidato que se va actualizando',
    a: 'static int maximo(int a, int b, int c) {\n    int mayor = a;\n    if (b > mayor) mayor = b;\n    if (c > mayor) mayor = c;\n    return mayor;\n}\n\nLa idea es la del candidato: empiezas suponiendo que gana el primero y lo sustituyes cada vez que aparece uno mejor. Es el mismo esquema que usarás para buscar el máximo de un array, solo que allí el bucle recorre los demás.\n\nCon ifs encadenados también sale, pero se lía enseguida:\n\n    if (a >= b && a >= c) return a;\n    else if (b >= c) return b;\n    else return c;\n\nFíjate en los >= : con > estrictos, tres números iguales no entrarían en ningún caso y el método no compilaría por falta de return. Ese es justo el tipo de detalle que el esquema del candidato te ahorra.'
  },
  {
    id: 'fm2',
    g: 'Métodos',
    level: 2,
    q: '¿Qué imprime?\n\nstatic void cambiar(int n, int[] v) {\n    n = 99;\n    v[0] = 99;\n}\n\npublic static void main(String[] args) {\n    int x = 1;\n    int[] w = {1};\n    cambiar(x, w);\n    System.out.println(x + " " + w[0]);\n}',
    hint: 'Java copia el argumento. Con el array, ¿qué es exactamente lo que se copia?',
    key: '1 99',
    a: '1 99\n\nJava pasa SIEMPRE por valor: lo que llega al método es una copia del argumento.\n\nCon x, que es un int, la copia es una copia del número. n = 99 cambia la copia y la x de fuera ni se entera.\n\nCon w, que es un array, la copia es una copia de la REFERENCIA: el papelito con la dirección del array, no el array. Así que dentro y fuera hay dos papelitos distintos apuntando al mismo array. v[0] = 99 va por el papelito hasta el array de verdad y lo modifica, y eso sí se ve desde fuera.\n\nLa prueba de que la regla es la misma en los dos casos: si dentro del método escribieras\n\n    v = new int[]{7, 7};\n\nestarías cambiando el papelito de dentro para que apunte a otro sitio, y el w de fuera seguiría apuntando al array original, sin enterarse. Exactamente igual que con n = 99.'
  },
  {
    id: 'fm3',
    g: 'Métodos',
    level: 2,
    q: 'Escribe el factorial de forma recursiva, señala cuál es el caso base y di qué pasa exactamente si se te olvida.',
    hint: 'Dos preguntas: cuándo puedo responder sin preguntarme otra vez, y cómo hago el problema más pequeño.',
    key: 'Caso base n <= 1 → 1; sin él, StackOverflowError',
    a: 'static long factorial(int n) {\n    if (n <= 1) return 1;          // caso base\n    return n * factorial(n - 1);   // paso recursivo\n}\n\nEl caso base es n <= 1: ahí se responde 1 sin volver a llamarse. Es lo que corta la cadena.\n\nEl paso recursivo tiene que ACERCARSE al caso base, y por eso es n - 1 y no cualquier otra cosa.\n\nSin caso base:\n\n    return n * factorial(n - 1);   // y nada más\n\ncada llamada hace otra llamada, y cada llamada pendiente ocupa un sitio en la pila. La pila tiene un tamaño limitado, así que al cabo de unos miles de llamadas salta StackOverflowError. Fíjate en que es un Error, no una Exception: no es algo que debas capturar, es un fallo de diseño del programa.\n\nUn detalle práctico: long en vez de int porque el factorial crece muy deprisa. 13! ya no cabe en un int, y lo peor es que no avisa — desborda en silencio y da un número negativo.'
  },
  {
    id: 'fm4',
    g: 'Métodos',
    level: 3,
    q: 'Escribe un método recursivo int sumaDigitos(int n) para n >= 0. sumaDigitos(1234) debe dar 10.',
    hint: 'Los dos operadores que separan el último dígito del resto son % y /.',
    key: 'n < 10 ? n : n % 10 + sumaDigitos(n / 10)',
    a: 'static int sumaDigitos(int n) {\n    if (n < 10) return n;                     // caso base: un solo dígito\n    return n % 10 + sumaDigitos(n / 10);      // último dígito + el resto\n}\n\nLa clave son los dos operadores:\n\n    n % 10  →  el último dígito      (1234 % 10 = 4)\n    n / 10  →  todo lo demás         (1234 / 10 = 123, división entera)\n\nY entre los dos parten el número sin perder nada, que es justo lo que pide la recursión: un trozo que resuelvo ahora y un problema más pequeño del mismo tipo.\n\nTraza de 1234:\n\n    sumaDigitos(1234) = 4 + sumaDigitos(123)\n                      = 4 + 3 + sumaDigitos(12)\n                      = 4 + 3 + 2 + sumaDigitos(1)\n                      = 4 + 3 + 2 + 1 = 10\n\nEl caso base es n < 10, no n == 0: con n == 0 también funciona, pero da una llamada de más, y sobre todo hay que acordarse de que sumaDigitos(0) tiene que devolver 0 y no entrar en el paso recursivo. Con n < 10 los dos casos quedan cubiertos.'
  },

  // ---------- Vectores
  {
    id: 'fv1',
    g: 'Vectores',
    level: 1,
    q: 'Escribe un método int suma(int[] v) que devuelva la suma de todos los elementos, y di qué debe devolver con un array vacío.',
    hint: '¿Con qué valor empiezas a acumular?',
    key: 'Acumulador a 0; con array vacío devuelve 0',
    a: 'static int suma(int[] v) {\n    int total = 0;\n    for (int x : v) {\n        total += x;\n    }\n    return total;\n}\n\nCon un array vacío devuelve 0, y sale solo: el bucle no da ninguna vuelta y se devuelve el valor inicial del acumulador. Que el caso vacío salga bien sin escribir nada especial es señal de que el acumulador está bien elegido — para un producto sería 1, por el mismo motivo.\n\nAquí el for-each (for (int x : v)) es lo natural porque no necesitas saber en qué posición estás. Si lo necesitaras:\n\n    for (int i = 0; i < v.length; i++) total += v[i];\n\nOjo: esto supone que v no es null. Un array vacío (length 0) y un array inexistente (null) son cosas distintas, y el segundo da NullPointerException.'
  },
  {
    id: 'fv2',
    g: 'Vectores',
    level: 2,
    q: 'Escribe int buscar(int[] v, int x) que devuelva la posición de x en v, o -1 si no está. ¿Por qué devolver el índice y no un boolean?',
    hint: 'En cuanto lo encuentras, ¿tiene sentido seguir mirando?',
    key: 'Búsqueda lineal con return dentro del bucle; -1 si no está',
    a: 'static int buscar(int[] v, int x) {\n    for (int i = 0; i < v.length; i++) {\n        if (v[i] == x) return i;      // encontrado: se sale ya\n    }\n    return -1;                        // recorrido entero sin encontrarlo\n}\n\nEl return dentro del bucle sale en cuanto lo encuentra. Es correcto y es lo que hace que, de media, se recorra medio array en vez del array entero.\n\nPor qué el índice y no un boolean: cuesta exactamente lo mismo y dice más. Con el índice puedes borrar, sustituir o contar; con un true solo sabes que está. Y sigue respondiendo a la pregunta original, porque\n\n    if (buscar(v, x) != -1)\n\nes el «¿está?» de toda la vida.\n\nEl -1 es un convenio de la biblioteca de Java: indexOf devuelve -1 por lo mismo. Funciona porque -1 no es un índice válido, así que no se confunde con una respuesta buena.'
  },
  {
    id: 'fv3',
    g: 'Vectores',
    level: 2,
    q: '¿Qué pasa al ejecutar esto, y en qué vuelta exactamente?\n\nint[] v = {10, 20, 30};\nfor (int i = 0; i <= v.length; i++) {\n    System.out.println(v[i]);\n}',
    hint: 'Cuenta hasta dónde llega i y compáralo con el último índice válido.',
    key: 'Imprime 10, 20, 30 y revienta con ArrayIndexOutOfBoundsException en i = 3',
    a: 'Imprime 10, 20 y 30, y en la cuarta vuelta revienta con ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3.\n\nv.length vale 3, pero los índices válidos son 0, 1 y 2. La condición i <= v.length deja entrar i = 3, que ya está fuera.\n\nEs el error «por uno» clásico, y lo peligroso es que las tres primeras vueltas funcionan: si solo miras la salida, parece que va bien hasta que se para.\n\nArreglado: i < v.length. La regla es que con índices desde 0 la condición es SIEMPRE < length, y el <= solo aparece cuando cuentas desde 1.\n\nSi no necesitas el índice, el for-each te lo quita de encima porque no puede salirse:\n\n    for (int x : v) System.out.println(x);'
  },
  {
    id: 'fv4',
    g: 'Vectores',
    level: 3,
    q: 'Dada una matriz int[][] m, escribe un método que devuelva la suma de su diagonal principal. Comprueba antes que sea cuadrada.',
    hint: 'La diagonal principal son las posiciones donde la fila y la columna coinciden. ¿Y cómo se pregunta cuántas columnas tiene una fila?',
    key: 'Sumar m[i][i] tras comprobar que cada fila mide m.length',
    a: 'static int sumaDiagonal(int[][] m) {\n    for (int i = 0; i < m.length; i++) {\n        if (m[i].length != m.length) {\n            throw new IllegalArgumentException("La matriz no es cuadrada");\n        }\n    }\n    int total = 0;\n    for (int i = 0; i < m.length; i++) {\n        total += m[i][i];\n    }\n    return total;\n}\n\nLa diagonal principal son las posiciones con fila == columna, así que basta con m[i][i] y un solo bucle: no hacen falta dos.\n\nLo importante es la comprobación, y por qué se hace fila a fila. En Java una matriz es un ARRAY DE ARRAYS, y cada fila es un array independiente que puede tener su propia longitud:\n\n    int[][] rara = new int[3][];\n    rara[0] = new int[3];\n    rara[1] = new int[5];      // perfectamente legal\n\nPor eso mirar solo m[0].length no basta. Si la fila 2 fuera más corta, m[2][2] se saldría de rango.\n\nY por eso también m.length son las FILAS y m[i].length las columnas de esa fila concreta.'
  },

  // ---------- Cadenas
  {
    id: 'fs1',
    g: 'Cadenas',
    level: 1,
    q: '¿Qué imprime?\n\nString s = "hola";\ns.toUpperCase();\nSystem.out.println(s);',
    hint: 'El método devuelve algo. ¿Dónde va a parar?',
    key: 'hola — en minúsculas',
    a: 'Imprime hola, en minúsculas.\n\nLos String en Java son INMUTABLES: no se pueden modificar. toUpperCase() no cambia s; crea y devuelve una cadena nueva con el contenido en mayúsculas. Como esa línea no asigna el resultado a nada, la cadena nueva se crea y se tira al instante.\n\nEs una línea que no hace absolutamente nada, y el compilador no protesta porque llamar a un método e ignorar lo que devuelve es legal.\n\n    s = s.toUpperCase();    // ahora sí: HOLA\n\nLo mismo pasa con trim(), replace(), substring() y prácticamente todo lo que parece que «modifica» una cadena. Si un método de String no devuelve void, casi seguro que tienes que asignar el resultado.'
  },
  {
    id: 'fs2',
    g: 'Cadenas',
    level: 2,
    q: '¿Por qué esta comparación puede dar true al probarla y false con lo que teclea el usuario?\n\nif (nombre == "Carlos")',
    hint: 'El == pregunta otra cosa distinta de la que crees.',
    key: '== compara referencias; con literales coinciden por el pool, con entrada del usuario no',
    a: 'Porque == no compara el contenido: compara si las dos variables apuntan AL MISMO objeto en memoria.\n\nJava guarda los literales del código en un sitio común (el pool de cadenas) y los reutiliza. Así que si escribes\n\n    String nombre = "Carlos";\n    if (nombre == "Carlos")      // true\n\nlas dos apuntan al mismísimo objeto del pool y el == da true. Funciona, pero por casualidad.\n\nSi el nombre viene de un Scanner, de un fichero o de una concatenación, es un objeto NUEVO construido en ejecución. El contenido es igual pero el objeto es otro, y == da false.\n\nAhí está la trampa: funciona en tus pruebas, donde escribes los datos a mano, y falla en cuanto el dato llega de fuera. Es un fallo que aparece en la demo, no en el desarrollo.\n\nLa respuesta es siempre equals:\n\n    if (nombre.equals("Carlos"))\n\nY si nombre puede ser null, mejor al revés — "Carlos".equals(nombre) — que así no revienta.'
  },
  {
    id: 'fs3',
    g: 'Cadenas',
    level: 2,
    q: '¿Qué imprime System.out.println("programacion".substring(3, 7)); ?',
    hint: 'Numera las letras empezando por cero. ¿El segundo índice entra o no entra?',
    key: 'gram',
    a: 'Imprime gram.\n\nNumeramos desde 0:\n\n    p r o g r a m a c i o n\n    0 1 2 3 4 5 6 7 8 9 ...\n\nsubstring(3, 7) coge desde el índice 3 INCLUIDO hasta el 7 EXCLUIDO, es decir las posiciones 3, 4, 5 y 6: g, r, a, m.\n\nDe ahí sale una regla que conviene tener automatizada: el trozo mide siempre fin - inicio caracteres. 7 - 3 = 4.\n\nEse convenio —el primero entra, el segundo no— se repite en toda la biblioteca de Java y en casi todos los lenguajes. La razón práctica es que hace que los trozos encajen sin solaparse: substring(0, 3) y substring(3, 7) son piezas consecutivas sin repetir ninguna letra.'
  },
  {
    id: 'fs4',
    g: 'Cadenas',
    level: 3,
    q: 'Escribe boolean esPalindromo(String s) que ignore mayúsculas y espacios. «Anita lava la tina» debe dar true.',
    hint: 'Primero limpia, luego compara. Y para comparar no hace falta dar la vuelta a nada.',
    key: 'Limpiar y comparar con dos índices que se acercan',
    a: 'static boolean esPalindromo(String s) {\n    String limpia = s.toLowerCase().replace(" ", "");\n    int i = 0, j = limpia.length() - 1;\n    while (i < j) {\n        if (limpia.charAt(i) != limpia.charAt(j)) return false;\n        i++;\n        j--;\n    }\n    return true;\n}\n\nDos partes bien separadas:\n\n1. Limpiar. toLowerCase() y replace(" ", "") devuelven cadenas nuevas, así que hay que ASIGNAR el resultado — aquí a limpia. Si escribieras s.toLowerCase(); en una línea suelta no pasaría nada.\n\n2. Comparar con dos índices que se acercan desde los extremos. En cuanto dos letras no coinciden, no hay nada más que mirar y se devuelve false.\n\nLa condición del while es i < j, no i <= j: cuando se cruzan o se encuentran en el centro ya está todo comparado. Con una cadena impar, la letra del medio no necesita pareja.\n\nLa alternativa de dar la vuelta con StringBuilder y comparar:\n\n    return limpia.equals(new StringBuilder(limpia).reverse().toString());\n\nes más corta pero construye una cadena entera de más y siempre la recorre completa, mientras que la de los dos índices corta en el primer fallo. Para un examen, la de los índices demuestra más.'
  },

  // ---------- Objetos
  {
    id: 'fo1',
    g: 'Objetos',
    level: 1,
    q: 'Escribe una clase Alumno con nombre y nota, constructor, los getters y un método boolean aprobado().',
    hint: 'El constructor se llama como la clase y no devuelve nada, ni siquiera void.',
    key: 'Atributos privados, constructor con this, getters y aprobado()',
    a: 'public class Alumno {\n    private String nombre;\n    private double nota;\n\n    public Alumno(String nombre, double nota) {\n        this.nombre = nombre;\n        this.nota = nota;\n    }\n\n    public String getNombre() { return nombre; }\n    public double getNota()   { return nota; }\n\n    public boolean aprobado() {\n        return nota >= 5;\n    }\n}\n\nTres detalles que se preguntan:\n\n1. El constructor NO lleva tipo de retorno. Si escribes public void Alumno(...) deja de ser un constructor y pasa a ser un método normal llamado Alumno, que nadie llama nunca. Compila, y el objeto sale con los atributos a cero. Es un error silencioso.\n\n2. this.nombre = nombre distingue el atributo del parámetro, que se llaman igual. Sin this, nombre = nombre se asigna el parámetro a sí mismo y el atributo se queda vacío.\n\n3. aprobado() es un método y no un atributo porque es algo que se CALCULA a partir del estado. Guardarlo como un boolean aparte obligaría a mantenerlo sincronizado con la nota, y tarde o temprano se desincroniza.'
  },
  {
    id: 'fo2',
    g: 'Objetos',
    level: 2,
    q: '¿Por qué revienta la última línea, y cómo se arregla?\n\nAlumno[] clase = new Alumno[3];\nSystem.out.println(clase[0].getNombre());',
    hint: '¿Qué ha creado exactamente ese new?',
    key: 'new Alumno[3] crea tres huecos a null: NullPointerException',
    a: 'Revienta con NullPointerException.\n\nnew Alumno[3] crea el ARRAY: tres huecos capaces de guardar una referencia a un Alumno. No crea ningún Alumno. Los tres huecos valen null, y llamar a getNombre() sobre null es exactamente lo que produce esa excepción.\n\nHay que rellenarlos:\n\n    Alumno[] clase = new Alumno[3];\n    clase[0] = new Alumno("Carlos", 7.5);\n    clase[1] = new Alumno("Ana", 9.0);\n    clase[2] = new Alumno("Luis", 4.0);\n\nO de una vez:\n\n    Alumno[] clase = { new Alumno("Carlos", 7.5), ... };\n\nLa diferencia con int[] v = new int[3] es que ahí los huecos se rellenan solos con 0, porque int es un tipo primitivo y siempre tiene un valor. Las referencias empiezan en null, que significa «todavía no apunto a nada».\n\nPor eso, al recorrer un array de objetos que puede estar a medio llenar, se comprueba:\n\n    if (clase[i] != null) { ... }'
  },
  {
    id: 'fo3',
    g: 'Objetos',
    level: 3,
    q: 'Dado Alumno[] clase, escribe un método que devuelva el alumno con la nota más alta. ¿Qué devuelves si el array está vacío?',
    hint: 'Es el esquema del candidato otra vez. Y piensa qué significa «el mejor de ninguno».',
    key: 'Candidato que se actualiza; null (o excepción) si está vacío',
    a: 'static Alumno mejor(Alumno[] clase) {\n    if (clase == null || clase.length == 0) return null;\n    Alumno mejor = clase[0];\n    for (int i = 1; i < clase.length; i++) {\n        if (clase[i].getNota() > mejor.getNota()) {\n            mejor = clase[i];\n        }\n    }\n    return mejor;\n}\n\nEl esquema es el mismo del máximo de tres números: un candidato que empieza siendo el primero y se sustituye cuando aparece uno mejor. Fíjate en que el bucle arranca en i = 1, porque el 0 ya es el candidato.\n\nSobre el array vacío, que es la parte interesante: «el mejor de ninguno» no existe, así que hay tres respuestas defendibles y hay que ELEGIR una y documentarla.\n\n- Devolver null: cómodo, pero traslada el problema a quien llama, que puede olvidarse de comprobarlo. Es cómo se crea el siguiente NullPointerException.\n- Lanzar IllegalArgumentException: obliga a quien llama a no pasarte un array vacío. Más honesto si eso nunca debería ocurrir.\n- Devolver un Optional<Alumno>: la solución moderna, pero llega más adelante en el grado.\n\nLo que NO vale es devolver un Alumno inventado con nota 0: sería un dato falso circulando por el programa.\n\nY con > estricto, en caso de empate se queda el primero. Si quisieras el último, sería >=.'
  },

  // ---------- Excepciones
  {
    id: 'fe1',
    g: 'Excepciones',
    level: 1,
    q: '¿Qué diferencia hay entre una excepción checked y una unchecked? Pon un ejemplo de cada una y di qué te obliga a hacer el compilador.',
    hint: 'Una la puedes prever; la otra suele ser un fallo tuyo.',
    key: 'Checked: el compilador obliga a tratarla o declararla (IOException). Unchecked: no (NullPointerException)',
    a: 'CHECKED: el compilador te obliga a tratarla con try/catch o a declarar que tu método puede lanzarla con throws. Si no haces ninguna de las dos, no compila.\n\nEjemplo: IOException. Abrir un fichero que no existe no es un fallo de programación, es una situación que ocurre; Java te obliga a haber pensado qué hacer.\n\nUNCHECKED: el compilador no dice nada. Son las que heredan de RuntimeException.\n\nEjemplo: NullPointerException, ArrayIndexOutOfBoundsException, ArithmeticException.\n\nEl criterio de diseño detrás: las unchecked señalan BUGS. Obligarte a capturar un NullPointerException en cada línea sería absurdo, porque la respuesta correcta no es capturarlo, es arreglar el código para que no pase.\n\nLas checked señalan situaciones previsibles del mundo real: el fichero no está, la red se cayó. Ahí sí tiene sentido que el lenguaje te obligue a decidir.'
  },
  {
    id: 'fe2',
    g: 'Excepciones',
    level: 2,
    q: '¿Qué imprime, y en qué orden?\n\ntry {\n    int[] v = new int[2];\n    v[5] = 1;\n    System.out.println("A");\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("B");\n} finally {\n    System.out.println("C");\n}\nSystem.out.println("D");',
    hint: '¿Qué pasa con las líneas que hay DESPUÉS de la que lanza la excepción?',
    key: 'B, C, D',
    a: 'B\nC\nD\n\nv[5] lanza la excepción, y en ese instante el try se abandona. La A NO llega a imprimirse: no es que se salte esa línea, es que el bloque entero se interrumpe justo ahí. Esto es lo que más cuesta ver al principio.\n\nEl catch coincide con el tipo lanzado, así que se ejecuta: B.\n\nEl finally se ejecuta siempre, haya habido excepción o no, se haya capturado o no: C.\n\nY como la excepción quedó atendida, el programa sigue con normalidad: D.\n\nDos variantes que conviene trazar mentalmente:\n\n- Si el catch fuera de otro tipo (por ejemplo ArithmeticException), no coincidiría: se ejecutaría C y el programa terminaría con la excepción sin atender. No se imprimiría ni B ni D.\n- Si no hubiera excepción, saldría A, C, D. La B nunca se imprime sin excepción.'
  },
  {
    id: 'fe3',
    g: 'Excepciones',
    level: 3,
    q: 'Escribe un método que lea un fichero de texto con un número por línea y devuelva su suma, distinguiendo el caso de que el fichero no exista del caso de que una línea no sea un número.',
    hint: 'Son dos problemas distintos y merecen dos respuestas distintas. Y algo hay que cerrar.',
    key: 'try-with-resources, IOException fuera y NumberFormatException por línea',
    a: 'static int sumarFichero(String ruta) throws IOException {\n    int total = 0;\n    try (Scanner sc = new Scanner(new File(ruta))) {\n        int numeroLinea = 0;\n        while (sc.hasNextLine()) {\n            numeroLinea++;\n            String linea = sc.nextLine().trim();\n            if (linea.isEmpty()) continue;\n            try {\n                total += Integer.parseInt(linea);\n            } catch (NumberFormatException e) {\n                System.out.println("Línea " + numeroLinea + " ignorada: " + linea);\n            }\n        }\n    }\n    return total;\n}\n\nLas tres decisiones:\n\n1. El fichero que no existe NO se captura aquí: se deja subir con throws. Quien llama al método es quien sabe qué hacer — pedir otra ruta, avisar, abortar. Si lo capturases aquí devolverías 0, y un 0 es indistinguible de un fichero lleno de ceros.\n\n2. La línea mala SÍ se captura, y dentro del bucle. Así una línea estropeada no tira las demás. Ponerlo fuera del while abortaría el fichero entero al primer fallo, que es justo lo contrario de lo que se pide.\n\n3. try-with-resources — el try(...) con el Scanner dentro del paréntesis — lo cierra solo al salir, haya excepción o no. Es lo que sustituye al finally { sc.close(); } de toda la vida, y no se olvida nunca.\n\nY fíjate en el mensaje del catch: dice QUÉ línea y QUÉ contenido. Un catch que solo imprime "error" no sirve para arreglar nada.'
  }
]
