import {
  Configuration,
  CreateProductRequest,
  DefaultApi,
  DefaultApiGetListRequest,
  ProductListResponse,
  ProductResponse,
  UpdateProductRequest,
} from '@sokol111/ecommerce-product-service-api';
import { createHttpClient } from './http-client';

const basePath = process.env.PRODUCT_API_URL;

const httpClient = createHttpClient();

const api = new DefaultApi(new Configuration({ basePath }), basePath, httpClient);

export async function getProductById(productId: string): Promise<ProductResponse> {
  const response = await api.getProductById({ id: productId });
  return response.data;
}

export async function getListProducts(
  params?: Partial<DefaultApiGetListRequest>
): Promise<ProductListResponse> {
  const response = await api.getList({
    page: params?.page ?? 1,
    size: params?.size ?? 10,
    sort: params?.sort,
    order: params?.order,
    enabled: params?.enabled,
  });
  return response.data;
}

export async function createProduct(newProduct: CreateProductRequest): Promise<ProductResponse> {
  const response = await api.createProduct({
    createProductRequest: newProduct,
  });
  return response.data;
}

export async function updateProduct(
  updatedProduct: UpdateProductRequest
): Promise<ProductResponse> {
  const response = await api.updateProduct({
    updateProductRequest: updatedProduct,
  });
  return response.data;
}
