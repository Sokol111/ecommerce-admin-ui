import { Code, ConnectError } from '@connectrpc/connect'

export async function rethrowConnectAuthError(event: Parameters<typeof clearAuthSession>[0], error: unknown): Promise<void> {
  const connectError = ConnectError.from(error)
  if (connectError.code === Code.Unauthenticated) {
    await clearAuthSession(event)
    throw createError({ statusCode: 401, message: 'Session expired' })
  }
  if (connectError.code === Code.PermissionDenied) {
    throw createError({ statusCode: 403, message: 'Permission denied' })
  }
}

export function rethrowHttpAuthError(error: unknown): void {
  const statusCode = (error as { statusCode?: number }).statusCode
  if (statusCode === 401 || statusCode === 403) throw error
}
