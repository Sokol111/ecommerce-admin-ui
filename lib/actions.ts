'use server';

import { createCategory, updateCategory } from '@/lib/client/category-client';
import { confirmUpload, createPresign } from '@/lib/client/image-client';
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

export async function presignImageAction({ ownerId, file}: { ownerId: string; file: File; }): Promise<PresignResponse> {
  return await createPresign({  ownerType: "productDraft", ownerId: ownerId, filename: file.name, contentType: "image/jpeg", size: file.size, role: "main" });
}


export async function confirmUploadAction({ownerId, key}: { ownerId: string; key: string; }): Promise<Image> {
  return await confirmUpload({ownerType: "productDraft", ownerId: ownerId, key, alt: "alt text", mime: "image/jpeg", role: "main" });
}
