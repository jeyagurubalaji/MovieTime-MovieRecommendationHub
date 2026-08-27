import { SUPPORTED_LANGUAGES } from '../i18n/index.js'
import { useAccessibility } from '../context/AccessibilityContext.jsx'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useAccessibility()

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="Select language"
      className="icon-btn"
      style={{ width: 'auto', borderRadius: 'var(--radius-sm)', padding: '0 8px', fontSize: 13, background: 'var(--surface)' }}
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}
