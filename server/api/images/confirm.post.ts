export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imageClient = useImageClient(event)

  try {
    const result = await imageClient.confirmUpload(body)
    return { success: true, data: result }
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
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to confirm upload',
        detail: err.response?.data?.detail
      }
    }
  }
})
