import type { PresignResponse } from '@sokol111/ecommerce-image-service-api'

export type UploadState = 'idle' | 'presigning' | 'uploading' | 'confirming' | 'done' | 'error'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MiB

interface UploadParams {
  ownerId: string
  ownerType?: 'draft' | 'product'
  alt?: string
}

interface UseImageUploadOptions {
  role?: 'main' | 'gallery' | 'other'
  onUploaded?: (imageId: string) => void
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const notify = useNotify()

  const uploadState = ref<UploadState>('idle')
  const uploadProgress = ref(0)
  const errorMessage = ref<string>()
  const uploadedImageId = ref<string>()

  const isUploading = computed(() =>
    ['presigning', 'uploading', 'confirming'].includes(uploadState.value)
  )

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      return `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum: 10 MB`
    }
    if (file.size === 0) {
      return 'File is empty'
    }
    return null
  }

  async function upload(file: File, params: UploadParams): Promise<string | null> {
    const validationError = validateFile(file)
    if (validationError) {
      errorMessage.value = validationError
      uploadState.value = 'error'
      notify.error(validationError, 'Upload Error')
      return null
    }

    errorMessage.value = undefined
    uploadProgress.value = 0

    try {
      // Step 1: Get presigned URL
      uploadState.value = 'presigning'
      const presignBody = {
        ownerType: params.ownerType || 'draft',
        ownerId: params.ownerId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        role: options.role || 'main'
      }
      console.log('[upload] Step 1: presign request', presignBody)
      const presignResult = await $fetch('/api/images/presign', {
        method: 'POST',
        body: presignBody
      }) as { success: boolean, data?: PresignResponse, error?: { title?: string, detail?: string } }
      console.log('[upload] Step 1: presign response', presignResult)

      if (!presignResult.success || !presignResult.data) {
        throw new Error(presignResult.error?.detail || 'Failed to get upload URL')
      }

      const { uploadUrl, uploadToken, formData } = presignResult.data

      // Step 2: Upload file directly to S3/MinIO
      uploadState.value = 'uploading'
      console.log('[upload] Step 2: uploading to', uploadUrl)
      console.log('[upload] Step 2: formData fields', Object.keys(formData))
      const multipartForm = new FormData()

      // Form fields must be added BEFORE the file
      for (const [key, value] of Object.entries(formData)) {
        multipartForm.append(key, value)
      }
      multipartForm.append('file', file)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            uploadProgress.value = Math.round((e.loaded / e.total) * 100)
          }
        })

        xhr.addEventListener('load', () => {
          console.log('[upload] Step 2: XHR response status', xhr.status, xhr.responseText?.substring(0, 500))
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText?.substring(0, 200)}`))
          }
        })

        xhr.addEventListener('error', () => {
          console.error('[upload] Step 2: XHR network error')
          reject(new Error('Upload failed'))
        })
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

        xhr.open('POST', uploadUrl)
        xhr.send(multipartForm)
      })

      // Step 3: Confirm upload
      uploadState.value = 'confirming'
      const confirmBody = {
        uploadToken,
        alt: params.alt || file.name.replace(/\.[^.]+$/, ''),
        role: options.role || 'main'
      }
      console.log('[upload] Step 3: confirm request', { ...confirmBody, uploadToken: confirmBody.uploadToken.substring(0, 20) + '...' })
      const confirmResult = await $fetch('/api/images/confirm', {
        method: 'POST',
        body: confirmBody
      }) as { success: boolean, data?: { id: string }, error?: { title?: string, detail?: string } }
      console.log('[upload] Step 3: confirm response', confirmResult)

      if (!confirmResult.success || !confirmResult.data) {
        throw new Error(confirmResult.error?.detail || 'Failed to confirm upload')
      }

      // Done
      uploadState.value = 'done'
      uploadProgress.value = 100
      uploadedImageId.value = confirmResult.data.id
      options.onUploaded?.(confirmResult.data.id)

      return confirmResult.data.id
    } catch (err) {
      uploadState.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Upload failed'
      console.error('[upload] Error:', err)
      notify.error(errorMessage.value, 'Upload Error')
      return null
    }
  }

  function reset() {
    uploadState.value = 'idle'
    uploadProgress.value = 0
    errorMessage.value = undefined
    uploadedImageId.value = undefined
  }

  return {
    uploadState,
    uploadProgress,
    errorMessage,
    uploadedImageId,
    isUploading,
    upload,
    reset,
    validateFile
  }
}
