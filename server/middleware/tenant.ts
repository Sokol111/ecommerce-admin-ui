export default defineEventHandler((event) => {
  // Skip tenant resolution for health checks (k8s probes use pod IP, no hostname)
  if (event.path === '/api/health') return

  const host = getRequestHost(event, { xForwardedHost: true })
  const slug = host.split('.')[0]

  if (!slug || slug === host) {
    throw createError({ statusCode: 400, message: 'Tenant not resolved from hostname' })
  }

  event.context.tenantSlug = slug
})
