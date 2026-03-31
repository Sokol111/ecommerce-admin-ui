<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

const statusCode = computed(() => props.error.status || 500)
const message = computed(() => {
  if (statusCode.value === 401) return 'You are not authorized to access this page.'
  if (statusCode.value === 404) return 'The page you are looking for does not exist.'
  return 'Something went wrong. Please try again later.'
})

useSeoMeta({ title: `Error ${statusCode.value}` })
</script>

<template>
  <UApp>
    <div class="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 class="text-6xl font-bold text-primary mb-4">
        {{ statusCode }}
      </h1>
      <p class="text-lg text-muted mb-8">
        {{ message }}
      </p>
      <UButton
        label="Go Home"
        size="lg"
        @click="handleError"
      />
    </div>
  </UApp>
</template>
