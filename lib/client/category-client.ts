import {
  DefaultApi,
  Configuration,
  UpdateCategoryRequest,
  CreateCategoryRequest,
  CategoryResponse,
} from '@sokol111/ecommerce-category-service-api';
import { Category } from '../model/category-model';

const basePath = process.env.CATEGORY_API_URL;

const api = new DefaultApi(new Configuration({ basePath }));

export async function getCategoryById(categoryId: string): Promise<Category> {
  const response = await api.getCategoryById({ id: categoryId });
  return transformCategoryResponse(response.data);
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await api.getAll();
  return response.data.map(transformCategoryResponse);
}

export async function createCategory(
  newCategory: CreateCategoryRequest
): Promise<Category> {
  const response = await api.createCategory({
    createCategoryRequest: newCategory,
  });
  return transformCategoryResponse(response.data);
}

export async function updateCategory(
  updatedCategory: UpdateCategoryRequest
): Promise<Category> {
  const response = await api.updateCategory({
    updateCategoryRequest: updatedCategory,
  });
  return transformCategoryResponse(response.data);
}

export function transformCategoryResponse(
  response: CategoryResponse
): Category {
  return {
    id: response.id,
    name: response.name,
    version: response.version,
    enabled: response.enabled,
    createdAt: response.createdAt,
    modifiedAt: response.modifiedAt,
  };
}
