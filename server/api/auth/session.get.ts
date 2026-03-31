import type { AdminUserProfile } from '@sokol111/ecommerce-auth-service-api'
import { consola } from 'consola'

const logger = consola.withTag('api:auth:session')

export default defineEventHandler(async (event): Promise<AdminUserProfile> => {
  const authClient = useAuthClient(event)

  try {
    return await authClient.getAuthenticatedProfile()
  } catch (error: unknown) {
    logger.error('Failed to fetch authenticated profile', error)
    throw error
  }
})
