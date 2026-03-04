import type {
  AdminAuthResponse,
  AdminUserProfile,
  LoginRequest,
  TokenRefreshResponse
} from '@sokol111/ecommerce-auth-service-api'
import {
  getAdminGetProfileUrl,
  getAdminLoginUrl,
  getAdminLogoutUrl,
  getTokenRefreshUrl
} from '@sokol111/ecommerce-auth-service-api'
import type { H3Event } from 'h3'

export function useAuthClient(event: H3Event) {
  const { authApiUrl: baseURL } = useRuntimeConfig()
  const accessToken = getCookie(event, ACCESS_TOKEN_KEY)
  const refreshTokenValue = getCookie(event, REFRESH_TOKEN_KEY)

  function getAuthHeaders(): HeadersInit {
    if (!accessToken) {
      throw createError({ statusCode: 401, message: 'Not authenticated' })
    }
    return { Authorization: `Bearer ${accessToken}` }
  }

  return {
    async login(credentials: LoginRequest): Promise<AdminAuthResponse> {
      return $fetch<AdminAuthResponse>(getAdminLoginUrl(), {
        baseURL,
        method: 'POST',
        body: credentials
      })
    },

    async getProfile(): Promise<AdminUserProfile> {
      return $fetch<AdminUserProfile>(getAdminGetProfileUrl(), {
        baseURL,
        headers: getAuthHeaders()
      })
    },

    async refreshToken(): Promise<TokenRefreshResponse> {
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }
      return $fetch<TokenRefreshResponse>(getTokenRefreshUrl(), {
        baseURL,
        method: 'POST',
        body: { refreshToken: refreshTokenValue }
      })
    },

    async logout(): Promise<void> {
      await $fetch(getAdminLogoutUrl(), {
        baseURL,
        method: 'POST',
        headers: getAuthHeaders()
      })
    }
  }
}

export type AuthClient = ReturnType<typeof useAuthClient>
