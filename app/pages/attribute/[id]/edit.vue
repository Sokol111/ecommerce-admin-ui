<script setup lang="ts">
import type { ApiErrorData } from '~/composables/useNotify'
import type { AttributeFormData, AttributeOptionFormData } from '~/schemas/attribute.schema'
import AttributeForm from '../_components/AttributeForm.vue'

const route = useRoute('attribute-id-edit')
const notify = useNotify()

const attributeId = computed(() => route.params.id)

// Fetch attribute
const { data: attribute, error: attributeError } = await useFetch(
  `/api/catalog/attributes/${attributeId.value}`
)

if (attributeError.value || !attribute.value) {
  throw createError({
    statusCode: 404,
    message: 'Attribute not found'
  })
}

// Convert attribute to form data
const initialData = computed(() => ({
  id: attribute.value!.id,
  version: attribute.value!.version,
  name: attribute.value!.name,
  slug: attribute.value!.slug,
  type: attribute.value!.type as 'single' | 'multiple' | 'range' | 'boolean' | 'text',
  unit: attribute.value!.unit,
  enabled: attribute.value!.enabled,
  options: attribute.value!.options?.map((opt) => ({
    name: opt.name,
    slug: opt.slug,
    colorCode: opt.colorCode,
    sortOrder: opt.sortOrder
  })) || []
}))

async function handleSubmit(data: AttributeFormData) {
  const { data: result, error } = await useFetch('/api/catalog/attributes', {
    method: 'PUT',
    body: {
      id: data.id,
      version: data.version,
      name: data.name,
      slug: data.slug,
      type: data.type,
      unit: data.unit || undefined,
      enabled: data.enabled,
      options: data.options?.map((opt: AttributeOptionFormData) => ({
        name: opt.name,
        slug: opt.slug,
        colorCode: opt.colorCode || undefined,
        sortOrder: opt.sortOrder
      }))
    }
  })

  if (error.value || !result.value?.success) {
    const errData = result.value && 'error' in result.value ? result.value.error as ApiErrorData : undefined
    notify.crud.updateFailed('Attribute', errData)
    return
  }

  notify.crud.updated('Attribute')
  await navigateTo('/attribute')
}
</script>

<template>
  <div>
    <PageHeader
      title="Edit Attribute"
      description="Update attribute information"
      :breadcrumbs="[
        { label: 'Attributes', to: '/attribute', icon: 'i-lucide-tags' },
        { label: 'Edit' }
      ]"
    />

    <UCard>
      <AttributeForm
        :initial-data="initialData"
        is-edit-mode
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template>
