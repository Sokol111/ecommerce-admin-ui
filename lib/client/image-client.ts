import {
  ConfirmRequest,
  GetDeliveryUrl200,
  getImageServiceAPI,
  Image,
  PresignRequest,
  PresignResponse,
  PromoteImages200,
  PromoteRequest,
} from '@sokol111/ecommerce-image-service-api';

const baseURL = process.env.IMAGE_API_URL;

const api = getImageServiceAPI();

export async function createPresign(request: PresignRequest): Promise<PresignResponse> {
  const response = await api.createPresign(request, { baseURL });
  return response.data;
}

export async function confirmUpload(request: ConfirmRequest): Promise<Image> {
  const response = await api.confirmUpload(request, { baseURL });
  return response.data;
}

export async function promoteImages(request: PromoteRequest): Promise<PromoteImages200> {
  const response = await api.promoteImages(request, { baseURL });
  return response.data;
}

export async function getDeliveryUrl({
  imageId,
  options,
}: {
  imageId: string;
  options: { w: number; quality: number };
}): Promise<GetDeliveryUrl200> {
  const response = await api.getDeliveryUrl(
    imageId,
    { w: options.w, quality: options.quality },
    { baseURL }
  );
  return response.data;
}
