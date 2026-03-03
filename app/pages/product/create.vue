<script setup lang="ts">
import type { ApiErrorData } from '~/composables/useNotify'
import type { ProductFormData } from '~/schemas/product.schema'
import ProductForm from './_components/ProductForm.vue'

const notify = useNotify()

// Fetch categories for the form
const { data: categoriesData } = await useFetch('/api/catalog/categories')

const categories = computed(() => categoriesData.value?.items || [])

async function handleSubmit(data: ProductFormData) {
  const { data: result, error } = await useFetch('/api/catalog/products', {
    method: 'POST',
    body: {
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      quantity: data.quantity,
      enabled: data.enabled,
      imageId: data.imageId || undefined,
      categoryId: data.categoryId || undefined,
      attributes: data.attributes?.filter(
        (attr) =>
          attr.optionSlugValue !== undefined ||
          (attr.optionSlugValues && attr.optionSlugValues.length > 0) ||
          attr.numericValue !== undefined ||
          attr.textValue !== undefined ||
          attr.booleanValue !== undefined
      )
    }
  })

  if (error.value || !result.value?.success) {
    const errData = (result.value as { error?: ApiErrorData } | null)?.error
    notify.crud.createFailed('Product', errData)
    return
  }

  notify.crud.created('Product')
  await navigateTo('/product')
}
</script>

<template>
  <div>
    <PageHeader
      title="Create Product"
      description="Add a new product to your catalog"
      :breadcrumbs="[
        { label: 'Products', to: '/product', icon: 'i-lucide-package' },
        { label: 'Create' }
      ]"
    />

    <UCard>
      <ProductForm
        :categories="categories"
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template>
