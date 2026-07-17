import { describe, expect, it } from 'vitest'
import { hasAdminAccess } from '../server/utils/auth-access'

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
