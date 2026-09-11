// Guía de estudio · Año 1 (curso 2026/27)
// Temarios orientativos basados en el plan UNIPRO/UNIR y en las guías
// docentes públicas de estas asignaturas. Contrasta siempre con la guía
// docente de tu campus: puede variar el orden o el nombre de los temas.

export const YEAR1 = {
  // ---------------------------------------------------------------- SEP
  algebra: {
    ects: 6,
    summary:
      'La base matemática de casi toda la informática: matrices y espacios vectoriales (gráficos, IA, redes), y matemática discreta (lógica, conjuntos, grafos, combinatoria) que reaparece en Algoritmia, Bases de Datos y Estructura de Datos.',
    approach:
      'Es una asignatura de hacer, no de leer: cada tema se aprende resolviendo 20–30 ejercicios a mano. Usa GeoGebra o WolframAlpha solo para comprobar, nunca para saltarte el cálculo. La lógica y los grafos son los temas que más se reutilizan en el resto del grado; dedícales tiempo extra.',
    topics: [
      'Lógica proposicional y de predicados: tablas de verdad, equivalencias, demostraciones',
      'Teoría de conjuntos, relaciones (equivalencia, orden) y funciones',
      'Inducción matemática y recursividad',
      'Aritmética modular, divisibilidad y aplicaciones (hash, criptografía básica)',
      'Combinatoria: principios de conteo, permutaciones, combinaciones, binomio de Newton',
      'Teoría de grafos: representación, caminos, árboles, grafos eulerianos y hamiltonianos',
      'Matrices, determinantes y sistemas de ecuaciones lineales (Gauss)',
      'Espacios vectoriales, bases, dimensión y aplicaciones lineales',
      'Diagonalización: autovalores y autovectores'
    ],
    resources: [
      { type: 'video', lang: 'en', title: '3Blue1Brown · Essence of Linear Algebra', url: 'https://www.3blue1brown.com/topics/linear-algebra', note: 'La intuición visual de vectores, matrices y autovalores en 15 vídeos cortos. Verlo antes de estudiar el tema hace que todo lo demás encaje.' },
      { type: 'curso', lang: 'es', title: 'Khan Academy · Álgebra lineal', url: 'https://es.khanacademy.org/math/linear-algebra', note: 'Vídeos y ejercicios autocorregidos en español. Ideal para matrices, sistemas y espacios vectoriales.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · 18.06 Linear Algebra (Gilbert Strang)', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', note: 'El curso de referencia mundial, con vídeos, problemas resueltos y exámenes. Para profundizar.' },
      { type: 'libro', lang: 'en', title: 'Discrete Mathematics: An Open Introduction (Oscar Levin)', url: 'https://discrete.openmathbooks.org/', note: 'Libro libre y online con ejercicios interactivos: lógica, conteo, grafos, inducción. Cubre toda la parte discreta.' },
      { type: 'libro', lang: 'en', title: 'Book of Proof (Richard Hammack)', url: 'https://www.people.vcu.edu/~rhammack/BookOfProof/', note: 'Gratis en PDF. Enseña a escribir demostraciones: la habilidad que más cuesta al empezar.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · Mathematics for Computer Science', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/', note: 'Matemática discreta orientada a informáticos, con apuntes completos en PDF.' },
      { type: 'video', lang: 'en', title: 'TrevTutor · Discrete Math', url: 'https://www.youtube.com/@Trevtutor', note: 'Listas de reproducción claras y cortas sobre lógica, conjuntos, relaciones y grafos.' },
      { type: 'libro', lang: 'es', title: 'Matemática discreta y sus aplicaciones (Kenneth Rosen, McGraw-Hill)', note: 'El manual clásico de la asignatura; casi seguro que es la bibliografía básica. Miles de ejercicios con solución.' }
    ],
    lab: {
      intro: 'No necesitas instalar nada pesado: papel, una herramienta de comprobación y, si quieres ir más allá, Python para experimentar con matrices y grafos.',
      tools: [
        { title: 'GeoGebra', url: 'https://www.geogebra.org/', note: 'Visualiza vectores, transformaciones lineales y resuelve sistemas paso a paso.' },
        { title: 'WolframAlpha', url: 'https://www.wolframalpha.com/', note: 'Comprueba determinantes, inversas, autovalores y tablas de verdad.' },
        { title: 'Google Colab', url: 'https://colab.research.google.com/', note: 'Python en el navegador sin instalar nada: NumPy para matrices, NetworkX para grafos.' },
        { title: 'NumPy · guía de inicio', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html', note: 'Álgebra lineal con código: np.linalg.solve, det, eig.' }
      ],
      steps: [
        'Abre un cuaderno en Colab y reproduce con NumPy cada sistema de ecuaciones que resuelvas a mano: si el resultado no coincide, revisa tu cálculo.',
        'Con NetworkX (pip install networkx) construye los grafos de los ejercicios y comprueba grados, conectividad y caminos.',
        'Crea flashcards en NÚCLEO con las equivalencias lógicas y las fórmulas de conteo: son puro repaso espaciado.',
        'Antes de la prueba final, hazte una hoja de una cara con las propiedades de determinantes, rango y diagonalización.'
      ]
    }
  },

  fisica: {
    ects: 6,
    summary:
      'Electricidad, magnetismo y electrónica básica: lo justo para entender por qué un ordenador funciona. Desemboca en Tecnología de Computadores (puertas lógicas) y Estructura de Computadores.',
    approach:
      'Céntrate en circuitos: leyes de Kirchhoff, Ohm, divisores de tensión, condensadores y el diodo/transistor como interruptor. La parte de campos es más teórica; en la práctica se evalúa resolviendo circuitos. Simula cada circuito del temario antes de intentar el problema en papel.',
    topics: [
      'Carga eléctrica, campo y potencial eléctrico',
      'Corriente, resistencia y ley de Ohm; potencia y energía',
      'Circuitos de corriente continua: leyes de Kirchhoff, asociaciones, Thévenin',
      'Condensadores y circuitos RC; bobinas e inducción electromagnética',
      'Corriente alterna: impedancia, fasores, filtros básicos',
      'Semiconductores: unión P-N, diodo, diodo Zener, LED',
      'Transistores bipolar y MOSFET; el transistor como interruptor',
      'Amplificador operacional; introducción a la electrónica digital'
    ],
    resources: [
      { type: 'curso', lang: 'es', title: 'Khan Academy · Física (electricidad y circuitos)', url: 'https://es.khanacademy.org/science/physics', note: 'Los bloques de electrostática, circuitos y magnetismo cubren la primera mitad de la asignatura con ejercicios.' },
      { type: 'libro', lang: 'es', title: 'OpenStax · Física universitaria, volumen 2', url: 'https://openstax.org/details/books/f%C3%ADsica-universitaria-volumen-2', note: 'Libro universitario gratuito en español: electricidad, magnetismo y circuitos, con problemas resueltos.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · 8.02 Electricity and Magnetism', url: 'https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2019/', note: 'Vídeos y problemas del curso de física II del MIT. Para los temas de campos.' },
      { type: 'libro', lang: 'en', title: 'All About Circuits · Textbook', url: 'https://www.allaboutcircuits.com/textbook/', note: 'Libro online gratuito de electrónica: desde Ohm hasta transistores y amplificadores operacionales. Muy práctico.' },
      { type: 'video', lang: 'en', title: 'Ben Eater · electrónica desde cero', url: 'https://www.youtube.com/@BenEater', note: 'Explica transistores, puertas y circuitos montándolos en una protoboard. Enlace directo con Tecnología de Computadores.' },
      { type: 'libro', lang: 'es', title: 'Física para la ciencia y la tecnología, vol. 2 (Tipler & Mosca, Reverté)', note: 'El manual habitual de referencia para electricidad y magnetismo, con muchos problemas.' }
    ],
    lab: {
      intro: 'Un laboratorio de electrónica cabe en el navegador: simula cada circuito y mide tensiones y corrientes como si tuvieras un polímetro.',
      tools: [
        { title: 'Falstad · Circuit Simulator', url: 'https://www.falstad.com/circuit/', note: 'Simulador interactivo: ves la corriente moverse. Tiene ejemplos de casi todos los temas (RC, diodos, transistores, amp. op.).' },
        { title: 'PhET · Kit de construcción de circuitos', url: 'https://phet.colorado.edu/es/simulations/circuit-construction-kit-dc', note: 'Simulación en español de la Universidad de Colorado. Perfecta para Kirchhoff y asociaciones.' },
        { title: 'Tinkercad Circuits', url: 'https://www.tinkercad.com/', note: 'Protoboard virtual con componentes reales y Arduino. Gratis con cuenta.' },
        { title: 'PhET · todas las simulaciones de física', url: 'https://phet.colorado.edu/es/simulations/filter?subjects=physics', note: 'Campos eléctricos, condensadores, inducción… cada tema tiene su simulación.' }
      ],
      steps: [
        'Por cada problema de circuitos del temario, móntalo primero en Falstad y anota las medidas; luego resuélvelo a mano y compara.',
        'Construye en Tinkercad un divisor de tensión, un circuito RC y un transistor como interruptor controlando un LED.',
        'Si te animas con hardware real: un kit de iniciación Arduino (~25 €) reproduce todos los montajes del curso.',
        'Haz flashcards con las fórmulas (Ohm, potencia, RC, impedancias) y las curvas características de diodo y transistor.'
      ]
    }
  },

  'tec-comp': {
    ects: 6,
    summary:
      'Cómo se construye un ordenador a partir de puertas lógicas: sistemas de numeración, álgebra de Boole, circuitos combinacionales y secuenciales, memorias y la organización básica de un procesador.',
    approach:
      'Domina primero binario, complemento a dos y simplificación por Karnaugh: caen en todos los exámenes. Después diseña circuitos de verdad en un simulador; ver un contador o una ALU funcionando fija los conceptos mucho mejor que el papel. Nand2Tetris es la mejor inversión de tiempo de toda la asignatura.',
    topics: [
      'Sistemas de numeración: binario, octal, hexadecimal; complemento a dos; coma flotante IEEE 754',
      'Álgebra de Boole, puertas lógicas y funciones lógicas',
      'Simplificación: mapas de Karnaugh y Quine-McCluskey',
      'Circuitos combinacionales: codificadores, multiplexores, comparadores, sumadores, ALU',
      'Circuitos secuenciales: biestables, registros, contadores; máquinas de estados (Moore/Mealy)',
      'Memorias: RAM, ROM, organización y direccionamiento',
      'Organización básica de un computador: unidad de control, ruta de datos, ciclo de instrucción',
      'Tecnologías de implementación: TTL, CMOS, dispositivos programables (PLD, FPGA)'
    ],
    resources: [
      { type: 'curso', lang: 'en', title: 'Nand2Tetris · From NAND to Tetris', url: 'https://www.nand2tetris.org/', note: 'Construyes un ordenador completo desde la puerta NAND. Gratis, con simulador. Los proyectos 1–5 son exactamente esta asignatura.' },
      { type: 'video', lang: 'en', title: 'Crash Course · Computer Science', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo', note: 'Los episodios 1–10 explican puertas, ALU, registros, RAM y CPU en 10 minutos cada uno. Subtítulos en español.' },
      { type: 'video', lang: 'en', title: 'Ben Eater · ordenador de 8 bits en protoboard', url: 'https://eater.net/8bit', note: 'Serie legendaria: monta una CPU con chips discretos. Verás un contador, un registro y una ALU reales.' },
      { type: 'libro', lang: 'es', title: 'Fundamentos de sistemas digitales (Thomas Floyd, Pearson)', note: 'El manual estándar de electrónica digital en español; suele ser la bibliografía básica.' },
      { type: 'libro', lang: 'es', title: 'Organización y arquitectura de computadores (William Stallings, Pearson)', note: 'Para los temas de memoria y organización del computador. Lo reutilizarás en Estructura de Computadores.' },
      { type: 'practica', lang: 'en', title: 'HDLBits · ejercicios de circuitos en Verilog', url: 'https://hdlbits.01xz.net/wiki/Main_Page', note: 'Problemas autocorregidos de puertas, multiplexores, biestables y máquinas de estado. Introduce el diseño con HDL.' },
      { type: 'teoria', lang: 'en', title: 'Coma flotante IEEE 754 · conversor interactivo', url: 'https://www.h-schmidt.net/FloatConverter/IEEE754.html', note: 'Ve bit a bit cómo se representa un número real. Imprescindible para entender los errores de redondeo.' }
    ],
    lab: {
      intro: 'El laboratorio es un simulador de circuitos digitales: diseñas con puertas, biestables y memorias, y lo ves funcionar con relojes y LEDs.',
      tools: [
        { title: 'Logisim Evolution', url: 'https://github.com/logisim-evolution/logisim-evolution', note: 'El simulador clásico de circuitos digitales en las universidades. Descarga el .jar o instalador de la sección Releases (necesita Java).' },
        { title: 'Digital (hneemann)', url: 'https://github.com/hneemann/Digital', note: 'Alternativa moderna a Logisim: más rápida, con análisis de circuitos y exportación a Verilog.' },
        { title: 'CircuitVerse', url: 'https://circuitverse.org/', note: 'Simulador en el navegador, sin instalar nada. Bien para empezar y para móvil/tablet.' },
        { title: 'Nand2Tetris · Hardware Simulator', url: 'https://www.nand2tetris.org/software', note: 'Simulador online de los proyectos del curso: chips en HDL y sus tests.' }
      ],
      steps: [
        'Instala Logisim Evolution y reconstruye cada circuito del temario: sumador de 4 bits, multiplexor 4:1, decodificador, contador módulo 10.',
        'Haz los proyectos 1, 2 y 3 de Nand2Tetris (puertas, ALU, memoria): te dan la asignatura entera hecha.',
        'Practica conversiones binario/hexadecimal y complemento a dos a mano hasta hacerlas sin pensar; luego comprueba con la calculadora del sistema en modo programador.',
        'Para cada mapa de Karnaugh, implementa la función simplificada en el simulador y verifica la tabla de verdad.'
      ]
    }
  },

  // ---------------------------------------------------------------- NOV
  'fund-prog': {
    ects: 6,
    summary:
      'Aprender a programar de verdad: variables, control de flujo, funciones, vectores, cadenas y una introducción a la orientación a objetos. Es la llave de Programación Avanzada y la base de Estructura de Datos.',
    approach:
      'La única forma de aprender a programar es programar todos los días, aunque sean 30 minutos. Escribe cada ejemplo del tema a mano (nada de copiar y pegar), rómpelo a propósito y arréglalo. En UNIPRO/UNIR la asignatura se imparte habitualmente en Java; confírmalo el primer día en tu campus, porque los recursos de abajo asumen Java.',
    topics: [
      'Introducción: algoritmos, lenguajes, compilación e interpretación; el entorno de desarrollo',
      'Tipos de datos, variables, constantes, operadores y expresiones',
      'Entrada/salida por consola',
      'Estructuras de control: condicionales y bucles',
      'Métodos (funciones): parámetros, retorno, ámbito, recursividad básica',
      'Vectores y matrices; cadenas de caracteres',
      'Introducción a la programación orientada a objetos: clases, objetos, atributos, métodos, constructores',
      'Gestión de errores y excepciones; ficheros de texto',
      'Buenas prácticas: depuración, pruebas, estilo y documentación'
    ],
    resources: [
      { type: 'curso', lang: 'en', title: 'MOOC.fi · Java Programming I (Universidad de Helsinki)', url: 'https://java-programming.mooc.fi/', note: 'El mejor curso gratuito de Java desde cero: cientos de ejercicios autocorregidos. Sigue exactamente el orden de esta asignatura.' },
      { type: 'video', lang: 'es', title: 'Píldoras Informáticas · Curso de Java desde cero', url: 'https://www.youtube.com/@pildorasinformaticas', note: 'El curso de Java en español más seguido; muy pausado y claro. Busca la lista «Curso Java desde cero».' },
      { type: 'curso', lang: 'en', title: 'CS50x · Harvard', url: 'https://cs50.harvard.edu/x/', note: 'Si quieres entender qué pasa por debajo (memoria, punteros) antes de Java: la mejor introducción a la programación que existe.' },
      { type: 'teoria', lang: 'en', title: 'Oracle · The Java Tutorials', url: 'https://docs.oracle.com/javase/tutorial/', note: 'La referencia oficial. Los «Trails» Learning the Java Language y Essential Classes cubren todo el temario.' },
      { type: 'libro', lang: 'en', title: 'Think Java (Allen Downey), 2ª ed.', url: 'https://greenteapress.com/wp/think-java-2e/', note: 'Libro gratuito y corto, pensado para primer curso. Ejercicios al final de cada capítulo.' },
      { type: 'practica', lang: 'en', title: 'Exercism · Java track', url: 'https://exercism.org/tracks/java', note: 'Ejercicios progresivos con mentores humanos gratuitos que revisan tu código.' },
      { type: 'practica', lang: 'es', title: 'Acepta el Reto (UCM)', url: 'https://aceptaelreto.com/', note: 'Juez online en español de la Complutense: problemas ordenados por dificultad, corrección automática.' },
      { type: 'herramienta', lang: 'en', title: 'Python Tutor · visualiza tu código paso a paso', url: 'https://pythontutor.com/java.html', note: 'Ve cómo cambian las variables y la pila de llamadas línea a línea. Oro para entender bucles y recursión.' }
    ],
    lab: {
      intro: 'Necesitas un JDK y un editor. Lo montas en 15 minutos y te sirve para todo el grado.',
      tools: [
        { title: 'Eclipse Temurin (JDK)', url: 'https://adoptium.net/', note: 'Instala la versión LTS más reciente (17 o 21). Es Java: gratuito y sin registro.' },
        { title: 'IntelliJ IDEA Community', url: 'https://www.jetbrains.com/idea/download/', note: 'El IDE más cómodo para Java; la edición Community es gratis. Con tu correo de universidad tienes además la Ultimate.' },
        { title: 'Visual Studio Code + Extension Pack for Java', url: 'https://code.visualstudio.com/docs/java/java-tutorial', note: 'Alternativa ligera. La guía oficial te lo deja configurado en 5 minutos.' },
        { title: 'OnlineGDB', url: 'https://www.onlinegdb.com/', note: 'Compilador Java online con depurador, por si estás en otro ordenador.' }
      ],
      steps: [
        'Instala Temurin y comprueba en la terminal: java -version y javac -version.',
        'Instala IntelliJ Community, crea un proyecto «Hola mundo» y aprende a usar el depurador (puntos de ruptura, paso a paso): es la herramienta que más te va a enseñar.',
        'Crea un repositorio en GitHub llamado «fundamentos-programacion» y sube cada ejercicio: en Ingeniería de Software te pedirán Git de todas formas.',
        'Haz las partes 1–7 de MOOC.fi Java Programming I en paralelo a los temas: son los mismos contenidos con corrección automática.',
        'Registra en NÚCLEO cada sesión de práctica: la constancia diaria es lo que aprueba esta asignatura.'
      ]
    }
  },

  'fund-empresa': {
    ects: 6,
    summary:
      'La empresa como organización: tipos, áreas funcionales, estrategia, marketing, finanzas básicas y emprendimiento. Se imparte en inglés, así que también es una asignatura de vocabulario técnico-empresarial.',
    approach:
      'La tienes reconocida, pero el vocabulario reaparece en Gestión de Proyectos, Comunicación y Liderazgo y en el TFB. Si quieres repasarla, céntrate en leer el balance y la cuenta de resultados de una empresa real y en el Business Model Canvas: es lo que se usa en la práctica.',
    topics: [
      'La empresa y el empresario: concepto, tipos, formas jurídicas',
      'El entorno: análisis PESTEL, sector y competencia (Porter), DAFO',
      'Estrategia y dirección: misión, objetivos, planificación, estructura organizativa',
      'Área de marketing: mercado, segmentación, marketing mix (4P)',
      'Área de producción y operaciones; cadena de valor',
      'Área financiera: balance, cuenta de resultados, inversión y financiación',
      'Recursos humanos y cultura organizativa',
      'Emprendimiento, modelo de negocio (Canvas) y plan de empresa'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'OpenStax · Introduction to Business', url: 'https://openstax.org/details/books/introduction-business', note: 'Libro universitario gratuito que cubre exactamente este temario, en el inglés en que se examina la asignatura.' },
      { type: 'libro', lang: 'en', title: 'OpenStax · Principles of Management', url: 'https://openstax.org/details/books/principles-management', note: 'Para los temas de estrategia, estructura y dirección.' },
      { type: 'curso', lang: 'en', title: 'Khan Academy · Economics & Finance', url: 'https://www.khanacademy.org/economics-finance-domain', note: 'Los bloques de finanzas y contabilidad explican balance, resultados e inversión con ejemplos numéricos.' },
      { type: 'teoria', lang: 'en', title: 'Strategyzer · Business Model Canvas', url: 'https://www.strategyzer.com/library/the-business-model-canvas', note: 'La plantilla original y cómo rellenarla. Úsala con una empresa que conozcas.' },
      { type: 'teoria', lang: 'en', title: 'Investopedia', url: 'https://www.investopedia.com/', note: 'Diccionario de términos financieros y empresariales en inglés claro. Para cualquier palabra que no entiendas.' },
      { type: 'curso', lang: 'en', title: 'Y Combinator · Startup School', url: 'https://www.startupschool.org/', note: 'Curso gratuito sobre cómo crear una empresa tecnológica, de los inversores de Airbnb y Stripe. Para el tema de emprendimiento.' }
    ],
    lab: {
      intro: 'El «laboratorio» aquí es analizar empresas reales con las herramientas del temario.',
      tools: [
        { title: 'Canvanizer', url: 'https://canvanizer.com/', note: 'Business Model Canvas y DAFO online, gratis.' },
        { title: 'CNMV · cuentas anuales de empresas cotizadas', url: 'https://www.cnmv.es/', note: 'Descarga el informe anual de una empresa española y localiza balance y cuenta de resultados.' },
        { title: 'Google Sheets', url: 'https://sheets.google.com/', note: 'Para reconstruir un balance sencillo y calcular ratios (liquidez, endeudamiento, rentabilidad).' }
      ],
      steps: [
        'Elige una empresa tecnológica que conozcas y rellena su Business Model Canvas y su DAFO.',
        'Baja su informe anual y calcula tres ratios: liquidez, endeudamiento y ROE.',
        'Haz flashcards bilingües (término inglés ↔ definición) del vocabulario de cada tema.'
      ]
    }
  },

  // ---------------------------------------------------------------- MAR
  calculo: {
    ects: 6,
    summary:
      'Cálculo diferencial e integral de una variable, sucesiones y series, y métodos numéricos: cómo un ordenador aproxima raíces, integrales y ecuaciones diferenciales cuando no hay solución exacta.',
    approach:
      'Dos mitades muy distintas. La de cálculo se aprueba haciendo derivadas e integrales hasta automatizarlas. La de métodos numéricos es programación: implementa cada método (bisección, Newton, trapecio, Simpson, Euler) en Python y compara con el valor exacto. Entender el error es lo que se pregunta.',
    topics: [
      'Números reales, sucesiones y límites',
      'Funciones de una variable: continuidad, límites, asíntotas',
      'Derivadas: reglas, regla de la cadena, aplicaciones (optimización, Taylor)',
      'Integral definida e indefinida: técnicas de integración, aplicaciones geométricas',
      'Series numéricas y de potencias; series de Taylor',
      'Métodos numéricos: aritmética de coma flotante y análisis del error',
      'Resolución numérica de ecuaciones: bisección, secante, Newton-Raphson',
      'Interpolación y aproximación (Lagrange, mínimos cuadrados)',
      'Integración numérica (trapecio, Simpson) y resolución numérica de EDO (Euler, Runge-Kutta)'
    ],
    resources: [
      { type: 'curso', lang: 'es', title: 'Khan Academy · Cálculo 1', url: 'https://es.khanacademy.org/math/calculus-1', note: 'Límites, derivadas e integrales con ejercicios corregidos en español. Continúa con «Cálculo 2» para series.' },
      { type: 'video', lang: 'en', title: '3Blue1Brown · Essence of Calculus', url: 'https://www.3blue1brown.com/topics/calculus', note: 'Por qué la derivada y la integral son lo que son. Doce vídeos que dan la intuición que los ejercicios no dan.' },
      { type: 'libro', lang: 'es', title: 'OpenStax · Cálculo, volumen 1', url: 'https://openstax.org/details/books/c%C3%A1lculo-volumen-1', note: 'Libro universitario gratuito en español con miles de ejercicios y soluciones de los impares.' },
      { type: 'teoria', lang: 'en', title: "Paul's Online Math Notes", url: 'https://tutorial.math.lamar.edu/', note: 'Apuntes y problemas resueltos paso a paso de Calculus I y II. La mejor chuleta de técnicas de integración.' },
      { type: 'libro', lang: 'en', title: 'Python Programming and Numerical Methods (Berkeley)', url: 'https://pythonnumericalmethods.berkeley.edu/notebooks/Index.html', note: 'Libro gratuito con código Python para cada método numérico del temario: raíces, interpolación, integración, EDO.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · 18.01 Single Variable Calculus', url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/', note: 'Curso completo con vídeos, problemas y exámenes resueltos.' },
      { type: 'libro', lang: 'es', title: 'Métodos numéricos para ingenieros (Chapra & Canale, McGraw-Hill)', note: 'El manual clásico de métodos numéricos; probablemente la bibliografía de la segunda mitad.' }
    ],
    lab: {
      intro: 'Python con NumPy, SciPy y Matplotlib es el laboratorio de métodos numéricos. Colab te lo da sin instalar nada.',
      tools: [
        { title: 'Google Colab', url: 'https://colab.research.google.com/', note: 'Cuadernos Python online con NumPy, SciPy y Matplotlib ya instalados.' },
        { title: 'Desmos · calculadora gráfica', url: 'https://www.desmos.com/calculator', note: 'Dibuja funciones, derivadas e integrales al instante. Para ver antes de calcular.' },
        { title: 'Symbolab', url: 'https://www.symbolab.com/', note: 'Resuelve derivadas e integrales paso a paso. Solo para comprobar.' },
        { title: 'SciPy · referencia', url: 'https://docs.scipy.org/doc/scipy/reference/', note: 'scipy.optimize (raíces), scipy.integrate (integrales y EDO), scipy.interpolate.' }
      ],
      steps: [
        'Implementa tú mismo bisección, Newton-Raphson, trapecio, Simpson y Euler en un cuaderno de Colab; luego compara con SciPy y con el valor exacto y grafica el error frente al número de pasos.',
        'Por cada tema de cálculo, haz 15 ejercicios a mano y comprueba solo los que dudes en Symbolab.',
        'Dibuja en Desmos las funciones de los problemas de optimización y de Taylor: ver el polinomio acercarse a la función lo explica todo.'
      ]
    }
  },

  estadistica: {
    ects: 6,
    summary:
      'Estadística descriptiva, probabilidad, variables aleatorias, inferencia (estimación y contraste de hipótesis) y regresión. Es la base de Inteligencia Artificial y Aprendizaje Automático.',
    approach:
      'Probabilidad se aprende con problemas (y dibujando el espacio muestral); inferencia se aprende entendiendo qué es un p-valor de verdad, no memorizando fórmulas. Usa R o Python con datos reales desde el primer tema: la asignatura cobra sentido cuando analizas algo que te importa.',
    topics: [
      'Estadística descriptiva: tablas, gráficos, medidas de centralización y dispersión',
      'Probabilidad: axiomas, probabilidad condicionada, independencia, teorema de Bayes',
      'Variables aleatorias discretas y continuas; esperanza y varianza',
      'Distribuciones: binomial, Poisson, uniforme, exponencial, normal',
      'Muestreo y teorema central del límite',
      'Estimación puntual e intervalos de confianza',
      'Contraste de hipótesis: medias, proporciones, chi-cuadrado',
      'Regresión lineal y correlación'
    ],
    resources: [
      { type: 'curso', lang: 'es', title: 'Khan Academy · Estadística y probabilidad', url: 'https://es.khanacademy.org/math/statistics-probability', note: 'Cubre el temario completo con ejercicios corregidos en español.' },
      { type: 'video', lang: 'en', title: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/@statquest', note: 'Explica p-valores, distribuciones y regresión con una claridad que no tiene ningún libro. Empieza por «Statistics Fundamentals».' },
      { type: 'herramienta', lang: 'en', title: 'Seeing Theory (Brown University)', url: 'https://seeing-theory.brown.edu/', note: 'Probabilidad e inferencia con visualizaciones interactivas. Juega con el teorema central del límite.' },
      { type: 'libro', lang: 'es', title: 'OpenStax · Introducción a la estadística', url: 'https://openstax.org/details/books/introducci%C3%B3n-estad%C3%ADstica', note: 'Libro universitario gratuito en español, con datos y ejercicios.' },
      { type: 'libro', lang: 'en', title: 'Think Stats (Allen Downey), 3ª ed.', url: 'https://allendowney.github.io/ThinkStats/', note: 'Estadística para programadores, con Python. Gratis. Ideal si prefieres código a fórmulas.' },
      { type: 'libro', lang: 'es', title: 'R para Ciencia de Datos (Wickham & Grolemund)', url: 'https://es.r4ds.hadley.nz/', note: 'Traducción al español del libro de referencia de R. Para la parte práctica de análisis de datos.' },
      { type: 'libro', lang: 'es', title: 'Probabilidad y estadística para ingeniería y ciencias (Walpole et al., Pearson)', note: 'Manual clásico con cientos de problemas resueltos. Probable bibliografía básica.' }
    ],
    lab: {
      intro: 'R o Python: elige uno y hazlo todo con él. Para esta asignatura R es más directo; Python te servirá luego en IA.',
      tools: [
        { title: 'R + RStudio Desktop', url: 'https://posit.co/download/rstudio-desktop/', note: 'El entorno estándar de estadística. Gratis. Instala primero R desde el mismo enlace.' },
        { title: 'Google Colab', url: 'https://colab.research.google.com/', note: 'Python con pandas, SciPy.stats y Matplotlib, sin instalar nada.' },
        { title: 'GeoGebra · Probabilidad', url: 'https://www.geogebra.org/probability', note: 'Calculadora gráfica de distribuciones: normal, binomial, t… Ves el área que calculas.' },
        { title: 'Kaggle · datasets', url: 'https://www.kaggle.com/datasets', note: 'Datos reales para practicar descriptiva, contrastes y regresión.' }
      ],
      steps: [
        'Instala R y RStudio; en la primera semana aprende a cargar un CSV, hacer un histograma y calcular media, mediana y desviación.',
        'Por cada distribución del temario, genera 10 000 muestras (rnorm, rbinom…) y compara el histograma con la curva teórica.',
        'Con un dataset de Kaggle que te interese, plantea una hipótesis, haz el contraste (t.test, chisq.test) y una regresión (lm). Explícalo en 10 líneas: eso es lo que se pide en las actividades.',
        'Haz flashcards con «cuándo se usa cada contraste» y las fórmulas de intervalos de confianza.'
      ]
    }
  },

  ipo: {
    ects: 6,
    summary:
      'Diseñar sistemas para personas: factores humanos, usabilidad, accesibilidad, diseño centrado en el usuario, prototipado y evaluación de interfaces.',
    approach:
      'Es la asignatura más «de proyecto» del primer año: la evaluación práctica suele consistir en analizar una interfaz, prototipar una mejora y evaluarla con usuarios. Aprende las 10 heurísticas de Nielsen de memoria y aplícalas a apps que usas a diario; con Figma o Penpot prototipas en una tarde.',
    topics: [
      'Introducción a la IPO: historia, paradigmas de interacción, disciplinas implicadas',
      'El factor humano: percepción, memoria, atención, modelos mentales, errores',
      'Dispositivos y estilos de interacción; interfaces gráficas, táctiles, de voz',
      'Diseño centrado en el usuario: proceso, personas, escenarios, tareas',
      'Principios y heurísticas de usabilidad; guías de estilo',
      'Prototipado: baja y alta fidelidad, wireframes, diseño de interacción',
      'Evaluación: heurística, pruebas con usuarios, métricas, tests A/B',
      'Accesibilidad (WCAG) y diseño inclusivo'
    ],
    resources: [
      { type: 'teoria', lang: 'en', title: 'Nielsen Norman Group · 10 Usability Heuristics', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/', note: 'El artículo original de las heurísticas que se usan en toda evaluación. Explora el resto de artículos de NN/g: son el canon de la disciplina.' },
      { type: 'teoria', lang: 'en', title: 'Laws of UX', url: 'https://lawsofux.com/', note: 'Las leyes psicológicas del diseño de interfaces (Fitts, Hick, Miller…) explicadas en una página cada una.' },
      { type: 'teoria', lang: 'en', title: 'Interaction Design Foundation · Literature', url: 'https://www.interaction-design.org/literature', note: 'Enciclopedia abierta de IPO/UX escrita por los autores de referencia.' },
      { type: 'teoria', lang: 'es', title: 'W3C WAI · Introducción a la accesibilidad web', url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/es', note: 'Punto de partida oficial para WCAG, en español.' },
      { type: 'teoria', lang: 'en', title: 'Material Design 3', url: 'https://m3.material.io/', note: 'Guía de estilo completa de Google: componentes, accesibilidad, patrones. Ejemplo perfecto de sistema de diseño.' },
      { type: 'teoria', lang: 'en', title: 'Apple · Human Interface Guidelines', url: 'https://developer.apple.com/design/human-interface-guidelines/', note: 'La otra gran guía de estilo. Comparar ambas es un ejercicio clásico.' },
      { type: 'libro', lang: 'es', title: 'La psicología de los objetos cotidianos (Don Norman)', note: 'El libro fundacional del diseño centrado en el usuario. Se lee en un fin de semana y cambia cómo ves las puertas.' },
      { type: 'libro', lang: 'es', title: 'No me hagas pensar (Steve Krug)', note: 'Usabilidad web práctica en 200 páginas. Incluye cómo hacer un test de usuarios barato.' }
    ],
    lab: {
      intro: 'Herramientas de prototipado y de evaluación, todas gratuitas.',
      tools: [
        { title: 'Figma', url: 'https://www.figma.com/', note: 'El estándar de la industria para wireframes y prototipos interactivos. Plan gratuito suficiente; con correo de universidad, plan educativo.' },
        { title: 'Penpot', url: 'https://penpot.app/', note: 'Alternativa libre y de código abierto a Figma, con interfaz en español.' },
        { title: 'WebAIM · Contrast Checker', url: 'https://webaim.org/resources/contrastchecker/', note: 'Comprueba el contraste de color según WCAG.' },
        { title: 'WAVE · evaluador de accesibilidad', url: 'https://wave.webaim.org/', note: 'Analiza cualquier web y señala problemas de accesibilidad.' },
        { title: 'Maze', url: 'https://maze.co/', note: 'Pruebas de usabilidad remotas sobre prototipos de Figma; plan gratuito.' }
      ],
      steps: [
        'Elige una app que uses a diario y haz una evaluación heurística con las 10 de Nielsen: tabla de problemas, gravedad y propuesta de mejora.',
        'Prototipa esa mejora en Figma o Penpot: primero wireframe en papel, luego baja fidelidad, luego prototipo navegable.',
        'Pásaselo a tres personas con una tarea concreta, cronometra y anota dónde se atascan. Escribe un informe de una página.',
        'Pasa WAVE y el contrast checker por la web de UNIPRO y anota lo que fallaría en WCAG AA.'
      ]
    }
  },

  // ---------------------------------------------------------------- MAY
  algoritmia: {
    ects: 6,
    summary:
      'Analizar cuánto tarda y cuánta memoria consume un algoritmo (notación O), y los esquemas clásicos de diseño: divide y vencerás, voraces, programación dinámica, vuelta atrás.',
    approach:
      'Primero la notación asintótica hasta que puedas mirar un bucle y decir su coste sin pensar. Después, cada esquema de diseño con 3–4 problemas canónicos (mochila, cambio de monedas, N reinas, subsecuencia común). Los jueces online te dan corrección instantánea; úsalos.',
    topics: [
      'Eficiencia de algoritmos: notación O, Ω, Θ; análisis de casos mejor, peor y medio',
      'Análisis de algoritmos iterativos y recursivos; ecuaciones de recurrencia, teorema maestro',
      'Algoritmos de ordenación y búsqueda y su complejidad',
      'Divide y vencerás',
      'Algoritmos voraces (greedy)',
      'Programación dinámica',
      'Vuelta atrás (backtracking) y ramificación y poda',
      'Introducción a la complejidad computacional: clases P, NP, NP-completitud'
    ],
    resources: [
      { type: 'herramienta', lang: 'es', title: 'VisuAlgo', url: 'https://visualgo.net/es', note: 'Animaciones de ordenación, búsqueda, grafos y programación dinámica, en español. Míralo antes de leer cada tema.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · 6.006 Introduction to Algorithms', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', note: 'Vídeos, problemas y soluciones del curso de algoritmos del MIT.' },
      { type: 'libro', lang: 'en', title: 'Algorithms (Jeff Erickson)', url: 'https://jeffe.cs.illinois.edu/teaching/algorithms/', note: 'Libro gratuito de nivel universitario: recursión, DP, greedy, grafos. Con muchísimos ejercicios.' },
      { type: 'libro', lang: 'en', title: 'Algorithms, 4th ed. (Sedgewick & Wayne) · web del libro', url: 'https://algs4.cs.princeton.edu/home/', note: 'Código Java de todos los algoritmos, ejercicios y vídeos. Encaja con Estructura de Datos.' },
      { type: 'teoria', lang: 'en', title: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/', note: 'Tabla de complejidades de estructuras y algoritmos. Para tenerla en la pared.' },
      { type: 'libro', lang: 'es', title: 'Introducción a los algoritmos (Cormen, Leiserson, Rivest, Stein — «CLRS»)', note: 'La biblia de la asignatura. No hace falta leerlo entero: capítulos 2–4, 15, 16 y 34.' },
      { type: 'practica', lang: 'es', title: 'Acepta el Reto (UCM)', url: 'https://aceptaelreto.com/', note: 'Problemas en español clasificados por técnica (DP, greedy, backtracking). Corrección automática.' },
      { type: 'practica', lang: 'en', title: 'LeetCode', url: 'https://leetcode.com/', note: 'Problemas por tema y dificultad; las «Easy» y «Medium» de arrays, DP y greedy son el entrenamiento ideal.' }
    ],
    lab: {
      intro: 'Tu laboratorio es un lenguaje (Java o Python) y un juez online que te diga si tu solución es correcta y eficiente.',
      tools: [
        { title: 'Acepta el Reto', url: 'https://aceptaelreto.com/', note: 'Juez en español. Empieza por los problemas de la categoría «Algoritmia».' },
        { title: 'Python Tutor', url: 'https://pythontutor.com/', note: 'Visualiza la pila de llamadas de tus funciones recursivas.' },
        { title: 'Codeforces', url: 'https://codeforces.com/', note: 'Concursos de programación competitiva; los problemas Div. 2 A–C son alcanzables.' },
        { title: 'Google Colab', url: 'https://colab.research.google.com/', note: 'Para medir tiempos de ejecución empíricos (timeit) y graficar coste frente a tamaño de entrada.' }
      ],
      steps: [
        'Implementa las ordenaciones clásicas (burbuja, inserción, merge, quick) y mide el tiempo con entradas de 10³, 10⁴, 10⁵ elementos; grafica y compara con la O teórica.',
        'Por cada esquema (DyV, greedy, DP, backtracking) resuelve tres problemas canónicos en Acepta el Reto y anota la recurrencia o la estrategia usada.',
        'Haz flashcards con las complejidades de los algoritmos clásicos y las tres formas del teorema maestro.'
      ]
    }
  },

  'estructura-datos': {
    ects: 6,
    summary:
      'Tipos abstractos de datos y su implementación en Java: listas, pilas, colas, árboles, tablas hash y grafos, con sus operaciones y complejidad. Es el puente entre Fundamentos de Programación y todo lo que viene después.',
    approach:
      'Implementa cada estructura desde cero (sin usar java.util) y luego compárala con la de la biblioteca estándar. Escribe tests JUnit para cada operación: te obliga a pensar en los casos límite (vacío, un elemento, lleno) que es donde caen los errores del examen.',
    topics: [
      'Tipos abstractos de datos; recursividad; repaso de clases, genéricos e interfaces en Java',
      'Listas: contiguas y enlazadas (simple, doble, circular); iteradores',
      'Pilas y colas; colas de prioridad',
      'Árboles: binarios, de búsqueda (ABB), equilibrados (AVL), montículos (heap)',
      'Tablas hash: funciones de dispersión, tratamiento de colisiones',
      'Grafos: representación (matriz, listas de adyacencia), recorridos (BFS, DFS), caminos mínimos (Dijkstra), árbol de recubrimiento mínimo',
      'Análisis de complejidad de cada estructura y elección de la adecuada',
      'Las colecciones de Java (java.util): List, Set, Map, Deque'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'Algorithms, 4th ed. (Sedgewick & Wayne) · web del libro', url: 'https://algs4.cs.princeton.edu/home/', note: 'Todas las estructuras del temario implementadas en Java limpio, con explicaciones y ejercicios. Es el libro de la asignatura aunque no sea oficial.' },
      { type: 'curso', lang: 'en', title: 'Coursera · Algorithms, Part I (Princeton)', url: 'https://www.coursera.org/learn/algorithms-part1', note: 'El curso de los autores del libro anterior, en Java, gratis en modo auditar. Ejercicios de programación autocorregidos.' },
      { type: 'libro', lang: 'en', title: 'Open Data Structures (edición Java)', url: 'https://opendatastructures.org/', note: 'Libro libre con el código Java de cada estructura y análisis de complejidad.' },
      { type: 'herramienta', lang: 'es', title: 'VisuAlgo', url: 'https://visualgo.net/es', note: 'Animaciones de listas, árboles AVL, heaps, tablas hash y grafos. Mira cada operación antes de programarla.' },
      { type: 'video', lang: 'en', title: 'freeCodeCamp · Data Structures Easy to Advanced (William Fiset)', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', note: 'Ocho horas que cubren todo el temario, con código Java en GitHub.' },
      { type: 'teoria', lang: 'en', title: 'Oracle · Java Collections Framework', url: 'https://docs.oracle.com/javase/tutorial/collections/', note: 'Tutorial oficial de java.util: cuándo usar ArrayList, LinkedList, HashMap, TreeMap, PriorityQueue.' },
      { type: 'curso', lang: 'en', title: 'MOOC.fi · Java Programming II', url: 'https://java-programming.mooc.fi/', note: 'Continuación del curso de Helsinki: genéricos, interfaces, colecciones. Ejercicios corregidos.' },
      { type: 'libro', lang: 'es', title: 'Estructuras de datos en Java (Mark Allen Weiss, Pearson)', note: 'Manual clásico en español; probable bibliografía básica.' }
    ],
    lab: {
      intro: 'El mismo entorno Java de Fundamentos de Programación más JUnit para probar tus estructuras.',
      tools: [
        { title: 'IntelliJ IDEA Community', url: 'https://www.jetbrains.com/idea/download/', note: 'Crea el proyecto con Maven o Gradle para poder añadir JUnit con un clic.' },
        { title: 'JUnit 5 · guía de usuario', url: 'https://junit.org/junit5/docs/current/user-guide/', note: 'Pruebas unitarias en Java. Con un test por operación no te llevas sorpresas.' },
        { title: 'Python Tutor (Java)', url: 'https://pythontutor.com/java.html', note: 'Dibuja las referencias entre nodos de tu lista enlazada o tu árbol paso a paso.' },
        { title: 'LeetCode · Explore', url: 'https://leetcode.com/explore/', note: 'Series de problemas por estructura: Linked List, Binary Tree, Hash Table, Graph.' }
      ],
      steps: [
        'Crea un proyecto «estructuras-datos» con Maven y JUnit 5. Por cada estructura del temario: interfaz, implementación propia y tests.',
        'Implementa en este orden: pila y cola sobre array, lista enlazada, ABB, heap, tabla hash con encadenamiento, grafo con listas de adyacencia + BFS/DFS + Dijkstra.',
        'Para cada una, mide con System.nanoTime() el coste de insertar 10⁵ elementos y compáralo con la implementación de java.util.',
        'Sube el proyecto a GitHub: será tu mejor material de repaso para Programación Avanzada y Algoritmos Avanzados.'
      ]
    }
  }
}
