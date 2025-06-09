import {
  DefaultApi,
  Configuration,
  UpdateProductRequest,
  CreateProductRequest,
  ProductResponse,
} from '@sokol111/ecommerce-product-service-api';
import { Product } from '../model/product-model';

const basePath = process.env.PRODUCT_API_URL;

const api = new DefaultApi(new Configuration({ basePath }));

export async function getProductById(productId: string): Promise<Product> {
  const response = await api.getProductById({ id: productId });
  return transformProductResponse(response.data);
}

export async function getAllProducts(): Promise<Product[]> {
  const response = await api.getAll();
  return response.data.map(transformProductResponse);
}

export async function createProduct(
  newProduct: CreateProductRequest
): Promise<Product> {
  const response = await api.createProduct({
    createProductRequest: newProduct,
  });
  return transformProductResponse(response.data);
}

export async function updateProduct(
  updatedProduct: UpdateProductRequest
): Promise<Product> {
  const response = await api.updateProduct({
    updateProductRequest: updatedProduct,
  });
  return transformProductResponse(response.data);
}

export function transformProductResponse(response: ProductResponse): Product {
  return {
    id: response.id,
    name: response.name,
    price: response.price,
    quantity: response.quantity,
    version: response.version,
    enabled: response.enabled,
    createdAt: response.createdAt,
    modifiedAt: response.modifiedAt,
  };
}
