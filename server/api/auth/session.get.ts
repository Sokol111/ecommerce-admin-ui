import type { AdminUserProfile } from '@sokol111/ecommerce-auth-service-api'
import { getAuthAPI } from '@sokol111/ecommerce-auth-service-api'

const api = getAuthAPI()

export default defineEventHandler(async (event): Promise<AdminUserProfile> => {
  const { authApiUrl: baseURL } = useRuntimeConfig()

  const accessToken = getCookie(event, ACCESS_TOKEN_KEY)
  const refreshToken = getCookie(event, REFRESH_TOKEN_KEY)
  const expiresAt = getCookie(event, ACCESS_TOKEN_EXPIRES_AT_KEY)

  console.log('[session] accessToken:', !!accessToken, 'refreshToken:', !!refreshToken, 'expiresAt:', expiresAt, 'isExpired:', isTokenExpired(expiresAt))

  if (!accessToken && !refreshToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  // Use current access token or obtain a new one via refresh
  let token = accessToken
  if (!token || isTokenExpired(expiresAt)) {
    try {
      console.log('[session] refreshing token...')
      const response = await api.tokenRefresh({ refreshToken: refreshToken! }, { baseURL })
      setAuthCookies(event, response.data)
      token = response.data.accessToken
      console.log('[session] refresh success')
    } catch (error) {
      console.error('[session] refresh failed:', error)
      clearAuthCookies(event)
      throw createError({ statusCode: 401, message: 'Failed to refresh token' })
    }
  }

  try {
    console.log('[session] fetching profile...')
    const response = await api.adminGetProfile({
      baseURL,
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('[session] profile success')
    return response.data
  } catch (error) {
    console.error('[session] profile failed:', error)
    throw createError({ statusCode: 401, message: 'Failed to get profile' })
  }
})
