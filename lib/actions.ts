'use server';

import { createAttribute, deleteAttribute, updateAttribute } from '@/lib/client/attribute-client';
import { createCategory, updateCategory } from '@/lib/client/category-client';
import { confirmUpload, createPresign, getDeliveryUrl } from '@/lib/client/image-client';
import { createProduct, updateProduct } from '@/lib/client/product-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import {
  CreateAttributeBody,
  UpdateAttributeBody,
} from '@sokol111/ecommerce-attribute-service-api';
import { CreateCategoryBody, UpdateCategoryBody } from '@sokol111/ecommerce-category-service-api';
import {
  Image,
  PresignRequestContentType,
  PresignResponse,
} from '@sokol111/ecommerce-image-service-api';
import { CreateProductBody, UpdateProductBody } from '@sokol111/ecommerce-product-service-api';
import { z } from 'zod';

const ContentTypeSchema = z.enum([
  PresignRequestContentType['image/jpeg'],
  PresignRequestContentType['image/png'],
  PresignRequestContentType['image/webp'],
  PresignRequestContentType['image/avif'],
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

// ==================== ATTRIBUTE ACTIONS ====================

export async function createAttributeAction(attribute: CreateAttributeBody): Promise<ActionResult> {
  try {
    await createAttribute(attribute);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to create attribute') };
  }
}

export async function updateAttributeAction(attribute: UpdateAttributeBody): Promise<ActionResult> {
  try {
    await updateAttribute(attribute);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to update attribute') };
  }
}

export async function deleteAttributeAction(attributeId: string): Promise<ActionResult> {
  try {
    await deleteAttribute(attributeId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to delete attribute') };
  }
}

// ==================== IMAGE ACTIONS ====================

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
