import { createClient } from '@connectrpc/connect'
import { createGrpcTransport } from '@connectrpc/connect-node'
import type {
  ConfirmUploadRequest,
  CreatePresignResponse,
  GetDeliveryUrlResponse,
  Image,
  PromoteImagesRequest,
  PromoteImagesResponse
} from '@sokol111/ecommerce-image-service-api'
import { ImageService } from '@sokol111/ecommerce-image-service-api'
import type { H3Event } from 'h3'

export async function useImageClient(event: H3Event) {
  const { imageApiUrl: baseURL } = useRuntimeConfig()
  const token = await useAuthToken(event)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...tenantHeaders(event) as Record<string, string>
  }

  const transport = createGrpcTransport({
    baseUrl: baseURL,
    interceptors: [
      (next) => (req) => {
        for (const [key, value] of Object.entries(headers)) {
          req.header.set(key, value)
        }
        return next(req)
      }
    ]
  })

  const client = createClient(ImageService, transport)

  return {
    async createPresign(request: Parameters<typeof client.createPresign>[0]): Promise<CreatePresignResponse> {
      return client.createPresign(request)
    },

    async confirmUpload(request: ConfirmUploadRequest): Promise<Image> {
      const res = await client.confirmUpload(request)
      return res.image!
    },

    async promoteImages(request: PromoteImagesRequest): Promise<PromoteImagesResponse> {
      return client.promoteImages(request)
    },

    async getDeliveryUrl(params: {
      imageId: string
      options: { w: number, quality: number }
    }): Promise<GetDeliveryUrlResponse> {
      return client.getDeliveryUrl({
        id: params.imageId,
        w: params.options.w,
        quality: params.options.quality
      })
    }
  }
}

export type ImageClient = Awaited<ReturnType<typeof useImageClient>>
