export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imageClient = useImageClient(event)

  console.log('[server:confirm] request body:', JSON.stringify({ ...body, uploadToken: body.uploadToken?.substring(0, 20) + '...' }))

  try {
    const result = await imageClient.confirmUpload(body)
    console.log('[server:confirm] success, imageId:', result.id)
    return { success: true, data: result }
  } catch (error: unknown) {
    console.error('[server:confirm] error:', error)
    const err = error as {
      response?: {
        status?: number
        data?: {
          title?: string
          detail?: string
        }
      }
    }
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to confirm upload',
        detail: err.response?.data?.detail
      }
    }
  }
})
