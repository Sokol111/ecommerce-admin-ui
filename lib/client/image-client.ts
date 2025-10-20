import {
  Configuration,
  ConfirmRequest,
  DefaultApi,
  Image,
  PresignRequest,
  PresignResponse,
  PromoteRequest
} from '@sokol111/ecommerce-image-service-api';

const basePath = process.env.IMAGE_API_URL;

const api = new DefaultApi(new Configuration({ basePath }));

export async function createPresign(request: PresignRequest): Promise<PresignResponse> {
  const response = await api.createPresign({ presignRequest: request });
  return response.data
}

export async function confirmUpload(request: ConfirmRequest): Promise<Image> {
  const response = await api.confirmUpload({ confirmRequest: request });
  return response.data
}

export async function promoteImages(request: PromoteRequest): Promise<Image> {
  const response = await api.promoteImages({ promoteRequest: request });
  return response.data
}

export async function getDeliveryUrl({ imageId, options }: { imageId: string; options: { w: number; quality: number; }; }): Promise<string> {
  const response = await api.getDeliveryUrl({ id: imageId, w: options.w, quality: options.quality });
  return response.data.url;
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
