import type { H3Event } from 'h3'

export async function useAuthToken(event: H3Event): Promise<string> {
  try {
    const token = (await getValidAuthSessionTokens(event))?.accessToken
    if (token) return token
  } catch {
    await clearAuthSession(event)
    throw createError({ statusCode: 401, message: 'Session expired' })
  }

  await clearAuthSession(event)
  throw createError({ statusCode: 401, message: 'Not authenticated' })
}
