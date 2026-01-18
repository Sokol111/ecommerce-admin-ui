import {
  AttributeListResponse,
  AttributeResponse,
  CategoryListResponse,
  CategoryResponse,
  CreateAttributeRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  GetAttributeListParams,
  getCatalogAPI,
  GetCategoryListParams,
  GetProductListParams,
  ProductListResponse,
  ProductResponse,
  UpdateAttributeRequest,
  UpdateCategoryRequest,
  UpdateProductRequest,
} from '@sokol111/ecommerce-catalog-service-api';

const baseURL = process.env.CATALOG_API_URL;
const api = getCatalogAPI();

// ==================== PRODUCTS ====================

export async function getProductById(productId: string): Promise<ProductResponse> {
  const response = await api.getProductById(productId, { baseURL });
  return response.data;
}

export async function getProductList(
  params?: Partial<GetProductListParams>
): Promise<ProductListResponse> {
  const response = await api.getProductList(
    {
      page: params?.page ?? 1,
      size: params?.size ?? 10,
      sort: params?.sort,
      order: params?.order,
      enabled: params?.enabled,
      categoryId: params?.categoryId,
    },
    { baseURL }
  );
  return response.data;
}

export async function createProduct(newProduct: CreateProductRequest): Promise<ProductResponse> {
  const response = await api.createProduct(newProduct, { baseURL });
  return response.data;
}

export async function updateProduct(
  updatedProduct: UpdateProductRequest
): Promise<ProductResponse> {
  const response = await api.updateProduct(updatedProduct, { baseURL });
  return response.data;
}

// ==================== CATEGORIES ====================

export async function getCategoryById(categoryId: string): Promise<CategoryResponse> {
  const response = await api.getCategoryById(categoryId, { baseURL });
  return response.data;
}

export async function getCategoryList(
  params?: Partial<GetCategoryListParams>
): Promise<CategoryListResponse> {
  const response = await api.getCategoryList(
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

export async function createCategory(
  newCategory: CreateCategoryRequest
): Promise<CategoryResponse> {
  const response = await api.createCategory(newCategory, { baseURL });
  return response.data;
}

export async function updateCategory(
  updatedCategory: UpdateCategoryRequest
): Promise<CategoryResponse> {
  const response = await api.updateCategory(updatedCategory, { baseURL });
  return response.data;
}

// ==================== ATTRIBUTES ====================

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
  newAttribute: CreateAttributeRequest
): Promise<AttributeResponse> {
  const response = await api.createAttribute(newAttribute, { baseURL });
  return response.data;
}

export async function updateAttribute(
  updatedAttribute: UpdateAttributeRequest
): Promise<AttributeResponse> {
  const response = await api.updateAttribute(updatedAttribute, { baseURL });
  return response.data;
}

export async function deleteAttribute(attributeId: string): Promise<void> {
  await api.deleteAttribute(attributeId, { baseURL });
}
