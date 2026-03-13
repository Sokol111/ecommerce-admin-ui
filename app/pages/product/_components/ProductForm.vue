<script setup lang="ts">
import type { AttributeResponse, CategoryResponse } from '@sokol111/ecommerce-catalog-service-api'
import { productSchema, type ProductFormData } from '~/schemas/product.schema'
import ProductAttributeEditor from './ProductAttributeEditor.vue'
import ProductImageUpload from './ProductImageUpload.vue'

const props = defineProps<{
  initialData?: Partial<ProductFormData>
  categories: CategoryResponse[]
  availableAttributes: AttributeResponse[]
  isEditMode?: boolean
}>()

const emit = defineEmits<{
  submit: [data: ProductFormData]
}>()

const notify = useNotify()
const isSubmitting = ref(false)

// Always upload to draft — promotion to product happens server-side after save
const draftId = useId()
const imageOwnerId = draftId

// Form state
const state = reactive<ProductFormData>({
  id: props.initialData?.id,
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

// Selected category and its attributes
const selectedCategory = computed(() =>
  props.categories.find((c) => c.id === state.categoryId)
)

const categoryAttributes = computed(() =>
  selectedCategory.value?.attributes || []
)

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
  <UForm
    :schema="productSchema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Product Image -->
      <UFormField
        label="Product Image"
        name="imageId"
        class="md:col-span-2"
      >
        <ProductImageUpload
          :image-id="state.imageId"
          :owner-id="imageOwnerId"
          :disabled="isSubmitting"
          @update:image-id="(id: string | undefined) => state.imageId = id"
        />
      </UFormField>

      <!-- Name -->
      <UFormField
        label="Name"
        name="name"
        required
        class="md:col-span-2"
      >
        <UInput
          v-model="state.name"
          class="w-full"
          placeholder="Product name"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Description -->
      <UFormField
        label="Description"
        name="description"
        class="md:col-span-2"
      >
        <UTextarea
          v-model="state.description"
          class="w-full"
          placeholder="Product description"
          :rows="4"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Category -->
      <UFormField
        label="Category"
        name="categoryId"
      >
        <USelect
          v-model="categoryId"
          :items="categoryOptions"
          placeholder="Select category"
          value-key="value"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Price -->
      <UFormField
        label="Price"
        name="price"
        required
      >
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
      <UFormField
        label="Quantity"
        name="quantity"
        required
      >
        <UInput
          v-model.number="state.quantity"
          type="number"
          min="0"
          placeholder="0"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- Enabled -->
      <UFormField
        label="Status"
        name="enabled"
      >
        <div class="flex items-center gap-2">
          <USwitch
            v-model="state.enabled"
            :disabled="isSubmitting"
          />
          <span class="text-sm">{{ state.enabled ? 'Enabled' : 'Disabled' }}</span>
        </div>
      </UFormField>
    </div>

    <!-- Product Attributes (shown when a category is selected) -->
    <ProductAttributeEditor
      v-if="state.categoryId && categoryAttributes.length > 0"
      v-model="state.attributes"
      :category-attributes="categoryAttributes"
      :all-attributes="availableAttributes"
      :disabled="isSubmitting"
    />

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
