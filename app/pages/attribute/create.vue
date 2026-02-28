<script setup lang="ts">
import type { ApiErrorData } from '~/composables/useNotify'
import type { AttributeFormData, AttributeOptionFormData } from '~/schemas/attribute.schema'
import AttributeForm from './_components/AttributeForm.vue'

const notify = useNotify()

async function handleSubmit(data: AttributeFormData) {
  const { data: result, error } = await useFetch('/api/catalog/attributes', {
    method: 'POST',
    body: {
      id: data.id,
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
    notify.crud.createFailed('Attribute', errData)
    return
  }

  notify.crud.created('Attribute')
  await navigateTo('/attribute')
}
</script>

<template>
  <div>
    <PageHeader
      title="Create Attribute"
      description="Add a new attribute to your catalog"
      :breadcrumbs="[
        { label: 'Attributes', to: '/attribute', icon: 'i-lucide-tags' },
        { label: 'Create' }
      ]"
    />

    <UCard>
      <AttributeForm @submit="handleSubmit" />
    </UCard>
  </div>
</template>
