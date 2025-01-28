"use server";

import { revalidatePath } from "next/cache";
import { updateProduct, createProduct } from "./client/product-client";
import { createCategory, updateCategory } from "./client/category-client";
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/api/generated/category-api";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "@/api/generated/product-api";

export async function updateProductAction(product: UpdateProductRequest) {
  await updateProduct(product);
  revalidatePath("/product/list");
}

export async function createProductAction(product: CreateProductRequest) {
  await createProduct(product);
  revalidatePath("/product/list");
}

export async function updateCategoryAction(category: UpdateCategoryRequest) {
  await updateCategory(category);
  revalidatePath("/category/list");
}

export async function createCategoryAction(category: CreateCategoryRequest) {
  await createCategory(category);
  revalidatePath("/category/list");
}
