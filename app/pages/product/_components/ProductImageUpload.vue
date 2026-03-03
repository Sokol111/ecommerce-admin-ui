<script setup lang="ts">
const props = defineProps<{
  imageId?: string | null
  ownerId: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:imageId': [id: string | undefined]
}>()

const { upload, uploadState, uploadProgress, isUploading, reset, validateFile } = useImageUpload({
  role: 'main',
  onUploaded: (id: string) => {
    emit('update:imageId', id)
    loadPreview(id)
  }
})

const fileInputRef = ref<HTMLInputElement>()
const isDragging = ref(false)
const previewUrl = ref<string>()
const isLoadingPreview = ref(false)

// Load preview for existing imageId
async function loadPreview(imageId: string) {
  isLoadingPreview.value = true
  try {
    const result = await $fetch(`/api/images/${imageId}/url`, {
      query: { w: 400, quality: 80 }
    }) as { url: string }
    previewUrl.value = result.url
  } catch {
    previewUrl.value = undefined
  } finally {
    isLoadingPreview.value = false
  }
}

// Load preview on mount if imageId exists
onMounted(() => {
  if (props.imageId) {
    loadPreview(props.imageId)
  }
})

// Watch for external imageId changes
watch(() => props.imageId, (newId) => {
  if (newId) {
    loadPreview(newId)
  } else {
    previewUrl.value = undefined
  }
})

async function handleFile(file: File) {
  const error = validateFile(file)
  if (error) return

  await upload(file, {
    ownerId: props.ownerId,
    ownerType: 'draft'
  })
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  // Reset input so the same file can be re-selected
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function removeImage() {
  previewUrl.value = undefined
  reset()
  emit('update:imageId', undefined)
}

const statusLabel = computed(() => {
  switch (uploadState.value) {
    case 'presigning': return 'Preparing...'
    case 'uploading': return `Uploading ${uploadProgress.value}%`
    case 'confirming': return 'Processing...'
    case 'done': return 'Uploaded'
    case 'error': return 'Failed'
    default: return ''
  }
})

const hasImage = computed(() => !!previewUrl.value || !!props.imageId)
</script>

<template>
  <div class="space-y-2">
    <!-- Preview -->
    <div
      v-if="hasImage && !isUploading"
      class="relative group rounded-lg overflow-hidden border border-default bg-elevated w-48 h-48"
    >
      <!-- Loading skeleton -->
      <div
        v-if="isLoadingPreview && !previewUrl"
        class="w-full h-full flex items-center justify-center"
      >
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <!-- Image preview -->
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Product image"
        class="w-full h-full object-cover"
      >

      <!-- Overlay with actions -->
      <div
        v-if="!disabled"
        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
      >
        <UButton
          icon="i-lucide-replace"
          color="neutral"
          variant="ghost"
          size="sm"
          title="Replace image"
          @click="triggerFileSelect"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          title="Remove image"
          @click="removeImage"
        />
      </div>
    </div>

    <!-- Upload zone (when there's no image) -->
    <div
      v-if="!hasImage || isUploading"
      class="relative rounded-lg border-2 border-dashed transition-colors w-48 h-48 flex flex-col items-center justify-center cursor-pointer"
      :class="[
        isDragging ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50',
        disabled || isUploading ? 'pointer-events-none opacity-60' : ''
      ]"
      @click="triggerFileSelect"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
    >
      <!-- Upload progress -->
      <template v-if="isUploading">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary mb-2" />
        <span class="text-sm text-muted">{{ statusLabel }}</span>
        <div v-if="uploadState === 'uploading'" class="w-32 mt-2">
          <UProgress :value="uploadProgress" size="xs" />
        </div>
      </template>

      <!-- Default state -->
      <template v-else>
        <UIcon name="i-lucide-image-plus" class="size-8 text-muted mb-2" />
        <span class="text-sm text-muted text-center px-2">
          Drop image here or click to upload
        </span>
        <span class="text-xs text-dimmed mt-1">
          JPEG, PNG, WebP, AVIF · Max 10 MB
        </span>
      </template>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      class="hidden"
      :disabled="disabled || isUploading"
      @change="onFileSelected"
    >
  </div>
</template>
