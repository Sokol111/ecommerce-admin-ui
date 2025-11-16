import {
  Configuration,
  ConfirmRequest,
  DefaultApi,
  Image,
  PresignRequest,
  PresignResponse,
  PromoteImages200Response,
  PromoteRequest,
} from '@sokol111/ecommerce-image-service-api';
import { createTracedHttpClient } from './http-client';

const basePath = process.env.IMAGE_API_URL;

const httpClient = createTracedHttpClient();

const api = new DefaultApi(new Configuration({ basePath }), basePath, httpClient);

export async function createPresign(request: PresignRequest): Promise<PresignResponse> {
  const response = await api.createPresign({ presignRequest: request });
  return response.data;
}

export async function confirmUpload(request: ConfirmRequest): Promise<Image> {
  const response = await api.confirmUpload({ confirmRequest: request });
  return response.data;
}

export async function promoteImages(request: PromoteRequest): Promise<PromoteImages200Response> {
  const response = await api.promoteImages({ promoteRequest: request });
  return response.data;
}

export async function getDeliveryUrl({
  imageId,
  options,
}: {
  imageId: string;
  options: { w: number; quality: number };
}): Promise<{ url: string; expiresAt?: string }> {
  const response = await api.getDeliveryUrl({
    id: imageId,
    w: options.w,
    quality: options.quality,
  });
  return response.data;
}

// export function transformProductResponse(response: ProductResponse): Product {
//   return {
//     id: response.id,
//     name: response.name,
//     price: response.price,
//     quantity: response.quantity,
//     version: response.version,
//     enabled: response.enabled,
//     createdAt: response.createdAt,
//     modifiedAt: response.modifiedAt,
//   };
// }
