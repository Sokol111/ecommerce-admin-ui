import { describe, expect, it } from 'vitest'
import { hasAdminAccess, hasApiPermission } from '../server/utils/auth-access'

const readScopes = 'products:read categories:read attributes:read'

describe('hasAdminAccess', () => {
  it.each(['super_admin', 'catalog_manager', 'viewer'])('allows tenant role %s', (role) => {
    expect(hasAdminAccess({ tenant: 'shop', role, scope: readScopes })).toBe(true)
  })

  it('rejects users without a tenant', () => {
    expect(hasAdminAccess({ role: 'super_admin', scope: readScopes })).toBe(false)
  })

  it('rejects non-admin roles', () => {
    expect(hasAdminAccess({ tenant: 'shop', role: 'platform_manager', scope: readScopes })).toBe(false)
  })

  it('rejects users without the required read scopes', () => {
    expect(hasAdminAccess({ tenant: 'shop', role: 'viewer', scope: 'products:read' })).toBe(false)
  })
})

describe('hasApiPermission', () => {
  const claims = { scope: 'products:read products:write images:write' }

  it('allows safe requests without a write scope', () => {
    expect(hasApiPermission({ scope: 'products:read' }, 'GET', '/api/catalog/products')).toBe(true)
  })

  it('allows a catalog mutation with its resource scope', () => {
    expect(hasApiPermission(claims, 'POST', '/api/catalog/products')).toBe(true)
  })

  it('rejects a delete without its resource delete scope', () => {
    expect(hasApiPermission(claims, 'DELETE', '/api/catalog/products/1')).toBe(false)
  })

  it('allows an image mutation with the image write scope', () => {
    expect(hasApiPermission(claims, 'POST', '/api/images/presign')).toBe(true)
  })
})
