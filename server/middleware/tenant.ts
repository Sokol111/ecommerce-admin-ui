export default defineEventHandler((event) => {
  const host = getRequestHost(event, { xForwardedHost: true })
  const slug = host.split('.')[0]

  if (!slug || slug === host) {
    throw createError({ statusCode: 400, message: 'Tenant not resolved from hostname' })
  }

  event.context.tenantSlug = slug
})
