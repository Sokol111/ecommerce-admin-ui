import { getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'

export default defineEventHandler(async (event) => {
  // Skip paths that don't need tenant context
  if (event.path === '/api/health' || event.path.startsWith('/auth/')) return

  const session = await getUserSession(event).catch(() => null)
  const token = session?.accessToken as string | undefined
  if (!token) return

  // Decode JWT payload (access token is a signed JWT with a `tenant` claim)
  const payload = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64url').toString())
  const slug = payload.tenant as string | undefined

  if (slug) {
    event.context.tenantSlug = slug
  }
})
