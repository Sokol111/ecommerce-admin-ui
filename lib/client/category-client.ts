import {
  CategoryResponse,
  Configuration,
  CreateCategoryRequest,
  DefaultApi,
  UpdateCategoryRequest,
} from '@sokol111/ecommerce-category-service-api';

const basePath = process.env.CATEGORY_API_URL;

const api = new DefaultApi(new Configuration({ basePath }));

export async function getCategoryById(categoryId: string): Promise<CategoryResponse> {
  const response = await api.getCategoryById({ id: categoryId });
  return response.data;
}

export async function getAllCategories(): Promise<CategoryResponse[]> {
  const response = await api.getAll();
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
