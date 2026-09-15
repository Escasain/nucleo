// Conceptos clave y trampas de Tecnología de Computadores.
// Misma estructura que el resto: t / g / d / why / x.

export const TEC_COMP = {
  concepts: [
    // ---------- Numeración
    {
      t: 'Sistema posicional',
      g: 'Numeración',
      d: 'Cada dígito vale según su posición: se multiplica por la base elevada al lugar que ocupa.',
      why: 'Es lo único que hay que entender de los cambios de base. Binario, decimal y hexadecimal son la misma idea con base 2, 10 y 16.'
    },
    {
      t: 'Hexadecimal como taquigrafía del binario',
      g: 'Numeración',
      d: 'Un dígito hexadecimal equivale exactamente a 4 bits, siempre, sin cuentas.',
      why: 'Convertir hex ↔ binario es agrupar de cuatro en cuatro. Por eso las direcciones de memoria y los volcados se escriben en hex y no en decimal.'
    },
    {
      t: 'Complemento a dos',
      g: 'Numeración',
      d: 'Forma de representar negativos: se invierten todos los bits del positivo y se suma 1.',
      why: 'Su gracia es que la resta desaparece: A − B se calcula sumando A y el complemento a dos de B, con el MISMO circuito sumador.',
      x: 'El rango es asimétrico: con 8 bits va de −128 a +127, no de −127 a +127. Hay un negativo de más porque el cero no se duplica.'
    },
    {
      t: 'Desbordamiento (overflow)',
      g: 'Numeración',
      d: 'El resultado correcto no cabe en los bits disponibles, así que el que sale es otro número.',
      why: 'Se detecta comparando el acarreo que entra al bit de signo con el que sale de él: si difieren, hay desbordamiento.',
      x: 'Con el acarreo. En aritmética sin signo lo que importa es el acarreo; con signo, el desbordamiento. No son lo mismo y pueden darse por separado.'
    },
    {
      t: 'Extensión de signo',
      g: 'Numeración',
      d: 'Al pasar un número con signo a más bits, se replica el bit de signo por la izquierda.',
      why: 'Rellenar con ceros funcionaría para positivos y convertiría cualquier negativo en un positivo enorme.'
    },
    {
      t: 'IEEE 754',
      g: 'Numeración',
      d: 'Tres campos: un bit de signo, un exponente con sesgo y una mantisa con un 1 implícito delante.',
      why: 'Es notación científica en binario. Entender que el exponente lleva sesgo (se le resta 127 en simple precisión) explica casi todos los ejercicios del tema.'
    },
    {
      t: 'Error de representación en coma flotante',
      g: 'Numeración',
      d: 'Muchos decimales exactos no tienen representación binaria finita, así que se guardan aproximados.',
      why: '0,1 en binario es periódico, igual que 1/3 en decimal. Por eso 0.1 + 0.2 no da exactamente 0.3 en ningún lenguaje, y por eso nunca se comparan flotantes con igualdad.'
    },
    {
      t: 'Código Gray',
      g: 'Numeración',
      d: 'Ordenación de códigos binarios en la que entre dos valores consecutivos cambia un solo bit.',
      why: 'Evita estados intermedios falsos en sensores de posición y contadores. Es también el orden en el que se etiquetan los mapas de Karnaugh, y no por casualidad.'
    },
    {
      t: 'Bit de paridad',
      g: 'Numeración',
      d: 'Un bit extra que hace que el total de unos sea par (o impar).',
      why: 'Detecta cualquier número impar de errores, pero no corrige ninguno ni ve los errores dobles. Es el ejemplo mínimo de redundancia.'
    },

    // ---------- Álgebra de Boole
    {
      t: 'Función lógica',
      g: 'Boole',
      d: 'Una regla que asigna un 0 o un 1 a cada combinación posible de las entradas.',
      why: 'Con n entradas hay 2ⁿ filas en la tabla de verdad. La tabla ES la función: todo lo demás (expresión, circuito, Karnaugh) son formas de escribirla.'
    },
    {
      t: 'Leyes de De Morgan',
      g: 'Boole',
      d: 'La negación de un AND es el OR de las negaciones, y viceversa.',
      why: 'Permiten convertir cualquier circuito a puertas NAND o NOR, que es lo que se fabrica de verdad.',
      x: 'El error típico es negar cada término y dejar el operador como estaba. El operador también cambia.'
    },
    {
      t: 'Minterm y maxterm',
      g: 'Boole',
      d: 'Minterm: un AND de todas las variables que vale 1 en una sola fila. Maxterm: un OR que vale 0 en una sola fila.',
      why: 'Los minterms generan la suma de productos (a partir de los unos de la tabla); los maxterms, el producto de sumas (a partir de los ceros).'
    },
    {
      t: 'Forma canónica',
      g: 'Boole',
      d: 'La expresión escrita con todos los términos completos, sin simplificar nada.',
      why: 'Sale directa de la tabla de verdad y siempre es correcta. Es el punto de partida: simplificar viene después.'
    },
    {
      t: 'Completitud funcional (NAND es universal)',
      g: 'Boole',
      d: 'Con solo puertas NAND se puede construir cualquier función lógica.',
      why: 'Explica por qué los circuitos reales están llenos de NAND: fabricar un solo tipo de puerta sale más barato que fabricar tres.'
    },
    {
      t: 'Mapa de Karnaugh',
      g: 'Boole',
      d: 'Una tabla de verdad recolocada de modo que casillas vecinas se diferencian en un solo bit.',
      why: 'Eso convierte la simplificación algebraica en ver rectángulos. Agrupar dos casillas elimina una variable, cuatro eliminan dos, ocho eliminan tres.',
      x: 'Los bordes también son vecinos: el mapa se cierra por los lados y por arriba y abajo, como un donut. Es el error más frecuente.'
    },
    {
      t: 'Implicante primo esencial',
      g: 'Boole',
      d: 'Una agrupación que no se puede ampliar más y que es la única que cubre algún 1 concreto.',
      why: 'Los esenciales van sí o sí en la solución mínima. Identificarlos primero convierte Karnaugh en un procedimiento en vez de un tanteo.'
    },
    {
      t: 'Condiciones «don\'t care» (X)',
      g: 'Boole',
      d: 'Combinaciones de entrada que nunca se van a dar, o cuya salida da igual.',
      why: 'Son regalos: puedes tomarlas como 1 si te agrandan un grupo, o ignorarlas si no. Bien usadas simplifican muchísimo.'
    },

    // ---------- Combinacionales
    {
      t: 'Combinacional frente a secuencial',
      g: 'Combinacionales',
      d: 'Combinacional: la salida depende solo de las entradas de ahora. Secuencial: depende también de lo que pasó antes.',
      why: 'Es la división que estructura la asignatura entera. Si el circuito necesita recordar algo, ya no es combinacional por mucho que lo parezca.'
    },
    {
      t: 'Multiplexor',
      g: 'Combinacionales',
      d: 'Un selector: con n líneas de control elige una de 2ⁿ entradas y la saca por la salida.',
      why: 'Es la pieza más versátil del tema: además de seleccionar, un multiplexor puede implementar CUALQUIER función lógica de sus variables de control.'
    },
    {
      t: 'Decodificador',
      g: 'Combinacionales',
      d: 'Convierte un número binario de n bits en activar exactamente una de sus 2ⁿ salidas.',
      why: 'Es lo que traduce una dirección en «selecciona esta celda de memoria». Sin decodificadores no hay memoria direccionable.'
    },
    {
      t: 'Sumador completo',
      g: 'Combinacionales',
      d: 'Suma tres bits (dos operandos y el acarreo de entrada) y produce suma y acarreo de salida.',
      why: 'Encadenando n sumadores completos se suma cualquier anchura. Y con complemento a dos, el mismo circuito resta.'
    },
    {
      t: 'Acarreo anticipado (carry-lookahead)',
      g: 'Combinacionales',
      d: 'Calcular todos los acarreos a la vez a partir de las entradas, en lugar de esperar a que se propaguen.',
      why: 'Un sumador encadenado tarda proporcionalmente a los bits; el anticipado tarda casi lo mismo con 8 que con 64. Es más rápido a cambio de más puertas.'
    },
    {
      t: 'Retardo de propagación y camino crítico',
      g: 'Combinacionales',
      d: 'Lo que tarda un cambio en llegar a la salida; el camino crítico es la ruta más lenta del circuito.',
      why: 'Fija la frecuencia máxima de reloj. Optimizar cualquier otro camino no sirve de nada mientras el crítico siga igual.'
    },

    // ---------- Secuenciales
    {
      t: 'Latch frente a flip-flop',
      g: 'Secuenciales',
      d: 'El latch es transparente mientras el nivel de la señal esté activo; el flip-flop solo captura en el flanco.',
      why: 'Es la distinción que más se pregunta. El flip-flop deja el valor estable durante todo el ciclo, y por eso los circuitos síncronos se construyen con flip-flops.',
      x: 'Llamar «biestable» a los dos está bien: la diferencia es por nivel o por flanco.'
    },
    {
      t: 'Flip-flop D',
      g: 'Secuenciales',
      d: 'Copia la entrada a la salida en cada flanco de reloj y la mantiene hasta el siguiente.',
      why: 'Es un bit de memoria de un ciclo. Registros, contadores y máquinas de estados se construyen casi todos con flip-flops D.'
    },
    {
      t: 'Registro de desplazamiento',
      g: 'Secuenciales',
      d: 'Una fila de flip-flops donde cada uno pasa su valor al siguiente en cada flanco.',
      why: 'Convierte datos serie en paralelo y al revés, que es lo que hace toda comunicación. Desplazar también multiplica o divide por dos.'
    },
    {
      t: 'Contador síncrono frente a asíncrono',
      g: 'Secuenciales',
      d: 'Síncrono: todos los flip-flops comparten el mismo reloj. Asíncrono: cada uno se dispara con la salida del anterior.',
      why: 'El asíncrono es más simple pero los retardos se acumulan y aparecen estados fantasma durante la transición. El síncrono cambia todo a la vez y por eso es el que se usa.'
    },
    {
      t: 'Máquina de Moore frente a Mealy',
      g: 'Secuenciales',
      d: 'Moore: la salida depende solo del estado. Mealy: depende del estado Y de la entrada actual.',
      why: 'Mealy suele necesitar menos estados; Moore da salidas más estables, sin glitches al cambiar la entrada a mitad de ciclo.',
      x: 'Se distinguen en el diagrama: en Moore la salida se escribe dentro del estado; en Mealy, sobre la flecha.'
    },
    {
      t: 'Tiempos de setup y hold',
      g: 'Secuenciales',
      d: 'La entrada tiene que estar estable un rato ANTES del flanco (setup) y un rato DESPUÉS (hold).',
      why: 'Si no se respetan, el flip-flop puede quedarse en metaestabilidad: ni 0 ni 1 durante un tiempo impredecible. Es lo que limita la frecuencia junto al camino crítico.'
    },

    // ---------- Memoria
    {
      t: 'Bus de direcciones y capacidad',
      g: 'Memoria',
      d: 'Con n líneas de dirección se pueden distinguir 2ⁿ posiciones distintas.',
      why: 'La cuenta que aparece en todos los ejercicios: 16 líneas dan 65 536 posiciones. Y la anchura de cada posición la fija el bus de datos, no el de direcciones.',
      x: 'n líneas no son n posiciones. Son 2ⁿ.'
    },
    {
      t: 'SRAM frente a DRAM',
      g: 'Memoria',
      d: 'SRAM guarda cada bit en un biestable; DRAM lo guarda como carga en un condensador.',
      why: 'La DRAM es mucho más densa y barata, pero se descarga y hay que refrescarla constantemente. Por eso la caché es SRAM y la memoria principal, DRAM.'
    },
    {
      t: 'Expansión de memoria',
      g: 'Memoria',
      d: 'En anchura: varios chips en paralelo para tener más bits por palabra. En capacidad: varios chips en serie para tener más posiciones.',
      why: 'La expansión en capacidad necesita un decodificador que elija qué chip responde a cada rango de direcciones.'
    },
    {
      t: 'Jerarquía de memoria y localidad',
      g: 'Memoria',
      d: 'Niveles de memoria cada vez más grandes y lentos, apoyados en que los programas reutilizan lo que acaban de usar (localidad temporal) y lo que está al lado (localidad espacial).',
      why: 'Es el motivo de que exista la caché. Sin localidad, la jerarquía no ganaría nada.'
    },

    // ---------- Arquitectura
    {
      t: 'Arquitectura Von Neumann frente a Harvard',
      g: 'Arquitectura',
      d: 'Von Neumann: datos e instrucciones comparten memoria y bus. Harvard: memorias y buses separados.',
      why: 'Compartir bus crea el «cuello de botella de Von Neumann»: no se puede leer una instrucción y un dato a la vez. Harvard puede, y por eso domina en microcontroladores y en las cachés de nivel 1.'
    },
    {
      t: 'Ruta de datos y unidad de control',
      g: 'Arquitectura',
      d: 'La ruta de datos son los registros, la ALU y los buses que mueven bits. La unidad de control decide qué hace cada uno en cada instante.',
      why: 'Es la división clave de todo procesador: una parte trabaja, la otra dirige. La unidad de control es, literalmente, una máquina de estados.'
    },
    {
      t: 'Ciclo de instrucción',
      g: 'Arquitectura',
      d: 'Buscar la instrucción, decodificarla y ejecutarla; luego vuelta a empezar.',
      why: 'Todo procesador hace eso en bucle desde que arranca hasta que se apaga. Entenderlo convierte el resto del tema en detalles.'
    },
    {
      t: 'Contador de programa (PC)',
      g: 'Arquitectura',
      d: 'El registro que guarda la dirección de la siguiente instrucción.',
      why: 'Se incrementa solo en cada ciclo. Un salto no es más que escribir otro valor en el PC: ahí están los if y los bucles.'
    },
    {
      t: 'Segmentación (pipeline)',
      g: 'Arquitectura',
      d: 'Solapar etapas de instrucciones distintas, como una cadena de montaje.',
      why: 'No acelera una instrucción suelta; multiplica cuántas terminas por unidad de tiempo. Los saltos y las dependencias entre datos son lo que la estropea.'
    },
    {
      t: 'Interrupciones frente a sondeo',
      g: 'Arquitectura',
      d: 'Sondeo: el procesador pregunta una y otra vez si el periférico está listo. Interrupción: el periférico avisa cuando lo está.',
      why: 'El sondeo malgasta ciclos preguntando. La interrupción libera al procesador, a cambio de tener que guardar y restaurar el contexto.'
    },
    {
      t: 'DMA',
      g: 'Arquitectura',
      d: 'Un controlador que mueve datos entre periférico y memoria sin pasar por el procesador.',
      why: 'Para transferir un bloque grande, hasta las interrupciones son caras. El DMA deja al procesador trabajando en otra cosa mientras.'
    },

    // ---------- Tecnología
    {
      t: 'TTL frente a CMOS',
      g: 'Tecnología',
      d: 'Dos familias de fabricación: TTL con transistores bipolares, CMOS con transistores de efecto de campo complementarios.',
      why: 'CMOS consume prácticamente solo al conmutar, y por eso se comió el mercado. TTL es más rápida en conmutación pura pero gasta siempre.'
    },
    {
      t: 'Margen de ruido',
      g: 'Tecnología',
      d: 'Cuánto puede ensuciarse una señal sin que se confunda el 0 con el 1.',
      why: 'Es lo que hace que lo digital sea fiable: mientras el ruido no se coma el margen, la señal se regenera limpia en cada puerta.'
    },
    {
      t: 'Fan-out',
      g: 'Tecnología',
      d: 'A cuántas entradas puede atacar una salida sin degradarse.',
      why: 'Superarlo hace que los niveles de tensión dejen de ser válidos y el circuito falle de forma intermitente, que es la peor forma de fallar.'
    },
    {
      t: 'FPGA',
      g: 'Tecnología',
      d: 'Un chip con bloques lógicos y conexiones programables: se configura para comportarse como el circuito que describas.',
      why: 'Permite probar un diseño digital real sin fabricar nada. Es el puente entre los ejercicios de la asignatura y el hardware de verdad.'
    }
  ],

  pitfalls: [
    {
      t: 'El rango del complemento a dos',
      g: 'Numeración',
      wrong: 'Con 8 bits, de −127 a +127.',
      right: 'De −128 a +127. Hay un negativo de más porque el cero tiene una sola representación, no dos como en signo-magnitud.'
    },
    {
      t: 'Confundir acarreo con desbordamiento',
      g: 'Numeración',
      wrong: 'Ver un acarreo final y declarar desbordamiento.',
      right: 'En aritmética sin signo lo relevante es el acarreo; con signo, el desbordamiento, que se detecta cuando el acarreo que entra al bit de signo y el que sale difieren. Pueden darse por separado.'
    },
    {
      t: 'Comparar flotantes con igualdad',
      g: 'Numeración',
      wrong: 'if (0.1 + 0.2 == 0.3)',
      right: 'Es falso en cualquier lenguaje que use IEEE 754, porque 0,1 en binario es periódico. Se compara con una tolerancia.'
    },
    {
      t: 'Olvidar que el mapa de Karnaugh se cierra',
      g: 'Boole',
      wrong: 'No agrupar las cuatro esquinas, o las casillas del borde izquierdo con las del derecho.',
      right: 'El mapa es un toro: la primera columna es vecina de la última, y la primera fila de la última. Ahí se pierden las simplificaciones más grandes.'
    },
    {
      t: 'Aplicar De Morgan a medias',
      g: 'Boole',
      wrong: 'NOT(A · B) = NOT A · NOT B',
      right: 'NOT(A · B) = NOT A + NOT B. Al negar, el operador también cambia: el AND se vuelve OR y al revés.'
    },
    {
      t: 'Agrupar en Karnaugh un número que no sea potencia de dos',
      g: 'Boole',
      wrong: 'Rodear tres casillas juntas.',
      right: 'Los grupos son de 1, 2, 4, 8… Tres casillas se cubren con dos grupos de dos que se solapen, y solaparse está permitido.'
    },
    {
      t: 'Latch y flip-flop como sinónimos',
      g: 'Secuenciales',
      wrong: 'Usar un latch donde el diseño pide captura en flanco.',
      right: 'El latch es transparente durante todo el nivel activo, así que la entrada se cuela en la salida mientras tanto. El flip-flop solo mira en el flanco.'
    },
    {
      t: 'Colocar mal la salida en Moore y Mealy',
      g: 'Secuenciales',
      wrong: 'Escribir la salida sobre las flechas en una máquina de Moore.',
      right: 'En Moore la salida vive en el estado (se escribe dentro del círculo); en Mealy vive en la transición (sobre la flecha), porque depende también de la entrada.'
    },
    {
      t: 'Contar direcciones como líneas',
      g: 'Memoria',
      wrong: '«16 líneas de dirección, luego 16 posiciones».',
      right: '2¹⁶ = 65 536 posiciones. Y la capacidad total es ese número multiplicado por la anchura de cada palabra.'
    },
    {
      t: 'Convertir hexadecimal pasando por decimal',
      g: 'Numeración',
      wrong: 'Pasar cada dígito hex a decimal, sumar, y luego el total a binario.',
      right: 'Cada dígito hex son exactamente 4 bits: se sustituye uno a uno y ya está. Pasar por decimal es más largo y donde se cometen los errores.'
    },
    {
      t: 'Fiarse de un contador asíncrono',
      g: 'Secuenciales',
      wrong: 'Leer la salida de un contador asíncrono en cualquier momento.',
      right: 'Los retardos se acumulan etapa a etapa, así que durante la transición aparecen valores intermedios que no corresponden a ningún estado real.'
    },
    {
      t: 'Pensar que el pipeline acelera cada instrucción',
      g: 'Arquitectura',
      wrong: '«Con cinco etapas, cada instrucción tarda la quinta parte».',
      right: 'Una instrucción suelta tarda lo mismo o algo más. Lo que se multiplica es el número de instrucciones terminadas por unidad de tiempo.'
    }
  ]
}
