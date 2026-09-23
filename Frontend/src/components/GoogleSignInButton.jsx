import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useAccessibility } from '../context/AccessibilityContext.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth()
  const { language } = useAccessibility()
  const navigate = useNavigate()
  const divRef = useRef(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is missing in your .env file')
      return
    }

    const scriptId = 'google-identity-script'

    const renderGoogleBtn = () => {
      if (!window.google?.accounts?.id || !divRef.current) return

      if (!isInitialized.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          locale: language || 'en',
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential)
              navigate('/')
            } catch (err) {
              console.error('Google Auth Backend Error:', err.response?.data || err.message)
              onError?.(err.response?.data?.message || 'Google sign-in failed. Please try again.')
            }
          },
        })
        isInitialized.current = true
      }

      divRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 340,
        text: 'continue_with',
      })
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = renderGoogleBtn
      document.body.appendChild(script)
    } else {
      renderGoogleBtn()
    }
  }, [language, loginWithGoogle, navigate, onError])

  return <div ref={divRef} style={{ display: 'flex', justifyContent: 'center' }} />
}