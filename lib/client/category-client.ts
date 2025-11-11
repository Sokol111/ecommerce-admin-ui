import {
  CategoryListResponse,
  CategoryResponse,
  Configuration,
  CreateCategoryRequest,
  DefaultApi,
  DefaultApiGetListRequest,
  UpdateCategoryRequest,
} from '@sokol111/ecommerce-category-service-api';
import { createTracedHttpClient } from './http-client';

const basePath = process.env.CATEGORY_API_URL;

const httpClient = createTracedHttpClient();

const api = new DefaultApi(new Configuration({ basePath }), basePath, httpClient);

export async function getCategoryById(categoryId: string): Promise<CategoryResponse> {
  const response = await api.getCategoryById({ id: categoryId });
  return response.data;
}

export async function getListCategories(
  params?: Partial<DefaultApiGetListRequest>
): Promise<CategoryListResponse> {
  const response = await api.getList({
    page: params?.page ?? 1,
    size: params?.size ?? 10,
    sort: params?.sort,
    order: params?.order,
    enabled: params?.enabled,
  });
  return response.data;
}

export async function createCategory(
  newCategory: CreateCategoryRequest
): Promise<CategoryResponse> {
  const response = await api.createCategory({
    createCategoryRequest: newCategory,
  });
  return response.data;
}

export async function updateCategory(
  updatedCategory: UpdateCategoryRequest
): Promise<CategoryResponse> {
  const response = await api.updateCategory({
    updateCategoryRequest: updatedCategory,
  });
  return response.data;
}
