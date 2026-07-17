export default defineEventHandler(async (event) => {
  // Skip paths that don't need tenant context
  if (event.path === '/api/health' || event.path.startsWith('/api/auth/') || event.path.startsWith('/auth/')) return

  let claims: AccessTokenClaims
  try {
    const token = (await getValidAuthSessionTokens(event))?.accessToken
    if (!token) return

    claims = await verifyAccessToken(token, event)
    event.context.authClaims = claims
    if (claims.tenant) event.context.tenantSlug = claims.tenant
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 401 || statusCode === 403) await clearAuthSession(event)
    throw error
  }

  if (!hasApiPermission(claims, event.method, event.path)) {
    throw createError({ statusCode: 403, message: 'Missing required permission' })
  }
})
