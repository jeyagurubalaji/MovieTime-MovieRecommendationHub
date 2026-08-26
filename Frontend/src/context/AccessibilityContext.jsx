import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

const AccessibilityContext = createContext(null)

const FONT_SCALES = { small: '14px', normal: '16px', large: '18px', 'x-large': '21px' }

function syncToBackend(payload) {
  // Only persist server-side for signed-in users; guests just get localStorage persistence.
  if (localStorage.getItem('movietime_token')) {
    api.patch('/users/me/accessibility', payload).catch(() => {})
  }
}

export function AccessibilityProvider({ children }) {
  const { i18n } = useTranslation()
  const [highContrast, setHighContrastState] = useState(() => localStorage.getItem('movietime_high_contrast') === 'true')
  const [fontScale, setFontScaleState] = useState(() => localStorage.getItem('movietime_font_scale') || 'normal')

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal')
    localStorage.setItem('movietime_high_contrast', String(highContrast))
  }, [highContrast])

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALES[fontScale] || FONT_SCALES.normal
    localStorage.setItem('movietime_font_scale', fontScale)
  }, [fontScale])

  const setHighContrast = (value) => {
    setHighContrastState(value)
    syncToBackend({ highContrastMode: value })
  }

  const setFontScale = (scale) => {
    setFontScaleState(scale)
    syncToBackend({ fontSizeScale: scale })
  }

  const setLanguage = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('movietime_language', code)
    syncToBackend({ language: code })
  }

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast, setHighContrast,
        fontScale, setFontScale,
        language: i18n.language, setLanguage,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => useContext(AccessibilityContext)
