import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { http } from '@/services/http'
import type { components } from '@/types/api'

type UserDto = components['schemas']['UserDto']
type SignUpDto = components['schemas']['SignUpDto']
type SignInDto = components['schemas']['SignInDto']
type AccessTokenDto = components['schemas']['AccessTokenDto']

export type Role = 'student' | 'enterprise'

export const STORAGE_KEY = 'normal_user'
const STORAGE_KEY_ACCESS_TOKEN = `${STORAGE_KEY}_access_token`
const STORAGE_KEY_REFRESH_TOKEN = `${STORAGE_KEY}_refresh_token`
const STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN = `${STORAGE_KEY}_access_token_expires_in`
const STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN = `${STORAGE_KEY}_refresh_token_expires_in`

export const useAuthStore = defineStore('auth', () => {
  const userStored = localStorage.getItem(STORAGE_KEY)
  const accessTokenStored = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN)
  const refreshTokenStored = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN)
  const accessTokenExpiresInStored = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN)
  const refreshTokenExpiresInStored = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN)

  const loggedUser = ref<UserDto | null>(userStored ? JSON.parse(userStored) : null)
  const accessToken = ref<string | null>(accessTokenStored)
  const refreshToken = ref<string | null>(refreshTokenStored)
  const accessTokenExpiresIn = ref<number | null>(
    accessTokenExpiresInStored ? parseInt(accessTokenExpiresInStored) : null,
  )
  const refreshTokenExpiresIn = ref<number | null>(
    refreshTokenExpiresInStored ? parseInt(refreshTokenExpiresInStored) : null,
  )

  watch(
    loggedUser,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      else localStorage.removeItem(STORAGE_KEY)
    },
    { immediate: true },
  )

  watch(
    accessToken,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, val)
      else localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN)
    },
    { immediate: true },
  )

  watch(
    refreshToken,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, val)
      else localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN)
    },
    { immediate: true },
  )

  watch(
    accessTokenExpiresIn,
    (val) => {
      if (val) {
        localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN, val.toString())
      } else localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN)
    },
    { immediate: true },
  )

  watch(
    refreshTokenExpiresIn,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN, val.toString())
      else localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN)
    },
    { immediate: true },
  )

  const isLoggedIn = computed(() => !!loggedUser.value)
  const isAdmin = computed(() => loggedUser.value?.role === 'admin')
  const isStudent = computed(() => loggedUser.value?.role === 'student')
  const isEnterprise = computed(() => loggedUser.value?.role === 'enterprise')

  const signIn = async (signInDto: SignInDto): Promise<AccessTokenDto> => {
    const { data } = await http.post(`/auth/sign-in`, signInDto)
    populateStateFromResponse(data)
    return data
  }

  const signUp = async (signUpDto: SignUpDto, role: Role): Promise<AccessTokenDto> => {
    const { data } = await http.post(`/auth/${role}/sign-up`, signUpDto)
    populateStateFromResponse(data)
    return data
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value || Date.now() < (accessTokenExpiresIn.value ?? 0)) return false
    try {
      const { data } = await http.post('/auth/refresh', { refreshToken: refreshToken.value })
      console.log('Access token refreshed successfully')
      populateStateFromResponse(data)
      return true
    } catch {
      logout()
      return false
    }
  }

  const populateStateFromResponse = (data: AccessTokenDto) => {
    loggedUser.value = data.user ?? loggedUser.value
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token ?? refreshToken.value
    accessTokenExpiresIn.value = Date.now() + data.access_token_expires_in * 1000
    refreshTokenExpiresIn.value = Date.now() + data.refresh_token_expires_in * 1000
    setAuthorizationInterceptor()
  }

  let refreshTimerId: number | undefined = undefined

  const scheduleRefresh = () => {
    if (!accessTokenExpiresIn.value) return
    const delay = accessTokenExpiresIn.value - Date.now() - 30_000
    if (delay <= 0) return refreshAccessToken()

    if (refreshTimerId) {
      clearTimeout(refreshTimerId)
      refreshTimerId = undefined
    }

    refreshTimerId = setTimeout(refreshAccessToken, delay)
  }

  watch(accessTokenExpiresIn, scheduleRefresh, { immediate: true })

  const setAuthorizationInterceptor = () => {
    http.interceptors.response.use(
      (r) => r,
      async (err) => {
        const original = err.config
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true
          console.log('Refreshing access token... (401 error)')
          const ok = await refreshAccessToken()
          console.log('Access token refreshed:', ok)
          if (ok) {
            original.headers.Authorization = `Bearer ${accessToken.value}`
            return http(original)
          }
        }
        return Promise.reject(err)
      },
    )
  }

  setAuthorizationInterceptor()

  const logout = () => {
    loggedUser.value = null
    accessToken.value = null
    refreshToken.value = null
    accessTokenExpiresIn.value = null
    refreshTokenExpiresIn.value = null
  }

  return {
    loggedUser,
    isLoggedIn,
    isAdmin,
    isStudent,
    isEnterprise,
    signIn,
    signUp,
    logout,
  }
})
