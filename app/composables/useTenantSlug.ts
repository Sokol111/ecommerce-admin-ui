export function useTenantSlug() {
  return useState<string | null>('tenantSlug', () => {
    if (import.meta.server) {
      const event = useRequestEvent()
      return (event?.context.tenantSlug as string) ?? null
    }
    return null
  })
}
