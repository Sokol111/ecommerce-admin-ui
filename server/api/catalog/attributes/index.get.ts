import type { GetAttributeListSort } from '@sokol111/ecommerce-catalog-service-api'
import { consola } from 'consola'

const logger = consola.withTag('api:catalog:attributes')

export default defineEventHandler(async (event) => {
  const catalogClient = await useCatalogClient(event)
  const query = getQuery(event)

  try {
    const result = await catalogClient.getAttributeList({
      page: query.page ? Number(query.page) : 1,
      size: query.size ? Number(query.size) : 100, // Get all attributes for select
      sort: query.sort as GetAttributeListSort | undefined,
      order: query.order as 'asc' | 'desc' | undefined,
      enabled:
        query.enabled === 'true'
          ? true
          : query.enabled === 'false'
            ? false
            : undefined
    })

    return result
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    logger.error('Failed to fetch attributes', error)
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to fetch attributes'
    })
  }
})
