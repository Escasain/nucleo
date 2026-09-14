// Problemas de Tecnología de Computadores. Misma estructura que el
// resto: g / level / q / hint / a / key.

export const TEC_COMP_PRACTICE = [
  // ---------- Numeración
  {
    id: 'num1',
    g: 'Numeración',
    level: 1,
    q: 'Convierte 0xA7 a binario y a decimal. Hazlo sin pasar por decimal para el binario.',
    hint: 'Cada dígito hexadecimal son exactamente 4 bits. Sustituye uno a uno.',
    a: `A = 1010, 7 = 0111 → 0xA7 = 1010 0111 en binario.

A decimal, por posiciones hexadecimales:
A·16 + 7 = 10·16 + 7 = 167

Comprobación desde el binario: 128 + 32 + 4 + 2 + 1 = 167 ✓

El atajo importa: convertir hex → binario pasando por decimal es más largo y es donde se cometen los errores. Un dígito hex son siempre 4 bits, sin excepción.`,
    key: '1010 0111 · 167'
  },
  {
    id: 'num2',
    g: 'Numeración',
    level: 1,
    q: 'Representa −45 en complemento a dos con 8 bits. ¿Cuál es el rango representable con 8 bits?',
    hint: 'Parte del positivo, invierte todos los bits y suma 1.',
    a: `45 en binario de 8 bits: 0010 1101
Invertido:                   1101 0010
Sumando 1:                   1101 0011

−45 = 1101 0011 (0xD3)

Comprobación: 1101 0011 sin signo vale 211, y 211 − 256 = −45 ✓

Rango con 8 bits: de −128 a +127. Es ASIMÉTRICO, hay un negativo de más, porque el cero tiene una sola representación (a diferencia de signo-magnitud, que gasta dos patrones en +0 y −0).`,
    key: '1101 0011 · rango −128 a +127'
  },
  {
    id: 'num3',
    g: 'Numeración',
    level: 2,
    q: 'Con 8 bits y complemento a dos, calcula 100 + 50. ¿Hay acarreo? ¿Hay desbordamiento?',
    hint: 'Fíjate en el acarreo que ENTRA al bit de signo y en el que SALE de él. No son lo mismo.',
    a: `100 = 0110 0100
 50 = 0011 0010
suma= 1001 0110

El resultado, interpretado con signo, es negativo (bit más alto = 1): vale 0x96 = 150 sin signo, o 150 − 256 = −106 con signo.

· Acarreo de salida del bit 7: NO hay (no se sale del byte).
· Desbordamiento: SÍ. El acarreo que entra al bit de signo es 1 y el que sale es 0: difieren.

Y tiene sentido: 150 no cabe en el rango −128…+127, así que el resultado con signo es basura. En aritmética SIN signo, en cambio, 150 es perfectamente válido y no habría problema.

Esa es toda la diferencia: el acarreo importa sin signo, el desbordamiento con signo.`,
    key: 'Sin acarreo, con desbordamiento'
  },
  {
    id: 'num4',
    g: 'Numeración',
    level: 3,
    q: 'Representa 12,375 en IEEE 754 de precisión simple (32 bits).',
    hint: 'Pasa la parte entera y la fraccionaria a binario, normaliza a 1,xxx · 2^e y recuerda el sesgo de 127.',
    a: `Parte entera: 12 = 1100
Parte fraccionaria: 0,375 = 0,25 + 0,125 = 0,011

12,375 = 1100,011 en binario.

Normalizando: 1100,011 = 1,100011 · 2³

· Signo: 0 (positivo)
· Exponente: 3 + 127 = 130 = 1000 0010
· Mantisa: los bits tras la coma, rellenando a 23: 100 0110 0000 0000 0000 0000
  (el 1 de delante es implícito y no se guarda)

Resultado: 0 10000010 10001100000000000000000

En hexadecimal: 0x4146 0000.

Este número sale exacto porque 0,375 es suma de potencias de 2 negativas. Con 0,1 no pasaría: su binario es periódico y por eso 0.1 + 0.2 ≠ 0.3.`,
    key: '0 10000010 10001100000000000000000 (0x41460000)'
  },

  // ---------- Boole y Karnaugh
  {
    id: 'bool1',
    g: 'Boole',
    level: 1,
    q: 'Simplifica ¬(A·B) + ¬(A + C) aplicando De Morgan.',
    hint: 'Al negar un producto sale una suma, y al negar una suma sale un producto. El operador también cambia.',
    a: `¬(A·B) = ¬A + ¬B
¬(A + C) = ¬A · ¬C

Sustituyendo:
¬A + ¬B + ¬A·¬C

El término ¬A·¬C está absorbido por ¬A (si ¬A vale 1, la suma ya vale 1):
= ¬A + ¬B

El error clásico es escribir ¬(A·B) = ¬A · ¬B, dejando el operador quieto. Comprueba con A=1, B=0: ¬(1·0) = 1, mientras que ¬1·¬0 = 0·1 = 0. No son lo mismo.`,
    key: '¬A + ¬B'
  },
  {
    id: 'bool2',
    g: 'Boole',
    level: 2,
    q: 'Una función de 3 variables vale 1 en las combinaciones ABC = 001, 011, 101, 111. Escribe su forma canónica en suma de productos y simplifícala.',
    hint: 'Escribe qué tienen en común las cuatro combinaciones antes de ponerte a operar.',
    a: `Forma canónica (un minterm por cada 1):
F = ¬A¬BC + ¬ABC + A¬BC + ABC

Pero míralas: en las cuatro, C = 1, y A y B toman todos los valores posibles. O sea que la salida solo depende de C.

F = C

Algebraicamente:
¬A¬BC + ¬ABC = ¬AC(¬B + B) = ¬AC
A¬BC + ABC   = AC(¬B + B)  = AC
¬AC + AC     = C(¬A + A)   = C ✓

En un mapa de Karnaugh serían las cuatro casillas de la mitad C=1, un grupo de 4 que elimina dos variables.`,
    key: 'F = C'
  },
  {
    id: 'bool3',
    g: 'Boole',
    level: 3,
    q: 'Simplifica con Karnaugh la función de 4 variables que vale 1 en los minterms 0, 2, 8, 10.',
    hint: 'Escribe los cuatro en binario ABCD y mira qué bits se mantienen fijos. Y recuerda que el mapa se cierra por los bordes.',
    a: `En binario ABCD:
 0 = 0000
 2 = 0010
 8 = 1000
10 = 1010

Comparándolos: B = 0 y D = 0 en los cuatro; A y C toman todos los valores.

F = ¬B·¬D

Esos cuatro minterms son exactamente las CUATRO ESQUINAS del mapa de Karnaugh. Se agrupan porque el mapa se cierra sobre sí mismo: la primera columna es vecina de la última y la primera fila de la última, como un donut.

Es el grupo que más se pierde: si no cierras el mapa, sacas dos grupos de dos (¬A¬B¬D + A¬B¬D) y una expresión peor.`,
    key: 'F = ¬B·¬D (las cuatro esquinas)'
  },
  {
    id: 'bool4',
    g: 'Boole',
    level: 3,
    q: 'Una función de 4 bits detecta si un dígito BCD es mayor o igual que 5. Los patrones 1010–1111 no se dan nunca. Simplifícala aprovechándolo.',
    hint: 'Marca los 1 (5 a 9), los 0 (0 a 4) y los seis restantes como X. Los X puedes tomarlos como 1 si te agrandan un grupo.',
    a: `Unos: 5,6,7,8,9 · Ceros: 0,1,2,3,4 · Don't care: 10,11,12,13,14,15

Con ABCD (A el bit más alto):

· Grupo 1: A=1 cubre 8 y 9, y ampliando con los X 10–15 queda el grupo entero A=1 (8 casillas) → término A
· Grupo 2: 5 (0101), 7 (0111), y con los X 13 (1101) y 15 (1111) → B·D
· Grupo 3: 6 (0110), 7 (0111), y con los X 14, 15 → B·C

F = A + B·C + B·D

Sin los don't care saldría bastante más larga. Por eso los X son un regalo: tómalos como 1 cuando te agrandan un grupo y como 0 cuando no, decidiendo uno a uno.`,
    key: 'F = A + B·C + B·D'
  },
  {
    id: 'bool5',
    g: 'Boole',
    level: 2,
    q: 'Implementa F = A·B usando solo puertas NAND. ¿Cuántas necesitas?',
    hint: 'Una NAND con las dos entradas juntas hace de inversor.',
    a: `NAND(A,B) = ¬(A·B). Solo falta invertir eso.

Un inversor con NAND: NAND(X,X) = ¬(X·X) = ¬X.

Así que:
1ª NAND: N = NAND(A, B) = ¬(A·B)
2ª NAND: NAND(N, N) = ¬N = A·B ✓

Hacen falta 2 puertas NAND.

Esto es la completitud funcional: con NAND sola se construye cualquier función lógica, y por eso los circuitos reales están llenos de ellas — fabricar un solo tipo de puerta sale más barato.`,
    key: '2 NAND (la segunda como inversor)'
  },

  // ---------- Combinacionales
  {
    id: 'comb1',
    g: 'Combinacionales',
    level: 2,
    q: 'Escribe la tabla de verdad de un sumador completo (A, B, Cin → S, Cout) y sus ecuaciones simplificadas.',
    hint: 'La suma vale 1 cuando hay un número impar de unos. El acarreo, cuando hay dos o más.',
    a: `A B Cin | S Cout
0 0  0  | 0  0
0 0  1  | 1  0
0 1  0  | 1  0
0 1  1  | 0  1
1 0  0  | 1  0
1 0  1  | 0  1
1 1  0  | 0  1
1 1  1  | 1  1

S vale 1 cuando el número de unos es impar → S = A ⊕ B ⊕ Cin
Cout vale 1 cuando hay dos o más unos → Cout = A·B + Cin·(A ⊕ B)

(También vale Cout = A·B + A·Cin + B·Cin, pero la primera reaprovecha el A⊕B que ya calculas para S y sale más barata en puertas.)

Encadenando n sumadores completos se suma cualquier anchura, y con complemento a dos el mismo circuito resta.`,
    key: 'S = A⊕B⊕Cin · Cout = AB + Cin(A⊕B)'
  },
  {
    id: 'comb2',
    g: 'Combinacionales',
    level: 3,
    q: 'Implementa F(A,B,C) = Σm(1, 2, 4, 7) con un único multiplexor 4:1, usando A y B como señales de selección.',
    hint: 'Para cada combinación de AB, mira qué hace F en función de C: puede salir 0, 1, C o ¬C.',
    a: `Minterms en binario ABC: 1 = 001, 2 = 010, 4 = 100, 7 = 111.

Agrupando por AB:
· AB = 00 → F=1 solo con C=1  → entrada I₀ = C
· AB = 01 → F=1 solo con C=0  → entrada I₁ = ¬C
· AB = 10 → F=1 solo con C=0  → entrada I₂ = ¬C
· AB = 11 → F=1 solo con C=1  → entrada I₃ = C

Conectando A y B a las líneas de selección: I₀ = C, I₁ = ¬C, I₂ = ¬C, I₃ = C.
Un MUX 4:1 y un inversor, y ya está.

(De hecho F = A ⊕ B ⊕ C, la paridad impar. Se ve en el patrón.)

Este truco es lo que hace al multiplexor la pieza más versátil del tema: con n líneas de selección implementa cualquier función de n+1 variables.`,
    key: 'I₀=C, I₁=¬C, I₂=¬C, I₃=C'
  },
  {
    id: 'comb3',
    g: 'Combinacionales',
    level: 2,
    q: 'Un sumador de 4 bits con acarreo propagado usa sumadores completos con retardo de 10 ns cada uno. ¿Cuánto tarda en dar el resultado válido? ¿Y uno de 16 bits?',
    hint: 'Cada etapa tiene que esperar al acarreo de la anterior.',
    a: `Con acarreo propagado, la etapa i no puede terminar hasta que le llega el acarreo de la i−1. Los retardos se suman en cadena:

4 bits:  4 × 10 = 40 ns
16 bits: 16 × 10 = 160 ns

El tiempo crece LINEALMENTE con el número de bits, y ese es el camino crítico del circuito: fija la frecuencia máxima de reloj.

Por eso existe el acarreo anticipado (carry-lookahead), que calcula todos los acarreos a la vez a partir de las entradas: tarda casi lo mismo con 8 bits que con 64, a cambio de bastantes más puertas. Es el cambio de coste típico en digital: velocidad contra área.`,
    key: '40 ns y 160 ns (crece linealmente)'
  },

  // ---------- Secuenciales
  {
    id: 'sec1',
    g: 'Secuenciales',
    level: 2,
    q: 'Un latch D y un flip-flop D reciben la misma señal D, que cambia varias veces mientras el reloj está a nivel alto. ¿Qué sale por cada uno?',
    hint: 'Uno es transparente mientras el nivel está activo; el otro solo mira un instante.',
    a: `· El LATCH D es transparente mientras CLK = 1: su salida va copiando D en tiempo real, con todos los cambios intermedios. Al bajar el reloj se queda con el ÚLTIMO valor que tuviera D.

· El FLIP-FLOP D solo captura en el FLANCO (la transición de 0 a 1). Toma el valor que tenga D en ese instante y lo mantiene estable todo el ciclo, ignorando por completo lo que D haga después.

Consecuencia práctica: con un latch, los cambios de D se propagan al circuito que viene detrás en mitad del ciclo y pueden provocar carreras. Por eso los diseños síncronos se construyen con flip-flops.

Llamar «biestable» a los dos es correcto; la diferencia es por nivel o por flanco.`,
    key: 'Latch: sigue a D mientras CLK=1 · FF: solo el valor del flanco'
  },
  {
    id: 'sec2',
    g: 'Secuenciales',
    level: 3,
    q: 'Diseña un contador síncrono módulo 6 (cuenta 0→5 y vuelve a 0) con flip-flops D. ¿Cuántos necesitas y cómo detectas el final?',
    hint: 'Primero cuántos bits hacen falta. Luego, en qué estado hay que forzar la vuelta a cero.',
    a: `Para contar hasta 5 hacen falta 3 bits (2³ = 8 ≥ 6). Tres flip-flops D: Q₂Q₁Q₀.

Secuencia: 000 → 001 → 010 → 011 → 100 → 101 → 000 …

La detección del final: el estado 101 es el último, así que en el siguiente flanco hay que ir a 000. Una forma sencilla es detectar 110 (el primero que sobra) y usarlo como reset asíncrono, pero eso genera un pulso espurio.

Mejor: diseñar las ecuaciones para que desde 101 se vaya a 000 directamente, tratando 110 y 111 como don't care en el Karnaugh (nunca se alcanzan). Sale más barato y sin estados fantasma.

Ecuaciones (con 110 y 111 como X):
D₀ = ¬Q₀
D₁ = Q₁ ⊕ Q₀ ... y desde 101 hay que forzar Q₁ = 0
D₂ = Q₂ ⊕ (Q₁·Q₀)  con la vuelta a 0 desde 101

La lección del ejercicio: el reset por detección de estado sobrante funciona pero es asíncrono y sucio; hacerlo con don't care en las ecuaciones es la forma limpia.`,
    key: '3 flip-flops; 110 y 111 como don\'t care'
  },
  {
    id: 'sec3',
    g: 'Secuenciales',
    level: 3,
    q: 'Dibuja el diagrama de estados de un detector de la secuencia 101 (solapada) en versión Moore y en versión Mealy. ¿Cuántos estados necesita cada uno?',
    hint: 'En una la salida se escribe dentro del estado; en la otra, sobre la flecha. Eso cambia cuántos estados hacen falta.',
    a: `MEALY (3 estados): la salida depende del estado Y de la entrada.
S0 «nada»      --1/0--> S1      --0/0--> S2
S1 «he visto 1» --0/0--> S2,  --1/0--> S1
S2 «he visto 10» --1/1--> S1   ← aquí sale el 1
S2 --0/0--> S0

Fíjate en que desde S2 con un 1 vuelve a S1, no a S0: eso es lo que permite detectar secuencias SOLAPADAS (en 10101 hay dos detecciones).

MOORE (4 estados): la salida depende solo del estado, así que hace falta un estado extra «acabo de detectar».
S0 (sal 0) · S1 «1» (sal 0) · S2 «10» (sal 0) · S3 «101» (sal 1)
Y desde S3, con un 0 se va a S2 (porque el 1 final sirve de comienzo del siguiente).

Resumen: Mealy 3 estados, Moore 4. Mealy suele necesitar menos estados; Moore da salidas más estables, sin glitches cuando la entrada cambia a mitad de ciclo.`,
    key: 'Mealy 3 estados, Moore 4'
  },
  {
    id: 'sec4',
    g: 'Secuenciales',
    level: 3,
    q: 'Un circuito tiene un camino combinacional de 12 ns entre dos flip-flops. El tiempo de setup es 2 ns y el retardo de salida del flip-flop 1 ns. ¿Cuál es la frecuencia máxima de reloj?',
    hint: 'El período tiene que cubrir todo lo que pasa entre dos flancos consecutivos.',
    a: `Entre dos flancos tienen que caber tres cosas:

T ≥ t_salida + t_combinacional + t_setup
T ≥ 1 + 12 + 2 = 15 ns

f_max = 1 / 15 ns = 66,7 MHz

Lo que se olvida siempre es sumar el setup y el retardo de salida: con solo los 12 ns del camino combinacional saldrían 83 MHz y el circuito fallaría.

Si el camino combinacional fuera más corto en otras rutas, daría igual: manda el CAMINO CRÍTICO, la ruta más lenta. Optimizar cualquier otra no sube la frecuencia ni un hercio.`,
    key: 'T = 15 ns → 66,7 MHz'
  },

  // ---------- Memoria
  {
    id: 'mem1',
    g: 'Memoria',
    level: 1,
    q: 'Una memoria es de 32K × 8. ¿Cuántas líneas de dirección y de datos necesita? ¿Cuál es su capacidad total en bytes?',
    hint: 'Con n líneas de dirección se distinguen 2ⁿ posiciones. 32K = 2^?',
    a: `32K = 32 · 1024 = 32 768 = 2¹⁵

· Líneas de dirección: 15
· Líneas de datos: 8 (cada posición guarda 8 bits)
· Capacidad: 32 768 × 8 bits = 32 KB

El error que más se repite: pensar que 15 líneas son 15 posiciones. Son 2¹⁵. Y la anchura de cada posición la fija el bus de DATOS, no el de direcciones — son dos cosas independientes.`,
    key: '15 direcciones, 8 datos, 32 KB'
  },
  {
    id: 'mem2',
    g: 'Memoria',
    level: 2,
    q: '¿Cuántos chips de 8K × 8 hacen falta para construir una memoria de 32K × 16? ¿Cómo se conectan?',
    hint: 'Hay que expandir en dos direcciones distintas: anchura de palabra y número de posiciones.',
    a: `Dos expansiones a la vez:

· En ANCHURA: la palabra pasa de 8 a 16 bits → 16/8 = 2 chips en paralelo, compartiendo las mismas direcciones, uno para los bits 0–7 y otro para los 8–15.
· En CAPACIDAD: de 8K a 32K posiciones → 32/8 = 4 bloques en serie.

Total: 2 × 4 = 8 chips.

Conexión: los 4 bloques comparten las 13 líneas de dirección bajas (8K = 2¹³) y se distinguen por las 2 líneas altas (32K = 2¹⁵, sobran 15 − 13 = 2), que van a un DECODIFICADOR 2:4 cuyas salidas activan el chip-select de cada bloque.

Así solo responde un bloque a la vez, y los dos chips de ese bloque entregan sus 8 bits cada uno para formar la palabra de 16.`,
    key: '8 chips (2 en anchura × 4 en capacidad) + decodificador 2:4'
  },

  // ---------- Arquitectura
  {
    id: 'arq1',
    g: 'Arquitectura',
    level: 1,
    q: 'Enumera qué ocurre en cada fase del ciclo de instrucción y qué registro se actualiza solo en cada vuelta.',
    hint: 'Son tres fases, y hay un registro que apunta siempre a lo siguiente.',
    a: `1. BÚSQUEDA (fetch): la dirección del PC sale al bus de direcciones, se lee la instrucción de memoria y entra en el registro de instrucción (IR). El PC se incrementa.
2. DECODIFICACIÓN: la unidad de control interpreta el código de operación del IR y decide qué señales activar.
3. EJECUCIÓN: se hace la operación — la ALU calcula, se lee o escribe memoria, se mueve un registro.

Y vuelta a empezar, desde que arranca la máquina hasta que se apaga.

El registro que se actualiza solo es el CONTADOR DE PROGRAMA (PC). Que se incremente automáticamente es lo que hace que el programa avance; un salto no es más que escribir otro valor en el PC, y ahí están todos los if y todos los bucles.`,
    key: 'Fetch, decode, execute · el PC'
  },
  {
    id: 'arq2',
    g: 'Arquitectura',
    level: 2,
    q: 'Un periférico entrega un dato cada 1 ms. Con sondeo, el procesador comprueba su estado cada 10 µs y cada comprobación cuesta 5 instrucciones. ¿Cuántas instrucciones gasta por dato? Compáralo con una interrupción que cuesta 50 instrucciones de contexto.',
    hint: 'Cuenta cuántas comprobaciones entran en 1 ms.',
    a: `Sondeo: en 1 ms caben 1000 µs / 10 µs = 100 comprobaciones, a 5 instrucciones cada una:

100 × 5 = 500 instrucciones por dato

Interrupción: 50 instrucciones por dato, y solo cuando hay dato.

El sondeo gasta 10 veces más, y además esas instrucciones son puro desperdicio: 99 de las 100 comprobaciones no encuentran nada.

Cuándo compensa cada uno: el sondeo es mejor si el periférico es muy rápido y casi siempre tiene dato (ahí el coste de contexto de la interrupción domina); la interrupción gana en cuanto el dispositivo es lento comparado con el procesador, que es lo normal. Y para bloques grandes, ninguno de los dos: DMA.`,
    key: '500 contra 50 instrucciones por dato'
  },
  {
    id: 'arq3',
    g: 'Arquitectura',
    level: 2,
    q: 'Un pipeline de 5 etapas, cada una de 2 ns. ¿Cuánto tarda UNA instrucción? ¿Y 1000 instrucciones seguidas, sin riesgos?',
    hint: 'La primera tiene que atravesar las cinco etapas; a partir de ahí sale una por ciclo.',
    a: `Una instrucción sola: atraviesa las 5 etapas → 5 × 2 = 10 ns. Igual (o algo peor) que sin pipeline.

1000 instrucciones: la primera tarda 10 ns en llenar el pipeline, y luego sale una cada 2 ns.

10 + 999 × 2 = 2008 ns

Sin pipeline serían 1000 × 10 = 10 000 ns. Casi 5 veces más rápido, que es el número de etapas.

La confusión que hay que evitar: el pipeline NO acelera una instrucción (la latencia no baja), multiplica cuántas terminas por unidad de tiempo (el throughput). Y ese factor se pierde en cuanto aparecen saltos o dependencias entre datos, que es de lo que va el resto del tema.`,
    key: '10 ns una · 2008 ns mil'
  }
]
