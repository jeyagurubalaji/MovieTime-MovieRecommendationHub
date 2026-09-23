import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { SOURCE_LANGUAGE } from '../data/languages'

const AccessibilityContext = createContext(null)

const FONT_SCALES = { small: '14px', normal: '16px', large: '18px', 'x-large': '21px' }

function syncToBackend(payload) {
  // Only persist server-side for signed-in users; guests just get localStorage persistence.
  if (localStorage.getItem('movietime_token')) {
    api.patch('/users/me/accessibility', payload).catch(() => {})
  }
}

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrastState] = useState(() => localStorage.getItem('movietime_high_contrast') === 'true')
  const [fontScale, setFontScaleState] = useState(() => localStorage.getItem('movietime_font_scale') || 'normal')
  const [language, setLanguageState] = useState(() => localStorage.getItem('movietime_language') || SOURCE_LANGUAGE)

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal')
    localStorage.setItem('movietime_high_contrast', String(highContrast))
  }, [highContrast])

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALES[fontScale] || FONT_SCALES.normal
    localStorage.setItem('movietime_font_scale', fontScale)
  }, [fontScale])

  useEffect(() => {
    // FLORES-200 codes (e.g. 'fra_Latn') aren't valid HTML lang values on their own, but the
    // ISO 639-3 language subtag before the script suffix is - e.g. 'fra_Latn' -> 'fra'.
    document.documentElement.setAttribute('lang', language.split('_')[0].toLowerCase())
    localStorage.setItem('movietime_language', language)
  }, [language])

  const setHighContrast = (value) => {
    setHighContrastState(value)
    syncToBackend({ highContrastMode: value })
  }

  const setFontScale = (scale) => {
    setFontScaleState(scale)
    syncToBackend({ fontSizeScale: scale })
  }

  const setLanguage = (code) => {
    setLanguageState(code)
    syncToBackend({ language: code })
  }

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast, setHighContrast,
        fontScale, setFontScale,
        language, setLanguage,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => useContext(AccessibilityContext)