import type {
  AttributeListResponse,
  AttributeResponse,
  CategoryListResponse,
  CategoryResponse,
  CreateAttributeRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  GetAttributeListParams,
  GetCategoryListParams,
  GetProductListParams,
  ProductListResponse,
  ProductResponse,
  UpdateAttributeRequest,
  UpdateCategoryRequest,
  UpdateProductRequest
} from '@sokol111/ecommerce-catalog-service-api'
import {
  getCreateAttributeUrl,
  getCreateCategoryUrl,
  getCreateProductUrl,
  getGetAttributeByIdUrl,
  getGetAttributeListUrl,
  getGetCategoryByIdUrl,
  getGetCategoryListUrl,
  getGetProductByIdUrl,
  getGetProductListUrl,
  getUpdateAttributeUrl,
  getUpdateCategoryUrl,
  getUpdateProductUrl
} from '@sokol111/ecommerce-catalog-service-api'
import type { H3Event } from 'h3'

export function useCatalogClient(event: H3Event) {
  const { catalogApiUrl: baseURL } = useRuntimeConfig()
  const token = useAuthToken(event)
  const headers: HeadersInit = { Authorization: `Bearer ${token}` }

  return {
    // ==================== PRODUCTS ====================

    async getProductById(productId: string): Promise<ProductResponse> {
      return $fetch<ProductResponse>(getGetProductByIdUrl(productId), {
        baseURL,
        headers
      })
    },

    async getProductList(
      params?: Partial<GetProductListParams>
    ): Promise<ProductListResponse> {
      return $fetch<ProductListResponse>(getGetProductListUrl({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled,
        categoryId: params?.categoryId
      }), {
        baseURL,
        headers
      })
    },

    async createProduct(
      newProduct: CreateProductRequest
    ): Promise<ProductResponse> {
      return $fetch<ProductResponse>(getCreateProductUrl(), {
        baseURL,
        method: 'POST',
        headers,
        body: newProduct
      })
    },

    async updateProduct(
      updatedProduct: UpdateProductRequest
    ): Promise<ProductResponse> {
      return $fetch<ProductResponse>(getUpdateProductUrl(), {
        baseURL,
        method: 'PUT',
        headers,
        body: updatedProduct
      })
    },

    // ==================== CATEGORIES ====================

    async getCategoryById(categoryId: string): Promise<CategoryResponse> {
      return $fetch<CategoryResponse>(getGetCategoryByIdUrl(categoryId), {
        baseURL,
        headers
      })
    },

    async getCategoryList(
      params?: Partial<GetCategoryListParams>
    ): Promise<CategoryListResponse> {
      return $fetch<CategoryListResponse>(getGetCategoryListUrl({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled
      }), {
        baseURL,
        headers
      })
    },

    async createCategory(
      newCategory: CreateCategoryRequest
    ): Promise<CategoryResponse> {
      return $fetch<CategoryResponse>(getCreateCategoryUrl(), {
        baseURL,
        method: 'POST',
        headers,
        body: newCategory
      })
    },

    async updateCategory(
      updatedCategory: UpdateCategoryRequest
    ): Promise<CategoryResponse> {
      return $fetch<CategoryResponse>(getUpdateCategoryUrl(), {
        baseURL,
        method: 'PUT',
        headers,
        body: updatedCategory
      })
    },

    // ==================== ATTRIBUTES ====================

    async getAttributeById(attributeId: string): Promise<AttributeResponse> {
      return $fetch<AttributeResponse>(getGetAttributeByIdUrl(attributeId), {
        baseURL,
        headers
      })
    },

    async getAttributeList(
      params?: Partial<GetAttributeListParams>
    ): Promise<AttributeListResponse> {
      return $fetch<AttributeListResponse>(getGetAttributeListUrl({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled
      }), {
        baseURL,
        headers
      })
    },

    async createAttribute(
      newAttribute: CreateAttributeRequest
    ): Promise<AttributeResponse> {
      return $fetch<AttributeResponse>(getCreateAttributeUrl(), {
        baseURL,
        method: 'POST',
        headers,
        body: newAttribute
      })
    },

    async updateAttribute(
      updatedAttribute: UpdateAttributeRequest
    ): Promise<AttributeResponse> {
      return $fetch<AttributeResponse>(getUpdateAttributeUrl(), {
        baseURL,
        method: 'PUT',
        headers,
        body: updatedAttribute
      })
    }
  }
}

export type CatalogClient = ReturnType<typeof useCatalogClient>
