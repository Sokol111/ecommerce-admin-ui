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
