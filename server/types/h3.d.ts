declare module 'h3' {
  interface H3EventContext {
    authClaims?: import('../utils/auth-claims').AccessTokenClaims
    tenantSlug?: string
  }
}

export { }
