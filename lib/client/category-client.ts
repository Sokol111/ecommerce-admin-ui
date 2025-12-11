import {
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryBody,
  getCategoryAPI,
  GetListParams,
  UpdateCategoryBody,
} from '@sokol111/ecommerce-category-service-api';

const baseURL = process.env.CATEGORY_API_URL;

const api = getCategoryAPI();

export async function getCategoryById(categoryId: string): Promise<CategoryResponse> {
  const response = await api.getCategoryById(categoryId, { baseURL });
  return response.data;
}

export async function getListCategories(
  params?: Partial<GetListParams>
): Promise<CategoryListResponse> {
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

export async function createCategory(newCategory: CreateCategoryBody): Promise<CategoryResponse> {
  const response = await api.createCategory(newCategory, { baseURL });
  return response.data;
}

export async function updateCategory(
  updatedCategory: UpdateCategoryBody
): Promise<CategoryResponse> {
  const response = await api.updateCategory(updatedCategory, { baseURL });
  return response.data;
}
