import type {
    AdminAuthResponse,
    AdminUserProfile,
    LoginRequest
} from '@sokol111/ecommerce-auth-service-api'
import {
    getAdminGetProfileUrl,
    getAdminLoginUrl,
    getAdminLogoutUrl
} from '@sokol111/ecommerce-auth-service-api'
import type { H3Event } from 'h3'

export function useAuthClient(event: H3Event) {
  const { authApiUrl: baseURL } = useRuntimeConfig()
  const tenant = tenantHeaders(event)

  return {
    async login(credentials: LoginRequest): Promise<AdminAuthResponse> {
      return $fetch<AdminAuthResponse>(getAdminLoginUrl(), {
        baseURL,
        method: 'POST',
        headers: { ...tenant },
        body: credentials
      })
    },

    async logout(): Promise<void> {
      const token = useAuthToken(event)
      await $fetch(getAdminLogoutUrl(), {
        baseURL,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, ...tenant }
      })
    },

    async getAuthenticatedProfile(): Promise<AdminUserProfile> {
      const token = useAuthToken(event)
      try {
        const profile = await $fetch<AdminUserProfile>(getAdminGetProfileUrl(), {
          baseURL,
          headers: { Authorization: `Bearer ${token}`, ...tenant }
        })
        return profile
      } catch {
        clearAuthCookies(event)
        throw createError({ statusCode: 401, message: 'Failed to get profile' })
      }
    }
  }
}

export type AuthClient = ReturnType<typeof useAuthClient>
