<script setup lang="ts">
import {
    ATTRIBUTE_TYPES,
    attributeSchema,
    generateSlug,
    type AttributeFormData
} from '~/schemas/attribute.schema';

const props = defineProps<{
  initialData?: Partial<AttributeFormData>
  isEditMode?: boolean
}>()

const emit = defineEmits<{
  submit: [data: AttributeFormData]
}>()

const notify = useNotify()
const isSubmitting = ref(false)

// Generate UUID for new attributes
function generateUUID() {
  return crypto.randomUUID()
}

// Form state
const state = reactive<AttributeFormData>({
  id: props.initialData?.id || generateUUID(),
  version: props.initialData?.version || 0,
  name: props.initialData?.name || '',
  slug: props.initialData?.slug || '',
  type: props.initialData?.type || 'single',
  unit: props.initialData?.unit || '',
  enabled: props.initialData?.enabled || false,
  options: props.initialData?.options || []
})

// Watch name and auto-generate slug if empty
watch(
  () => state.name,
  (newName) => {
    if (!props.isEditMode && newName && !state.slug) {
      state.slug = generateSlug(newName)
    }
  }
)

// Type options
const typeOptions = ATTRIBUTE_TYPES.map(t => ({
  value: t.value,
  label: t.label
}))

// Show options editor for single/multiple types
const showOptions = computed(() =>
  state.type === 'single' || state.type === 'multiple'
)

// Add option
function addOption() {
  if (!state.options) state.options = []
  state.options.push({
    name: '',
    slug: '',
    colorCode: '',
    sortOrder: state.options.length
  })
}

// Remove option
function removeOption(index: number) {
  state.options?.splice(index, 1)
}

// Auto-generate option slug
function generateOptionSlug(index: number) {
  const option = state.options?.[index]
  if (option && option.name && !option.slug) {
    option.slug = generateSlug(option.name)
  }
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
  <UForm :schema="attributeSchema" :state="state" class="space-y-6" @submit="onSubmit">
    <!-- Basic Info -->
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="Name" name="name" required>
        <UInput
          v-model="state.name"
          placeholder="Attribute name"
          :disabled="isSubmitting"
        />
      </UFormField>

      <UFormField label="Slug" name="slug" required>
        <UInput
          v-model="state.slug"
          placeholder="attribute-slug"
          :disabled="isSubmitting"
        />
      </UFormField>

      <UFormField label="Type" name="type" required>
        <USelect
          v-model="state.type"
          :items="typeOptions"
          value-key="value"
          :disabled="isSubmitting || isEditMode"
        />
      </UFormField>

      <UFormField v-if="state.type === 'range'" label="Unit" name="unit">
        <UInput
          v-model="state.unit"
          placeholder="e.g. cm, kg, ml"
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

    <!-- Options Section (for single/multiple types) -->
    <div v-if="showOptions" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Options</h3>
        <UButton
          type="button"
          variant="outline"
          size="sm"
          icon="i-lucide-plus"
          :disabled="isSubmitting"
          @click="addOption"
        >
          Add Option
        </UButton>
      </div>

      <div v-if="!state.options?.length" class="text-muted text-sm py-4 text-center border border-dashed rounded-lg">
        No options added yet
      </div>

      <div v-else class="space-y-3">
        <UCard v-for="(option, index) in state.options" :key="index" class="p-4">
          <div class="flex items-start gap-4">
            <div class="flex-1 grid gap-4 md:grid-cols-4">
              <!-- Name -->
              <UFormField :label="index === 0 ? 'Name' : ''" :name="`options.${index}.name`">
                <UInput
                  v-model="option.name"
                  placeholder="Option name"
                  :disabled="isSubmitting"
                  @blur="generateOptionSlug(index)"
                />
              </UFormField>

              <!-- Slug -->
              <UFormField :label="index === 0 ? 'Slug' : ''" :name="`options.${index}.slug`">
                <UInput
                  v-model="option.slug"
                  placeholder="option-slug"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <!-- Color Code -->
              <UFormField :label="index === 0 ? 'Color' : ''" :name="`options.${index}.colorCode`">
                <div class="flex gap-2">
                  <input
                    v-model="option.colorCode"
                    type="color"
                    class="h-9 w-12 rounded border cursor-pointer"
                    :disabled="isSubmitting"
                  >
                  <UInput
                    v-model="option.colorCode"
                    placeholder="#000000"
                    class="flex-1"
                    :disabled="isSubmitting"
                  />
                </div>
              </UFormField>

              <!-- Sort Order -->
              <UFormField :label="index === 0 ? 'Sort' : ''" :name="`options.${index}.sortOrder`">
                <UInput
                  v-model.number="option.sortOrder"
                  type="number"
                  min="0"
                  :disabled="isSubmitting"
                />
              </UFormField>
            </div>

            <!-- Remove button -->
            <UButton
              type="button"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="sm"
              :class="index === 0 ? 'mt-6' : ''"
              :disabled="isSubmitting"
              @click="removeOption(index)"
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
        @click="navigateTo('/attribute')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ isEditMode ? 'Update Attribute' : 'Create Attribute' }}
      </UButton>
    </div>
  </UForm>
</template>
