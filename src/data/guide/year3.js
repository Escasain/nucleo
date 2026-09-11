// Guía de estudio · Año 3 (curso 2028/29)

export const YEAR3 = {
  // ---------------------------------------------------------------- SEP
  'apps-red': {
    ects: 6,
    summary:
      'Construir aplicaciones distribuidas sobre la red: sockets, HTTP y APIs REST, servicios web, arquitecturas cliente-servidor y de microservicios, mensajería, seguridad (autenticación, TLS) y despliegue.',
    approach:
      'Es una asignatura de construir: al terminar debes tener una API con base de datos desplegada en internet y un cliente que la consuma. Empieza con sockets a pelo para entender qué hace HTTP por ti, y después usa un framework (Spring Boot si sigues en Java, Node/Express si prefieres JavaScript). Postman para probar cada endpoint.',
    topics: [
      'Repaso de TCP/IP y programación con sockets (TCP y UDP), protocolos de aplicación',
      'HTTP a fondo: métodos, códigos, cabeceras, cookies, caché; HTTP/2 y HTTPS',
      'Arquitecturas: cliente-servidor, multicapa, REST, microservicios',
      'Diseño e implementación de APIs REST; serialización (JSON), documentación (OpenAPI)',
      'Frameworks de servidor (Spring Boot / Node.js) y acceso a datos',
      'Clientes web: fundamentos de HTML/CSS/JavaScript y consumo de APIs (fetch)',
      'Comunicación en tiempo real y asíncrona: WebSockets, colas de mensajes, gRPC',
      'Seguridad (autenticación, JWT, OAuth, CORS, TLS), despliegue con contenedores y en la nube'
    ],
    resources: [
      { type: 'teoria', lang: 'es', title: 'MDN · Aprende desarrollo web', url: 'https://developer.mozilla.org/es/docs/Learn_web_development', note: 'La referencia de la web, en español: HTTP, HTML, CSS, JavaScript, APIs. Lee la sección de HTTP entera.' },
      { type: 'curso', lang: 'es', title: 'Full Stack Open (Universidad de Helsinki)', url: 'https://fullstackopen.com/es/', note: 'Curso gratuito y completo en español: Node/Express, REST, bases de datos, autenticación, despliegue, tests. El mejor del mundo en su categoría.' },
      { type: 'teoria', lang: 'en', title: 'Spring · Guides (Building a RESTful Web Service)', url: 'https://spring.io/guides', note: 'Si sigues en Java: guías de 15 minutos para REST, JPA, seguridad, WebSockets.' },
      { type: 'libro', lang: 'en', title: "Beej's Guide to Network Programming", url: 'https://beej.us/guide/bgnet/', note: 'Sockets desde cero en C. Para el primer tema.' },
      { type: 'teoria', lang: 'en', title: 'Oracle · Java sockets tutorial', url: 'https://docs.oracle.com/javase/tutorial/networking/sockets/', note: 'Sockets en Java: cliente y servidor de eco, multihilo.' },
      { type: 'teoria', lang: 'en', title: 'OpenAPI Specification', url: 'https://swagger.io/specification/', note: 'El estándar para describir APIs REST; Swagger UI genera la documentación interactiva.' },
      { type: 'teoria', lang: 'es', title: 'The Twelve-Factor App', url: 'https://12factor.net/es/', note: 'Doce principios para aplicaciones desplegables en la nube. Corto y esencial.' },
      { type: 'teoria', lang: 'en', title: 'gRPC · documentación', url: 'https://grpc.io/docs/', note: 'RPC moderno con Protocol Buffers, para el tema de comunicación entre servicios.' }
    ],
    lab: {
      intro: 'Un servidor, un cliente para probarlo, una base de datos y un sitio donde desplegarlo gratis.',
      tools: [
        { title: 'Node.js', url: 'https://nodejs.org/', note: 'Si eliges JavaScript en el servidor. Instala la versión LTS.' },
        { title: 'Spring Initializr', url: 'https://start.spring.io/', note: 'Genera un proyecto Spring Boot listo para arrancar en un minuto.' },
        { title: 'Postman', url: 'https://www.postman.com/', note: 'Cliente para probar APIs: colecciones, variables, tests. Gratis.' },
        { title: 'Docker', url: 'https://docs.docker.com/get-started/', note: 'Para empaquetar la API y la base de datos con Docker Compose.' },
        { title: 'Render / Railway', url: 'https://render.com/', note: 'Despliegue gratuito de APIs y bases de datos PostgreSQL desde GitHub.' }
      ],
      steps: [
        'Programa un servidor y cliente de chat con sockets TCP (Java o Python), multihilo. Luego captúralo con Wireshark.',
        'Escribe a mano un servidor HTTP mínimo que responda a GET y POST, sin frameworks: entenderás qué hace un framework por ti.',
        'Construye la API REST de NÚCLEO (asignaturas, sesiones, evaluaciones) con Spring Boot o Express + PostgreSQL, documentada con OpenAPI y probada con Postman.',
        'Añade autenticación con JWT, empaquétala con Docker Compose y despliégala en Render. Conecta esta app a esa API como cliente.'
      ]
    }
  },

  'ing-requisitos': {
    ects: 6,
    summary:
      'Descubrir, analizar, especificar, validar y gestionar los requisitos de un sistema: técnicas de elicitación, modelado, especificación (SRS, casos de uso, historias de usuario), priorización, trazabilidad y gestión del cambio.',
    approach:
      'La evaluación práctica es escribir buenos requisitos: verificables, no ambiguos, trazables. Practica con sistemas reales: entrevista a alguien sobre un problema suyo y produce una especificación. Aprende una plantilla estándar (Volere o IEEE 830/29148) y las historias de usuario con criterios de aceptación en Gherkin.',
    topics: [
      'Introducción: qué es un requisito, tipos (funcionales, no funcionales, de dominio), el proceso de IR',
      'Elicitación: entrevistas, observación, talleres, prototipado, análisis de documentos, interesados',
      'Análisis y negociación: conflictos, priorización (MoSCoW, Kano), viabilidad',
      'Modelado de requisitos: casos de uso, historias de usuario, modelos de dominio, escenarios',
      'Especificación: documento SRS (IEEE 29148), plantillas (Volere), calidad de los requisitos',
      'Requisitos no funcionales y de calidad (ISO 25010), requisitos de seguridad y usabilidad',
      'Validación y verificación: revisiones, prototipos, criterios de aceptación, BDD',
      'Gestión de requisitos: trazabilidad, cambios, herramientas'
    ],
    resources: [
      { type: 'teoria', lang: 'en', title: 'Volere · plantilla de especificación de requisitos', url: 'https://www.volere.org/templates/volere-requirements-specification-template/', note: 'La plantilla más usada en la práctica, con el «snow card» por requisito. Gratis.' },
      { type: 'teoria', lang: 'en', title: 'Mountain Goat Software · User Stories', url: 'https://www.mountaingoatsoftware.com/agile/user-stories', note: 'Historias de usuario, INVEST y criterios de aceptación explicados por Mike Cohn.' },
      { type: 'teoria', lang: 'en', title: 'Cucumber · Gherkin reference', url: 'https://cucumber.io/docs/gherkin/reference/', note: 'Sintaxis Given/When/Then para criterios de aceptación ejecutables (BDD).' },
      { type: 'teoria', lang: 'es', title: 'Atlassian · documentos de requisitos de producto', url: 'https://www.atlassian.com/es/agile/product-management/requirements', note: 'Cómo se escriben requisitos en equipos ágiles reales.' },
      { type: 'teoria', lang: 'en', title: 'ISO/IEC 25010 · modelo de calidad del producto software', url: 'https://iso25000.com/index.php/en/iso-25000-standards/iso-25010', note: 'Las características de calidad (rendimiento, usabilidad, seguridad…) para los requisitos no funcionales.' },
      { type: 'libro', lang: 'en', title: 'Software Requirements, 3rd ed. (Karl Wiegers & Joy Beatty)', note: 'El manual de referencia de la disciplina, muy práctico. Probable bibliografía.' },
      { type: 'libro', lang: 'en', title: 'Mastering the Requirements Process (Robertson & Robertson)', note: 'El libro de los autores de Volere.' },
      { type: 'libro', lang: 'es', title: 'Ingeniería del software (Sommerville) · capítulo de requisitos', note: 'El capítulo 4 de Sommerville es un resumen excelente de toda la asignatura.' }
    ],
    lab: {
      intro: 'Herramientas para modelar, prototipar y gestionar requisitos con trazabilidad.',
      tools: [
        { title: 'PlantUML', url: 'https://plantuml.com/es/use-case-diagram', note: 'Diagramas de casos de uso y de dominio en texto.' },
        { title: 'Figma / Penpot', url: 'https://penpot.app/', note: 'Prototipos para validar requisitos con usuarios antes de escribirlos.' },
        { title: 'Jira (plan gratuito)', url: 'https://www.atlassian.com/software/jira', note: 'Historias de usuario, épicas, criterios de aceptación y trazabilidad.' },
        { title: 'Cucumber', url: 'https://cucumber.io/', note: 'Convierte criterios Gherkin en pruebas automáticas (Java: cucumber-jvm).' }
      ],
      steps: [
        'Entrevista a dos personas sobre un problema real (una pequeña tienda, una asociación) y escribe la lista de interesados y necesidades.',
        'Produce una especificación completa con la plantilla Volere: 30–40 requisitos funcionales y 10 no funcionales, cada uno con criterio de aceptación medible.',
        'Convierte los 10 requisitos principales en historias de usuario con escenarios Gherkin; carga todo en Jira con trazabilidad épica → historia.',
        'Pásale la especificación a un compañero para una revisión formal con una lista de comprobación (ambigüedad, completitud, verificabilidad) y corrige.'
      ]
    }
  },

  seguridad: {
    ects: 6,
    summary:
      'Seguridad de la información: amenazas y vulnerabilidades, criptografía (simétrica, asimétrica, hash, firmas, PKI), autenticación y control de acceso, seguridad en redes, sistemas y aplicaciones web (OWASP), gestión de la seguridad (ISO 27001, ENS) y respuesta a incidentes.',
    approach:
      'Mitad teoría (criptografía y gestión) y mitad práctica ofensiva/defensiva. Para la práctica, las plataformas de retos (TryHackMe, PortSwigger, OverTheWire) enseñan más en una tarde que un capítulo entero. La criptografía se entiende rompiéndola: CryptoHack está pensado para eso. Ojo con los conceptos de gestión (ISO 27001, análisis de riesgos): parecen aburridos y caen en el examen.',
    topics: [
      'Fundamentos: confidencialidad, integridad, disponibilidad; amenazas, vulnerabilidades, riesgo; atacantes y vectores',
      'Criptografía simétrica y asimétrica, funciones hash, firmas digitales, certificados y PKI, TLS',
      'Autenticación, autorización y control de acceso; gestión de identidades',
      'Seguridad en redes: cortafuegos, IDS/IPS, VPN, segmentación, ataques de red',
      'Seguridad en sistemas operativos y hardening; malware',
      'Seguridad en aplicaciones web: OWASP Top 10 (inyección, XSS, autenticación rota…), desarrollo seguro',
      'Gestión de la seguridad: análisis de riesgos, ISO 27001, ENS, políticas, continuidad de negocio',
      'Auditoría, pentesting, respuesta a incidentes e informática forense; aspectos legales'
    ],
    resources: [
      { type: 'teoria', lang: 'es', title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', note: 'Los diez riesgos principales en aplicaciones web, con ejemplos y contramedidas. Léelo entero.' },
      { type: 'curso', lang: 'en', title: 'PortSwigger · Web Security Academy', url: 'https://portswigger.net/web-security', note: 'Cursos y laboratorios gratuitos de seguridad web de los creadores de Burp Suite. Cada vulnerabilidad de OWASP con laboratorios vulnerables reales.' },
      { type: 'practica', lang: 'en', title: 'CryptoHack', url: 'https://cryptohack.org/', note: 'Aprende criptografía resolviendo retos con Python: desde XOR hasta RSA y curvas elípticas.' },
      { type: 'libro', lang: 'en', title: 'Crypto 101 (Laurens Van Houtven)', url: 'https://www.crypto101.io/', note: 'Libro gratuito de criptografía práctica para programadores.' },
      { type: 'libro', lang: 'en', title: 'Security Engineering, 3rd ed. (Ross Anderson) · gratis', url: 'https://www.cl.cam.ac.uk/~rja14/book.html', note: 'El manual más completo de ingeniería de seguridad, con capítulos descargables gratis.' },
      { type: 'teoria', lang: 'es', title: 'INCIBE', url: 'https://www.incibe.es/', note: 'Instituto Nacional de Ciberseguridad: guías, avisos y formación gratuita en español.' },
      { type: 'teoria', lang: 'es', title: 'CCN-CERT · guías STIC y ENS', url: 'https://www.ccn-cert.cni.es/', note: 'El CERT gubernamental español: guías de configuración segura y el Esquema Nacional de Seguridad.' },
      { type: 'teoria', lang: 'en', title: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework', note: 'Marco de referencia de gestión de la seguridad (Identificar, Proteger, Detectar, Responder, Recuperar).' },
      { type: 'curso', lang: 'en', title: 'Coursera · Cryptography I (Stanford, Dan Boneh)', url: 'https://www.coursera.org/learn/crypto', note: 'El curso de referencia de criptografía, gratis en modo auditar. Exigente pero definitivo.' }
    ],
    lab: {
      intro: 'Plataformas de retos legales y un laboratorio propio con máquinas vulnerables a propósito. Nunca pruebes nada contra sistemas que no sean tuyos.',
      tools: [
        { title: 'TryHackMe', url: 'https://tryhackme.com/', note: 'Rutas guiadas de aprendizaje con máquinas en el navegador. Muchas salas gratuitas; empieza por «Pre Security» y «Jr Penetration Tester».' },
        { title: 'OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/', note: 'Tienda web vulnerable a propósito, con 100+ retos. Corre en Docker en un minuto.' },
        { title: 'Kali Linux', url: 'https://www.kali.org/', note: 'Distribución con todas las herramientas de auditoría. Úsala en máquina virtual.' },
        { title: 'Burp Suite Community', url: 'https://portswigger.net/burp/communitydownload', note: 'Proxy de interceptación para analizar y manipular tráfico web.' },
        { title: 'Nmap', url: 'https://nmap.org/', note: 'Escáner de puertos y servicios. Practica solo contra tus máquinas virtuales.' },
        { title: 'picoCTF', url: 'https://picoctf.org/', note: 'Retos CTF permanentes para principiantes, de la CMU.' }
      ],
      steps: [
        'Monta Kali en VirtualBox y Juice Shop en Docker en una red interna; resuelve los retos de una y dos estrellas con Burp.',
        'Completa las rutas «Pre Security» y «Web Fundamentals» de TryHackMe y los 20 primeros retos de CryptoHack.',
        'Implementa en Python: cifrado César y Vigenère y cómo romperlos; usa la librería cryptography para AES, RSA, hashes y firma; genera un certificado autofirmado con OpenSSL y sírvelo con TLS.',
        'Haz un análisis de riesgos (activos, amenazas, impacto, probabilidad, salvaguardas) de NÚCLEO siguiendo la metodología MAGERIT del CCN.'
      ]
    }
  },

  // ---------------------------------------------------------------- NOV
  'bbdd-avanzadas': {
    ects: 6,
    summary:
      'Más allá del SQL básico: optimización de consultas e índices, transacciones y concurrencia a fondo, bases de datos distribuidas, NoSQL (documental, clave-valor, grafos, columnar), almacenes de datos y big data, y administración.',
    approach:
      'Requiere aprobada Bases de Datos. La clave es entender qué hace el motor por dentro: EXPLAIN ANALYZE en PostgreSQL te enseña los planes de ejecución y por qué un índice cambia todo. Después prueba cada familia NoSQL con un caso que le pegue (MongoDB para documentos, Redis para caché, Neo4j para grafos) y compara con la solución relacional.',
    topics: [
      'Arquitectura interna de un SGBD: almacenamiento, buffer, índices (B+, hash), procesamiento de consultas',
      'Optimización de consultas: planes de ejecución, estadísticas, índices, reescritura de consultas',
      'Transacciones a fondo: ACID, aislamiento, control de concurrencia (bloqueos, MVCC), recuperación',
      'Bases de datos distribuidas: fragmentación, replicación, consistencia, teorema CAP',
      'NoSQL: modelos documental, clave-valor, columnar y de grafos; casos de uso',
      'Almacenes de datos y OLAP: modelo dimensional (estrella, copo de nieve), ETL',
      'Big data: Hadoop/Spark, procesamiento distribuido, bases de datos analíticas',
      'Administración: seguridad, copias de seguridad, monitorización, rendimiento; SQL avanzado (funciones ventana, CTE, procedimientos)'
    ],
    resources: [
      { type: 'teoria', lang: 'es', title: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/es', note: 'Libro web gratuito sobre índices y rendimiento SQL, en español. Explica lo que ningún curso explica.' },
      { type: 'curso', lang: 'en', title: 'CMU 15-445/645 · Database Systems', url: 'https://15445.courses.cs.cmu.edu/', note: 'El curso de referencia de internos de bases de datos (Andy Pavlo), con vídeos y proyectos.' },
      { type: 'teoria', lang: 'en', title: 'PostgreSQL · documentación (Performance Tips, Indexes, MVCC)', url: 'https://www.postgresql.org/docs/current/', note: 'Los capítulos «Performance Tips», «Indexes» y «Concurrency Control» son el temario de la primera mitad.' },
      { type: 'libro', lang: 'en', title: 'Designing Data-Intensive Applications (Martin Kleppmann)', note: 'El libro sobre sistemas de datos modernos: replicación, particionado, consistencia, procesamiento. Imprescindible para la segunda mitad.' },
      { type: 'curso', lang: 'en', title: 'MongoDB University', url: 'https://learn.mongodb.com/', note: 'Cursos oficiales gratuitos de la base de datos documental más usada.' },
      { type: 'curso', lang: 'en', title: 'Neo4j GraphAcademy', url: 'https://graphacademy.neo4j.com/', note: 'Cursos oficiales gratuitos de bases de datos de grafos y Cypher.' },
      { type: 'teoria', lang: 'en', title: 'Redis · documentación', url: 'https://redis.io/docs/latest/', note: 'Estructuras de datos en memoria: clave-valor, listas, conjuntos, pub/sub.' },
      { type: 'teoria', lang: 'en', title: 'Apache Spark · guía de inicio', url: 'https://spark.apache.org/docs/latest/', note: 'Para el tema de big data; PySpark corre en Colab.' },
      { type: 'libro', lang: 'en', title: 'The Data Warehouse Toolkit (Ralph Kimball)', note: 'El manual del modelo dimensional para almacenes de datos.' }
    ],
    lab: {
      intro: 'PostgreSQL con datos de volumen, y una instancia de cada familia NoSQL en Docker.',
      tools: [
        { title: 'PostgreSQL + DBeaver', url: 'https://www.postgresql.org/download/', note: 'Con EXPLAIN ANALYZE y pg_stat_statements para los temas de rendimiento.' },
        { title: 'Docker Compose', url: 'https://docs.docker.com/compose/', note: 'Levanta PostgreSQL, MongoDB, Redis y Neo4j con un solo fichero.' },
        { title: 'MongoDB Compass', url: 'https://www.mongodb.com/products/tools/compass', note: 'Cliente gráfico de MongoDB.' },
        { title: 'DuckDB', url: 'https://duckdb.org/', note: 'Base de datos analítica embebida: OLAP sobre CSV/Parquet sin servidor. Perfecta para el tema de almacenes.' },
        { title: 'Google Colab (PySpark)', url: 'https://colab.research.google.com/', note: 'pip install pyspark y tienes Spark para practicar.' }
      ],
      steps: [
        'Genera una tabla de 5 millones de filas en PostgreSQL; ejecuta consultas con EXPLAIN ANALYZE antes y después de crear índices B+ y compuestos, y documenta las diferencias de plan y tiempo.',
        'Reproduce las anomalías de concurrencia (lectura sucia, no repetible, fantasma) con dos sesiones y cada nivel de aislamiento.',
        'Modela el mismo dominio (una red social pequeña) en PostgreSQL, MongoDB y Neo4j; escribe la consulta «amigos de amigos» en las tres y compara.',
        'Construye un pequeño almacén de datos en estrella con DuckDB a partir de CSV y calcula agregados OLAP con funciones ventana y CUBE/ROLLUP.'
      ]
    }
  },

  'algoritmos-avanzados': {
    ects: 6,
    summary:
      'Técnicas avanzadas de diseño de algoritmos: grafos a fondo (flujo máximo, emparejamientos, componentes), programación dinámica avanzada, algoritmos aleatorizados y de aproximación, geometría computacional, cadenas, y complejidad (NP-completitud, reducciones).',
    approach:
      'Continuación directa de Algoritmia y Complejidad con más grafos y más matemáticas. Programación competitiva es el gimnasio perfecto: CSES tiene un problema por cada técnica del temario, en orden. Para la NP-completitud, practica reducciones: es el tema que más se falla.',
    topics: [
      'Repaso de análisis y técnicas básicas; estructuras de datos avanzadas (union-find, segment tree, Fenwick)',
      'Grafos: componentes fuertemente conexas, orden topológico, caminos mínimos (Dijkstra, Bellman-Ford, Floyd), árboles de recubrimiento',
      'Flujo en redes: Ford-Fulkerson, Edmonds-Karp, corte mínimo, emparejamiento bipartito',
      'Programación dinámica avanzada: sobre subconjuntos, sobre árboles, optimizaciones',
      'Algoritmos sobre cadenas: KMP, Z, tries, arrays de sufijos, hashing',
      'Algoritmos aleatorizados y probabilísticos; algoritmos de aproximación y heurísticas',
      'Geometría computacional: envolvente convexa, barrido, intersecciones',
      'Complejidad computacional: NP, NP-completitud, reducciones, problemas intratables y cómo abordarlos'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'Competitive Programmer’s Handbook (Antti Laaksonen)', url: 'https://cses.fi/book/book.pdf', note: 'Libro gratuito que cubre todo el temario de forma compacta, con código C++.' },
      { type: 'practica', lang: 'en', title: 'CSES Problem Set', url: 'https://cses.fi/problemset/', note: 'Problemas ordenados por técnica (grafos, DP, cadenas, geometría) con juez automático. Hazlos en orden.' },
      { type: 'teoria', lang: 'en', title: 'CP-Algorithms', url: 'https://cp-algorithms.com/', note: 'Enciclopedia de algoritmos con explicaciones e implementaciones. Traducción del clásico e-maxx.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · 6.046J Design and Analysis of Algorithms', url: 'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/', note: 'La continuación de 6.006: DP avanzada, flujo, aleatorizados, NP-completitud.' },
      { type: 'libro', lang: 'en', title: 'Algorithms (Dasgupta, Papadimitriou, Vazirani) · gratis', url: 'https://cseweb.ucsd.edu/~dasgupta/book/', note: 'Libro universitario claro y corto; el capítulo de NP-completitud es el mejor que hay.' },
      { type: 'libro', lang: 'en', title: 'Algorithms (Jeff Erickson)', url: 'https://jeffe.cs.illinois.edu/teaching/algorithms/', note: 'Capítulos de flujo, reducciones y NP-dureza con muchísimos ejercicios.' },
      { type: 'teoria', lang: 'en', title: 'USACO Guide', url: 'https://usaco.guide/', note: 'Ruta de aprendizaje de programación competitiva por niveles, con problemas seleccionados.' },
      { type: 'libro', lang: 'es', title: 'Introducción a los algoritmos (CLRS) · capítulos 23–26, 32, 34, 35', note: 'Grafos, flujo, cadenas, NP-completitud y aproximación.' }
    ],
    lab: {
      intro: 'Jueces online y un lenguaje rápido de escribir. Python vale; C++ o Java si te importa el tiempo límite.',
      tools: [
        { title: 'CSES', url: 'https://cses.fi/problemset/', note: 'El juez principal para esta asignatura.' },
        { title: 'Codeforces', url: 'https://codeforces.com/', note: 'Concursos regulares; los problemas Div. 2 C–D usan estas técnicas.' },
        { title: 'Kattis', url: 'https://open.kattis.com/', note: 'Miles de problemas de competiciones universitarias (SWERC, ICPC).' },
        { title: 'Acepta el Reto', url: 'https://aceptaelreto.com/', note: 'Problemas en español, incluidos los de la OIE y competiciones universitarias.' }
      ],
      steps: [
        'Resuelve las secciones «Graph Algorithms», «Dynamic Programming», «String Algorithms» y «Geometry» de CSES en ese orden.',
        'Implementa una biblioteca propia (en Git): union-find, segment tree, Dijkstra, Bellman-Ford, Edmonds-Karp, KMP, envolvente convexa. Con tests.',
        'Para cada problema NP-completo clásico (SAT, clique, cubrimiento de vértices, mochila, TSP) escribe la reducción desde otro y una heurística o aproximación en código.',
        'Participa en dos rondas de Codeforces Div. 2: el tiempo límite te enseña a analizar complejidad de verdad.'
      ]
    }
  },

  // ---------------------------------------------------------------- MAR
  'procesos-sw': {
    ects: 6,
    summary:
      'Cómo una organización produce software de forma repetible: modelos de proceso y de madurez (CMMI, ISO 12207/15504), gestión de la configuración, integración y entrega continuas (DevOps), calidad del proceso, métricas y mejora continua.',
    approach:
      'La teoría de modelos de madurez es densa: haz esquemas y flashcards de niveles y áreas de proceso. La parte viva es DevOps: monta un pipeline completo (build → tests → análisis estático → despliegue) para un proyecto tuyo; es la mejor actividad que puedes presentar y algo que te pedirán en cualquier empresa.',
    topics: [
      'Procesos software: definición, modelos de ciclo de vida, estándares (ISO/IEC 12207), SWEBOK',
      'Modelos de madurez y mejora de procesos: CMMI, ISO/IEC 15504 (SPICE), Six Sigma',
      'Procesos ágiles y escalados: Scrum, Kanban, Lean, SAFe',
      'Gestión de la configuración del software: control de versiones, ramas, versiones, releases',
      'Integración continua, entrega continua y despliegue continuo; DevOps y cultura',
      'Calidad del proceso y del producto: revisiones, inspecciones, análisis estático, pruebas automatizadas',
      'Métricas de proceso y de producto (DORA, cobertura, deuda técnica); estimación',
      'Mantenimiento, evolución, operación (SRE) y mejora continua'
    ],
    resources: [
      { type: 'teoria', lang: 'en', title: 'DORA · DevOps Research and Assessment', url: 'https://dora.dev/', note: 'Las métricas y prácticas que distinguen a los equipos de alto rendimiento, con base empírica.' },
      { type: 'teoria', lang: 'es', title: 'GitHub Actions · documentación', url: 'https://docs.github.com/es/actions', note: 'Integración y despliegue continuos en el mismo sitio que tu código, en español.' },
      { type: 'libro', lang: 'en', title: 'Site Reliability Engineering (Google) · gratis', url: 'https://sre.google/sre-book/table-of-contents/', note: 'El libro de Google sobre operar sistemas en producción. Los capítulos de SLO y postmortems son oro.' },
      { type: 'teoria', lang: 'en', title: 'Martin Fowler · Practical Test Pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html', note: 'Qué pruebas automatizar y en qué proporción.' },
      { type: 'teoria', lang: 'en', title: 'CMMI Institute', url: 'https://cmmiinstitute.com/', note: 'El modelo de madurez de referencia; conoce sus niveles y áreas.' },
      { type: 'teoria', lang: 'en', title: 'SWEBOK · Guide to the Software Engineering Body of Knowledge', url: 'https://www.computer.org/education/bodies-of-knowledge/software-engineering', note: 'El cuerpo de conocimiento oficial de la IEEE, gratis. Capítulos de proceso, calidad y gestión de la configuración.' },
      { type: 'teoria', lang: 'es', title: 'The Twelve-Factor App', url: 'https://12factor.net/es/', note: 'Principios de aplicaciones desplegables y operables.' },
      { type: 'libro', lang: 'en', title: 'The DevOps Handbook (Kim, Humble, Debois, Willis)', note: 'La referencia práctica de DevOps.' },
      { type: 'libro', lang: 'en', title: 'Continuous Delivery (Humble & Farley)', note: 'El libro que definió la entrega continua.' }
    ],
    lab: {
      intro: 'Un pipeline real de integración y entrega continuas sobre un proyecto tuyo.',
      tools: [
        { title: 'GitHub Actions', url: 'https://github.com/features/actions', note: 'CI/CD gratuito para repositorios públicos. Ya lo usa NÚCLEO para desplegarse.' },
        { title: 'SonarQube Community / SonarCloud', url: 'https://www.sonarsource.com/products/sonarqube/', note: 'Análisis estático: bugs, vulnerabilidades, deuda técnica, cobertura.' },
        { title: 'Docker', url: 'https://docs.docker.com/get-started/', note: 'Artefactos reproducibles para desplegar.' },
        { title: 'Jenkins', url: 'https://www.jenkins.io/', note: 'El servidor de CI clásico, por si tu campus lo usa. Corre en Docker.' },
        { title: 'Semantic Versioning / Conventional Commits', url: 'https://www.conventionalcommits.org/es/', note: 'Convenciones de versiones y mensajes de commit para automatizar releases.' }
      ],
      steps: [
        'Coge tu proyecto de Programación Avanzada y monta un pipeline en GitHub Actions: compilación, tests con cobertura, análisis con SonarCloud, construcción de imagen Docker y despliegue automático a un entorno de pruebas.',
        'Define una estrategia de ramas (trunk-based o GitFlow), versionado semántico y releases automáticas con changelog.',
        'Mide tus cuatro métricas DORA durante un mes (frecuencia de despliegue, lead time, tasa de fallos, tiempo de recuperación).',
        'Evalúa tu propio proceso contra las áreas de CMMI nivel 2 y escribe un plan de mejora de una página.'
      ]
    }
  },

  optativa1: {
    ects: 6,
    summary:
      'Optativa I · Informática Gráfica y Visualización: cómo se dibuja en un ordenador: geometría y transformaciones, la tubería gráfica (rasterización, shaders), iluminación y texturas, modelado 3D, trazado de rayos, y visualización de datos.',
    approach:
      'Dos vías que se complementan: entender la tubería programando (WebGL/OpenGL con shaders) y ver los resultados en una herramienta de creación (Blender). El álgebra lineal de primero vuelve con fuerza: matrices de transformación y proyección. «Ray Tracing in One Weekend» es la mejor práctica posible. UNIPRO ofrece también como optativa «Calidad y Auditoría de Sistemas de Información» por si te interesa más esa vía.',
    topics: [
      'Introducción: aplicaciones, hardware gráfico (GPU), sistemas de coordenadas, color',
      'Geometría: transformaciones 2D/3D (matrices homogéneas), proyecciones, cámaras',
      'La tubería gráfica: vértices, rasterización, fragmentos, shaders (GLSL), buffers',
      'Iluminación y sombreado: modelos de Phong y PBR, texturas, mapeado de normales, sombras',
      'Modelado: mallas, curvas y superficies (Bézier, splines), subdivisión',
      'Síntesis realista: trazado de rayos, iluminación global',
      'Animación e interacción; gráficos en tiempo real y motores',
      'Visualización de datos e información: principios perceptivos, tipos de gráficos, herramientas'
    ],
    resources: [
      { type: 'curso', lang: 'en', title: 'LearnOpenGL', url: 'https://learnopengl.com/', note: 'El tutorial de referencia de OpenGL moderno: tubería, shaders, iluminación, PBR. Con código completo.' },
      { type: 'curso', lang: 'en', title: 'WebGL Fundamentals', url: 'https://webglfundamentals.org/', note: 'Lo mismo en el navegador, sin instalar nada. Excelente explicación de matrices y proyecciones.' },
      { type: 'libro', lang: 'en', title: 'Ray Tracing in One Weekend', url: 'https://raytracing.github.io/', note: 'Escribe un trazador de rayos desde cero en un fin de semana. La mejor práctica de la asignatura.' },
      { type: 'libro', lang: 'es', title: 'The Book of Shaders', url: 'https://thebookofshaders.com/?lan=es', note: 'Shaders de fragmentos desde cero, con editor en vivo, en español.' },
      { type: 'teoria', lang: 'en', title: 'Scratchapixel', url: 'https://www.scratchapixel.com/', note: 'Los fundamentos matemáticos de los gráficos explicados desde cero: rasterización, ray tracing, cámaras.' },
      { type: 'libro', lang: 'en', title: 'Fundamentals of Computer Graphics (Marschner & Shirley)', note: 'El manual universitario de referencia. Probable bibliografía.' },
      { type: 'teoria', lang: 'en', title: 'three.js · documentación y ejemplos', url: 'https://threejs.org/', note: 'La biblioteca 3D para web más usada. Sus ejemplos cubren todo el temario.' },
      { type: 'teoria', lang: 'en', title: 'D3.js', url: 'https://d3js.org/', note: 'Para el tema de visualización de datos: la biblioteca de referencia.' },
      { type: 'libro', lang: 'es', title: 'Storytelling con datos (Cole Nussbaumer Knaflic)', note: 'Cómo hacer gráficos que comuniquen. Para la parte de visualización de información.' }
    ],
    lab: {
      intro: 'Un navegador con WebGL y una herramienta de modelado 3D. Todo gratis.',
      tools: [
        { title: 'Shadertoy', url: 'https://www.shadertoy.com/', note: 'Editor de shaders en vivo con miles de ejemplos para diseccionar.' },
        { title: 'p5.js (editor web)', url: 'https://editor.p5js.org/', note: 'Gráficos 2D/3D con JavaScript en el navegador; ideal para transformaciones y animación.' },
        { title: 'Blender', url: 'https://www.blender.org/', note: 'Modelado, materiales, iluminación y render (Cycles es un trazador de rutas). Libre.' },
        { title: 'Godot Engine', url: 'https://godotengine.org/', note: 'Motor de juegos libre para el tema de gráficos en tiempo real.' },
        { title: 'Datawrapper', url: 'https://www.datawrapper.de/', note: 'Gráficos de datos rápidos y correctos, para la parte de visualización.' }
      ],
      steps: [
        'Con WebGL Fundamentals: dibuja un triángulo, luego un cubo con matrices de modelo/vista/proyección escritas por ti, luego ilumínalo con Phong en el shader.',
        'Haz «Ray Tracing in One Weekend» completo (C++ o Python) y renderiza la escena final.',
        'En Blender: modela un objeto sencillo, aplica materiales y texturas, ilumina y renderiza con Cycles; compara con Eevee (rasterización).',
        'Visualiza un dataset real con D3 o Datawrapper aplicando los principios perceptivos del temario; critica tres gráficos malos de prensa.'
      ]
    }
  },

  optativa2: {
    ects: 6,
    summary:
      'Optativa II · Aprendizaje Automático y Minería de Datos: preparación de datos, aprendizaje supervisado (regresión, árboles, SVM, redes neuronales), no supervisado (clustering, reducción de dimensionalidad), evaluación de modelos, minería de datos y una introducción al aprendizaje profundo.',
    approach:
      'Todo pasa por Python (pandas + scikit-learn). Empieza con el curso de Andrew Ng para la intuición y en paralelo un proyecto propio en Kaggle: limpiar datos, entrenar varios modelos, evaluar bien (validación cruzada, no solo accuracy) y explicar resultados. La estadística de primero vuelve entera. UNIPRO ofrece también como optativa «Calidad y Auditoría de Sistemas de Información».',
    topics: [
      'Introducción: minería de datos y KDD, tipos de aprendizaje, metodología (CRISP-DM)',
      'Preparación de datos: limpieza, valores perdidos, codificación, escalado, selección de características',
      'Regresión lineal y logística; regularización',
      'Árboles de decisión, bosques aleatorios, gradient boosting; k-NN, SVM, Naive Bayes',
      'Evaluación de modelos: partición, validación cruzada, métricas, sobreajuste, sesgo-varianza',
      'Aprendizaje no supervisado: clustering (k-means, jerárquico, DBSCAN), reducción de dimensionalidad (PCA), reglas de asociación',
      'Redes neuronales y aprendizaje profundo: perceptrón multicapa, retropropagación, CNN (introducción)',
      'Ética, interpretabilidad y despliegue de modelos'
    ],
    resources: [
      { type: 'curso', lang: 'en', title: 'Coursera · Machine Learning Specialization (Andrew Ng)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', note: 'El curso con el que ha aprendido medio mundo, actualizado a Python. Gratis en modo auditar. Subtítulos en español.' },
      { type: 'curso', lang: 'es', title: 'Google · Curso intensivo de aprendizaje automático', url: 'https://developers.google.com/machine-learning/crash-course?hl=es-419', note: 'Rápido y práctico, en español.' },
      { type: 'curso', lang: 'en', title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', note: 'Micro-cursos gratuitos con cuadernos: Pandas, Intro y Intermediate ML, Feature Engineering, Deep Learning.' },
      { type: 'libro', lang: 'en', title: 'An Introduction to Statistical Learning (ISLR/ISLP) · gratis', url: 'https://www.statlearning.com/', note: 'El manual universitario de referencia, gratis en PDF, con edición en Python. Probable bibliografía.' },
      { type: 'libro', lang: 'en', title: 'Python Data Science Handbook (Jake VanderPlas) · gratis', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', note: 'NumPy, pandas, Matplotlib y scikit-learn explicados con cuadernos ejecutables.' },
      { type: 'teoria', lang: 'en', title: 'scikit-learn · guía de usuario', url: 'https://scikit-learn.org/stable/user_guide.html', note: 'La documentación de scikit-learn es un libro de texto de ML en sí misma.' },
      { type: 'video', lang: 'en', title: 'StatQuest · Machine Learning', url: 'https://www.youtube.com/@statquest', note: 'Cada algoritmo explicado con claridad y humor. Empieza por la lista «Machine Learning».' },
      { type: 'video', lang: 'en', title: '3Blue1Brown · Neural Networks', url: 'https://www.3blue1brown.com/topics/neural-networks', note: 'La intuición de las redes neuronales y la retropropagación en cuatro vídeos.' },
      { type: 'libro', lang: 'en', title: 'Mining of Massive Datasets (Leskovec, Rajaraman, Ullman) · gratis', url: 'https://www.mmds.org/', note: 'Para la parte de minería de datos a gran escala: reglas de asociación, clustering, similitud.' },
      { type: 'libro', lang: 'es', title: 'Aprende Machine Learning con Scikit-Learn, Keras y TensorFlow (Aurélien Géron, O’Reilly)', note: 'El libro práctico más recomendado; hay edición en español.' }
    ],
    lab: {
      intro: 'Python científico en el navegador y las herramientas clásicas de minería de datos.',
      tools: [
        { title: 'Google Colab', url: 'https://colab.research.google.com/', note: 'pandas, scikit-learn, TensorFlow/PyTorch y GPU gratis.' },
        { title: 'Kaggle', url: 'https://www.kaggle.com/', note: 'Datasets, competiciones para principiantes (Titanic, House Prices) y cuadernos de otros para aprender.' },
        { title: 'UCI Machine Learning Repository', url: 'https://archive.ics.uci.edu/', note: 'Los datasets clásicos de la asignatura (Iris, Wine, Adult…).' },
        { title: 'Orange Data Mining', url: 'https://orangedatamining.com/', note: 'Minería de datos visual sin código, muy usada en docencia. Bien para entender flujos KDD.' },
        { title: 'Weka', url: 'https://ml.cms.waikato.ac.nz/weka/', note: 'La herramienta clásica de minería de datos en Java; probable en tu campus.' }
      ],
      steps: [
        'Haz los micro-cursos de Kaggle «Pandas», «Intro to Machine Learning» e «Intermediate Machine Learning» y presenta una solución al Titanic.',
        'Con un dataset de UCI: limpieza, división train/test, cinco modelos con validación cruzada, matriz de confusión, curvas ROC, y un informe de una página con el modelo elegido y por qué.',
        'Implementa regresión lineal y logística con descenso de gradiente en NumPy puro, sin scikit-learn, y compara con la librería.',
        'Aplica k-means y PCA a un dataset, visualiza los clusters y extrae reglas de asociación con mlxtend.'
      ]
    }
  },

  tfb: {
    ects: 12,
    summary:
      'Trabajo de Fin de Bachelor: un proyecto de ingeniería completo, desde la propuesta hasta la memoria y la defensa, que integra lo aprendido en el grado. Semestral (12 ECTS): el doble de carga que una asignatura normal.',
    approach:
      'Empieza a pensar el tema en segundo. Elige algo acotado que puedas terminar, con un tutor que responda rápido. La memoria se escribe desde el primer día (no al final): objetivos, estado del arte y metodología primero. Gestiónalo como un proyecto de verdad: Gantt, Git, hitos quincenales con el tutor. El código es la mitad; la otra mitad es explicar por qué.',
    topics: [
      'Elección del tema y propuesta: problema, objetivos, alcance, viabilidad',
      'Búsqueda bibliográfica y estado del arte; gestión de referencias y citación (APA/IEEE)',
      'Metodología: planificación, gestión de riesgos, metodología de desarrollo, herramientas',
      'Análisis y diseño: requisitos, arquitectura, modelos',
      'Implementación, pruebas y validación',
      'Redacción de la memoria: estructura, estilo técnico, figuras, tablas, anexos',
      'Aspectos legales y éticos: licencias, protección de datos, plagio',
      'Presentación y defensa oral'
    ],
    resources: [
      { type: 'herramienta', lang: 'es', title: 'Google Scholar', url: 'https://scholar.google.com/', note: 'Para el estado del arte. Configura las alertas del tema y usa «Citado por».' },
      { type: 'herramienta', lang: 'es', title: 'Dialnet', url: 'https://dialnet.unirioja.es/', note: 'Producción académica en español: artículos, tesis y TFG anteriores como referencia.' },
      { type: 'herramienta', lang: 'en', title: 'Semantic Scholar', url: 'https://www.semanticscholar.org/', note: 'Buscador académico con resúmenes e influencia de citas.' },
      { type: 'herramienta', lang: 'en', title: 'Connected Papers', url: 'https://www.connectedpapers.com/', note: 'Grafo visual de artículos relacionados a partir de uno: encuentra el estado del arte en una hora.' },
      { type: 'herramienta', lang: 'en', title: 'arXiv', url: 'https://arxiv.org/', note: 'Preprints gratuitos de informática, para lo más reciente.' },
      { type: 'teoria', lang: 'es', title: 'Normas APA · guía en español', url: 'https://normas-apa.org/', note: 'Cómo citar y referenciar. Confirma con tu tutor si UNIPRO pide APA o IEEE.' },
      { type: 'teoria', lang: 'en', title: 'IEEE · Reference Guide', url: 'https://ieeeauthorcenter.ieee.org/wp-content/uploads/IEEE-Reference-Guide.pdf', note: 'Estilo de citación IEEE, habitual en ingeniería.' },
      { type: 'libro', lang: 'en', title: 'The Craft of Research (Booth, Colomb, Williams)', note: 'Cómo plantear una pregunta, argumentar y escribir un trabajo académico.' },
      { type: 'teoria', lang: 'en', title: 'Make a README', url: 'https://www.makeareadme.com/', note: 'Tu repositorio del TFB debe tener un README que permita reproducirlo.' }
    ],
    lab: {
      intro: 'Herramientas de escritura académica, referencias y gestión del proyecto.',
      tools: [
        { title: 'Overleaf', url: 'https://www.overleaf.com/', note: 'LaTeX online colaborativo; hay plantillas de TFG. Cuida figuras, tablas y bibliografía automáticamente.' },
        { title: 'Zotero', url: 'https://www.zotero.org/', note: 'Gestor de referencias libre: guarda artículos desde el navegador y genera la bibliografía en APA/IEEE.' },
        { title: 'Git + GitHub', url: 'https://github.com/', note: 'Un repositorio para el código y otro para la memoria; commits desde el día 1.' },
        { title: 'ProjectLibre / Trello', url: 'https://trello.com/', note: 'Gantt para la planificación de la memoria y tablero para el día a día.' },
        { title: 'draw.io / PlantUML', url: 'https://app.diagrams.net/', note: 'Diagramas de arquitectura y UML para la memoria.' },
        { title: 'DeepL Write', url: 'https://www.deepl.com/write', note: 'Revisión de estilo si escribes en inglés o quieres pulir el español.' }
      ],
      steps: [
        'En segundo curso: anota en NÚCLEO tres ideas de tema y para cada una busca cinco referencias en Scholar; elige la que tenga más literatura y menos alcance.',
        'Semana 1 del TFB: propuesta de dos páginas (problema, objetivos SMART, alcance, plan con Gantt) validada con el tutor; repositorios creados; plantilla de memoria en Overleaf con el índice completo.',
        'Escribe el estado del arte y la metodología antes de programar; después, un capítulo por hito. Reunión quincenal con el tutor con entregable.',
        'Último mes: pruebas y validación con usuarios reales, revisión completa de la memoria, ensayo de la defensa cronometrado tres veces con público.'
      ]
    }
  }
}
