<script setup lang="ts">
import type { ApiErrorData } from '~/composables/useNotify'
import type { CategoryAttributeFormData, CategoryFormData } from '~/schemas/category.schema'
import CategoryForm from '../_components/CategoryForm.vue'

const route = useRoute('category-id-edit')
const notify = useNotify()

const categoryId = computed(() => route.params.id)

// Fetch category and attributes
const [{ data: category, error: categoryError }, { data: attributesData }] = await Promise.all([
  useFetch(`/api/catalog/categories/${categoryId.value}`),
  useFetch('/api/catalog/attributes')
])

if (categoryError.value || !category.value) {
  throw createError({
    statusCode: 404,
    message: 'Category not found'
  })
}

const availableAttributes = computed(() => attributesData.value?.items || [])

// Convert category to form data
const initialData = computed(() => ({
  id: category.value!.id,
  version: category.value!.version,
  name: category.value!.name,
  enabled: category.value!.enabled,
  attributes: category.value!.attributes?.map((attr) => ({
    attributeId: attr.attributeId,
    role: attr.role as 'variant' | 'specification',
    sortOrder: attr.sortOrder,
    filterable: attr.filterable,
    searchable: attr.searchable
  })) || []
}))

async function handleSubmit(data: CategoryFormData) {
  const { data: result, error } = await useFetch('/api/catalog/categories', {
    method: 'PUT',
    body: {
      id: data.id,
      version: data.version,
      name: data.name,
      enabled: data.enabled,
      attributes: data.attributes.map((attr: CategoryAttributeFormData) => ({
        attributeId: attr.attributeId,
        role: attr.role,
        sortOrder: attr.sortOrder,
        filterable: attr.filterable,
        searchable: attr.searchable
      }))
    }
  })

  if (error.value || !result.value?.success) {
    const errData = (result.value as { error?: ApiErrorData } | null)?.error
    notify.crud.updateFailed('Category', errData)
    return
  }

  notify.crud.updated('Category')
  await navigateTo('/category')
}
</script>

<template>
  <div>
    <PageHeader
      title="Edit Category"
      description="Update category information"
      :breadcrumbs="[
        { label: 'Categories', to: '/category', icon: 'i-lucide-folder-tree' },
        { label: 'Edit' }
      ]"
    />

    <UCard>
      <CategoryForm
        :initial-data="initialData"
        :available-attributes="availableAttributes"
        is-edit-mode
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template>
