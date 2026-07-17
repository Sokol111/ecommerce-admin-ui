export default defineEventHandler(async (event) => {
  const origin = getHeader(event, 'origin')
  const requestUrl = getRequestURL(event)
  if (origin !== requestUrl.origin) {
    throw createError({ statusCode: 403, message: 'Cross-origin logout is not allowed' })
  }

  const { oidcLogoutRedirectUrl, oidcLogoutUrl } = useRuntimeConfig(event)
  const idToken = (await getAuthSessionTokens(event))?.idToken
  await clearAuthSession(event)

  if (!oidcLogoutUrl) return { redirectUrl: oidcLogoutRedirectUrl || '/' }

  const logoutUrl = new URL(oidcLogoutUrl)
  logoutUrl.searchParams.set('post_logout_redirect_uri', oidcLogoutRedirectUrl)
  if (idToken) logoutUrl.searchParams.set('id_token_hint', idToken)
  return { redirectUrl: logoutUrl.toString() }
})
