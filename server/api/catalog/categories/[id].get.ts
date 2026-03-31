import { consola } from 'consola'

const logger = consola.withTag('api:catalog:categories:[id]')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Category ID is required'
    })
  }

  const catalogClient = useCatalogClient(event)

  try {
    const result = await catalogClient.getCategoryById(id)
    return result
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    logger.error(`Failed to fetch category ${id}`, error)
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to fetch category'
    })
  }
})
