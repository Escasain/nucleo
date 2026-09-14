// ============================================================
// Estado global de NÚCLEO
// - Fuente de verdad: objeto `data` (serializable a JSON)
// - Caché local: localStorage (funciona offline)
// - Persistencia principal: Google Drive (si está conectado)
// ============================================================
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, useCallback } from 'react'
import { INITIAL_SUBJECT_STATE } from '../data/curriculum.js'
import { APP_VERSION } from '../config.js'
import { todayISO, toISO, parseISO } from './dates.js'
import * as drive from './driveSync.js'

const LOCAL_KEY = 'nucleo.data'

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

export const DEFAULT_SETTINGS = {
  weeklyGoalMin: 600, // 10 h/semana
  onboardingDone: false,
  lastExportAt: null
}

// Planificador de estudio. weekHours en null significa «aún sin tocar»:
// el planificador lo siembra desde el horario semanal (data.schedule) y
// solo pasa a ser un array propio cuando ajustas un día a mano.
export const DEFAULT_PLANNER = {
  weekHours: null,
  exceptions: {},
  done: {},
  hourOverrides: {},
  // A qué hora empieza el estudio cada día (lun → dom). Entre semana
  // por la tarde, el fin de semana por la mañana. Solo se usa para
  // exportar al calendario: el reparto trabaja con horas, no con horas
  // del día. Si tienes una franja en el horario semanal, manda esa.
  startTimes: ['18:00', '18:00', '18:00', '18:00', '18:00', '10:00', '10:00'],
  // Factor de ritmo por asignatura: cuánto te cuestan de verdad las
  // unidades frente a lo estimado. 1 = la estimación acierta. Lo
  // calcula «Progreso» a partir de las sesiones cronometradas y lo
  // aplica unitHours() sobre la estimación original del temario.
  paceFactor: {}
}

export function emptyData() {
  return {
    version: APP_VERSION,
    updatedAt: new Date().toISOString(),
    subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECT_STATE)),
    sessions: [],
    resources: {},
    tasks: [],
    decks: {},
    pomodoro: [],
    schedule: [],
    topicProgress: {},
    settings: { ...DEFAULT_SETTINGS },
    planner: { ...DEFAULT_PLANNER }
  }
}

const asArray = (v) => (Array.isArray(v) ? v : [])
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})

// Un JSON venido de Drive o de una copia de seguridad puede estar
// incompleto o tener tipos raros. Lo dejamos siempre con la forma
// que espera el resto de la app para que ninguna vista reviente.
export function normalize(raw) {
  const base = emptyData()
  if (!raw || typeof raw !== 'object') return base
  const mapOfLists = (v) => {
    const out = {}
    for (const [k, list] of Object.entries(asObject(v))) out[k] = asArray(list)
    return out
  }
  return {
    ...base,
    ...raw,
    version: Number(raw.version) || APP_VERSION,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    subjects: asObject(raw.subjects),
    sessions: asArray(raw.sessions).filter((s) => s && s.id),
    tasks: asArray(raw.tasks).filter((t) => t && t.id),
    pomodoro: asArray(raw.pomodoro).filter((p) => p && p.id),
    resources: mapOfLists(raw.resources),
    decks: mapOfLists(raw.decks),
    schedule: asArray(raw.schedule).filter((s) => s && s.id),
    topicProgress: Object.fromEntries(
      Object.entries(asObject(raw.topicProgress)).map(([k, v]) => [
        k,
        { done: asArray(v && v.done), total: Number(v && v.total) || 0 }
      ])
    ),
    settings: { ...DEFAULT_SETTINGS, ...asObject(raw.settings) },
    planner: normalizePlanner(raw.planner)
  }
}

// El planificador guarda horas y marcas por unidad: si algo viene con
// el tipo cambiado (copia antigua, edición a mano del JSON) se descarta
// en vez de propagar NaN por todo el calendario.
function normalizePlanner(raw) {
  const p = asObject(raw)
  const hours = Array.isArray(p.weekHours) && p.weekHours.length === 7
    ? p.weekHours.map((h) => clampHours(h, 0, 12, 0))
    : null
  const exceptions = {}
  for (const [k, v] of Object.entries(asObject(p.exceptions))) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(Number(v))) {
      exceptions[k] = clampHours(v, 0, 12, 0)
    }
  }
  const done = {}
  for (const [k, list] of Object.entries(asObject(p.done))) {
    done[k] = asArray(list).filter((x) => typeof x === 'string')
  }
  const hourOverrides = {}
  for (const [k, v] of Object.entries(asObject(p.hourOverrides))) {
    if (Number.isFinite(Number(v))) hourOverrides[k] = clampHours(v, 0.5, 20, 0.5)
  }
  const startTimes =
    Array.isArray(p.startTimes) && p.startTimes.length === 7
      ? p.startTimes.map((t, i) => (/^\d{2}:\d{2}$/.test(t) ? t : DEFAULT_PLANNER.startTimes[i]))
      : [...DEFAULT_PLANNER.startTimes]
  const paceFactor = {}
  for (const [k, v] of Object.entries(asObject(p.paceFactor))) {
    const n = Number(v)
    if (Number.isFinite(n) && n > 0) paceFactor[k] = +Math.max(0.4, Math.min(3, n)).toFixed(2)
  }
  return { weekHours: hours, exceptions, done, hourOverrides, startTimes, paceFactor }
}

