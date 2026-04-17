import type { H3Event } from 'h3'
import { getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'

export async function useAuthToken(event: H3Event): Promise<string> {
  const session = await getUserSession(event)
  const token = session?.accessToken
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  return token as string
}
