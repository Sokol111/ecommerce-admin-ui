<script setup lang="ts">
import type {
  AttributeResponse,
  CategoryAttribute
} from '@sokol111/ecommerce-catalog-service-api'
import type { ProductAttributeData } from '~/schemas/product.schema'

const props = defineProps<{
  categoryAttributes: CategoryAttribute[]
  allAttributes: AttributeResponse[]
  disabled?: boolean
}>()

const attributes = defineModel<ProductAttributeData[]>('modelValue', {
  default: () => []
})

// Build a lookup map for attribute definitions
const attributeMap = computed(() => {
  const map = new Map<string, AttributeResponse>()
  for (const attr of props.allAttributes) {
    map.set(attr.id, attr)
  }
  return map
})

// Category attributes sorted by sortOrder, with their full definitions
const resolvedAttributes = computed(() =>
  [...props.categoryAttributes]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((ca) => ({
      categoryAttr: ca,
      definition: attributeMap.value.get(ca.attributeId)
    }))
    .filter((r) => r.definition != null)
)

// Get current value for an attribute
function getAttrValue(attributeId: string): ProductAttributeData | undefined {
  return attributes.value.find((a) => a.attributeId === attributeId)
}

// Update a specific attribute value
function updateAttrValue(attributeId: string, patch: Partial<ProductAttributeData>) {
  const idx = attributes.value.findIndex((a) => a.attributeId === attributeId)
  const updated = { attributeId, ...patch }

  if (idx >= 0) {
    const newArr = [...attributes.value]
    newArr[idx] = updated
    attributes.value = newArr
  } else {
    attributes.value = [...attributes.value, updated]
  }
}

// Remove empty attribute values for attributes no longer in the category
watch(
  () => props.categoryAttributes,
  (newCategoryAttrs) => {
    const validIds = new Set(newCategoryAttrs.map((ca) => ca.attributeId))
    attributes.value = attributes.value.filter((a) => validIds.has(a.attributeId))
  }
)

// Helper: option items for single/multiple select
function getOptionItems(def: AttributeResponse) {
  return (def.options || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((opt) => ({
      value: opt.slug,
      label: opt.name
    }))
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        Attributes
      </h3>
      <span class="text-muted text-sm">
        {{ resolvedAttributes.length }} attribute{{ resolvedAttributes.length !== 1 ? 's' : '' }} from category
      </span>
    </div>

    <div
      v-if="resolvedAttributes.length === 0"
      class="text-muted text-sm py-4 text-center border border-dashed rounded-lg"
    >
      No attributes defined for this category
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="{ categoryAttr, definition } in resolvedAttributes"
        :key="categoryAttr.attributeId"
        class="grid gap-4 md:grid-cols-2 items-start"
      >
        <!-- Single select -->
        <UFormField
          v-if="definition!.type === 'single'"
          :label="`${definition!.name}${definition!.unit ? ` (${definition!.unit})` : ''}`"
          :name="`attr-${categoryAttr.attributeId}`"
        >
          <USelect
            :model-value="getAttrValue(categoryAttr.attributeId)?.optionSlugValue"
            :items="getOptionItems(definition!)"
            :placeholder="`Select ${definition!.name.toLowerCase()}`"
            value-key="value"
            :disabled="disabled"
            @update:model-value="(v: string) => updateAttrValue(categoryAttr.attributeId, { optionSlugValue: v || undefined })"
          />
        </UFormField>

        <!-- Multiple select -->
        <UFormField
          v-else-if="definition!.type === 'multiple'"
          :label="`${definition!.name}${definition!.unit ? ` (${definition!.unit})` : ''}`"
          :name="`attr-${categoryAttr.attributeId}`"
        >
          <USelectMenu
            :model-value="getAttrValue(categoryAttr.attributeId)?.optionSlugValues || []"
            :items="getOptionItems(definition!)"
            multiple
            :placeholder="`Select ${definition!.name.toLowerCase()}`"
            value-key="value"
            :disabled="disabled"
            @update:model-value="(v: string[]) => updateAttrValue(categoryAttr.attributeId, { optionSlugValues: v.length > 0 ? v : undefined })"
          />
        </UFormField>

        <!-- Range (numeric with unit) -->
        <UFormField
          v-else-if="definition!.type === 'range'"
          :label="`${definition!.name}${definition!.unit ? ` (${definition!.unit})` : ''}`"
          :name="`attr-${categoryAttr.attributeId}`"
        >
          <UInput
            :model-value="getAttrValue(categoryAttr.attributeId)?.numericValue"
            type="number"
            step="any"
            :placeholder="`Enter ${definition!.name.toLowerCase()}`"
            :disabled="disabled"
            @update:model-value="(v: string | number) => updateAttrValue(categoryAttr.attributeId, { numericValue: v !== '' && v != null ? Number(v) : undefined })"
          >
            <template
              v-if="definition!.unit"
              #trailing
            >
              <span class="text-muted text-sm">{{ definition!.unit }}</span>
            </template>
          </UInput>
        </UFormField>

        <!-- Boolean -->
        <UFormField
          v-else-if="definition!.type === 'boolean'"
          :label="`${definition!.name}${definition!.unit ? ` (${definition!.unit})` : ''}`"
          :name="`attr-${categoryAttr.attributeId}`"
        >
          <div class="flex items-center gap-2 pt-1">
            <USwitch
              :model-value="getAttrValue(categoryAttr.attributeId)?.booleanValue ?? false"
              :disabled="disabled"
              @update:model-value="(v: boolean) => updateAttrValue(categoryAttr.attributeId, { booleanValue: v })"
            />
            <span class="text-sm">
              {{ getAttrValue(categoryAttr.attributeId)?.booleanValue ? 'Yes' : 'No' }}
            </span>
          </div>
        </UFormField>

        <!-- Text -->
        <UFormField
          v-else-if="definition!.type === 'text'"
          :label="`${definition!.name}${definition!.unit ? ` (${definition!.unit})` : ''}`"
          :name="`attr-${categoryAttr.attributeId}`"
          class="md:col-span-2"
        >
          <UInput
            :model-value="getAttrValue(categoryAttr.attributeId)?.textValue || ''"
            :placeholder="`Enter ${definition!.name.toLowerCase()}`"
            :disabled="disabled"
            @update:model-value="(v: string) => updateAttrValue(categoryAttr.attributeId, { textValue: v || undefined })"
          />
        </UFormField>

        <!-- Role badge -->
        <div
          v-if="definition!.type !== 'text'"
          class="flex items-center gap-2 pt-7"
        >
          <UBadge
            :color="categoryAttr.role === 'variant' ? 'primary' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ categoryAttr.role }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>
