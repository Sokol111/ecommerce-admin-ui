<script setup lang="ts">
import type { ApiErrorData } from '~/composables/useNotify'
import type { ProductFormData } from '~/schemas/product.schema'
import ProductForm from '../_components/ProductForm.vue'

const route = useRoute('product-id-edit')
const notify = useNotify()

const productId = computed(() => route.params.id)

// Fetch product, categories, and attributes
const [{ data: product, error: productError }, { data: categoriesData }, { data: attributesData }] = await Promise.all([
  useFetch(`/api/catalog/products/${productId.value}`),
  useFetch('/api/catalog/categories'),
  useFetch('/api/catalog/attributes')
])

if (productError.value || !product.value) {
  throw createError({
    statusCode: 404,
    message: 'Product not found'
  })
}

const categories = computed(() => categoriesData.value?.items || [])
const attributes = computed(() => attributesData.value?.items || [])

// Convert product to form data
const initialData = computed(() => ({
  id: product.value!.id,
  version: product.value!.version,
  imageId: product.value!.imageId,
  categoryId: product.value!.categoryId,
  name: product.value!.name,
  description: product.value!.description,
  price: product.value!.price,
  quantity: product.value!.quantity,
  enabled: product.value!.enabled,
  attributes: product.value!.attributes?.map((attr) => ({
    attributeId: attr.attributeId,
    optionSlugValue: attr.optionSlugValue,
    optionSlugValues: attr.optionSlugValues,
    numericValue: attr.numericValue,
    textValue: attr.textValue,
    booleanValue: attr.booleanValue
  })) || []
}))

async function handleSubmit(data: ProductFormData) {
  const { data: result, error } = await useFetch('/api/catalog/products', {
    method: 'PUT',
    body: {
      id: data.id,
      version: data.version,
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      quantity: data.quantity,
      enabled: data.enabled,
      imageId: data.imageId || undefined,
      categoryId: data.categoryId || undefined,
      attributes: data.attributes?.filter(
        (attr) =>
          attr.optionSlugValue !== undefined
          || (attr.optionSlugValues && attr.optionSlugValues.length > 0)
          || attr.numericValue !== undefined
          || attr.textValue !== undefined
          || attr.booleanValue !== undefined
      )
    }
  })

  if (error.value || !result.value?.success) {
    const errData = (result.value as { error?: ApiErrorData } | null)?.error
    notify.crud.updateFailed('Product', errData)
    return
  }

  notify.crud.updated('Product')
  await navigateTo('/product')
}
</script>

<template>
  <div>
    <PageHeader
      title="Edit Product"
      description="Update product information"
      :breadcrumbs="[
        { label: 'Products', to: '/product', icon: 'i-lucide-package' },
        { label: 'Edit' }
      ]"
    />

    <UCard>
      <ProductForm
        :initial-data="initialData"
        :categories="categories"
        :available-attributes="attributes"
        is-edit-mode
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template>
