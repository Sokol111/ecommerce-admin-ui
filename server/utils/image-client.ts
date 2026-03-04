import type {
  ConfirmRequest,
  GetDeliveryUrl200,
  Image,
  PresignRequest,
  PresignResponse,
  PromoteImages200,
  PromoteRequest
} from '@sokol111/ecommerce-image-service-api'
import {
  getConfirmUploadUrl,
  getCreatePresignUrl,
  getGetDeliveryUrlUrl,
  getPromoteImagesUrl
} from '@sokol111/ecommerce-image-service-api'
import type { H3Event } from 'h3'

export function useImageClient(event: H3Event) {
  const { imageApiUrl: baseURL } = useRuntimeConfig()
  const accessToken = getCookie(event, ACCESS_TOKEN_KEY)

  function getHeaders(): HeadersInit {
    if (!accessToken) {
      throw createError({ statusCode: 401, message: 'Not authenticated' })
    }
    return { Authorization: `Bearer ${accessToken}` }
  }

  return {
    async createPresign(request: PresignRequest): Promise<PresignResponse> {
      return $fetch<PresignResponse>(getCreatePresignUrl(), {
        baseURL,
        method: 'POST',
        headers: getHeaders(),
        body: request
      })
    },

    async confirmUpload(request: ConfirmRequest): Promise<Image> {
      return $fetch<Image>(getConfirmUploadUrl(), {
        baseURL,
        method: 'POST',
        headers: getHeaders(),
        body: request
      })
    },

    async promoteImages(request: PromoteRequest): Promise<PromoteImages200> {
      return $fetch<PromoteImages200>(getPromoteImagesUrl(), {
        baseURL,
        method: 'POST',
        headers: getHeaders(),
        body: request
      })
    },

    async getDeliveryUrl(params: {
      imageId: string
      options: { w: number, quality: number }
    }): Promise<GetDeliveryUrl200> {
      return $fetch<GetDeliveryUrl200>(getGetDeliveryUrlUrl(
        params.imageId,
        { w: params.options.w, quality: params.options.quality }
      ), {
        baseURL,
        headers: getHeaders()
      })
    }
  }
}

export type ImageClient = ReturnType<typeof useImageClient>
