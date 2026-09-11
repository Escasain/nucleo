// Guía de estudio · Año 2 (curso 2027/28)

export const YEAR2 = {
  // ---------------------------------------------------------------- SEP
  deontologia: {
    ects: 3,
    summary:
      'Ética profesional del ingeniero informático y el marco legal que le afecta: protección de datos (RGPD), propiedad intelectual y licencias de software, delitos informáticos, responsabilidad y regulación de la IA. Se imparte en inglés.',
    approach:
      'Es de 3 ECTS: dos temas grandes (ética y RGPD) y varios pequeños. Lo que se evalúa suele ser aplicar los principios a casos: lee los códigos de ACM/IEEE y los principios del RGPD y practica argumentando dilemas reales (sesgos, vigilancia, brechas de datos). Aprende el vocabulario en inglés desde el principio.',
    topics: [
      'Ética y deontología profesional: códigos de conducta (ACM, IEEE), responsabilidad del ingeniero',
      'Dilemas éticos en tecnología: privacidad, sesgos algorítmicos, automatización, sostenibilidad',
      'Protección de datos: RGPD/GDPR, LOPDGDD, derechos, bases de legitimación, DPO, brechas',
      'Propiedad intelectual e industrial: derechos de autor, patentes, licencias de software libre y privativo',
      'Delitos informáticos y responsabilidad civil y penal; firma electrónica',
      'Regulación de la IA (AI Act) y de los servicios digitales (DSA/DMA)',
      'Seguridad de la información y esquemas normativos (ENS, ISO 27001) desde el punto de vista legal'
    ],
    resources: [
      { type: 'teoria', lang: 'en', title: 'ACM Code of Ethics and Professional Conduct', url: 'https://www.acm.org/code-of-ethics', note: 'El código de referencia de la profesión, con casos de estudio comentados. Léelo entero: son 20 minutos.' },
      { type: 'teoria', lang: 'en', title: 'IEEE Code of Ethics', url: 'https://www.ieee.org/about/corporate/governance/p7-8.html', note: 'El otro gran código profesional. Compáralo con el de ACM.' },
      { type: 'teoria', lang: 'en', title: 'GDPR · texto completo navegable', url: 'https://gdpr-info.eu/', note: 'El reglamento europeo artículo por artículo, con considerandos enlazados. Céntrate en artículos 5–6, 12–22, 33–35.' },
      { type: 'teoria', lang: 'es', title: 'AEPD · Agencia Española de Protección de Datos', url: 'https://www.aepd.es/', note: 'Guías prácticas en español (para responsables, para desarrolladores) y resoluciones reales de sanciones.' },
      { type: 'teoria', lang: 'es', title: 'LOPDGDD (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673', note: 'La ley española que desarrolla el RGPD, texto consolidado.' },
      { type: 'teoria', lang: 'en', title: 'EU Artificial Intelligence Act · explorador', url: 'https://artificialintelligenceact.eu/', note: 'El reglamento de IA con resúmenes por artículo y un comprobador de a qué categoría de riesgo pertenece un sistema.' },
      { type: 'teoria', lang: 'en', title: 'Choose a License', url: 'https://choosealicense.com/', note: 'Las licencias de software libre explicadas en una tabla: MIT, GPL, Apache… y qué permite cada una.' },
      { type: 'teoria', lang: 'es', title: 'Creative Commons · licencias', url: 'https://creativecommons.org/share-your-work/cclicenses/', note: 'Las seis licencias CC y qué significa cada combinación.' },
      { type: 'teoria', lang: 'en', title: 'Markkula Center · Ethics in Technology Practice', url: 'https://www.scu.edu/ethics-in-technology-practice/', note: 'Materiales de la Universidad de Santa Clara para analizar dilemas éticos en tecnología, con casos.' }
    ],
    lab: {
      intro: 'No hay software: el laboratorio es analizar casos reales con el marco legal y ético.',
      tools: [
        { title: 'AEPD · resoluciones y sanciones', url: 'https://www.aepd.es/informes-y-resoluciones', note: 'Casos reales resueltos: qué se hizo mal y qué artículo se infringió.' },
        { title: 'AI Act · Compliance Checker', url: 'https://artificialintelligenceact.eu/assessment/eu-ai-act-compliance-checker/', note: 'Cuestionario que clasifica un sistema de IA por nivel de riesgo.' },
        { title: 'GitHub · elegir licencia al crear un repositorio', url: 'https://docs.github.com/es/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository', note: 'Aplica lo aprendido a tus propios proyectos.' }
      ],
      steps: [
        'Coge tres resoluciones sancionadoras de la AEPD y, para cada una, identifica: dato tratado, base de legitimación que faltaba, artículo infringido y medida que lo habría evitado.',
        'Pasa un sistema de IA conocido (un filtro de currículums, un chatbot) por el comprobador del AI Act y justifica la categoría.',
        'Elige licencia para tus repositorios de la carrera y explica en el README por qué.',
        'Haz flashcards bilingües: principios del RGPD, derechos ARCO-POL, tipos de licencia.'
      ]
    }
  },

  so1: {
    ects: 6,
    summary:
      'Qué hace un sistema operativo: procesos e hilos, planificación de CPU, sincronización, gestión de memoria (paginación, memoria virtual), sistemas de ficheros y E/S. Es la llave de Sistemas Operativos Avanzados.',
    approach:
      'Dos frentes a la vez: la teoría (con OSTEP, que es gratis y mejor que cualquier manual) y la línea de comandos de Linux, que es donde se ve todo de verdad. Instala una máquina virtual la primera semana y vive en la terminal. Los ejercicios de planificación y de paginación se resuelven a mano: practícalos hasta que salgan solos.',
    topics: [
      'Introducción: funciones y estructura del SO, llamadas al sistema, modo usuario/núcleo',
      'Procesos e hilos: estados, PCB, creación, cambio de contexto',
      'Planificación de la CPU: FCFS, SJF, Round Robin, prioridades, multinivel',
      'Sincronización: condiciones de carrera, exclusión mutua, semáforos, monitores; interbloqueo',
      'Gestión de memoria: asignación contigua, paginación, segmentación',
      'Memoria virtual: paginación bajo demanda, algoritmos de reemplazo, hiperpaginación',
      'Sistemas de ficheros: interfaz, implementación, asignación de espacio, directorios',
      'Entrada/salida, discos y protección; introducción a la administración de Linux y al shell'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'Operating Systems: Three Easy Pieces (OSTEP)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', note: 'Libro gratuito de referencia mundial. Los capítulos cortos y con humor cubren virtualización, concurrencia y persistencia: el temario entero.' },
      { type: 'libro', lang: 'es', title: 'Fundamentos de sistemas operativos (Silberschatz, Galvin, Gagne — «el dinosaurio»)', note: 'El manual clásico en español; probable bibliografía básica. Bueno para los ejercicios de planificación y paginación.' },
      { type: 'curso', lang: 'es', title: 'The Missing Semester (MIT) · traducción al español', url: 'https://missing-semester-esp.github.io/', note: 'Shell, scripting, editores, Git: lo que la universidad da por sabido y nadie enseña. Hazlo la primera semana.' },
      { type: 'libro', lang: 'en', title: 'The Linux Command Line (William Shotts)', url: 'https://linuxcommand.org/tlcl.php', note: 'Libro gratuito en PDF: de cero a scripts en bash. El complemento práctico perfecto.' },
      { type: 'curso', lang: 'en', title: 'Linux Journey', url: 'https://linuxjourney.com/', note: 'Curso web gratuito por niveles: comandos, procesos, permisos, sistema de ficheros, con quizzes.' },
      { type: 'practica', lang: 'en', title: 'OverTheWire · Bandit', url: 'https://overthewire.org/wargames/bandit/', note: 'Juego de 30 niveles para aprender la terminal resolviendo retos. Adictivo y muy eficaz.' },
      { type: 'curso', lang: 'en', title: 'MIT 6.1810 · Operating System Engineering (xv6)', url: 'https://pdos.csail.mit.edu/6.828/', note: 'Para profundizar: un SO educativo real (xv6) con su libro gratuito. Más nivel del necesario, pero es la referencia.' },
      { type: 'teoria', lang: 'en', title: 'man7.org · páginas de manual de Linux', url: 'https://man7.org/linux/man-pages/', note: 'La documentación oficial de cada comando y llamada al sistema (fork, exec, wait, pipe…).' }
    ],
    lab: {
      intro: 'Un Linux propio para experimentar sin miedo. Tres opciones según tu equipo; con cualquiera vale.',
      tools: [
        { title: 'VirtualBox', url: 'https://www.virtualbox.org/', note: 'Máquina virtual gratuita. Instala dentro Ubuntu y haz un snapshot antes de cada experimento.' },
        { title: 'Ubuntu Desktop', url: 'https://ubuntu.com/download/desktop', note: 'La distribución más documentada para empezar.' },
        { title: 'WSL 2 (Windows)', url: 'https://learn.microsoft.com/es-es/windows/wsl/install', note: 'Si usas Windows: un Ubuntu integrado en el sistema con un solo comando (wsl --install).' },
        { title: 'GCC y make', url: 'https://gcc.gnu.org/', note: 'Los ejercicios de fork/exec/hilos se hacen en C. En Ubuntu: sudo apt install build-essential.' }
      ],
      steps: [
        'Monta Ubuntu (VM o WSL) y completa Bandit hasta el nivel 15 y los tres primeros capítulos de The Missing Semester.',
        'Escribe en C: un programa que use fork y wait, uno con dos hilos que incrementen un contador (verás la condición de carrera) y arréglalo con un mutex.',
        'Resuelve a mano y con tabla de Gantt los ejercicios de planificación (FCFS, SJF, RR con q=2 y q=4) y de reemplazo de páginas (FIFO, LRU, óptimo).',
        'Explora tu sistema: ps, top, /proc, free, df, lsblk, strace. Anota qué muestra cada uno.'
      ]
    }
  },

  redes: {
    ects: 6,
    summary:
      'Cómo viajan los datos: el modelo por capas (TCP/IP), Ethernet y Wi-Fi, direccionamiento IP y subredes, encaminamiento, TCP/UDP, y los protocolos de aplicación (HTTP, DNS, correo).',
    approach:
      'Subnetting a mano hasta la saciedad: es la parte mecánica que más puntos da. Para el resto, captura tráfico real con Wireshark mientras estudias cada capa: ver una petición HTTP dentro de un segmento TCP dentro de un paquete IP dentro de una trama Ethernet vale más que cualquier diagrama. Packet Tracer para montar redes y ver el encaminamiento.',
    topics: [
      'Introducción: conmutación, topologías, modelos OSI y TCP/IP, encapsulación',
      'Capa física y de enlace: medios, Ethernet, direcciones MAC, conmutadores, VLAN, Wi-Fi',
      'Capa de red: IPv4, direccionamiento y subredes (VLSM), ARP, ICMP, NAT, IPv6',
      'Encaminamiento: tablas de rutas, algoritmos (vector-distancia, estado de enlace), RIP, OSPF, BGP',
      'Capa de transporte: UDP, TCP (conexión, fiabilidad, control de flujo y congestión), puertos',
      'Capa de aplicación: DNS, HTTP/HTTPS, correo (SMTP, IMAP), DHCP',
      'Introducción a la seguridad en redes: cortafuegos, VPN, TLS',
      'Programación con sockets (introducción)'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'Kurose & Ross · Computer Networking: A Top-Down Approach (web del libro)', url: 'https://gaia.cs.umass.edu/kurose_ross/', note: 'Vídeos de cada capítulo, ejercicios interactivos y laboratorios de Wireshark, todo gratis. El libro es la bibliografía básica en casi todas las universidades (existe en español: «Redes de computadoras: un enfoque descendente»).' },
      { type: 'curso', lang: 'es', title: 'Cisco Networking Academy · Networking Basics', url: 'https://www.netacad.com/courses/networking-basics', note: 'Curso gratuito y autoguiado de Cisco, con Packet Tracer, disponible en español.' },
      { type: 'practica', lang: 'en', title: 'Subnetting Practice', url: 'https://subnettingpractice.com/', note: 'Ejercicios infinitos de subredes con corrección. Haz diez al día durante dos semanas.' },
      { type: 'teoria', lang: 'es', title: 'Cloudflare · Learning Center', url: 'https://www.cloudflare.com/es-es/learning/', note: 'Explicaciones claras en español de DNS, TCP, HTTP, TLS, DDoS… Ideal como primera lectura de cada tema.' },
      { type: 'libro', lang: 'en', title: "Beej's Guide to Network Programming", url: 'https://beej.us/guide/bgnet/', note: 'El clásico gratuito para programar sockets en C. Para el último tema y para Desarrollo de Aplicaciones en Red.' },
      { type: 'video', lang: 'en', title: 'Professor Messer · Network+', url: 'https://www.professormesser.com/', note: 'Vídeos gratuitos y cortos de cada concepto de redes, orientados a la certificación CompTIA Network+.' },
      { type: 'teoria', lang: 'en', title: 'RFC Editor', url: 'https://www.rfc-editor.org/', note: 'Los documentos originales de cada protocolo. Lee la RFC 791 (IP) y la 793 (TCP) por lo menos por encima.' },
      { type: 'libro', lang: 'es', title: 'Redes de computadoras (Andrew Tanenbaum, Pearson)', note: 'El otro gran manual, más orientado a la capa física y de enlace.' }
    ],
    lab: {
      intro: 'Dos herramientas que usan los profesionales y que son gratuitas: un simulador de redes y un analizador de tráfico.',
      tools: [
        { title: 'Cisco Packet Tracer', url: 'https://www.netacad.com/cisco-packet-tracer', note: 'Simulador de redes de Cisco: routers, switches, PCs, configuración real. Gratis con cuenta de NetAcad.' },
        { title: 'Wireshark', url: 'https://www.wireshark.org/', note: 'El analizador de protocolos estándar. Captura y disecciona cada paquete de tu red.' },
        { title: 'GNS3', url: 'https://www.gns3.com/', note: 'Emulador de redes con imágenes reales de routers. Más avanzado que Packet Tracer; para cuando te quedes corto.' },
        { title: 'Laboratorios Wireshark de Kurose & Ross', url: 'https://gaia.cs.umass.edu/kurose_ross/wireshark.php', note: 'Guiones de práctica por capa: HTTP, DNS, TCP, IP, Ethernet, ARP.' }
      ],
      steps: [
        'Abre Wireshark, filtra por http y visita una web sin HTTPS: sigue el flujo TCP (Follow TCP Stream) y localiza el three-way handshake.',
        'Haz los laboratorios de Wireshark de Kurose & Ross en el mismo orden que los temas.',
        'En Packet Tracer monta: dos redes con un router entre ellas, direccionamiento VLSM, un servidor DHCP y un DNS. Comprueba con ping y traceroute.',
        'Desde tu terminal: ip addr, ip route, ping, traceroute, nslookup/dig, netstat -tulpn. Interpreta cada salida.'
      ]
    }
  },

  // ---------------------------------------------------------------- NOV
  comunicacion: {
    ects: 3,
    summary:
      'Comunicación eficaz (escrita, oral, presentaciones técnicas), trabajo en equipo, negociación y liderazgo. En inglés, así que también entrena el inglés profesional que usarás en cualquier empresa tecnológica.',
    approach:
      'Asignatura de 3 ECTS eminentemente práctica: la evaluación suele ser un vídeo de presentación, un informe o un caso de negociación. Practica hablando en inglés en voz alta y grabándote. El marco teórico (estilos de liderazgo, escucha activa, feedback) se aprende rápido; lo difícil es hacerlo.',
    topics: [
      'Proceso de comunicación; comunicación verbal, no verbal y escrita',
      'Comunicación técnica: informes, correo profesional, documentación',
      'Presentaciones eficaces: estructura, diseño de diapositivas, hablar en público',
      'Escucha activa, asertividad y feedback',
      'Trabajo en equipo: roles, dinámicas, reuniones eficaces',
      'Negociación y gestión de conflictos',
      'Liderazgo: estilos, motivación, gestión de equipos técnicos',
      'Comunicación intercultural y en entornos remotos'
    ],
    resources: [
      { type: 'curso', lang: 'en', title: 'Coursera · Successful Negotiation (University of Michigan)', url: 'https://www.coursera.org/learn/negotiation-skills', note: 'Curso gratuito (modo auditar) muy valorado: preparar, negociar, cerrar. Con casos.' },
      { type: 'teoria', lang: 'en', title: 'Google re:Work', url: 'https://rework.withgoogle.com/', note: 'Guías de Google sobre equipos eficaces, feedback, reuniones y seguridad psicológica (Proyecto Aristóteles).' },
      { type: 'video', lang: 'en', title: 'TED · charlas sobre liderazgo', url: 'https://www.ted.com/topics/leadership', note: 'Modelos de presentación en inglés de 15 minutos. Analiza estructura, ritmo y apoyo visual, no solo el contenido.' },
      { type: 'teoria', lang: 'en', title: 'Harvard Business Review', url: 'https://hbr.org/', note: 'Artículos cortos sobre liderazgo, feedback y comunicación. Varios gratuitos al mes.' },
      { type: 'curso', lang: 'en', title: 'BBC Learning English · English at Work', url: 'https://www.bbc.co.uk/learningenglish/english/features/english-at-work', note: 'Inglés profesional para reuniones, correos y presentaciones, por episodios cortos.' },
      { type: 'libro', lang: 'es', title: 'Conversaciones cruciales (Patterson, Grenny, McMillan, Switzler)', note: 'El libro de referencia sobre conversaciones difíciles y feedback. Muy práctico.' },
      { type: 'libro', lang: 'en', title: 'The Pyramid Principle (Barbara Minto)', note: 'Cómo estructurar un informe o presentación para que se entienda a la primera. Lo usan las consultoras.' }
    ],
    lab: {
      intro: 'Herramientas para practicar presentaciones y escritura, y comunidades para hablar en público.',
      tools: [
        { title: 'Toastmasters', url: 'https://www.toastmasters.org/', note: 'Clubes de oratoria en todas las ciudades; muchos en inglés. Un par de sesiones de invitado son gratis.' },
        { title: 'Google Slides', url: 'https://slides.google.com/', note: 'Para las presentaciones. Regla: una idea por diapositiva, menos de 20 palabras.' },
        { title: 'Grammarly', url: 'https://www.grammarly.com/', note: 'Corrector de inglés escrito con versión gratuita. Úsalo en cada informe.' },
        { title: 'DeepL', url: 'https://www.deepl.com/', note: 'Para comprobar cómo suena una frase en inglés natural.' }
      ],
      steps: [
        'Prepara una presentación técnica de 5 minutos en inglés (sobre tu proyecto de Estructura de Datos, por ejemplo), grábate y revísala con una lista: apertura, estructura, contacto visual, muletillas.',
        'Escribe un correo profesional en inglés pidiendo una prórroga a un profesor y otro dando feedback negativo a un compañero: cortos, claros, asertivos.',
        'Haz el curso de negociación y practica el caso con alguien.',
        'Flashcards con vocabulario profesional en inglés: reuniones, feedback, negociación.'
      ]
    }
  },

  'ing-software': {
    ects: 6,
    summary:
      'Cómo se construye software de calidad en equipo: ciclo de vida, metodologías (ágiles y tradicionales), requisitos, análisis y diseño con UML, patrones, pruebas, control de versiones y mantenimiento.',
    approach:
      'Domina Git desde el primer día: es lo más útil que vas a aprender aquí. UML se aprende dibujando: haz el diagrama de clases y el de secuencia de tus propios proyectos. Para las metodologías, lee la Guía Scrum (son 13 páginas) y el Manifiesto Ágil originales antes que cualquier resumen.',
    topics: [
      'La ingeniería del software: crisis del software, proceso, calidad',
      'Ciclos de vida: cascada, incremental, espiral; metodologías ágiles (Scrum, XP, Kanban)',
      'Ingeniería de requisitos: elicitación, especificación, casos de uso, historias de usuario',
      'Análisis y diseño orientado a objetos con UML: casos de uso, clases, secuencia, estados, actividad',
      'Principios de diseño (SOLID, cohesión y acoplamiento) y patrones de diseño (GoF)',
      'Arquitectura del software: capas, MVC, cliente-servidor',
      'Pruebas: unitarias, integración, sistema, aceptación; TDD',
      'Control de versiones (Git), integración continua, mantenimiento y evolución'
    ],
    resources: [
      { type: 'libro', lang: 'es', title: 'Pro Git (Chacon & Straub) · libro oficial gratuito en español', url: 'https://git-scm.com/book/es/v2', note: 'Los capítulos 1–3 y 5 te dan todo el Git que necesitas en la carrera.' },
      { type: 'practica', lang: 'es', title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/?locale=es_ES', note: 'Juego interactivo para entender ramas, merge y rebase viéndolos.' },
      { type: 'curso', lang: 'en', title: 'GitHub Skills', url: 'https://skills.github.com/', note: 'Cursos prácticos gratuitos dentro de GitHub: pull requests, revisión de código, GitHub Actions.' },
      { type: 'teoria', lang: 'es', title: 'Refactoring Guru · patrones de diseño', url: 'https://refactoring.guru/es/design-patterns', note: 'Todos los patrones GoF con ejemplos en Java y en español. La mejor explicación online que existe.' },
      { type: 'teoria', lang: 'es', title: 'La Guía de Scrum (oficial)', url: 'https://scrumguides.org/', note: 'Las reglas de Scrum de sus creadores. Descarga la versión en español.' },
      { type: 'teoria', lang: 'es', title: 'Manifiesto por el desarrollo ágil de software', url: 'https://agilemanifesto.org/iso/es/manifesto.html', note: 'Los cuatro valores y doce principios. Lo preguntan.' },
      { type: 'teoria', lang: 'en', title: 'Martin Fowler · artículos', url: 'https://martinfowler.com/', note: 'Refactoring, arquitectura, microservicios, pruebas. Referencia viva de la disciplina.' },
      { type: 'libro', lang: 'es', title: 'Ingeniería del software (Ian Sommerville, Pearson)', note: 'El manual clásico y probable bibliografía básica. Existe edición en español.' },
      { type: 'libro', lang: 'es', title: 'Código limpio (Robert C. Martin)', note: 'Cómo escribir código que otros puedan mantener. Cambia la forma de programar.' }
    ],
    lab: {
      intro: 'Git, GitHub y herramientas de modelado UML gratuitas.',
      tools: [
        { title: 'Git', url: 'https://git-scm.com/downloads', note: 'Instálalo y configura nombre y correo. Trabaja siempre desde la terminal al principio.' },
        { title: 'GitHub Student Developer Pack', url: 'https://education.github.com/pack', note: 'Con tu correo universitario: GitHub Pro, JetBrains, créditos de nube y decenas de herramientas gratis.' },
        { title: 'PlantUML', url: 'https://plantuml.com/es/', note: 'UML escribiendo texto: diagramas de clases, secuencia y casos de uso versionables en Git.' },
        { title: 'draw.io (diagrams.net)', url: 'https://app.diagrams.net/', note: 'Editor de diagramas online con plantillas UML. Sin registro.' },
        { title: 'JUnit 5', url: 'https://junit.org/junit5/', note: 'Para el tema de pruebas y TDD en Java.' }
      ],
      steps: [
        'Pide el Student Pack. Crea un repositorio con README, .gitignore y licencia; practica ramas, pull requests y resolución de conflictos con un compañero.',
        'Modela un sistema pequeño (una biblioteca, una tienda) de principio a fin: casos de uso → diagrama de clases → diagrama de secuencia de dos casos → implementación en Java con tests.',
        'Aplica un patrón por semana a código tuyo (Strategy, Observer, Factory, Singleton) y explica en el commit por qué.',
        'Configura GitHub Actions para que tus tests corran en cada push: eso es integración continua.'
      ]
    }
  },

  'so-avanzados': {
    ects: 6,
    summary:
      'Programación de sistemas y administración avanzada: llamadas al sistema, concurrencia con hilos y procesos, comunicación entre procesos, sistemas de ficheros, virtualización y contenedores, sistemas distribuidos.',
    approach:
      'Requiere aprobada SO I. Aquí se programa contra el SO en C (o Python) y se administra Linux de verdad. Docker es la herramienta estrella: entender cómo un contenedor es solo procesos con namespaces y cgroups es la mejor lección de la asignatura. Los ejercicios de concurrencia (productores/consumidores, lectores/escritores) hay que programarlos y verlos fallar.',
    topics: [
      'Interfaz del sistema: llamadas al sistema POSIX, ficheros y descriptores, señales',
      'Procesos avanzados: fork/exec, pipes, FIFO, memoria compartida, colas de mensajes',
      'Hilos POSIX: creación, mutex, variables de condición, problemas clásicos de sincronización',
      'Gestión avanzada de memoria y de E/S; planificación en sistemas multiprocesador',
      'Sistemas de ficheros avanzados: journaling, ext4, permisos, ACL, RAID',
      'Virtualización y contenedores: hipervisores, namespaces, cgroups, Docker',
      'Sistemas distribuidos: modelos, RPC, sistemas de ficheros distribuidos, tolerancia a fallos',
      'Administración: arranque (systemd), usuarios, servicios, monitorización, seguridad'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'OSTEP · partes de Concurrency y Persistence', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', note: 'Los capítulos de hilos, cerrojos, variables de condición, sistemas de ficheros y sistemas distribuidos son este temario.' },
      { type: 'libro', lang: 'en', title: 'The Linux Programming Interface (Michael Kerrisk)', note: 'La referencia definitiva de programación de sistemas en Linux. Consulta por capítulos, no se lee entero.' },
      { type: 'teoria', lang: 'en', title: 'LLNL · POSIX Threads Programming', url: 'https://hpc-tutorials.llnl.gov/posix/', note: 'Tutorial clásico de pthreads con ejemplos en C completos.' },
      { type: 'curso', lang: 'en', title: 'Docker · Get Started', url: 'https://docs.docker.com/get-started/', note: 'Tutorial oficial: imágenes, contenedores, volúmenes, redes, Compose.' },
      { type: 'teoria', lang: 'en', title: 'Arch Wiki', url: 'https://wiki.archlinux.org/', note: 'La mejor documentación de administración de Linux, aunque no uses Arch: systemd, sistemas de ficheros, redes.' },
      { type: 'teoria', lang: 'en', title: 'Linux kernel documentation', url: 'https://docs.kernel.org/', note: 'Documentación oficial del núcleo. Para cgroups, namespaces y planificador.' },
      { type: 'curso', lang: 'en', title: 'Linux From Scratch', url: 'https://www.linuxfromscratch.org/', note: 'Construye un Linux desde el código fuente. Largo, pero después entiendes cada pieza del sistema.' },
      { type: 'libro', lang: 'en', title: 'Distributed Systems (van Steen & Tanenbaum) · gratis', url: 'https://www.distributed-systems.net/index.php/books/ds4/', note: 'El manual de sistemas distribuidos, descargable gratis registrándote.' }
    ],
    lab: {
      intro: 'Tu Linux de SO I, un compilador de C y Docker. Con eso cubres todos los temas.',
      tools: [
        { title: 'Docker Desktop / Docker Engine', url: 'https://docs.docker.com/get-docker/', note: 'En Linux instala Docker Engine; en Windows/Mac, Docker Desktop (gratis para uso educativo).' },
        { title: 'GDB', url: 'https://www.sourceware.org/gdb/', note: 'Depurador de C. Aprende a poner puntos de ruptura y a ver hilos (info threads).' },
        { title: 'Valgrind', url: 'https://valgrind.org/', note: 'Detecta fugas de memoria y condiciones de carrera (--tool=helgrind).' },
        { title: 'Compiler Explorer (Godbolt)', url: 'https://godbolt.org/', note: 'Ve el ensamblador que genera tu C. Útil para entender qué es atómico y qué no.' }
      ],
      steps: [
        'Programa en C: un shell mínimo (fork, exec, wait, pipes), productor/consumidor con hilos y variables de condición, y lectores/escritores. Pásales Helgrind.',
        'Con Docker: crea una imagen para tu proyecto Java de Estructura de Datos, ejecútalo en contenedor, y explora con docker inspect y /proc qué namespaces y cgroups usa.',
        'Administra tu VM: crea un servicio systemd propio, usuarios y grupos con permisos, y monta un disco adicional con su sistema de ficheros.',
        'Monta un mini sistema distribuido: dos contenedores que se comunican por sockets o gRPC, y mata uno para ver cómo falla y cómo lo detectas.'
      ]
    }
  },

  // ---------------------------------------------------------------- MAR
  bbdd: {
    ects: 6,
    summary:
      'Diseñar y consultar bases de datos relacionales: modelo entidad-relación, modelo relacional, normalización, SQL (DDL, DML, consultas complejas), transacciones e introducción a la administración. Es la llave de Bases de Datos Avanzadas.',
    approach:
      'SQL se aprende escribiendo consultas contra una base de datos real: instala PostgreSQL la primera semana y haz SQLBolt entero antes del tema de consultas. El diseño (E-R → relacional → normalización) es lo que más se evalúa: practica con enunciados de todo tipo hasta que la 3FN sea automática.',
    topics: [
      'Introducción a las bases de datos y los SGBD; arquitectura, independencia de datos',
      'Modelo entidad-relación: entidades, atributos, relaciones, cardinalidades, E-R extendido',
      'Modelo relacional: relaciones, claves, integridad; paso de E-R a relacional',
      'Álgebra relacional',
      'SQL: DDL (creación de tablas, restricciones), DML (inserción, actualización, borrado)',
      'SQL: consultas (SELECT, JOIN, agrupación, subconsultas, vistas)',
      'Normalización: dependencias funcionales, 1FN, 2FN, 3FN, FNBC',
      'Transacciones, concurrencia, recuperación; seguridad e introducción a la administración'
    ],
    resources: [
      { type: 'practica', lang: 'en', title: 'SQLBolt', url: 'https://sqlbolt.com/', note: 'Tutorial interactivo de SQL en 18 lecciones cortas con ejercicios en el navegador. Empieza aquí.' },
      { type: 'practica', lang: 'en', title: 'PostgreSQL Exercises', url: 'https://pgexercises.com/', note: 'Ejercicios progresivos con un esquema real y corrección automática: joins, agregaciones, subconsultas.' },
      { type: 'curso', lang: 'en', title: 'Stanford Online · Databases: Relational Databases and SQL', url: 'https://online.stanford.edu/courses/soe-ydatabases0005-databases-relational-databases-and-sql', note: 'Curso gratuito de Jennifer Widom, referencia clásica. Hay módulos hermanos de modelado y de diseño relacional.' },
      { type: 'libro', lang: 'en', title: 'Database System Concepts (Silberschatz) · web del libro', url: 'https://db-book.com/', note: 'Diapositivas, ejercicios y soluciones del manual clásico. La edición en español es «Fundamentos de bases de datos».' },
      { type: 'teoria', lang: 'es', title: 'PostgreSQL · tutorial oficial', url: 'https://www.postgresql.org/docs/current/tutorial.html', note: 'El tutorial de la documentación oficial. Corto y bien hecho.' },
      { type: 'curso', lang: 'en', title: 'CMU 15-445 · Database Systems', url: 'https://15445.courses.cs.cmu.edu/', note: 'Para los temas de transacciones y almacenamiento. Vídeos en YouTube de nivel alto.' },
      { type: 'libro', lang: 'es', title: 'Fundamentos de sistemas de bases de datos (Elmasri & Navathe, Pearson)', note: 'El otro manual clásico, muy bueno para E-R y normalización. Probable bibliografía básica.' }
    ],
    lab: {
      intro: 'PostgreSQL es el SGBD de referencia libre; SQLite sirve para practicar sin instalar nada.',
      tools: [
        { title: 'PostgreSQL', url: 'https://www.postgresql.org/download/', note: 'Instálalo en local (o en Docker: docker run -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres).' },
        { title: 'DBeaver Community', url: 'https://dbeaver.io/', note: 'Cliente gráfico universal: editor SQL, diagrama E-R generado desde el esquema.' },
        { title: 'DB Fiddle', url: 'https://www.db-fiddle.com/', note: 'PostgreSQL/MySQL/SQLite en el navegador para probar consultas rápidas.' },
        { title: 'dbdiagram.io', url: 'https://dbdiagram.io/', note: 'Diagramas E-R/relacionales escribiendo texto; exporta a SQL.' }
      ],
      steps: [
        'Instala PostgreSQL y DBeaver; carga la base de ejemplo de PostgreSQL Exercises y resuelve todos sus bloques.',
        'Diseña de cero una base de datos para NÚCLEO (asignaturas, sesiones, evaluaciones): E-R en dbdiagram, paso a relacional, normaliza a 3FN, crea las tablas con restricciones y carga datos.',
        'Escribe 20 consultas sobre tu diseño de complejidad creciente: joins múltiples, GROUP BY con HAVING, subconsultas correlacionadas, vistas.',
        'Reproduce un problema de concurrencia: dos transacciones que se pisan, y arréglalo con el nivel de aislamiento adecuado.'
      ]
    }
  },

  'gestion-proyectos': {
    ects: 6,
    summary:
      'Planificar, ejecutar y controlar proyectos de software: alcance, tiempo (WBS, Gantt, camino crítico), costes, riesgos, calidad, equipo y comunicación, con enfoques predictivos (PMBOK) y ágiles (Scrum, Kanban).',
    approach:
      'Los ejercicios de PERT/CPM, camino crítico y valor ganado son mecánicos y caen seguro: practícalos. Para el resto, planifica un proyecto real (tu TFB o un proyecto personal) con las herramientas del temario; es lo que se pide en las actividades y te sirve dos veces.',
    topics: [
      'Introducción: proyecto, ciclo de vida, áreas de conocimiento (PMBOK), rol del jefe de proyecto',
      'Inicio y alcance: acta de constitución, interesados, EDT/WBS',
      'Planificación temporal: diagramas de red, PERT/CPM, camino crítico, Gantt, nivelación de recursos',
      'Estimación y costes: técnicas de estimación (puntos de función, COCOMO, planning poker), presupuesto',
      'Seguimiento y control: valor ganado (EVM), indicadores, gestión de cambios',
      'Gestión de riesgos: identificación, análisis cualitativo y cuantitativo, respuestas',
      'Calidad, equipo, comunicación y adquisiciones',
      'Gestión ágil: Scrum, Kanban, roles, ceremonias, métricas (velocidad, burndown)'
    ],
    resources: [
      { type: 'curso', lang: 'es', title: 'Coursera · Certificado de Gestión de Proyectos de Google', url: 'https://www.coursera.org/professional-certificates/google-project-management', note: 'Muy completo y práctico; en modo auditar los vídeos son gratis. Disponible en español.' },
      { type: 'teoria', lang: 'en', title: 'PMI · PMBOK Guide', url: 'https://www.pmi.org/pmbok-guide-standards', note: 'El estándar de referencia (de pago, pero gratis para miembros estudiantes de PMI). Conoce al menos sus áreas de conocimiento.' },
      { type: 'teoria', lang: 'es', title: 'La Guía de Scrum', url: 'https://scrumguides.org/', note: 'Oficial y en español. 13 páginas.' },
      { type: 'teoria', lang: 'es', title: 'Atlassian · guía ágil', url: 'https://www.atlassian.com/es/agile', note: 'Scrum, Kanban, estimación, métricas… explicado por los creadores de Jira, en español.' },
      { type: 'teoria', lang: 'en', title: 'Kanban Guide', url: 'https://kanbanguides.org/', note: 'La definición oficial de Kanban, corta y precisa.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · Project Management', url: 'https://ocw.mit.edu/courses/1-040-project-management-spring-2009/', note: 'Para la parte cuantitativa: planificación, riesgo, control.' },
      { type: 'libro', lang: 'es', title: 'Scrum: el arte de hacer el doble de trabajo en la mitad de tiempo (Jeff Sutherland)', note: 'El creador de Scrum explicando por qué funciona. Ameno.' }
    ],
    lab: {
      intro: 'Software de planificación libre y tableros ágiles gratuitos.',
      tools: [
        { title: 'ProjectLibre', url: 'https://www.projectlibre.com/', note: 'Alternativa libre a MS Project: WBS, Gantt, camino crítico, recursos.' },
        { title: 'GanttProject', url: 'https://www.ganttproject.biz/', note: 'Más sencillo que ProjectLibre. Diagramas de Gantt y PERT.' },
        { title: 'Jira (plan gratuito)', url: 'https://www.atlassian.com/software/jira', note: 'El gestor ágil estándar en la industria. Gratis hasta 10 usuarios.' },
        { title: 'Trello', url: 'https://trello.com/', note: 'Tablero Kanban sencillo. Para empezar con los límites de WIP.' },
        { title: 'Google Sheets', url: 'https://sheets.google.com/', note: 'Para los cálculos de PERT, valor ganado y estimaciones.' }
      ],
      steps: [
        'Planifica tu TFB (o un proyecto personal) en ProjectLibre: WBS de 20–30 tareas, dependencias, duraciones, recursos; identifica el camino crítico.',
        'Haz en Sheets un ejercicio de valor ganado: PV, EV, AC, CPI, SPI y estimación a la conclusión.',
        'Lleva un tablero Kanban de tus asignaturas en Trello durante un bimestre; mide el lead time.',
        'Simula un Sprint de dos semanas de un proyecto pequeño: backlog en Jira, planning con planning poker, burndown al final.'
      ]
    }
  },

  'prog-avanzada': {
    ects: 6,
    summary:
      'Programación orientada a objetos avanzada en Java: herencia y polimorfismo a fondo, interfaces y genéricos, excepciones, colecciones y streams, concurrencia, E/S y acceso a datos, patrones de diseño e interfaces gráficas.',
    approach:
      'Requiere aprobada Fundamentos de Programación. Aquí se construyen programas de tamaño medio: elige un proyecto propio desde el primer tema y ve incorporándole cada concepto (herencia, genéricos, streams, hilos, persistencia). Lee «Effective Java» por capítulos: es donde están las preguntas con trampa.',
    topics: [
      'POO avanzada: herencia, polimorfismo, clases abstractas, interfaces, enumeraciones, records',
      'Genéricos y colecciones; programación funcional en Java: lambdas y la API Stream',
      'Gestión de excepciones y diseño robusto; pruebas unitarias con JUnit',
      'Entrada/salida: ficheros, serialización, JSON; acceso a bases de datos con JDBC',
      'Concurrencia: hilos, sincronización, ejecutores, colecciones concurrentes',
      'Patrones de diseño aplicados (creacionales, estructurales, de comportamiento)',
      'Interfaces gráficas (JavaFX/Swing) y modelo-vista-controlador',
      'Herramientas: Maven/Gradle, documentación (Javadoc), refactorización, calidad de código'
    ],
    resources: [
      { type: 'libro', lang: 'en', title: 'Effective Java (Joshua Bloch)', note: 'El libro sobre cómo escribir Java bien. 90 consejos cortos; cada uno es un posible examen.' },
      { type: 'teoria', lang: 'en', title: 'Oracle · The Java Tutorials (Generics, Collections, Concurrency)', url: 'https://docs.oracle.com/javase/tutorial/', note: 'La referencia oficial de cada tema del programa.' },
      { type: 'teoria', lang: 'es', title: 'Refactoring Guru · patrones en Java', url: 'https://refactoring.guru/es/design-patterns/java', note: 'Cada patrón con código Java completo y en español.' },
      { type: 'teoria', lang: 'en', title: 'Baeldung', url: 'https://www.baeldung.com/', note: 'Artículos cortos y precisos sobre cualquier API de Java: streams, Optional, concurrencia, JDBC.' },
      { type: 'teoria', lang: 'en', title: 'Jenkov · Java Concurrency Tutorial', url: 'https://jenkov.com/tutorials/java-concurrency/index.html', note: 'El mejor tutorial gratuito de concurrencia en Java, de lo básico a los ejecutores.' },
      { type: 'curso', lang: 'en', title: 'Coursera · Object Oriented Java Programming (UC San Diego)', url: 'https://www.coursera.org/specializations/java-object-oriented', note: 'Especialización gratuita en modo auditar con proyectos de tamaño medio.' },
      { type: 'curso', lang: 'en', title: 'MOOC.fi · Java Programming II', url: 'https://java-programming.mooc.fi/', note: 'Herencia, interfaces, genéricos, streams, con corrección automática.' },
      { type: 'teoria', lang: 'en', title: 'Spring · Guides', url: 'https://spring.io/guides', note: 'Para ver cómo se usa todo esto en el framework Java más usado en la industria. Opcional pero muy recomendable.' }
    ],
    lab: {
      intro: 'El entorno Java completo con gestor de dependencias y pruebas.',
      tools: [
        { title: 'IntelliJ IDEA (Ultimate gratis con correo universitario)', url: 'https://www.jetbrains.com/community/education/', note: 'Refactorizaciones automáticas, inspecciones de código y depurador de hilos.' },
        { title: 'Maven · Getting Started', url: 'https://maven.apache.org/guides/getting-started/', note: 'Gestor de dependencias y construcción estándar.' },
        { title: 'JUnit 5 + AssertJ', url: 'https://junit.org/junit5/docs/current/user-guide/', note: 'Pruebas unitarias legibles.' },
        { title: 'SQLite JDBC', url: 'https://github.com/xerial/sqlite-jdbc', note: 'Base de datos embebida para el tema de JDBC sin montar un servidor.' },
        { title: 'JavaFX', url: 'https://openjfx.io/', note: 'Para el tema de interfaces gráficas.' }
      ],
      steps: [
        'Elige un proyecto (gestor de biblioteca, de gastos, un juego de mesa) y créalo con Maven, JUnit y Git desde el día 1.',
        'Tema a tema: jerarquía de clases con polimorfismo → reescribe las búsquedas con streams → persistencia en JSON y luego en SQLite → un hilo en segundo plano con ExecutorService → interfaz JavaFX con MVC.',
        'Aplica al menos cuatro patrones justificados (Factory, Strategy, Observer, Command…) y documéntalos en el README.',
        'Configura GitHub Actions para ejecutar los tests y genera el Javadoc.'
      ]
    }
  },

  // ---------------------------------------------------------------- MAY
  'estructura-comp': {
    ects: 6,
    summary:
      'Arquitectura del computador: repertorio de instrucciones y ensamblador, ruta de datos y unidad de control, segmentación (pipeline), jerarquía de memoria (caché, memoria virtual), E/S y una introducción al paralelismo.',
    approach:
      'Programa en ensamblador (RISC-V o MIPS) desde el primer tema con un simulador: ver los registros cambiar es la única forma de entender la ruta de datos. Los ejercicios de caché (aciertos/fallos, mapeo) y de pipeline (riesgos, ciclos) son mecánicos y muy preguntados: practícalos a mano.',
    topics: [
      'Repaso: rendimiento, ley de Amdahl, métricas (CPI, MIPS)',
      'Repertorio de instrucciones (ISA): RISC-V/MIPS, formatos, modos de direccionamiento, ensamblador',
      'Aritmética del computador: sumadores, multiplicación, división, coma flotante',
      'Ruta de datos y unidad de control monociclo y multiciclo',
      'Segmentación (pipeline): etapas, riesgos estructurales, de datos y de control, adelantamiento, predicción de saltos',
      'Jerarquía de memoria: caché (mapeo, políticas, rendimiento), memoria virtual y TLB',
      'Entrada/salida: buses, interrupciones, DMA',
      'Introducción al paralelismo: multinúcleo, SIMD, GPU'
    ],
    resources: [
      { type: 'libro', lang: 'es', title: 'Estructura y diseño de computadores: la interfaz software/hardware (Patterson & Hennessy)', note: 'EL libro de la asignatura en todo el mundo; usa la edición RISC-V si puedes. Probable bibliografía básica.' },
      { type: 'libro', lang: 'en', title: 'Dive into Systems', url: 'https://diveintosystems.org/', note: 'Libro gratuito y moderno: representación, ensamblador, caché, paralelismo. Muy claro.' },
      { type: 'curso', lang: 'en', title: 'Berkeley CS61C · Great Ideas in Computer Architecture', url: 'https://cs61c.org/', note: 'El curso de Berkeley con RISC-V, proyectos y laboratorios públicos.' },
      { type: 'curso', lang: 'en', title: 'Nand2Tetris · proyectos 4–6', url: 'https://www.nand2tetris.org/', note: 'Ensamblador, CPU y ensamblador (el programa): la continuación natural de Tecnología de Computadores.' },
      { type: 'libro', lang: 'en', title: 'CS:APP · Computer Systems: A Programmer’s Perspective (web)', url: 'https://csapp.cs.cmu.edu/', note: 'Laboratorios públicos (Bomb Lab, Cache Lab) de la CMU. Cache Lab es el mejor ejercicio de caché que existe.' },
      { type: 'video', lang: 'en', title: 'Ben Eater · 8-bit computer', url: 'https://eater.net/8bit', note: 'La ruta de datos y la unidad de control montadas en protoboard, paso a paso.' },
      { type: 'teoria', lang: 'en', title: 'RISC-V · especificación y tarjeta de referencia', url: 'https://riscv.org/technical/specifications/', note: 'La ISA oficial. Descarga la «green card» de instrucciones.' }
    ],
    lab: {
      intro: 'Simuladores de procesador que muestran registros, memoria y pipeline en tiempo real.',
      tools: [
        { title: 'RARS · RISC-V Assembler and Runtime Simulator', url: 'https://github.com/TheThirdOne/rars', note: 'Ejecuta ensamblador RISC-V paso a paso viendo registros y memoria. Java, un solo .jar.' },
        { title: 'Ripes', url: 'https://github.com/mortbopet/Ripes', note: 'Simulador visual de RISC-V con la ruta de datos y el pipeline dibujados. Ves cada etapa.' },
        { title: 'MARS (MIPS)', url: 'https://dpetersanderson.github.io/', note: 'Si tu campus usa MIPS en lugar de RISC-V.' },
        { title: 'Compiler Explorer (Godbolt)', url: 'https://godbolt.org/', note: 'Escribe C y ve el ensamblador que genera para RISC-V, x86 o ARM.' }
      ],
      steps: [
        'En RARS: hola mundo, suma de un vector, factorial recursivo (con pila) y una función que siga la convención de llamada. Ejecuta paso a paso viendo los registros.',
        'En Ripes: carga tus programas y observa el pipeline; provoca un riesgo de datos y comprueba cómo lo resuelve el adelantamiento.',
        'Resuelve a mano ejercicios de caché (directa, asociativa, totalmente asociativa) con secuencias de accesos; luego haz el Cache Lab de CS:APP.',
        'Compila en Godbolt un bucle en C con -O0 y -O2 y explica las diferencias.'
      ]
    }
  },

  ia: {
    ects: 6,
    summary:
      'Fundamentos de la inteligencia artificial: agentes, búsqueda (informada, adversaria, con restricciones), representación del conocimiento y razonamiento (lógica, sistemas expertos, ontologías), incertidumbre (Bayes) e introducción al aprendizaje automático.',
    approach:
      'Los algoritmos de búsqueda (A*, minimax) se entienden implementándolos sobre un problema de juguete (8-puzzle, tres en raya). Para la parte de conocimiento, Prolog o CLIPS: escribir diez reglas te enseña más que leer cien páginas. El curso Berkeley CS188 tiene el mismo temario y proyectos con Pac-Man.',
    topics: [
      'Introducción: historia, agentes inteligentes, entornos, racionalidad',
      'Resolución de problemas mediante búsqueda: no informada (BFS, DFS, coste uniforme) e informada (A*, heurísticas)',
      'Búsqueda local y metaheurísticas; búsqueda adversaria (minimax, poda alfa-beta)',
      'Problemas de satisfacción de restricciones',
      'Representación del conocimiento: lógica proposicional y de primer orden, inferencia',
      'Ingeniería del conocimiento: sistemas expertos, reglas, motores de inferencia, ontologías',
      'Razonamiento con incertidumbre: probabilidad, redes bayesianas',
      'Introducción al aprendizaje automático: aprendizaje supervisado, árboles de decisión, redes neuronales'
    ],
    resources: [
      { type: 'libro', lang: 'es', title: 'Inteligencia artificial: un enfoque moderno (Russell & Norvig, «AIMA»)', url: 'https://aima.cs.berkeley.edu/', note: 'La biblia de la IA y bibliografía básica en todas partes. En la web hay código en Python y Java de todos los algoritmos.' },
      { type: 'curso', lang: 'en', title: 'Berkeley CS188 · Introduction to Artificial Intelligence', url: 'https://inst.eecs.berkeley.edu/~cs188/', note: 'Mismo temario que la asignatura, con vídeos, apuntes y los famosos proyectos de Pac-Man (búsqueda, CSP, minimax, Bayes, RL).' },
      { type: 'curso', lang: 'es', title: 'Elements of AI', url: 'https://www.elementsofai.com/es/', note: 'Curso gratuito de la Universidad de Helsinki en español, sin matemáticas pesadas. Buena introducción antes de empezar.' },
      { type: 'libro', lang: 'en', title: 'Artificial Intelligence: Foundations of Computational Agents (Poole & Mackworth)', url: 'https://artint.info/', note: 'Libro universitario gratuito y completo, con ejercicios y código.' },
      { type: 'curso', lang: 'en', title: 'MIT OCW · 6.034 Artificial Intelligence (Patrick Winston)', url: 'https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/', note: 'Clases magistrales legendarias: búsqueda, reglas, árboles, redes neuronales.' },
      { type: 'libro', lang: 'en', title: 'Learn Prolog Now!', url: 'https://lpn.swi-prolog.org/lpnpage.php?pageid=online', note: 'Tutorial gratuito de Prolog para la parte de lógica y representación del conocimiento.' },
      { type: 'curso', lang: 'es', title: 'Google · Curso intensivo de aprendizaje automático', url: 'https://developers.google.com/machine-learning/crash-course?hl=es-419', note: 'Para el último tema. Vídeos y ejercicios en español.' }
    ],
    lab: {
      intro: 'Python para búsqueda y aprendizaje; Prolog o CLIPS para reglas y lógica.',
      tools: [
        { title: 'Google Colab', url: 'https://colab.research.google.com/', note: 'Python con NumPy, scikit-learn y matplotlib listo.' },
        { title: 'SWI-Prolog', url: 'https://www.swi-prolog.org/', note: 'El Prolog de referencia; tiene versión online (SWISH) sin instalar.' },
        { title: 'CLIPS', url: 'https://www.clipsrules.net/', note: 'Motor de sistemas expertos basado en reglas, el clásico de la asignatura.' },
        { title: 'Protégé', url: 'https://protege.stanford.edu/', note: 'Editor de ontologías de Stanford, para el tema de ingeniería del conocimiento.' },
        { title: 'scikit-learn', url: 'https://scikit-learn.org/stable/', note: 'Árboles de decisión y clasificadores en tres líneas, para el tema de aprendizaje.' }
      ],
      steps: [
        'Implementa en Python BFS, DFS, coste uniforme y A* sobre el 8-puzzle y compara nodos expandidos con dos heurísticas.',
        'Programa un tres en raya con minimax y poda alfa-beta; luego un cuatro en raya con profundidad limitada y función de evaluación.',
        'Escribe en Prolog una base de hechos familiar y reglas (abuelo, primo…); luego un sistema experto de diagnóstico con 15 reglas en CLIPS.',
        'Haz los proyectos 1 y 2 de Pac-Man de CS188 (búsqueda y multiagente): están pensados justo para este nivel.'
      ]
    }
  }
}
