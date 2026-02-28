<script setup lang="ts">
import type { CategoryResponse } from '@sokol111/ecommerce-catalog-service-api';
import { productSchema, type ProductFormData } from '~/schemas/product.schema';

const props = defineProps<{
  initialData?: Partial<ProductFormData>
  categories: CategoryResponse[]
  isEditMode?: boolean
}>()

const emit = defineEmits<{
  submit: [data: ProductFormData]
}>()

const notify = useNotify()
const isSubmitting = ref(false)

// Generate UUID for new products
function generateUUID() {
  return crypto.randomUUID()
}

// Form state
const state = reactive<ProductFormData>({
  id: props.initialData?.id || generateUUID(),
  version: props.initialData?.version || 0,
  imageId: props.initialData?.imageId ?? undefined,
  categoryId: props.initialData?.categoryId ?? undefined,
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  price: props.initialData?.price || 0,
  quantity: props.initialData?.quantity || 0,
  enabled: props.initialData?.enabled || false,
  attributes: props.initialData?.attributes || []
})

// Category options for select
const categoryOptions = computed(() =>
  props.categories.map((c) => ({
    value: c.id,
    label: c.enabled ? c.name : `${c.name} (disabled)`,
    disabled: !c.enabled
  }))
)

// Computed for categoryId to handle null/undefined conversion
const categoryId = computed({
  get: () => state.categoryId ?? undefined,
  set: (value: string | undefined) => {
    state.categoryId = value
  }
})

async function onSubmit() {
  isSubmitting.value = true

  try {
    // Round price to 2 decimals
    state.price = Number(state.price.toFixed(2))

    emit('submit', { ...state })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'
    notify.error(message, 'Validation Error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UForm :schema="productSchema" :state="state" class="space-y-6" @submit="onSubmit">
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Name -->
      <UFormField label="Name" name="name" required class="md:col-span-2">
        <UInput
          v-model="state.name"
          placeholder="Product name"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Description -->
      <UFormField label="Description" name="description" class="md:col-span-2">
        <UTextarea
          v-model="state.description"
          placeholder="Product description"
          :rows="4"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Category -->
      <UFormField label="Category" name="categoryId">
        <USelect
          v-model="categoryId"
          :items="categoryOptions"
          placeholder="Select category"
          value-key="value"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Price -->
      <UFormField label="Price" name="price" required>
        <UInput
          v-model.number="state.price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :disabled="isSubmitting"
        >
          <template #leading>
            <span class="text-muted">$</span>
          </template>
        </UInput>
      </UFormField>

      <!-- Quantity -->
      <UFormField label="Quantity" name="quantity" required>
        <UInput
          v-model.number="state.quantity"
          type="number"
          min="0"
          placeholder="0"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Enabled -->
      <UFormField label="Status" name="enabled">
        <div class="flex items-center gap-2">
          <USwitch v-model="state.enabled" :disabled="isSubmitting" />
          <span class="text-sm">{{ state.enabled ? 'Enabled' : 'Disabled' }}</span>
        </div>
      </UFormField>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-default">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        :disabled="isSubmitting"
        @click="navigateTo('/product')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ isEditMode ? 'Update Product' : 'Create Product' }}
      </UButton>
    </div>
  </UForm>
</template>
