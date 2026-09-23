import { useAccessibility } from '../context/AccessibilityContext.jsx'
import { LANGUAGES } from '../data/languages'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useAccessibility()

  const handleChange = (e) => {
    const code = e.target.value
    setLanguage(code)

    // Set Google's translation cookie for the current and root domain
    const cookieVal = `/en/${code}`
    document.cookie = `googtrans=${cookieVal}; path=/;`
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`

    // Trigger the native Google Translate select element if available
    const googleSelect = document.querySelector('#google_translate_element select')
    if (googleSelect) {
      googleSelect.value = code
      googleSelect.dispatchEvent(new Event('change'))
    } else {
      // Fallback reload if the widget hasn't rendered yet
      window.location.reload()
    }
  }

  return (
    <select
      value={language}
      onChange={handleChange}
      aria-label="Select language"
      data-no-translate
      className="notranslate icon-btn"
      style={{
        width: 'auto',
        maxWidth: 160,
        borderRadius: 'var(--radius-sm)',
        padding: '0 8px',
        fontSize: 13,
        background: 'var(--surface)'
      }}
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ))}
    </select>
  )
}