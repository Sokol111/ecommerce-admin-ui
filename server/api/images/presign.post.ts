import { consola } from 'consola'

const logger = consola.withTag('api:images:presign')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imageClient = useImageClient(event)

  try {
    const result = await imageClient.createPresign(body)
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
    logger.error('Failed to create presigned URL', error)
    return {
      success: false,
      error: {
        title: err.response?.data?.title || 'Failed to create presigned URL',
        detail: err.response?.data?.detail
      }
    }
  }
})
