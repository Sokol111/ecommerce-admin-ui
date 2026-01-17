import {
  AttributeListResponse,
  AttributeResponse,
  CreateAttributeBody,
  getAttributeAPI,
  GetAttributeListParams,
  UpdateAttributeBody,
} from '@sokol111/ecommerce-attribute-service-api';

const baseURL = process.env.ATTRIBUTE_API_URL;
const api = getAttributeAPI();

export async function getAttributeById(attributeId: string): Promise<AttributeResponse> {
  const response = await api.getAttributeById(attributeId, { baseURL });
  return response.data;
}

export async function getAttributeList(
  params?: Partial<GetAttributeListParams>
): Promise<AttributeListResponse> {
  const response = await api.getAttributeList(
    {
      page: params?.page ?? 1,
      size: params?.size ?? 10,
      sort: params?.sort,
      order: params?.order,
      enabled: params?.enabled,
      type: params?.type,
    },
    { baseURL }
  );
  return response.data;
}

export async function createAttribute(
  newAttribute: CreateAttributeBody
): Promise<AttributeResponse> {
  const response = await api.createAttribute(newAttribute, { baseURL });
  return response.data;
}

export async function updateAttribute(
  updatedAttribute: UpdateAttributeBody
): Promise<AttributeResponse> {
  const response = await api.updateAttribute(updatedAttribute, { baseURL });
  return response.data;
}

export async function deleteAttribute(attributeId: string): Promise<void> {
  await api.deleteAttribute(attributeId, { baseURL });
}
