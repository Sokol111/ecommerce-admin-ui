export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imageClient = useImageClient(event)

  console.log('[server:presign] request body:', JSON.stringify(body))

  try {
    const result = await imageClient.createPresign(body)
    console.log('[server:presign] success, uploadUrl:', result.uploadUrl)
    return { success: true, data: result }
  } catch (error: unknown) {
    console.error('[server:presign] error:', error)
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
        title: err.response?.data?.title || 'Failed to create presigned URL',
        detail: err.response?.data?.detail
      }
    }
  }
})
