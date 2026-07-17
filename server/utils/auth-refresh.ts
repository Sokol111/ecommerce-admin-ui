import type { H3Event } from 'h3'

interface RefreshTokenResponse {
  access_token: string
  expires_in: number
  id_token?: string
  refresh_token?: string
}

const refreshes = new Map<string, Promise<AuthSessionTokens>>()

async function refreshAuthSession(event: H3Event, tokens: AuthSessionTokens): Promise<AuthSessionTokens> {
  const config = useRuntimeConfig(event)
  const { clientId, clientSecret, openidConfig } = config.oauth.oidc
  const tokenEndpoint = typeof openidConfig === 'object' ? openidConfig.token_endpoint : undefined
  if (!tokens.refreshToken || !clientId || !clientSecret || !tokenEndpoint) {
    throw createError({ statusCode: 401, message: 'Session expired' })
  }

  const response = await $fetch<RefreshTokenResponse>(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      resource: config.apiResourceIndicator
    }).toString()
  })

  const claims = await verifyAccessToken(response.access_token, event)
  if (!hasAdminAccess(claims)) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const refreshed: AuthSessionTokens = {
    accessToken: response.access_token,
    accessTokenExpiresAt: claims.exp,
    idToken: response.id_token ?? tokens.idToken,
    refreshToken: response.refresh_token ?? tokens.refreshToken
  }
  return refreshed
}

export async function getValidAuthSessionTokens(event: H3Event): Promise<AuthSessionTokens | null> {
  const tokens = await getAuthSessionTokens(event)
  if (!tokens) return null

  const now = Math.trunc(Date.now() / 1000)
  if (tokens.accessTokenExpiresAt && tokens.accessTokenExpiresAt > now + 30) return tokens

  const key = tokens.refreshToken
  if (!key) return null

  let refresh = refreshes.get(key)
  if (!refresh) {
    refresh = refreshAuthSession(event, tokens).finally(() => refreshes.delete(key))
    refreshes.set(key, refresh)
  }
  const refreshed = await refresh
  await setUserSession(event, { secure: refreshed })
  return refreshed
}
