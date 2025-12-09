'use server';

import { createCategory, updateCategory } from '@/lib/client/category-client';
import { confirmUpload, createPresign, getDeliveryUrl } from '@/lib/client/image-client';
import { createProduct, updateProduct } from '@/lib/client/product-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@sokol111/ecommerce-category-service-api';
import {
  Image,
  PresignRequestContentTypeEnum,
  PresignResponse,
} from '@sokol111/ecommerce-image-service-api';
import {
  CreateProductRequest,
  UpdateProductRequest,
} from '@sokol111/ecommerce-product-service-api';
import { z } from 'zod';

const ContentTypeSchema = z.enum([
  PresignRequestContentTypeEnum.ImageJpeg,
  PresignRequestContentTypeEnum.ImagePng,
  PresignRequestContentTypeEnum.ImageWebp,
  PresignRequestContentTypeEnum.ImageAvif,
]);

// Max size 1MB (same as client side check) enforced server-side
const PresignImageSchema = z.object({
  ownerId: z.uuid(),
  filename: z.string().min(1),
  size: z
    .number()
    .int()
    .positive()
    .max(1 * 1024 * 1024),
  contentType: ContentTypeSchema,
});

const ConfirmUploadSchema = z.object({
  uploadToken: z.string().min(1),
  alt: z.string().min(1),
  role: z.enum(['main', 'gallery', 'other']),
});

const GetDeliveryUrlSchema = z.object({
  imageId: z.uuid(),
  width: z.number().int().positive().max(4096),
});

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

export async function presignImageAction({
  ownerId,
  filename,
  size,
  contentType,
}: {
  ownerId: string;
  filename: string;
  size: number;
  contentType: string;
}): Promise<ActionResult<PresignResponse>> {
  try {
    const {
      ownerId: vOwnerId,
      filename: vFilename,
      size: vSize,
      contentType: vContentType,
    } = PresignImageSchema.parse({ ownerId, filename, size, contentType });
    const data = await createPresign({
      ownerType: 'productDraft',
      ownerId: vOwnerId,
      filename: vFilename,
      contentType: vContentType,
      size: vSize,
      role: 'main',
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to prepare image upload') };
  }
}

export async function confirmUploadAction({
  uploadToken,
  alt,
  role,
}: {
  uploadToken: string;
  alt: string;
  role: 'main' | 'gallery' | 'other';
}): Promise<ActionResult<Image>> {
  try {
    const {
      uploadToken: vUploadToken,
      alt: vAlt,
      role: vRole,
    } = ConfirmUploadSchema.parse({
      uploadToken,
      alt,
      role,
    });
    const data = await confirmUpload({
      uploadToken: vUploadToken,
      alt: vAlt,
      role: vRole,
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to confirm image upload') };
  }
}

export async function getDeliveryUrlAction(
  imageId: string,
  width: number
): Promise<ActionResult<{ url: string; expiresAt?: string }>> {
  try {
    const { imageId: vImageId, width: vWidth } = GetDeliveryUrlSchema.parse({ imageId, width });
    const data = await getDeliveryUrl({ imageId: vImageId, options: { w: vWidth, quality: 85 } });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to get image URL') };
  }
}
