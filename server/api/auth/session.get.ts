import type { AdminUserProfile } from '@sokol111/ecommerce-auth-service-api'

export default defineEventHandler(async (event): Promise<AdminUserProfile> => {
  const authClient = useAuthClient(event)
  return await authClient.getAuthenticatedProfile()
})
