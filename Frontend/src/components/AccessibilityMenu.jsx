import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccessibility } from '../context/AccessibilityContext.jsx'

export default function AccessibilityMenu() {
  const { t } = useTranslation()
  const { highContrast, setHighContrast, fontScale, setFontScale } = useAccessibility()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        title={t('accessibility_title')}
        aria-label={t('accessibility_title')}
        aria-expanded={open}
      >
        ♿
      </button>

      {open && (
        <div className="card" style={{ position: 'absolute', top: 46, right: 0, width: 220, padding: 16, zIndex: 70 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{t('accessibility_title')}</div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
            {t('accessibility_high_contrast')}
          </label>

          <div style={{ fontSize: 13, marginBottom: 8 }}>{t('accessibility_font_size')}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'small', size: 11 },
              { key: 'normal', size: 14 },
              { key: 'large', size: 17 },
              { key: 'x-large', size: 20 },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFontScale(opt.key)}
                aria-label={`Font size ${opt.key}`}
                aria-pressed={fontScale === opt.key}
                className={fontScale === opt.key ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '6px 10px', fontSize: opt.size, lineHeight: 1 }}
              >
                A
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
