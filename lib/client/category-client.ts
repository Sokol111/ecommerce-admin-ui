import {
  DefaultApi,
  Configuration,
  UpdateCategoryRequest,
  CreateCategoryRequest,
  CategoryResponse,
} from "@/api/generated/category-api";
import { Category } from "../model/category-model";

const basePath = process.env.NEXT_PUBLIC_CATEGORY_API_URL;

const api = new DefaultApi(new Configuration({ basePath }));

export async function getCategoryById(categoryId: string): Promise<Category> {
  const response = await api.getCategoryById(categoryId);
  return transformCategoryResponse(response.data);
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await api.getAll();
  return response.data.map(transformCategoryResponse);
}

export async function createCategory(
  newCategory: CreateCategoryRequest
): Promise<Category> {
  const response = await api.createCategory(newCategory);
  return transformCategoryResponse(response.data);
}

export async function updateCategory(
  updatedCategory: UpdateCategoryRequest
): Promise<Category> {
  const response = await api.updateCategory(updatedCategory);
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
