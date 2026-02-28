<script setup lang="ts">
import type { ApiErrorData } from '~/composables/useNotify'
import type { CategoryAttributeFormData, CategoryFormData } from '~/schemas/category.schema'
import CategoryForm from './_components/CategoryForm.vue'

const notify = useNotify()

// Fetch attributes for the form
const { data: attributesData } = await useFetch('/api/catalog/attributes')

const availableAttributes = computed(() => attributesData.value?.items || [])

async function handleSubmit(data: CategoryFormData) {
  const { data: result, error } = await useFetch('/api/catalog/categories', {
    method: 'POST',
    body: {
      id: data.id,
      name: data.name,
      enabled: data.enabled,
      attributes: data.attributes.map((attr: CategoryAttributeFormData) => ({
        attributeId: attr.attributeId,
        role: attr.role,
        required: attr.required,
        sortOrder: attr.sortOrder,
        filterable: attr.filterable,
        searchable: attr.searchable
      }))
    }
  })

  if (error.value || !result.value?.success) {
    const errData = (result.value as { error?: ApiErrorData } | null)?.error
    notify.crud.createFailed('Category', errData)
    return
  }

  notify.crud.created('Category')
  await navigateTo('/category')
}
</script>

<template>
  <div>
    <PageHeader
      title="Create Category"
      description="Add a new category to your catalog"
      :breadcrumbs="[
        { label: 'Categories', to: '/category', icon: 'i-lucide-folder-tree' },
        { label: 'Create' }
      ]"
    />

    <UCard>
      <CategoryForm
        :available-attributes="availableAttributes"
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template>
