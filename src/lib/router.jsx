// Mini-router por hash: #/, #/plan, #/asignatura/:id, #/calendario, #/agenda, #/estudio, #/ajustes
import { useEffect, useState, useCallback } from 'react'

export function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const parts = raw.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'dashboard' }
  if (parts[0] === 'plan') return { name: 'plan' }
  if (parts[0] === 'asignatura' && parts[1]) return { name: 'subject', id: parts[1] }
  if (parts[0] === 'calendario') return { name: 'calendario', day: parts[1] || null }
  if (parts[0] === 'agenda') return { name: 'agenda' }
  if (parts[0] === 'estudio') return { name: 'estudio', subjectId: parts[1] || null }
  if (parts[0] === 'ajustes') return { name: 'ajustes' }
  return { name: 'dashboard' }
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash)
  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const navigate = useCallback((path) => {
    window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`
  }, [])
  return { route, navigate }
}
