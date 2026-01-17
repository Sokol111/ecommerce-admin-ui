'use server';

import { createCategory, updateCategory } from '@/lib/client/category-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import { CreateCategoryBody, UpdateCategoryBody } from '@sokol111/ecommerce-category-service-api';

export async function updateCategoryAction(category: UpdateCategoryBody): Promise<ActionResult> {
  try {
    await updateCategory(category);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to update category') };
  }
}

export async function createCategoryAction(category: CreateCategoryBody): Promise<ActionResult> {
  try {
    await createCategory(category);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to create category') };
  }
}
