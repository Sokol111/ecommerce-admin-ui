import type { H3Event } from 'h3'

export function useAuthToken(event: H3Event): string {
  const token = event.context.authToken
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  return token
}
