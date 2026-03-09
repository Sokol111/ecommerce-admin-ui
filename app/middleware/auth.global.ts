export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/api/')) {
    return
  }

  if (to.meta.auth === false) {
    return
  }

  const { ensureAuthenticated } = useAuth()
  const isAuthenticated = await ensureAuthenticated()

  if (!isAuthenticated) {
    return navigateTo('/login')
  }
})
