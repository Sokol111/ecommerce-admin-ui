import {
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  TOKEN_EXPIRY_BUFFER_MS
} from '~/utils/auth/constants'
import { readCookie } from '~/utils/cookie'

export default defineNuxtPlugin(() => {
  const { isAuthenticated, ensureAuthenticated } = useAuth()

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const scheduleRefresh = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    const raw = readCookie(ACCESS_TOKEN_EXPIRES_AT_KEY)
    const expiresAt = raw ? parseInt(raw, 10) : null
    if (!isAuthenticated.value || !expiresAt || Number.isNaN(expiresAt)) {
      return
    }

    const refreshAt = Math.max(0, expiresAt - TOKEN_EXPIRY_BUFFER_MS - Date.now())

    timeoutId = setTimeout(async () => {
      await ensureAuthenticated()
      scheduleRefresh()
    }, refreshAt)
  }

  watch(isAuthenticated, () => scheduleRefresh(), { immediate: true })
})
