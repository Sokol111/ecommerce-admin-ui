import { consola } from 'consola'

const logger = consola.withTag('api:catalog:products:[id]')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required'
    })
  }

  const catalogClient = useCatalogClient(event)

  try {
    const result = await catalogClient.getProductById(id)
    return result
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    logger.error(`Failed to fetch product ${id}`, error)
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to fetch product'
    })
  }
})
