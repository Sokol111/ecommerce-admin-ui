import type { GetProductListSort } from '@sokol111/ecommerce-catalog-service-api'

export default defineEventHandler(async (event) => {
  const catalogClient = useCatalogClient(event)
  const query = getQuery(event)

  try {
    const result = await catalogClient.getProductList({
      page: query.page ? Number(query.page) : undefined,
      size: query.size ? Number(query.size) : undefined,
      sort: query.sort as GetProductListSort | undefined,
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
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to fetch products'
    })
  }
})
