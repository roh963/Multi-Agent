import api from './axiosInstance.js'

/** POST /auth/signup */
export const signup = async ({ email, password, name }) => {
  const { data } = await api.post('/auth/signup', { email, password, name })
  return data // { access_token, token_type, user }
}

/** POST /auth/login */
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

/** GET /auth/google/login → backend redirect karta hai Google pe */
export const getGoogleLoginUrl = () => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  return `${base}/auth/google/login`
}

/** GET /users/me */
export const getMe = async () => {
  const { data } = await api.get('/users/me')
  return data
}
