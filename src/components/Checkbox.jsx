import React from 'react'
import { IconCheck } from './Icons.jsx'

export default function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`checkbox${checked ? ' checked' : ''}`}
      aria-checked={checked}
      role="checkbox"
      aria-label={label || 'Completado'}
      title={label || 'Completado'}
      onClick={onChange}
    >
      <IconCheck aria-hidden="true" />
    </button>
  )
}
