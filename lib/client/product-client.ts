import {
  Configuration,
  CreateProductRequest,
  DefaultApi,
  ProductResponse,
  UpdateProductRequest,
} from '@sokol111/ecommerce-product-service-api';

const basePath = process.env.PRODUCT_API_URL;

const api = new DefaultApi(new Configuration({ basePath }));

export async function getProductById(productId: string): Promise<ProductResponse> {
  const response = await api.getProductById({ id: productId });
  return response.data;
}

export async function getAllProducts(): Promise<ProductResponse[]> {
  const response = await api.getAll();
  return response.data;
}

export async function createProduct(newProduct: CreateProductRequest): Promise<ProductResponse> {
  const response = await api.createProduct({
    createProductRequest: newProduct,
  });
  return response.data;
}

export async function updateProduct(
  updatedProduct: UpdateProductRequest
): Promise<ProductResponse> {
  const response = await api.updateProduct({
    updateProductRequest: updatedProduct,
  });
  return response.data;
}
