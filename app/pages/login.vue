<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
  auth: false // Custom flag to skip auth middleware
})

const { login } = useAuth()
const notify = useNotify()

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

type LoginSchema = z.output<typeof schema>

const state = reactive<LoginSchema>({
  email: '',
  password: ''
})

const isLoading = ref(false)

async function onSubmit() {
  isLoading.value = true

  const success = await login(state.email, state.password)

  if (!success) {
    notify.error('Login failed')
  }

  isLoading.value = false
}
</script>

<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold">
          Sign in
        </h1>
        <p class="text-muted mt-1">
          Enter your credentials to access the admin panel
        </p>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="Email"
        name="email"
      >
        <UInput
          v-model="state.email"
          class="w-full"
          type="email"
          placeholder="admin@example.com"
          icon="i-lucide-mail"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
      >
        <UInput
          v-model="state.password"
          class="w-full"
          type="password"
          placeholder="Enter your password"
          icon="i-lucide-lock"
          :disabled="isLoading"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        :loading="isLoading"
        :disabled="isLoading"
      >
        Sign in
      </UButton>
    </UForm>
  </UCard>
</template>
