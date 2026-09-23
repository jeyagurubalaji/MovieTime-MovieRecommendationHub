import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),

  login: (data) => api.post('/auth/login', data).then((r) => r.data),

  loginWithGoogle: (idToken) => api.post('/auth/google', { idToken }).then((r) => r.data),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),

  getCurrentUser: () => api.get('/users/me').then((r) => r.data),

  updateTheme: (darkMode) => api.patch('/users/me/theme', { darkMode }).then((r) => r.data),
}
