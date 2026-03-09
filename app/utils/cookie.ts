import { getCookie as getH3Cookie } from 'h3'

/**
 * Read a cookie value universally (server & client).
 *
 * Unlike `useCookie`, this performs a fresh read every call
 * without caching or hydration — so it always returns the current value.
 */
export function readCookie(name: string): string | undefined {
  if (import.meta.server) {
    const event = useRequestEvent()
    if (!event) return undefined
    return getH3Cookie(event, name)
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  )
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}
