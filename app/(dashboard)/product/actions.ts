'use server';

import { createProduct, updateProduct } from '@/lib/client/product-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import { CreateProductBody, UpdateProductBody } from '@sokol111/ecommerce-product-service-api';

export async function updateProductAction(product: UpdateProductBody): Promise<ActionResult> {
  try {
    await updateProduct(product);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to update product') };
  }
}

export async function createProductAction(product: CreateProductBody): Promise<ActionResult> {
  try {
    await createProduct(product);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to create product') };
  }
}
