import type { H3Event } from 'h3'

const TENANT_SLUG_HEADER = 'X-Tenant-Slug'

export function useTenantSlug(event: H3Event): string {
  const slug = event.context.tenantSlug
  if (!slug) {
    throw createError({ statusCode: 500, message: 'Tenant slug not found in context' })
  }
  return slug
}

export function tenantHeaders(event: H3Event): HeadersInit {
  return { [TENANT_SLUG_HEADER]: useTenantSlug(event) }
}
