'use server';

import { createCategory, updateCategory } from '@/lib/client/category-client';
import { confirmUpload, createPresign, getDeliveryUrl } from '@/lib/client/image-client';
import { createProduct, updateProduct } from '@/lib/client/product-client';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@sokol111/ecommerce-category-service-api';
import { Image, PresignResponse } from '@sokol111/ecommerce-image-service-api';
import {
  CreateProductRequest,
  UpdateProductRequest,
} from '@sokol111/ecommerce-product-service-api';
import { revalidatePath } from 'next/cache';

export async function updateProductAction(product: UpdateProductRequest) {
  await updateProduct(product);
  revalidatePath('/product/list');
}

export async function createProductAction(product: CreateProductRequest) {
  await createProduct(product);
  revalidatePath('/product/list');
}

export async function updateCategoryAction(category: UpdateCategoryRequest) {
  await updateCategory(category);
  revalidatePath('/category/list');
}

export async function createCategoryAction(category: CreateCategoryRequest) {
  await createCategory(category);
  revalidatePath('/category/list');
}

export async function presignImageAction({ ownerId, filename, size}: { ownerId: string; filename: string, size: number }): Promise<PresignResponse> {
  return await createPresign({  ownerType: "productDraft", ownerId: ownerId, filename, contentType: "image/jpeg", size, role: "main" });
}


export async function confirmUploadAction({ownerId, key}: { ownerId: string; key: string; }): Promise<Image> {
  return await confirmUpload({ownerType: "productDraft", ownerId: ownerId, key, alt: "alt text", mime: "image/jpeg", role: "main" });
}

export async function getDeliveryUrlAction(imageId: string, width: number): Promise<string> {
  return await getDeliveryUrl({imageId, options: { w: width, quality: 85 }});
}
