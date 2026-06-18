import { createClient } from '@connectrpc/connect'
import { createGrpcTransport } from '@connectrpc/connect-node'
import type {
  Attribute,
  Category,
  Product
} from '@sokol111/ecommerce-catalog-service-api'
import {
  AttributeService,
  AttributeType,
  CategoryAttributeRole,
  CategoryService,
  ProductService
} from '@sokol111/ecommerce-catalog-service-api'
import type { H3Event } from 'h3'

type FlatAttributeValue = {
  attributeId: string
  optionSlugValue?: string
  optionSlugValues?: string[]
  numericValue?: number
  textValue?: string
  booleanValue?: boolean
}

// Deeply converts all BigInt values to numbers so h3 can JSON.stringify the response
function bigintSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? Number(v) : v))
}

function toAttributeValueInput(attr: FlatAttributeValue) {
  if (attr.optionSlugValue !== undefined)
    return { attributeId: attr.attributeId, value: { case: 'optionSlugValue' as const, value: attr.optionSlugValue } }
  if (attr.optionSlugValues !== undefined)
    return { attributeId: attr.attributeId, value: { case: 'optionSlugValues' as const, value: { values: attr.optionSlugValues } } }
  if (attr.numericValue !== undefined)
    return { attributeId: attr.attributeId, value: { case: 'numericValue' as const, value: attr.numericValue } }
  if (attr.textValue !== undefined)
    return { attributeId: attr.attributeId, value: { case: 'textValue' as const, value: attr.textValue } }
  if (attr.booleanValue !== undefined)
    return { attributeId: attr.attributeId, value: { case: 'booleanValue' as const, value: attr.booleanValue } }
  return { attributeId: attr.attributeId, value: { case: undefined as undefined } }
}

type ProductBody = {
  id?: string
  version?: number
  name: string
  description?: string
  price: number
  quantity: number
  enabled: boolean
  imageId?: string
  categoryId?: string
  attributes?: FlatAttributeValue[]
}

const attributeTypeMap: Record<string, AttributeType> = {
  single: AttributeType.SINGLE,
  multiple: AttributeType.MULTIPLE,
  range: AttributeType.RANGE,
  boolean: AttributeType.BOOLEAN,
  text: AttributeType.TEXT
}

const categoryAttributeRoleMap: Record<string, CategoryAttributeRole> = {
  variant: CategoryAttributeRole.VARIANT,
  specification: CategoryAttributeRole.SPECIFICATION
}

type AttributeBody = {
  id?: string
  version?: number
  name: string
  slug?: string
  type: string
  unit?: string
  enabled: boolean
  options?: Array<{
    name: string
    slug: string
    colorCode?: string
    sortOrder?: number
  }>
}

type CategoryAttributeBody = {
  attributeId: string
  role: string
  sortOrder: number
  filterable: boolean
  searchable: boolean
}

type CategoryBody = {
  id?: string
  version?: number
  name: string
  enabled: boolean
  attributes?: CategoryAttributeBody[]
}

export async function useCatalogClient(event: H3Event) {
  const { catalogApiUrl: baseURL } = useRuntimeConfig()
  const token = await useAuthToken(event)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...tenantHeaders(event) as Record<string, string>
  }

  const transport = createGrpcTransport({
    baseUrl: baseURL,
    interceptors: [
      (next) => (req) => {
        for (const [key, value] of Object.entries(headers)) {
          req.header.set(key, value)
        }
        return next(req)
      }
    ]
  })

  const productClient = createClient(ProductService, transport)
  const categoryClient = createClient(CategoryService, transport)
  const attributeClient = createClient(AttributeService, transport)

  return {
    // ==================== PRODUCTS ====================

    async getProductById(productId: string): Promise<Product> {
      const res = await productClient.getProductById({ id: productId })
      return res.product!
    },

    async getProductList(params?: {
      page?: number
      size?: number
      sort?: string
      order?: string
      enabled?: boolean
      categoryId?: string
    }) {
      const res = await productClient.getProductList({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled,
        categoryId: params?.categoryId
      })
      return bigintSafe(res)
    },

    async createProduct(body: ProductBody): Promise<Product> {
      const res = await productClient.createProduct({
        ...body,
        attributes: body.attributes?.map(toAttributeValueInput) ?? []
      })
      return res.product!
    },

    async updateProduct(body: ProductBody & { id: string }): Promise<Product> {
      const res = await productClient.updateProduct({
        ...body,
        attributes: body.attributes?.map(toAttributeValueInput) ?? []
      })
      return res.product!
    },

    async deleteProduct(productId: string): Promise<void> {
      await productClient.deleteProduct({ id: productId })
    },

    // ==================== CATEGORIES ====================

    async getCategoryById(categoryId: string): Promise<Category> {
      const res = await categoryClient.getCategoryById({ id: categoryId })
      return res.category!
    },

    async getCategoryList(params?: {
      page?: number
      size?: number
      sort?: string
      order?: string
      enabled?: boolean
    }) {
      const res = await categoryClient.getCategoryList({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled
      })
      return bigintSafe(res)
    },

    async createCategory(body: CategoryBody): Promise<Category> {
      const res = await categoryClient.createCategory({
        ...body,
        attributes: body.attributes?.map((a) => ({
          ...a,
          role: categoryAttributeRoleMap[a.role] ?? CategoryAttributeRole.SPECIFICATION
        })) ?? []
      })
      return res.category!
    },

    async updateCategory(body: CategoryBody & { id: string }): Promise<Category> {
      const res = await categoryClient.updateCategory({
        ...body,
        attributes: body.attributes?.map((a) => ({
          ...a,
          role: categoryAttributeRoleMap[a.role] ?? CategoryAttributeRole.SPECIFICATION
        })) ?? []
      })
      return res.category!
    },

    // ==================== ATTRIBUTES ====================

    async getAttributeById(attributeId: string): Promise<Attribute> {
      const res = await attributeClient.getAttributeById({ id: attributeId })
      return res.attribute!
    },

    async getAttributeList(params?: {
      page?: number
      size?: number
      sort?: string
      order?: string
      enabled?: boolean
    }) {
      const res = await attributeClient.getAttributeList({
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sort: params?.sort,
        order: params?.order,
        enabled: params?.enabled
      })
      return bigintSafe(res)
    },

    async createAttribute(body: AttributeBody): Promise<Attribute> {
      const res = await attributeClient.createAttribute({
        ...body,
        type: attributeTypeMap[body.type] ?? AttributeType.SINGLE,
        options: body.options ?? []
      })
      return res.attribute!
    },

    async updateAttribute(body: AttributeBody & { id: string }): Promise<Attribute> {
      const { type: _type, slug: _slug, ...rest } = body
      const res = await attributeClient.updateAttribute({
        ...rest,
        options: body.options ?? []
      })
      return res.attribute!
    }
  }
}

export type CatalogClient = Awaited<ReturnType<typeof useCatalogClient>>
