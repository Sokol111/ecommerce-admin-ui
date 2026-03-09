import type { AdminUserProfile } from '@sokol111/ecommerce-auth-service-api'
import { ACCESS_TOKEN_EXPIRES_AT_KEY, isTokenExpired } from '~/utils/auth/constants'
import { readCookie } from '~/utils/cookie'

export function useAuth() {
  const user = useState<AdminUserProfile | null>('auth:user', () => null)
  const isLoading = useState<boolean>('auth:loading', () => true)
  const isAuthenticated = computed(() => !!user.value)

  const getHeaders = (): HeadersInit | undefined => {
    if (import.meta.server) {
      const event = useRequestEvent()
      return event?.headers
    }
    return undefined
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      user.value = response.user
      await navigateTo('/')
      return true
    } catch {
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore - clear state anyway
    }
    user.value = null
    await navigateTo('/login')
  }

  const ensureAuthenticated = async (): Promise<boolean> => {
    const expiresAtRaw = readCookie(ACCESS_TOKEN_EXPIRES_AT_KEY)
    const tokenExpired = isTokenExpired(expiresAtRaw)

    if (user.value && !tokenExpired) {
      return true
    }

    // No cookies at all — skip the API call, we know user is not authenticated
    if (!expiresAtRaw) {
      user.value = null
      isLoading.value = false
      return false
    }

    try {
      user.value = await $fetch<AdminUserProfile>('/api/auth/session', {
        headers: getHeaders()
      })

      return true
    } catch {
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAuthenticated,
    ensureAuthenticated,
    login,
    logout
  }
}
