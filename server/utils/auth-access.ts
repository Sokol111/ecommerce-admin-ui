export const ADMIN_ROLES = new Set(['super_admin', 'catalog_manager', 'viewer'])

export interface AdminAccessClaims {
  role?: string
  tenant?: string
  scope?: string
}

export function hasAdminAccess(claims: AdminAccessClaims): boolean {
  if (!claims.tenant || !claims.role || !ADMIN_ROLES.has(claims.role)) return false

  const scopes = new Set(claims.scope?.split(' ').filter(Boolean))
  return scopes.has('products:read')
    && scopes.has('categories:read')
    && scopes.has('attributes:read')
}

export function hasApiPermission(claims: AdminAccessClaims, method: string, path: string): boolean {
  const action = ({ DELETE: 'delete', PATCH: 'write', POST: 'write', PUT: 'write' } as Record<string, string>)[method]
  if (!action) return true
  if (!path.startsWith('/api/catalog/') && !path.startsWith('/api/images/')) return true

  const resource = path.startsWith('/api/images/') ? 'images' : path.split('/')[3]
  return new Set(claims.scope?.split(' ').filter(Boolean)).has(`${resource}:${action}`)
}
