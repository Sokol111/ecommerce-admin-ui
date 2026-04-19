export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
}

export function useAuth() {
  const { loggedIn, user: oidcUser, login: oidcLogin, logout: oidcLogout, fetch: refreshSession } = useOidcAuth()

  const user = computed<UserProfile | null>(() => {
    if (!loggedIn.value || !oidcUser.value) return null
    const claims = oidcUser.value.claims as Record<string, unknown> | undefined
    return {
      id: (claims?.sub as string) ?? '',
      email: (claims?.email as string) ?? '',
      firstName: (claims?.given_name as string) ?? '',
      lastName: (claims?.family_name as string) ?? ''
    }
  })

  const isAuthenticated = loggedIn
  const isLoading = ref(false)

  const login = async () => {
    await oidcLogin('oidc')
  }

  const logout = async () => {
    await oidcLogout('oidc')
  }

  const ensureAuthenticated = async (): Promise<boolean> => {
    if (loggedIn.value) return true
    try {
      await refreshSession()
      return loggedIn.value
    } catch {
      return false
    }
  }

  return {
    user,
    isLoading: readonly(isLoading),
    isAuthenticated,
    ensureAuthenticated,
    login,
    logout
  }
}
