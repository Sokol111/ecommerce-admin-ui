<script setup lang="ts">
import type { AttributeResponse } from '@sokol111/ecommerce-catalog-service-api';
import { categorySchema, type CategoryFormData } from '~/schemas/category.schema';

const props = defineProps<{
  initialData?: Partial<CategoryFormData>
  availableAttributes: AttributeResponse[]
  isEditMode?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CategoryFormData]
}>()

const notify = useNotify()
const isSubmitting = ref(false)

// Generate UUID for new categories
function generateUUID() {
  return crypto.randomUUID()
}

// Form state
const state = reactive<CategoryFormData>({
  id: props.initialData?.id || generateUUID(),
  version: props.initialData?.version || 0,
  name: props.initialData?.name || '',
  enabled: props.initialData?.enabled || false,
  attributes: props.initialData?.attributes || []
})

// Available attributes for select (exclude already added)
const availableAttributeOptions = computed(() => {
  const usedIds = state.attributes.map(a => a.attributeId)
  return props.availableAttributes
    .filter(a => !usedIds.includes(a.id))
    .map(a => ({
      value: a.id,
      label: a.name
    }))
})

// Role options
const roleOptions = [
  { value: 'variant', label: 'Variant' },
  { value: 'specification', label: 'Specification' }
]

// Add attribute
function addAttribute() {
  const firstOption = availableAttributeOptions.value[0]
  if (!firstOption) return

  state.attributes.push({
    attributeId: firstOption.value,
    role: 'specification',
    required: false,
    sortOrder: state.attributes.length,
    filterable: false,
    searchable: false
  })
}

// Remove attribute
function removeAttribute(index: number) {
  state.attributes.splice(index, 1)
}

// Get attribute name by ID
function getAttributeName(id: string): string {
  return props.availableAttributes.find(a => a.id === id)?.name || 'Unknown'
}

async function onSubmit() {
  isSubmitting.value = true

  try {
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
  <UForm :schema="categorySchema" :state="state" class="space-y-6" @submit="onSubmit">
    <!-- Basic Info -->
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="Name" name="name" required class="md:col-span-2">
        <UInput
          v-model="state.name"
          placeholder="Category name"
          :disabled="isSubmitting"
        />
      </UFormField>

      <UFormField label="Status" name="enabled">
        <div class="flex items-center gap-2">
          <USwitch v-model="state.enabled" :disabled="isSubmitting" />
          <span class="text-sm">{{ state.enabled ? 'Enabled' : 'Disabled' }}</span>
        </div>
      </UFormField>
    </div>

    <!-- Attributes Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Attributes</h3>
        <UButton
          type="button"
          variant="outline"
          size="sm"
          icon="i-lucide-plus"
          :disabled="availableAttributeOptions.length === 0 || isSubmitting"
          @click="addAttribute"
        >
          Add Attribute
        </UButton>
      </div>

      <div v-if="state.attributes.length === 0" class="text-muted text-sm py-4 text-center border border-dashed rounded-lg">
        No attributes added yet
      </div>

      <div v-else class="space-y-3">
        <UCard v-for="(attr, index) in state.attributes" :key="index" class="p-4">
          <div class="flex items-start gap-4">
            <div class="flex-1 grid gap-4 md:grid-cols-3">
              <!-- Attribute Select -->
              <UFormField :label="index === 0 ? 'Attribute' : ''" :name="`attributes.${index}.attributeId`">
                <USelect
                  v-model="attr.attributeId"
                  :items="[
                    { value: attr.attributeId, label: getAttributeName(attr.attributeId) },
                    ...availableAttributeOptions
                  ]"
                  value-key="value"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <!-- Role Select -->
              <UFormField :label="index === 0 ? 'Role' : ''" :name="`attributes.${index}.role`">
                <USelect
                  v-model="attr.role"
                  :items="roleOptions"
                  value-key="value"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <!-- Sort Order -->
              <UFormField :label="index === 0 ? 'Sort Order' : ''" :name="`attributes.${index}.sortOrder`">
                <UInput
                  v-model.number="attr.sortOrder"
                  type="number"
                  min="0"
                  :disabled="isSubmitting"
                />
              </UFormField>
            </div>

            <!-- Toggles -->
            <div class="flex items-center gap-4 pt-6">
              <label class="flex items-center gap-2 text-sm">
                <UCheckbox v-model="attr.required" :disabled="isSubmitting" />
                Required
              </label>
              <label class="flex items-center gap-2 text-sm">
                <UCheckbox v-model="attr.filterable" :disabled="isSubmitting" />
                Filterable
              </label>
              <label class="flex items-center gap-2 text-sm">
                <UCheckbox v-model="attr.searchable" :disabled="isSubmitting" />
                Searchable
              </label>
            </div>

            <!-- Remove button -->
            <UButton
              type="button"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="sm"
              class="mt-6"
              :disabled="isSubmitting"
              @click="removeAttribute(index)"
            />
          </div>
        </UCard>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-default">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        :disabled="isSubmitting"
        @click="navigateTo('/category')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ isEditMode ? 'Update Category' : 'Create Category' }}
      </UButton>
    </div>
  </UForm>
</template>
