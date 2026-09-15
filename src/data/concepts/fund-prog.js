// ============================================================
// Fundamentos de Programación · conceptos y trampas
// ------------------------------------------------------------
// Aquí «no entender» tiene una forma muy concreta: el programa compila,
// hace algo, y no es lo que querías. Casi siempre porque una palabra
// significa algo ligeramente distinto de lo que parece — que un String
// no se puede cambiar, que dividir dos enteros da un entero, que pasar
// un objeto no es pasar el objeto.
//
// La asignatura se imparte en Java, así que los ejemplos son Java.
// ============================================================
export const FUND_PROG = {
  concepts: [
    // ---------- Bases
    {
      t: 'Algoritmo',
      g: 'Bases',
      d: 'Una secuencia finita de pasos, sin ambigüedad, que resuelve un problema.',
      why: 'El lenguaje viene después. Si no sabes decir los pasos en español, no los vas a saber escribir en Java: la mitad de los atascos de esta asignatura son de algoritmo, no de sintaxis.',
      x: '«Ordenar de menor a mayor» no es un algoritmo hasta que dices cómo.'
    },
    {
      t: 'Compilar frente a interpretar',
      g: 'Bases',
      d: 'Traducir el programa entero antes de ejecutarlo, o ir traduciéndolo mientras se ejecuta.',
      why: 'Java hace las dos cosas: javac compila tu código a bytecode y la JVM lo ejecuta. Por eso hay dos familias de errores en momentos distintos, y saber en cuál estás te dice dónde mirar.',
      x: 'int x = "hola" no llega a compilar; dividir entre cero compila perfectamente y revienta al ejecutar.'
    },
    {
      t: 'JVM',
      g: 'Bases',
      d: 'La máquina virtual que ejecuta el bytecode de Java.',
      why: 'Es lo que hace que el mismo fichero .class funcione en Windows, en Linux y en un móvil sin recompilar. El precio es que necesitas la JVM instalada.'
    },
    {
      t: 'Error de compilación frente a excepción',
      g: 'Bases',
      d: 'Uno impide que el programa llegue a existir; la otra ocurre con el programa ya en marcha.',
      why: 'Un error de compilación es gratis: lo ves antes de ejecutar y el compilador te dice la línea. Una excepción se paga en tiempo de ejecución y puede no aparecer hasta el caso raro.',
      x: 'Falta un punto y coma → compilación. NullPointerException → ejecución.'
    },
    {
      t: 'main',
      g: 'Bases',
      d: 'El método por el que empieza la ejecución de un programa Java.',
      why: 'Su firma tiene que ser exactamente public static void main(String[] args). Si cambias una palabra, compila igual pero la JVM no lo encuentra y te dice que no hay método main.'
    },

    // ---------- Tipos
    {
      t: 'Tipo primitivo',
      g: 'Tipos',
      d: 'int, double, boolean, char, long… Valores puros, no objetos.',
      why: 'Se guardan por valor y nunca pueden ser null. Esa es la diferencia práctica con String o con cualquier clase tuya.'
    },
    {
      t: 'Declaración e inicialización',
      g: 'Tipos',
      d: 'Declarar es reservar el nombre y el tipo; inicializar es darle su primer valor.',
      why: 'Java no te deja leer una variable local sin inicializar: es un error de compilación, no un valor basura. Es una de las cosas que te protege.',
      x: 'int n; System.out.println(n); no compila.'
    },
    {
      t: 'Conversión implícita y casting',
      g: 'Tipos',
      d: 'De int a double Java convierte solo; de double a int tienes que pedirlo con (int).',
      why: 'La regla es que lo que cabe seguro se hace solo, y lo que puede perder información hay que escribirlo. Y el casting a int TRUNCA: corta la parte decimal, no redondea.',
      x: '(int) 3.9 vale 3. Para redondear, Math.round.'
    },
    {
      t: 'División entera',
      g: 'Tipos',
      d: 'Entre dos int, el resultado es int: la parte decimal se pierde.',
      why: 'Es la fuente número uno de resultados «casi bien» en primer curso. Basta con que uno de los dos sea double para que deje de pasar.',
      x: '5 / 2 vale 2. 5 / 2.0 vale 2.5.'
    },
    {
      t: 'Módulo (%)',
      g: 'Tipos',
      d: 'El resto de la división entera.',
      why: 'Es la herramienta para «cada cuántos», para dígitos y para paridad. n % 2 == 0 es como se pregunta si un número es par.'
    },
    {
      t: 'final',
      g: 'Tipos',
      d: 'Una variable que no se puede reasignar después de darle valor.',
      why: 'Sirve para las constantes y, sobre todo, para que el compilador te avise si te la pisas sin querer.',
      x: 'final int MAX = 10;'
    },
    {
      t: 'char',
      g: 'Tipos',
      d: 'Un único carácter — y por debajo, un número.',
      why: 'Eso explica comportamientos que parecen raros: en una suma, el char se promociona a int y el resultado ya no es un carácter.',
      x: "'A' + 1 imprime 66, no 'B'. Si quieres la letra: (char) ('A' + 1)."
    },

    // ---------- Control
    {
      t: 'Condición booleana',
      g: 'Control',
      d: 'Una expresión que vale true o false, y nada más.',
      why: 'En Java el if exige un boolean, no un número. Eso hace imposible el clásico error de escribir = donde iba ==: con enteros ni siquiera compila.'
    },
    {
      t: 'else if',
      g: 'Control',
      d: 'Encadenar condiciones que se excluyen entre sí.',
      why: 'En cuanto una se cumple, las demás ni se evalúan. Escribir ifs sueltos en vez de encadenados cambia el resultado cuando dos condiciones pueden ser ciertas a la vez.'
    },
    {
      t: 'switch',
      g: 'Control',
      d: 'Elegir entre valores concretos de una misma expresión.',
      why: 'En la forma clásica, cada caso necesita su break: sin él la ejecución cae al siguiente caso. Eso a veces se busca a propósito, pero casi nunca.'
    },
    {
      t: 'while y do-while',
      g: 'Control',
      d: 'Repetir mientras se cumpla una condición. El do-while la comprueba al final.',
      why: 'La diferencia es exactamente una: el do-while ejecuta el cuerpo al menos una vez. Es el bucle de los menús, que primero enseñan y luego preguntan si repetir.'
    },
    {
      t: 'for',
      g: 'Control',
      d: 'El bucle con contador: inicio, condición y avance en la misma línea.',
      why: 'Se usa cuando sabes cuántas vueltas vas a dar. Tenerlo todo junto es lo que hace difícil olvidar el avance, que es la causa típica del bucle infinito.'
    },
    {
      t: 'break y continue',
      g: 'Control',
      d: 'Salir del bucle del todo, o saltar directamente a la siguiente vuelta.',
      why: 'Los dos afectan solo al bucle más interno que los contiene. En bucles anidados, eso sorprende.'
    },
    {
      t: 'Bucle infinito',
      g: 'Control',
      d: 'Un bucle cuya condición nunca llega a ser falsa.',
      why: 'Casi siempre es olvidar avanzar el contador, o avanzarlo dentro de un if que no siempre se cumple. Si el programa se queda colgado, mira eso antes que nada.'
    },

    // ---------- Métodos
    {
      t: 'Método',
      g: 'Métodos',
      d: 'Un trozo de código con nombre, que recibe parámetros y puede devolver un valor.',
      why: 'Es la unidad con la que se parte un programa en cosas que caben en la cabeza. Un método que no sabes nombrar en tres palabras suele estar haciendo dos cosas.'
    },
    {
      t: 'Parámetro y argumento',
      g: 'Métodos',
      d: 'El parámetro es el nombre en la definición; el argumento, el valor concreto de la llamada.',
      why: 'Distinguirlos deja de ser pedantería cuando aparece el paso por valor: lo que se copia es el argumento en el parámetro.'
    },
    {
      t: 'Ámbito (scope)',
      g: 'Métodos',
      d: 'La parte del programa donde una variable existe.',
      why: 'Una variable declarada dentro de un bloque muere al cerrar la llave. Por eso el contador de un for no existe fuera del for, y por eso dos métodos pueden usar el mismo nombre sin pisarse.'
    },
    {
      t: 'Paso por valor',
      g: 'Métodos',
      d: 'Java siempre copia el valor del argumento en el parámetro. Siempre.',
      why: 'Con un objeto, lo que se copia es la referencia: por eso puedes MODIFICAR el objeto desde dentro del método, pero no puedes hacer que el de fuera apunte a otro distinto. No es una excepción a la regla, es la regla aplicada a una referencia.',
      x: 'Cambiar v[0] dentro del método se ve fuera; hacer v = new int[3] dentro, no.'
    },
    {
      t: 'Sobrecarga',
      g: 'Métodos',
      d: 'Varios métodos con el mismo nombre y distinta lista de parámetros.',
      why: 'El compilador elige por los tipos de los argumentos. El tipo devuelto no cuenta: dos métodos que solo se diferencien en eso no compilan.'
    },
    {
      t: 'Recursividad',
      g: 'Métodos',
      d: 'Un método que se llama a sí mismo con un problema más pequeño.',
      why: 'Necesita dos cosas: un caso base que corte y que cada llamada se acerque a él. Si falta el caso base, la pila se llena y salta StackOverflowError.',
      x: 'factorial(0) = 1 es el caso base; factorial(n) = n · factorial(n−1) es el paso.'
    },
    {
      t: 'void',
      g: 'Métodos',
      d: 'El método no devuelve nada: hace algo y ya.',
      why: 'Un método void que «debería» darte un resultado suele estar guardándolo en un sitio raro. Si calculas algo, devuélvelo.'
    },

    // ---------- Vectores
    {
      t: 'Array (vector)',
      g: 'Vectores',
      d: 'Una colección de tamaño fijo de elementos del mismo tipo.',
      why: 'Fijo de verdad: new int[5] reserva cinco huecos y no hay forma de añadir un sexto. Para eso están las listas, que vienen en Estructura de Datos.'
    },
    {
      t: 'Índice desde cero',
      g: 'Vectores',
      d: 'El primer elemento es el 0 y el último, length − 1.',
      why: 'De aquí sale ArrayIndexOutOfBoundsException, y casi siempre por escribir <= length en la condición del bucle en vez de < length.'
    },
    {
      t: 'length frente a length()',
      g: 'Vectores',
      d: 'En un array es un campo, sin paréntesis; en un String es un método.',
      why: 'No es un capricho del lenguaje que puedas ignorar: confundirlos es un error de compilación, y verlo escrito una vez te ahorra el rato de buscarlo.',
      x: 'v.length y s.length().'
    },
    {
      t: 'Recorrer un array',
      g: 'Vectores',
      d: 'Con for clásico si necesitas el índice; con for-each si solo necesitas los valores.',
      why: 'El for-each es más corto y no puede salirse de rango, pero no te deja saber por dónde vas ni modificar el array. Elige según eso.'
    },
    {
      t: 'Búsqueda lineal',
      g: 'Vectores',
      d: 'Recorrer de principio a fin hasta encontrar lo que buscas.',
      why: 'Es el algoritmo más simple y el que hay que saber escribir sin pensar. Devolver el índice y no un booleano da más información por el mismo trabajo; −1 es el convenio para «no está».'
    },
    {
      t: 'Array bidimensional',
      g: 'Vectores',
      d: 'Un array cuyos elementos son, a su vez, arrays.',
      why: 'Por eso se accede con m[fila][columna], m.length son las filas y m[0].length las columnas. Y por eso las filas pueden tener longitudes distintas.'
    },

    // ---------- Cadenas
    {
      t: 'String',
      g: 'Cadenas',
      d: 'Una secuencia de caracteres. Es un objeto, no un tipo primitivo.',
      why: 'Que sea un objeto explica dos cosas que dan guerra: que pueda valer null y que no se compare con ==.'
    },
    {
      t: 'Inmutabilidad',
      g: 'Cadenas',
      d: 'Un String no se puede modificar. Cada operación devuelve uno nuevo.',
      why: 'Es lo que hace que s.toUpperCase(); en una línea suelta no haga absolutamente nada: el resultado está ahí y lo estás tirando. Hay que asignarlo.',
      x: 's = s.toUpperCase();'
    },
    {
      t: 'equals frente a ==',
      g: 'Cadenas',
      d: 'equals compara el contenido; == compara si son el mismo objeto en memoria.',
      why: 'Con cadenas cortas escritas en el código, == a veces funciona por una optimización del compilador, y ahí está la trampa: funciona en tus pruebas y falla con lo que teclea el usuario. Usa siempre equals.'
    },
    {
      t: 'charAt y substring',
      g: 'Cadenas',
      d: 'Sacar el carácter de una posición, o un trozo de la cadena.',
      why: 'En substring(a, b) el primero entra y el segundo no: el trozo tiene b − a caracteres. Ese convenio se repite en toda la biblioteca.'
    },
    {
      t: 'StringBuilder',
      g: 'Cadenas',
      d: 'Una cadena que sí se puede modificar.',
      why: 'Concatenar con + dentro de un bucle crea una cadena nueva en cada vuelta. Con pocos datos da igual; con muchos es la diferencia entre instantáneo y eterno.'
    },

    // ---------- Objetos
    {
      t: 'Clase e instancia',
      g: 'Objetos',
      d: 'La clase es el molde; el objeto, la pieza fabricada con él.',
      why: 'Puedes tener mil objetos de una clase, cada uno con sus valores. La clase se escribe una vez; los objetos se crean con new.'
    },
    {
      t: 'Atributo',
      g: 'Objetos',
      d: 'El estado que guarda cada objeto.',
      why: 'A diferencia de una variable local, vive mientras viva el objeto. Ahí está la diferencia entre programar con métodos sueltos y programar con objetos.'
    },
    {
      t: 'Constructor',
      g: 'Objetos',
      d: 'El método que se ejecuta al crear el objeto.',
      why: 'Se llama igual que la clase y no declara tipo de retorno — ni siquiera void. Si le pones void deja de ser un constructor y pasa a ser un método normal que nadie llama: un error que compila.'
    },
    {
      t: 'this',
      g: 'Objetos',
      d: 'Una referencia al objeto sobre el que se está ejecutando el método.',
      why: 'Sirve para distinguir el atributo del parámetro cuando se llaman igual, que es lo normal en un constructor.',
      x: 'this.nombre = nombre;'
    },
    {
      t: 'Encapsulación',
      g: 'Objetos',
      d: 'Atributos privados y acceso controlado desde fuera.',
      why: 'No es burocracia: es poder cambiar cómo se guarda algo sin romper a quien lo usa, y poder validar en un solo sitio.'
    },
    {
      t: 'null',
      g: 'Objetos',
      d: 'Una referencia que no apunta a ningún objeto.',
      why: 'Llamar a un método sobre null da NullPointerException, la excepción más frecuente de Java con diferencia. Con una variable local el compilador te protege y no te deja usarla sin inicializar; donde aparece de verdad es en atributos sin asignar y en arrays de objetos recién creados, cuyos huecos valen null.'
    },
    {
      t: 'static',
      g: 'Objetos',
      d: 'Pertenece a la clase, no a cada objeto.',
      why: 'Por eso main es static: tiene que poder ejecutarse sin que exista ningún objeto todavía. Y por eso desde un método static no puedes usar atributos de instancia: no hay instancia.'
    },

    // ---------- Excepciones
    {
      t: 'Excepción',
      g: 'Excepciones',
      d: 'Un objeto que señala que algo ha ido mal durante la ejecución.',
      why: 'No es un mensaje de error cualquiera: interrumpe el flujo y sube por la pila de llamadas hasta que alguien la atiende. Si nadie lo hace, el programa termina.'
    },
    {
      t: 'try / catch',
      g: 'Excepciones',
      d: 'Intentar un bloque y, si lanza una excepción, atenderla en el catch.',
      why: 'El catch debe ser tan concreto como puedas: capturar Exception a secas esconde errores de programación tuyos entre los fallos previstos.'
    },
    {
      t: 'finally',
      g: 'Excepciones',
      d: 'Un bloque que se ejecuta pase lo que pase, haya excepción o no.',
      why: 'Es donde se cierra lo que se abrió. Con ficheros es casi obligatorio, salvo que uses try-with-resources, que lo hace por ti.'
    },
    {
      t: 'Checked y unchecked',
      g: 'Excepciones',
      d: 'Las que el compilador te obliga a tratar o declarar, y las que no.',
      why: 'IOException es checked: no compila si la ignoras. NullPointerException es unchecked: el compilador te deja en paz porque se supone que es un fallo tuyo, no una situación prevista.'
    }
  ],

  pitfalls: [
    {
      t: 'Comparar cadenas con ==',
      g: 'Cadenas',
      wrong: 'if (nombre == "Carlos")',
      right: 'Compara referencias, no contenido. Con literales escritos en el código a veces da true por una optimización, y por eso funciona en tus pruebas y falla con lo que teclea el usuario. Es equals: if (nombre.equals("Carlos")).'
    },
    {
      t: 'Creer que toUpperCase cambia la cadena',
      g: 'Cadenas',
      wrong: 's.toUpperCase();  // y seguir usando s',
      right: 'Los String son inmutables: el método devuelve uno nuevo y el original no se toca. Sin asignar, esa línea no hace nada. s = s.toUpperCase();'
    },
    {
      t: 'Salirse del array por uno',
      g: 'Vectores',
      wrong: 'for (int i = 0; i <= v.length; i++)',
      right: 'El último índice válido es length − 1, así que la condición es i < v.length. Con <= se sale justo en la última vuelta: ArrayIndexOutOfBoundsException.'
    },
    {
      t: 'Confundir length con length()',
      g: 'Vectores',
      wrong: 'v.length() en un array, o s.length en un String.',
      right: 'En un array es un campo (v.length) y en un String un método (s.length()). Los dos al revés son error de compilación, no un fallo silencioso: lo bueno es que se ve enseguida.'
    },
    {
      t: 'Dividir enteros esperando decimales',
      g: 'Tipos',
      wrong: 'double media = suma / n;  // con suma y n enteros',
      right: 'La división se hace entre enteros ANTES de asignar, así que los decimales se pierden antes de llegar al double. Fuerza uno a double: (double) suma / n.'
    },
    {
      t: 'Comparar decimales con ==',
      g: 'Tipos',
      wrong: 'if (0.1 + 0.2 == 0.3)',
      right: 'Los double no representan exactamente los decimales, así que esa comparación es false. Se compara la diferencia contra una tolerancia: Math.abs(a − b) < 1e−9.'
    },
    {
      t: 'Punto y coma después del if',
      g: 'Control',
      wrong: 'if (x > 0);  { ... }',
      right: 'Ese punto y coma ES el cuerpo del if — uno vacío — y el bloque de abajo se ejecuta siempre. Compila sin una queja y el programa hace lo contrario de lo que lees. Lo mismo con for y while.'
    },
    {
      t: 'Bucle infinito por no avanzar',
      g: 'Control',
      wrong: 'while (i < 10) { System.out.println(i); }',
      right: 'Falta i++. Y ojo con avanzarlo dentro de un if: si la condición no se cumple, tampoco avanza. Si el programa se queda colgado, mira el avance del contador antes que nada.'
    },
    {
      t: 'Recursión sin caso base',
      g: 'Métodos',
      wrong: 'int f(int n) { return n * f(n - 1); }',
      right: 'Nunca deja de llamarse y la pila se agota: StackOverflowError. Hace falta un caso base que corte (if (n <= 1) return 1;) y que cada llamada se acerque a él.'
    },
    {
      t: 'Esperar que un parámetro cambie fuera',
      g: 'Métodos',
      wrong: 'void doblar(int n) { n = n * 2; }  // y esperar que cambie la variable de fuera',
      right: 'Java pasa siempre una copia del valor. Con primitivos, lo de fuera no se entera. Devuelve el resultado: int doblar(int n) { return n * 2; }. Con objetos sí puedes modificar el objeto, porque lo copiado es la referencia.'
    },
    {
      t: 'Creer que new int[3] de objetos ya trae objetos',
      g: 'Objetos',
      wrong: 'Alumno[] lista = new Alumno[3];  lista[0].getNombre();',
      right: 'Eso crea tres HUECOS, no tres alumnos: los tres valen null y el primer método revienta con NullPointerException. Hay que rellenarlos uno a uno con new Alumno(...). Con una variable local suelta ni siquiera llegas ahí: el compilador te para antes por usarla sin inicializar.'
    },
    {
      t: 'Capturar la excepción y callarla',
      g: 'Excepciones',
      wrong: 'try { ... } catch (Exception e) { }',
      right: 'El programa sigue como si nada con un estado roto, y el fallo aparece más tarde en otro sitio sin relación aparente. Captura lo concreto que esperas y haz algo: avisar, reintentar o dejarla subir.'
    }
  ]
}
