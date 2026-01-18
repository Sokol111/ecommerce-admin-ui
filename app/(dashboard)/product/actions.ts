'use server';

import { createProduct, updateProduct } from '@/lib/client/catalog-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import {
  CreateProductRequest,
  UpdateProductRequest,
} from '@sokol111/ecommerce-catalog-service-api';

export async function updateProductAction(product: UpdateProductRequest): Promise<ActionResult> {
  try {
    await updateProduct(product);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to update product') };
  }
}

export async function createProductAction(product: CreateProductRequest): Promise<ActionResult> {
  try {
    await createProduct(product);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to create product') };
  }
}
