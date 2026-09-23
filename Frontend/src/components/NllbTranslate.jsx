import { useEffect } from 'react'

export function subscribeTranslationStatus(callback) {
  // Returns a no-op unsubscriber to maintain backward compatibility
  return () => {}
}

export function setNllbTranslateLanguage(code) {
  // Handled directly via LanguageSwitcher and Google's script
}

export function restoreNllbTranslateLanguage() {}

export function getCurrentNllbLanguage() {
  return 'en'
}

export default function NllbTranslate() {
  useEffect(() => {
    // Ensure all internal elements not requiring translation carry the 'notranslate' class
    document.querySelectorAll('[data-no-translate]').forEach((el) => {
      el.classList.add('notranslate')
    })
  }, [])

  return null
}