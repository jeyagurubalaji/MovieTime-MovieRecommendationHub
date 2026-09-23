import { useEffect, useState } from 'react'
import { subscribeTranslationStatus } from './NllbTranslate.jsx'

export default function TranslationStatus() {
  const [status, setStatus] = useState({ loading: false, error: null })

  useEffect(() => subscribeTranslationStatus(setStatus), [])

  if (!status.loading && !status.error) return null

  return (
    <div
      role="status"
      aria-live="polite"
      data-no-translate
      style={{
        position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
        background: status.error ? 'var(--ticket-red)' : 'var(--gold)',
        color: status.error ? '#fff' : '#14161F',
        padding: '8px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      }}
    >
      {status.loading ? 'Translating page…' : status.error}
    </div>
  )
}
