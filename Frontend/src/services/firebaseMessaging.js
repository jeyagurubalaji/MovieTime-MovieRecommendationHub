import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { notificationService } from './notificationService'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let messagingInstance = null

/**
 * Requests notification permission, registers the service worker, gets an FCM token,
 * and hands it to the backend. No-ops quietly if Firebase env vars aren't set, so the
 * app works fine without push notifications configured.
 */
export async function initPushNotifications() {
  if (!isConfigured) {
    console.info('Firebase not configured - push notifications disabled. In-app notifications still work.')
    return
  }

  try {
    const supported = await isSupported()
    if (!supported) return

    const app = initializeApp(firebaseConfig)
    messagingInstance = getMessaging(app)

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })

    if (token) {
      await notificationService.registerDeviceToken(token)
    }

    onMessage(messagingInstance, (payload) => {
      console.info('Foreground push received:', payload)
    })
  } catch (err) {
    console.warn('Push notification setup failed (non-fatal):', err)
  }
}

export const firebaseEnabled = isConfigured
