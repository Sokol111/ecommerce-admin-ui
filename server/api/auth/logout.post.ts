import { consola } from 'consola'

const logger = consola.withTag('api:auth:logout')

export default defineEventHandler(async (event): Promise<void> => {
  const authClient = useAuthClient(event)

  try {
    await authClient.logout()
  } catch (error: unknown) {
    logger.warn('Logout request failed, clearing cookies anyway', error)
  }

  clearAuthCookies(event)
})
