// Verificación mecánica del material de Fundamentos de Programación.
//
// Dos veces he publicado afirmaciones falsas sobre Java (que 5/0 no
// compila, que un máximo con > estrictos no compila) y las dos las cazó
// una revisión, no una prueba. Esto lo arregla: cada fragmento que la
// app publica se COMPILA Y SE EJECUTA aquí, y su salida se compara con
// lo que dice la solución. Si un día edito una y no la otra, falla.
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FUND_PROG_PRACTICE } from '../src/data/practice/fund-prog.js'

const out = []
const check = (n, ok, x = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' :: ' + x : ''}`); if (!ok) process.exitCode = 1 }

// Sin JDK no se puede comprobar nada de esto, y fingir que sí sería
// peor que no ejecutarlo: se dice en voz alta y el lanzador lo marca
// como omitida en lugar de contarla como verde.
try {
  execFileSync('javac', ['-version'], { stdio: 'pipe' })
} catch {
  console.log('OMITIDA  el material de Java necesita un JDK (javac) y aquí no hay ninguno.')
  console.log('         Instala uno (https://adoptium.net) y vuelve a lanzarla.')
  process.exit(0)
}

const dir = mkdtempSync(join(tmpdir(), 'nucleo-java-'))
const P = (id) => FUND_PROG_PRACTICE.find((p) => p.id === id)

// La JVM de este entorno anuncia JAVA_TOOL_OPTIONS por stderr en cada
// invocación. No es salida del programa y no puede contarse como tal.
const limpia = (t) =>
  String(t)
    .split('\n')
    .filter((l) => !l.startsWith('Picked up JAVA_TOOL_OPTIONS'))
    .join('\n')
    .trim()

/** Compila y ejecuta. Devuelve {compila, salida} sin lanzar. */
function correr(nombre, cuerpo) {
  const file = join(dir, `${nombre}.java`)
  writeFileSync(file, cuerpo)
  try {
    execFileSync('javac', ['-d', dir, file], { stdio: 'pipe' })
  } catch (e) {
    return { compila: false, salida: limpia(String(e.stderr || e.stdout || e)) }
  }
  try {
    return { compila: true, salida: limpia(execFileSync('java', ['-cp', dir, nombre], { stdio: 'pipe' }).toString()) }
  } catch (e) {
    return { compila: true, salida: limpia(String(e.stdout || '') + String(e.stderr || '')) }
  }
}

// El parámetro se llama args y no a: con a chocaba con las variables de
// los propios ejemplos.
const prog = (nombre, dentro, extra = '') =>
  `public class ${nombre} {\n${extra}\n  public static void main(String[] args) {\n${dentro}\n  }\n}\n`

// ---------- fb3: qué es de compilación y qué de ejecución
const tipos = correr('Tipos', 'public class Tipos { public static void main(String[] a) { int x = "hola"; } }')
check('fb3(a): asignar String a int NO compila', !tipos.compila)

const fuera = correr('Fuera', prog('Fuera', '    int[] v = new int[3];\n    v[3] = 1;'))
check('fb3(b): salirse del array compila y revienta al ejecutar',
  fuera.compila && /ArrayIndexOutOfBoundsException/.test(fuera.salida), fuera.salida.split('\n')[0])

const div = correr('Div', prog('Div', '    int p = 5, q = 0;\n    System.out.println(p / q);'))
check('fb3(c): dividir entre cero compila y lanza ArithmeticException',
  div.compila && /ArithmeticException/.test(div.salida), div.salida.split('\n')[0])

// CLAVE (hallazgo de Codex en el PR #11): también con literales.
const divLit = correr('DivLit', prog('DivLit', '    System.out.println(5 / 0);'))
check('fb3: 5 / 0 con literales TAMBIÉN compila', divLit.compila)
check('y también lanza ArithmeticException al ejecutar', /ArithmeticException/.test(divLit.salida),
  divLit.salida.split('\n')[0])
check('y la solución publicada ya no dice lo contrario',
  !/el compilador sí se da cuenta/.test(P('fb3').a) && /TAMBIÉN compilaría/.test(P('fb3').a))

const puntoYComa = correr('PyC', 'public class PyC { public static void main(String[] a) { System.out.println("hola") } }')
check('fb3(d): sin punto y coma no compila', !puntoYComa.compila)

// ---------- fm1: el máximo con > estrictos
const maxEstricto = correr('MaxE', prog('MaxE',
  '    System.out.println(m(5,5,5) + " " + m(9,2,2) + " " + m(2,9,2) + " " + m(2,2,9));',
  '  static int m(int a, int b, int c) {\n    if (a > b && a > c) return a;\n    else if (b > c) return b;\n    else return c;\n  }'))
// CLAVE (hallazgo de Codex): compila, y además acierta.
check('fm1: con > estrictos SÍ compila', maxEstricto.compila, maxEstricto.salida.split('\n')[0])
check('y con tres iguales devuelve el número, no un error', maxEstricto.salida === '5 9 9 9', maxEstricto.salida)
check('y la solución publicada ya no promete un error de compilación',
  !/no compilaría por falta de return/.test(P('fm1').a) && /COMPILA igual/.test(P('fm1').a))

const maxCandidato = correr('MaxC', prog('MaxC',
  '    System.out.println(m(5,5,5) + " " + m(9,2,2) + " " + m(2,9,2) + " " + m(2,2,9));',
  '  static int m(int a, int b, int c) {\n    int mayor = a;\n    if (b > mayor) mayor = b;\n    if (c > mayor) mayor = c;\n    return mayor;\n  }'))
check('fm1: el esquema del candidato da lo mismo', maxCandidato.salida === '5 9 9 9', maxCandidato.salida)

// ---------- ft1, ft2, ft3: tipos
const t1 = correr('T1', prog('T1',
  '    int x = 7, y = 2;\n    System.out.println(x / y);\n    System.out.println(x % y);\n    System.out.println((double) x / y);'))
check('ft1: imprime 3, 1 y 3.5', t1.salida === '3\n1\n3.5', JSON.stringify(t1.salida))
check('y la clave publicada lo dice', P('ft1').key.includes('3') && P('ft1').key.includes('3.5'))

const t2 = correr('T2', prog('T2',
  '    int suma = 7, n = 2;\n    double mal = suma / n;\n    double bien = (double) suma / n;\n    System.out.println(mal + " " + bien);'))
check('ft2: la división entera da 3.0 y el arreglo 3.5', t2.salida === '3.0 3.5', t2.salida)
check('y la clave publicada da el valor malo y el arreglo',
  P('ft2').key.includes('3.0') && P('ft2').key.includes('(double) suma / n'), P('ft2').key)

const t3 = correr('T3', prog('T3',
  "    System.out.println('A' + 1);\n    System.out.println((char) ('A' + 1));"))
check("ft3: 'A' + 1 imprime 66, y con el casting la B", t3.salida === '66\nB', JSON.stringify(t3.salida))
check('y la clave publicada dice 66', P('ft3').key.includes('66'))

// ---------- fc1, fc2, fc3: control
const c1 = correr('C1', prog('C1',
  '    StringBuilder sb = new StringBuilder();\n    for (int i = 1; i <= 20; i++) if (i % 3 == 0) sb.append(i).append(" ");\n    System.out.println(sb.toString().trim());'))
check('fc1: múltiplos de 3 hasta 20', c1.salida === '3 6 9 12 15 18', c1.salida)
check('y la clave publicada los lista', P('fc1').key === '3, 6, 9, 12, 15, 18')

const c2 = correr('C2', prog('C2',
  '    int i = 0;\n    while (i < 3) {\n      for (int j = 0; j < 2; j++) {\n        if (j == 1) continue;\n        System.out.println(i + "-" + j);\n      }\n      i++;\n    }'))
check('fc2: el continue solo afecta al for', c2.salida === '0-0\n1-0\n2-0', JSON.stringify(c2.salida))
check('y la clave publicada lo dice', P('fc2').key === '0-0, 1-0, 2-0')

// El bucle que no termina: con tope, para poder probarlo sin colgarse.
const c3 = correr('C3', prog('C3',
  '    int n = 10, vueltas = 0;\n    while (n > 0 && vueltas < 1000) { if (n % 2 == 0) n--; vueltas++; }\n    System.out.println(n);'))
check('fc3: el bucle se atasca en 9', c3.salida === '9', c3.salida)
check('y la clave publicada dice 9', P('fc3').key.includes('9'))

// ---------- fm2, fm3, fm4: métodos
const m2 = correr('M2', prog('M2',
  '    int x = 1;\n    int[] w = {1};\n    cambiar(x, w);\n    System.out.println(x + " " + w[0]);',
  '  static void cambiar(int n, int[] v) { n = 99; v[0] = 99; }'))
check('fm2: paso por valor imprime «1 99»', m2.salida === '1 99', m2.salida)
check('y la clave publicada dice 1 99', P('fm2').key === '1 99')

const m3 = correr('M3', prog('M3',
  '    System.out.println(factorial(0) + " " + factorial(1) + " " + factorial(5) + " " + factorial(13));',
  '  static long factorial(int n) { if (n <= 1) return 1; return n * factorial(n - 1); }'))
check('fm3: el factorial publicado da 1, 1, 120 y 6227020800',
  m3.salida === '1 1 120 6227020800', m3.salida)
// Y la advertencia sobre int: 13! no cabe y desborda en silencio.
const m3int = correr('M3i', prog('M3i',
  '    System.out.println(f(13));',
  '  static int f(int n) { if (n <= 1) return 1; return n * f(n - 1); }'))
check('fm3: con int, 13! desborda y ni siquiera avisa',
  m3int.compila && Number(m3int.salida) !== 6227020800, m3int.salida)

const m4 = correr('M4', prog('M4',
  '    System.out.println(sd(1234) + " " + sd(0) + " " + sd(7) + " " + sd(999));',
  '  static int sd(int n) { if (n < 10) return n; return n % 10 + sd(n / 10); }'))
check('fm4: sumaDigitos da 10, 0, 7 y 27', m4.salida === '10 0 7 27', m4.salida)
check('y la clave publicada trae la fórmula', P('fm4').key.includes('n % 10 + sumaDigitos(n / 10)'))

// ---------- fv1..fv4: vectores
const v1 = correr('V1', prog('V1',
  '    System.out.println(suma(new int[]{1,2,3}) + " " + suma(new int[0]));',
  '  static int suma(int[] v) { int t = 0; for (int x : v) t += x; return t; }'))
check('fv1: la suma acumula, y con array vacío da 0', v1.salida === '6 0', v1.salida)

const v2 = correr('V2', prog('V2',
  '    int[] v = {4,8,15};\n    System.out.println(buscar(v,8) + " " + buscar(v,4) + " " + buscar(v,99));',
  '  static int buscar(int[] v, int x) { for (int i = 0; i < v.length; i++) if (v[i] == x) return i; return -1; }'))
check('fv2: devuelve el índice, y -1 si no está', v2.salida === '1 0 -1', v2.salida)

const v3 = correr('V3', prog('V3',
  '    int[] v = {10,20,30};\n    for (int i = 0; i <= v.length; i++) System.out.println(v[i]);'))
check('fv3: imprime los tres y revienta en el índice 3',
  v3.salida.startsWith('10\n20\n30') && /Index 3 out of bounds/.test(v3.salida),
  v3.salida.split('\n').slice(0, 5).join(' | '))
check('y la clave publicada lo dice', P('fv3').key.includes('i = 3'))

const v4 = correr('V4', prog('V4',
  '    System.out.println(diag(new int[][]{{1,2},{3,4}}));\n    try { diag(new int[][]{{1,2,3},{4,5,6}}); System.out.println("sin queja"); }\n    catch (IllegalArgumentException e) { System.out.println("cuadrada?"); }',
  '  static int diag(int[][] m) {\n    for (int i = 0; i < m.length; i++) if (m[i].length != m.length) throw new IllegalArgumentException("no cuadrada");\n    int t = 0;\n    for (int i = 0; i < m.length; i++) t += m[i][i];\n    return t;\n  }'))
check('fv4: la diagonal suma 5 y rechaza la no cuadrada', v4.salida === '5\ncuadrada?', JSON.stringify(v4.salida))

// ---------- fs1, fs3, fs4: cadenas
const s1 = correr('S1', prog('S1',
  '    String s = "hola";\n    s.toUpperCase();\n    System.out.println(s);\n    s = s.toUpperCase();\n    System.out.println(s);'))
check('fs1: sin asignar no cambia nada; asignando sí', s1.salida === 'hola\nHOLA', JSON.stringify(s1.salida))
check('y la clave publicada dice que sale en minúsculas', P('fs1').key.includes('hola'))

const s3 = correr('S3', prog('S3', '    System.out.println("programacion".substring(3, 7));'))
check('fs3: substring(3, 7) da «gram»', s3.salida === 'gram', s3.salida)
check('y la clave publicada dice gram', P('fs3').key === 'gram')

const s4 = correr('S4', prog('S4',
  '    System.out.println(pal("Anita lava la tina") + " " + pal("hola") + " " + pal("ana") + " " + pal(""));',
  '  static boolean pal(String s) {\n    String l = s.toLowerCase().replace(" ", "");\n    int i = 0, j = l.length() - 1;\n    while (i < j) { if (l.charAt(i) != l.charAt(j)) return false; i++; j--; }\n    return true;\n  }'))
check('fs4: el palíndromo publicado acierta los cuatro casos',
  s4.salida === 'true false true true', s4.salida)

// ---------- fo1, fo2, fo3: objetos
const ALUMNO = '  static class Alumno {\n    private String nombre; private double nota;\n    Alumno(String nombre, double nota) { this.nombre = nombre; this.nota = nota; }\n    String getNombre() { return nombre; }\n    double getNota() { return nota; }\n    boolean aprobado() { return nota >= 5; }\n  }\n'

const o1 = correr('O1', prog('O1',
  '    Alumno a = new Alumno("Carlos", 7.5);\n    Alumno b = new Alumno("Luis", 4.0);\n    System.out.println(a.getNombre() + " " + a.aprobado() + " " + b.aprobado());', ALUMNO))
check('fo1: la clase publicada compila y aprobado() acierta en el 5',
  o1.salida === 'Carlos true false', o1.salida)
const o1b = correr('O1b', prog('O1b',
  '    System.out.println(new Alumno("x", 5.0).aprobado());', ALUMNO))
check('fo1: con un 5 justo, aprobado', o1b.salida === 'true', o1b.salida)

const o2 = correr('O2', prog('O2',
  '    Alumno[] clase = new Alumno[3];\n    System.out.println(clase[0].getNombre());', ALUMNO))
check('fo2: los huecos de un array de objetos valen null → NPE',
  o2.compila && /NullPointerException/.test(o2.salida), o2.salida.split('\n')[0])
check('y la clave publicada lo dice', P('fo2').key.includes('NullPointerException'))
// El caso que corregí en las trampas: una local sin inicializar NO llega a NPE.
const o2local = correr('O2l', prog('O2l', '    Alumno a;\n    System.out.println(a.getNombre());', ALUMNO))
check('una variable local sin inicializar ni siquiera compila', !o2local.compila)
check('y el compilador lo dice con esas palabras',
  /might not have been initialized|podría no haberse inicializado/.test(o2local.salida),
  o2local.salida.split('\n').find((l) => l.includes('error')) || '')

const o3 = correr('O3', prog('O3',
  '    Alumno[] c = { new Alumno("A", 6), new Alumno("B", 9), new Alumno("C", 9) };\n    System.out.println(mejor(c).getNombre() + " " + (mejor(new Alumno[0]) == null));',
  ALUMNO + '  static Alumno mejor(Alumno[] c) {\n    if (c == null || c.length == 0) return null;\n    Alumno m = c[0];\n    for (int i = 1; i < c.length; i++) if (c[i].getNota() > m.getNota()) m = c[i];\n    return m;\n  }'))
check('fo3: devuelve el mejor, con empate se queda el primero, y null si está vacío',
  o3.salida === 'B true', o3.salida)

// ---------- fe2: excepciones
const e2 = correr('E2', prog('E2',
  '    try {\n      int[] v = new int[2];\n      v[5] = 1;\n      System.out.println("A");\n    } catch (ArrayIndexOutOfBoundsException e) {\n      System.out.println("B");\n    } finally {\n      System.out.println("C");\n    }\n    System.out.println("D");'))
check('fe2: imprime B, C y D — nunca la A', e2.salida === 'B\nC\nD', JSON.stringify(e2.salida))
check('y la clave publicada dice B, C, D', P('fe2').key === 'B, C, D')
// La variante que la solución describe: sin excepción sale A, C, D.
const e2sin = correr('E2s', prog('E2s',
  '    try { System.out.println("A"); }\n    catch (RuntimeException e) { System.out.println("B"); }\n    finally { System.out.println("C"); }\n    System.out.println("D");'))
check('fe2: sin excepción sale A, C, D, como dice la solución', e2sin.salida === 'A\nC\nD', JSON.stringify(e2sin.salida))

console.log(out.join('\n'))
console.log(`\n${out.filter((x) => x.startsWith('PASS')).length} PASS · ${out.filter((x) => x.startsWith('FAIL')).length} FAIL`)