export function clampHours(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return +Math.max(min, Math.min(max, n)).toFixed(1)
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.subjects) return null
    return normalize(parsed)
  } catch {
    return null
  }
}

function saveLocal(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  } catch {
    /* modo incógnito o sin espacio: seguimos en memoria */
  }
}

function stamp(data) {
  return { ...data, updatedAt: new Date().toISOString() }
}

// Intervalos Leitner (días) por caja 1..5
const LEITNER = [0, 1, 3, 7, 16]

function reducer(data, action) {
  switch (action.type) {
    case 'load':
      return action.data

    case 'setSubject': {
      const prev = data.subjects[action.id] || {}
      return stamp({
        ...data,
        subjects: { ...data.subjects, [action.id]: { ...prev, ...action.patch } }
      })
    }

    case 'addSession':
      return stamp({
        ...data,
        sessions: [...data.sessions, { id: uid(), done: false, ...action.session }]
      })
    case 'updateSession':
      return stamp({
        ...data,
        sessions: data.sessions.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s))
      })
    case 'deleteSession':
      return stamp({ ...data, sessions: data.sessions.filter((s) => s.id !== action.id) })

    case 'addResource': {
      const list = data.resources[action.subjectId] || []
      return stamp({
        ...data,
        resources: {
          ...data.resources,
          [action.subjectId]: [...list, { id: uid(), ...action.resource }]
        }
      })
    }
    case 'deleteResource': {
      const list = data.resources[action.subjectId] || []
      return stamp({
        ...data,
        resources: {
          ...data.resources,
          [action.subjectId]: list.filter((r) => r.id !== action.id)
        }
      })
    }

    case 'addTask':
      return stamp({ ...data, tasks: [...data.tasks, { id: uid(), done: false, ...action.task }] })
    case 'updateTask':
      return stamp({
        ...data,
        tasks: data.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t))
      })
    case 'deleteTask':
      return stamp({ ...data, tasks: data.tasks.filter((t) => t.id !== action.id) })

    case 'addCard': {
      const deck = data.decks[action.subjectId] || []
      return stamp({
        ...data,
        decks: {
          ...data.decks,
          [action.subjectId]: [
            ...deck,
            { id: uid(), front: action.front, back: action.back, box: 1, nextReview: todayISO() }
          ]
        }
      })
    }
    case 'updateCard': {
      const deck = data.decks[action.subjectId] || []
      return stamp({
        ...data,
        decks: {
          ...data.decks,
          [action.subjectId]: deck.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c))
        }
      })
    }
    case 'deleteCard': {
      const deck = data.decks[action.subjectId] || []
      return stamp({
        ...data,
        decks: { ...data.decks, [action.subjectId]: deck.filter((c) => c.id !== action.id) }
      })
    }
    case 'reviewCard': {
      const deck = data.decks[action.subjectId] || []
      return stamp({
        ...data,
        decks: {
          ...data.decks,
          [action.subjectId]: deck.map((c) => {
            if (c.id !== action.id) return c
            let box
            if (action.quality === 'otra') box = 1
            else if (action.quality === 'bien') box = Math.min(5, (c.box || 1) + 1)
            else box = Math.min(5, (c.box || 1) + 2) // 'facil'
            const days = LEITNER[box - 1]
            const next = parseISO(todayISO())
            next.setDate(next.getDate() + Math.max(days, action.quality === 'otra' ? 0 : 1))
            // reviewedAt manda las tarjetas recién vistas al final de la
            // cola: con «Otra vez» la tarjeta vuelve hoy, pero después
            // de las demás, no inmediatamente.
            return { ...c, box, nextReview: toISO(next), reviewedAt: Date.now() }
          })
        }
      })
    }

    case 'setPlanner':
      return stamp({ ...data, planner: { ...data.planner, ...action.patch } })

    case 'setSettings':
      return stamp({ ...data, settings: { ...data.settings, ...action.patch } })

    case 'addSlot':
      return stamp({ ...data, schedule: [...data.schedule, { id: uid(), ...action.slot }] })
    case 'updateSlot':
      return stamp({
        ...data,
        schedule: data.schedule.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s))
      })
    case 'deleteSlot':
      return stamp({ ...data, schedule: data.schedule.filter((s) => s.id !== action.id) })

    case 'toggleTopic': {
      const prev = data.topicProgress[action.subjectId] || { done: [], total: 0 }
      const done = prev.done.includes(action.topic)
        ? prev.done.filter((t) => t !== action.topic)
        : [...prev.done, action.topic]
      return stamp({
        ...data,
        topicProgress: { ...data.topicProgress, [action.subjectId]: { done, total: action.total || prev.total } }
      })
    }

    case 'reset':
      return emptyData()

    case 'logPomodoro':
      return stamp({
        ...data,
        pomodoro: [
          ...data.pomodoro,
          { id: uid(), date: todayISO(), minutes: Number(action.minutes) || 0, subjectId: action.subjectId || null }
        ]
      })

    default:
      return data
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, dispatch] = useReducer(reducer, null, () => loadLocal() || emptyData())
  const dataRef = useRef(data)
  dataRef.current = data
  // syncStatus: 'local' | 'connecting' | 'syncing' | 'synced' | 'error' | 'unconfigured'
  const [syncStatus, setSyncStatus] = useState(drive.isConfigured() ? 'local' : 'unconfigured')
  const [toasts, setToasts] = useState([])
  const driveOn = useRef(false)
  const saveTimer = useRef(null)
  const skipNextSave = useRef(true)

  const toast = useCallback((msg) => {
    const id = uid()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  // Fusiona local y Drive: gana el más reciente
  const mergeAndAdopt = useCallback((remote, local) => {
    if (!remote) return local
    if (!local) return remote
    const rT = Date.parse(remote.updatedAt || 0) || 0
    const lT = Date.parse(local.updatedAt || 0) || 0
    return rT >= lT ? remote : local
  }, [])

  // Reconexión silenciosa al abrir la app
  useEffect(() => {
    let cancelled = false
    async function silentConnect() {
      if (!drive.isConfigured() || !drive.wasConnected()) return
      setSyncStatus('connecting')
      try {
        await drive.getToken(false)
        const remote = await drive.loadFromDrive()
        if (cancelled) return
        const merged = mergeAndAdopt(remote && normalize(remote), dataRef.current)
        driveOn.current = true
        skipNextSave.current = true
        dispatch({ type: 'load', data: merged })
        saveLocal(merged)
        if (merged !== remote) await drive.saveToDrive(merged)
        setSyncStatus('synced')
      } catch {
        if (!cancelled) setSyncStatus('local')
      }
    }
    silentConnect()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Conexión manual (botón en Ajustes)
  const connectDrive = useCallback(async () => {
    setSyncStatus('connecting')
    try {
      await drive.getToken(true)
      const remote = await drive.loadFromDrive()
      const merged = mergeAndAdopt(remote && normalize(remote), dataRef.current)
      driveOn.current = true
      skipNextSave.current = true
      dispatch({ type: 'load', data: merged })
      saveLocal(merged)
      await drive.saveToDrive(merged)
      setSyncStatus('synced')
      toast('Conectado con Google Drive')
    } catch (e) {
      setSyncStatus('error')
      toast(`No se pudo conectar: ${e.message}`)
    }
  }, [mergeAndAdopt, toast])

  const disconnectDrive = useCallback(() => {
    drive.disconnect()
    driveOn.current = false
    setSyncStatus(drive.isConfigured() ? 'local' : 'unconfigured')
    toast('Desconectado de Drive (los datos siguen en este navegador)')
  }, [toast])

  // Persistencia en cada cambio: localStorage siempre, Drive con debounce
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    saveLocal(data)
    if (!driveOn.current) return
    setSyncStatus('syncing')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await drive.saveToDrive(data)
        setSyncStatus('synced')
      } catch {
        setSyncStatus('error')
      }
    }, 1500)
  }, [data])

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    },
    []
  )

  const exportJSON = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nucleo-backup-${todayISO()}.json`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      // Revocar de inmediato cancela la descarga en algunos navegadores.
      setTimeout(() => {
        a.remove()
        URL.revokeObjectURL(url)
      }, 0)
      dispatch({ type: 'setSettings', patch: { lastExportAt: new Date().toISOString() } })
    } catch (e) {
      toast(`No se pudo exportar: ${e.message}`)
    }
  }, [data, toast])

  const importJSON = useCallback(
    (file) => {
      const reader = new FileReader()
      reader.onerror = () => toast('No se pudo leer el fichero')
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result)
          if (!parsed || typeof parsed !== 'object' || !parsed.subjects) {
            throw new Error('no parece una copia de NÚCLEO')
          }
          dispatch({ type: 'load', data: stamp(normalize(parsed)) })
          toast('Copia importada')
        } catch (e) {
          toast(`No se pudo importar: ${e.message}`)
        }
      }
      reader.readAsText(file)
    },
    [toast]
  )

  const value = useMemo(
    () => ({
      data,
      dispatch,
      syncStatus,
      connectDrive,
      disconnectDrive,
      exportJSON,
      importJSON,
      toast,
      toasts
    }),
    [data, syncStatus, connectDrive, disconnectDrive, exportJSON, importJSON, toast, toasts]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
