import type { AdminUserProfile } from '@sokol111/ecommerce-auth-service-api'
import { consola } from 'consola'

const logger = consola.withTag('api:auth:login')

export interface LoginResponse {
  user: AdminUserProfile
  expiresIn: number
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body = await readBody<{ email: string, password: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  const authClient = useAuthClient(event)

  try {
    const response = await authClient.login({
      email: body.email,
      password: body.password
    })

    setAuthCookies(event, response)

    return {
      user: response.user,
      expiresIn: response.expiresIn
    }
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    logger.error(`Login failed for ${body.email}`, error)
    throw createError({
      statusCode: err.response?.status || 401,
      message: err.response?.data?.detail || 'Invalid email or password'
    })
  }
})
