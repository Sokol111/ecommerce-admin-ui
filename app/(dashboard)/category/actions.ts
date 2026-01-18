'use server';

import { createCategory, updateCategory } from '@/lib/client/catalog-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@sokol111/ecommerce-catalog-service-api';

export async function updateCategoryAction(category: UpdateCategoryRequest): Promise<ActionResult> {
  try {
    await updateCategory(category);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to update category') };
  }
}

export async function createCategoryAction(category: CreateCategoryRequest): Promise<ActionResult> {
  try {
    await createCategory(category);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to create category') };
  }
}
