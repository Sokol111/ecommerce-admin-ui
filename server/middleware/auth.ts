import type { TokenRefreshResponse } from '@sokol111/ecommerce-auth-service-api'
import { getTokenRefreshUrl } from '@sokol111/ecommerce-auth-service-api'

const PUBLIC_ROUTES = ['/api/auth/login', '/api/health']

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }
  if (PUBLIC_ROUTES.includes(event.path) || event.path.startsWith('/api/_nuxt_icon/')) {
    return
  }

  const accessToken = getCookie(event, ACCESS_TOKEN_KEY)
  const expiresAt = getCookie(event, ACCESS_TOKEN_EXPIRES_AT_KEY)

  if (accessToken && !isTokenExpired(expiresAt)) {
    event.context.authToken = accessToken
    return
  }

  const refreshToken = getCookie(event, REFRESH_TOKEN_KEY)

  if (!refreshToken) {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const { authApiUrl: baseURL } = useRuntimeConfig()
  try {
    const data = await $fetch<TokenRefreshResponse>(getTokenRefreshUrl(), {
      baseURL,
      method: 'POST',
      body: { refreshToken }
    })
    setAuthCookies(event, data)
    event.context.authToken = data.accessToken
  } catch {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, message: 'Failed to refresh token' })
  }
})
