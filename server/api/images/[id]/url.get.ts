export default defineEventHandler(async (event) => {
  const imageId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const imageClient = useImageClient(event)

  if (!imageId) {
    throw createError({ statusCode: 400, message: 'Image ID is required' })
  }

  try {
    const result = await imageClient.getDeliveryUrl({
      imageId,
      options: {
        w: query.w ? Number(query.w) : 400,
        quality: query.quality ? Number(query.quality) : 80
      }
    })
    return result
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number, data?: { detail?: string } }
    }
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.response?.data?.detail || 'Failed to get image URL'
    })
  }
})
