'use server';

import { createCategory, updateCategory } from '@/lib/client/category-client';
import { confirmUpload, createPresign, getDeliveryUrl } from '@/lib/client/image-client';
import { createProduct, updateProduct } from '@/lib/client/product-client';
import { ActionResult, failureResult, successResult } from '@/lib/types/action-result';
import { parseError } from '@/lib/utils/error-parser';
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

/**
 * Helper to log trace information for server actions
 * This helps correlate frontend actions with backend API calls
 */
function logActionTrace(actionName: string, error?: unknown) {
  const timestamp = new Date().toISOString();
  if (error) {
    console.error(`[${timestamp}] [Action:${actionName}] Failed:`, error);
  } else {
    console.log(`[${timestamp}] [Action:${actionName}] Executed`);
  }
}

const ContentTypeSchema = z.enum([
  PresignRequestContentTypeEnum.ImageJpeg,
  PresignRequestContentTypeEnum.ImagePng,
  PresignRequestContentTypeEnum.ImageWebp,
  PresignRequestContentTypeEnum.ImageAvif,
]);

// Max size 1MB (same as client side check) enforced server-side
const PresignImageSchema = z.object({
  ownerId: z.string().uuid(),
  filename: z.string().min(1),
  size: z
    .number()
    .int()
    .positive()
    .max(1 * 1024 * 1024),
  contentType: ContentTypeSchema,
});

const ConfirmUploadSchema = z.object({
  ownerId: z.string().uuid(),
  key: z.string().min(1),
  mime: ContentTypeSchema,
});

const GetDeliveryUrlSchema = z.object({
  imageId: z.string().uuid(),
  width: z.number().int().positive().max(4096),
});

export async function updateProductAction(product: UpdateProductRequest): Promise<ActionResult> {
  try {
    logActionTrace('updateProduct');
    await updateProduct(product);
    return successResult(undefined);
  } catch (error) {
    logActionTrace('updateProduct', error);
    return failureResult(parseError(error, 'Failed to update product'));
  }
}

export async function createProductAction(product: CreateProductRequest): Promise<ActionResult> {
  try {
    logActionTrace('createProduct');
    await createProduct(product);
    return successResult(undefined);
  } catch (error) {
    logActionTrace('createProduct', error);
    return failureResult(parseError(error, 'Failed to create product'));
  }
}

export async function updateCategoryAction(category: UpdateCategoryRequest): Promise<ActionResult> {
  try {
    logActionTrace('updateCategory');
    await updateCategory(category);
    return successResult(undefined);
  } catch (error) {
    logActionTrace('updateCategory', error);
    return failureResult(parseError(error, 'Failed to update category'));
  }
}

export async function createCategoryAction(category: CreateCategoryRequest): Promise<ActionResult> {
  try {
    logActionTrace('createCategory');
    await createCategory(category);
    return successResult(undefined);
  } catch (error) {
    logActionTrace('createCategory', error);
    return failureResult(parseError(error, 'Failed to create category'));
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
    logActionTrace('presignImage');
    const data = await createPresign({
      ownerType: 'productDraft',
      ownerId: vOwnerId,
      filename: vFilename,
      contentType: vContentType,
      size: vSize,
      role: 'main',
    });
    return successResult(data);
  } catch (error) {
    logActionTrace('presignImage', error);
    return failureResult(parseError(error, 'Failed to prepare image upload'));
  }
}

export async function confirmUploadAction({
  ownerId,
  key,
  mime,
}: {
  ownerId: string;
  key: string;
  mime: string;
}): Promise<ActionResult<Image>> {
  try {
    const {
      ownerId: vOwnerId,
      key: vKey,
      mime: vMime,
    } = ConfirmUploadSchema.parse({
      ownerId,
      key,
      mime,
    });
    logActionTrace('confirmUpload');
    const data = await confirmUpload({
      ownerType: 'productDraft',
      ownerId: vOwnerId,
      key: vKey,
      alt: 'alt text',
      mime: vMime,
      role: 'main',
    });
    return successResult(data);
  } catch (error) {
    logActionTrace('confirmUpload', error);
    return failureResult(parseError(error, 'Failed to confirm image upload'));
  }
}

export async function getDeliveryUrlAction(
  imageId: string,
  width: number
): Promise<ActionResult<string>> {
  try {
    const { imageId: vImageId, width: vWidth } = GetDeliveryUrlSchema.parse({ imageId, width });
    logActionTrace('getDeliveryUrl');
    const data = await getDeliveryUrl({ imageId: vImageId, options: { w: vWidth, quality: 85 } });
    return successResult(data);
  } catch (error) {
    logActionTrace('getDeliveryUrl', error);
    return failureResult(parseError(error, 'Failed to get image URL'));
  }
}
