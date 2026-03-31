import { consola } from 'consola'

const logger = consola.withTag('api:catalog:categories:update')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const catalogClient = useCatalogClient(event)

  try {
    const result = await catalogClient.updateCategory(body)
    return { success: true, data: result }
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number
        data?: {
          title?: string
          detail?: string
          fields?: Record<string, string>
        }
      }
    }
    logger.error('Failed to update category', error)
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to update category',
        detail: err.response?.data?.detail,
        fields: err.response?.data?.fields
      }
    }
  }
})
