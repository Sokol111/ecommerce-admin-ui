'use server';

import {
  createAttribute,
  deleteAttribute,
  getAttributeList,
  updateAttribute,
} from '@/lib/client/attribute-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import {
  AttributeListResponse,
  CreateAttributeBody,
  GetAttributeListParams,
  UpdateAttributeBody,
} from '@sokol111/ecommerce-attribute-service-api';

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

export async function getAttributeListAction(
  params?: Partial<GetAttributeListParams>
): Promise<ActionResult<AttributeListResponse>> {
  try {
    const data = await getAttributeList({
      page: params?.page ?? 1,
      size: params?.size ?? 100,
      sort: params?.sort,
      order: params?.order,
      enabled: params?.enabled,
      type: params?.type,
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to fetch attributes') };
  }
}
