import { consola } from 'consola'

const logger = consola.withTag('api:catalog:products:delete')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  const catalogClient = await useCatalogClient(event)

  try {
    await catalogClient.deleteProduct(id)
    return { success: true }
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number
        data?: {
          title?: string
          detail?: string
        }
      }
    }
    logger.error('Failed to delete product', error)
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to delete product',
        detail: err.response?.data?.detail
      }
    }
  }
})
