import {
  CreateProductBody,
  GetListParams,
  getProductAPI,
  ProductListResponse,
  ProductResponse,
  UpdateProductBody,
} from '@sokol111/ecommerce-product-service-api';

const baseURL = process.env.PRODUCT_API_URL;

const api = getProductAPI();

export async function getProductById(productId: string): Promise<ProductResponse> {
  const response = await api.getProductById(productId, { baseURL });
  return response.data;
}

export async function getListProducts(
  params?: Partial<GetListParams>
): Promise<ProductListResponse> {
  const response = await api.getList(
    {
      page: params?.page ?? 1,
      size: params?.size ?? 10,
      sort: params?.sort,
      order: params?.order,
      enabled: params?.enabled,
    },
    { baseURL }
  );
  return response.data;
}

export async function createProduct(newProduct: CreateProductBody): Promise<ProductResponse> {
  const response = await api.createProduct(newProduct, { baseURL });
  return response.data;
}

export async function updateProduct(updatedProduct: UpdateProductBody): Promise<ProductResponse> {
  const response = await api.updateProduct(updatedProduct, { baseURL });
  return response.data;
}
