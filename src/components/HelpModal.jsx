import React from 'react'
import Modal from './Modal.jsx'

const SHORTCUTS = [
  ['?', 'Esta ayuda'],
  ['Ctrl / ⌘ + K', 'Buscar en toda la app'],
  ['G luego I / P / C / A / E / R / J', 'Ir a Inicio, Plan, Calendario, Agenda, Estudio, Progreso, Ajustes'],
  ['Esc', 'Cerrar ventanas y menús']
]

export default function HelpModal({ onClose }) {
  return (
    <Modal title="Cómo usar NÚCLEO" onClose={onClose}>
      <div className="help">
        <h4>El flujo de un bimestre</h4>
        <ol>
          <li>
            <strong>Plan de estudios</strong>: entra en cada asignatura y ponle su estado (matriculada, cursando…). Los
            estados alimentan Inicio, Estudio y el expediente.
          </li>
          <li>
            <strong>Guía de estudio</strong> (dentro de cada asignatura): temario orientativo con casillas para marcar lo
            estudiado, recursos para aprender y practicar, y el laboratorio con un plan de prácticas. Guarda con un clic
            los recursos que uses.
          </li>
          <li>
            <strong>Clases y sesiones</strong>: registra cada videoclase vista y cada sesión de estudio con sus minutos.
            <strong> Evaluaciones</strong>: tests, actividades y la prueba final con fecha; aparecen en Agenda e Inicio.
          </li>
          <li>
            <strong>Estudio</strong>: flashcards con repaso espaciado (cajas Leitner) y pomodoro. Ambos suman a tu tiempo
            de estudio, al objetivo semanal y a la racha.
          </li>
          <li>
            <strong>Calendario</strong>: el planificador reparte el temario pendiente entre los días que puedes
            estudiar. Toca un día para ver en detalle qué toca, marcarlo como hecho o cambiar sus horas. Con «Exportar
            al calendario» te llevas todas las sesiones a Google Calendar, cada una con sus recursos en la descripción.
          </li>
          <li>
            <strong>Agenda</strong>: lista de entregas, calendario mensual y tu horario semanal fijo (lo que verás cada
            día en Inicio).
          </li>
          <li>
            <strong>Sesión de estudio</strong>: el botón «Estudiar» de cada bloque del calendario abre la unidad con su
            material y un cronómetro. Al terminar registra los minutos reales atados a esa unidad.
          </li>
          <li>
            <strong>Progreso</strong>: compara el plan con la realidad. Cuánto tardas de verdad frente a lo estimado
            (y un botón para corregir el plan entero a tu ritmo), cuántas de las horas previstas cumples, y si a tu
            ritmo real llegas a cada examen.
          </li>
        </ol>

        <h4>La nota en UNIPRO</h4>
        <p>
          Evaluación continua 70 % (test, actividades prácticas y foros) + prueba de validación final 30 % (online, en
          directo, ~1 h). En cada asignatura tienes una calculadora que te dice qué necesitas en la prueba final.
        </p>

        <h4>Tus datos</h4>
        <p>
          Se guardan en este navegador y, si conectas Google Drive en Ajustes, también en tu Drive (carpeta NÚCLEO).
          Exporta una copia JSON de vez en cuando; Inicio te avisará si pasan dos semanas sin hacerlo.
        </p>

        <h4>Instalar como app</h4>
        <p>
          En el móvil: menú del navegador → «Añadir a pantalla de inicio». En el ordenador: icono de instalar en la barra
          de direcciones. Funciona sin conexión.
        </p>

        <h4>Atajos de teclado</h4>
        <table className="help-keys">
          <tbody>
            {SHORTCUTS.map(([k, d]) => (
              <tr key={k}>
                <td>
                  {k.split(' luego ').map((part, i) => (
                    <React.Fragment key={part}>
                      {i > 0 && <span className="muted"> luego </span>}
                      {part.split(' / ').map((kk, j) => (
                        <React.Fragment key={kk}>
                          {j > 0 && ' / '}
                          <span className="kbd">{kk.trim()}</span>
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </td>
                <td>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  )
}
