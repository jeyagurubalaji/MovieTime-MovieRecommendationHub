import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com'

export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const divRef = useRef(null)

  useEffect(() => {
    const scriptId = 'google-identity-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogle
      document.body.appendChild(script)
    } else {
      initGoogle()
    }

    function initGoogle() {
      if (!window.google || !divRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential)
            navigate('/')
          } catch (err) {
            onError?.(err.response?.data?.message || 'Google sign-in failed. Please try again.')
          }
        },
      })
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 340,
        text: 'continue_with',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={divRef} style={{ display: 'flex', justifyContent: 'center' }} />
}
