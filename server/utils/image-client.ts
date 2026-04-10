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
  const token = useAuthToken(event)
  const headers: HeadersInit = { Authorization: `Bearer ${token}`, ...tenantHeaders(event) }

  return {
    async createPresign(request: PresignRequest): Promise<PresignResponse> {
      return $fetch<PresignResponse>(getCreatePresignUrl(), {
        baseURL,
        method: 'POST',
        headers,
        body: request
      })
    },

    async confirmUpload(request: ConfirmRequest): Promise<Image> {
      return $fetch<Image>(getConfirmUploadUrl(), {
        baseURL,
        method: 'POST',
        headers,
        body: request
      })
    },

    async promoteImages(request: PromoteRequest): Promise<PromoteImages200> {
      return $fetch<PromoteImages200>(getPromoteImagesUrl(), {
        baseURL,
        method: 'POST',
        headers,
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
        headers
      })
    }
  }
}

export type ImageClient = ReturnType<typeof useImageClient>
