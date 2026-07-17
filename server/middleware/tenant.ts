export default defineEventHandler(async (event) => {
  // Skip paths that don't need tenant context
  if (event.path === '/api/health' || event.path.startsWith('/api/auth/') || event.path.startsWith('/auth/')) return

  try {
    const token = (await getValidAuthSessionTokens(event))?.accessToken
    if (!token) return

    const claims = await verifyAccessToken(token, event)
    if (claims.tenant) event.context.tenantSlug = claims.tenant
  } catch {
    await clearAuthSession(event)
    throw createError({ statusCode: 401, message: 'Invalid session' })
  }
})
