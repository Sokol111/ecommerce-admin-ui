<script setup lang="ts">
const { user } = useAuth()

// Fetch counts from existing endpoints (size=1 to minimize payload)
const [
  { data: productsData },
  { data: categoriesData },
  { data: attributesData }
] = await Promise.all([
  useFetch('/api/catalog/products', { query: { size: 1 } }),
  useFetch('/api/catalog/categories', { query: { size: 1 } }),
  useFetch('/api/catalog/attributes', { query: { size: 1 } })
])

const stats = computed(() => [
  {
    label: 'Products',
    value: productsData.value?.total ?? '—',
    icon: 'i-lucide-package',
    to: '/product'
  },
  {
    label: 'Categories',
    value: categoriesData.value?.total ?? '—',
    icon: 'i-lucide-folder-tree',
    to: '/category'
  },
  {
    label: 'Attributes',
    value: attributesData.value?.total ?? '—',
    icon: 'i-lucide-tags',
    to: '/attribute'
  }
])
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold">
        Welcome back, {{ user?.email?.split('@')[0] || 'Admin' }}
      </h1>
      <p class="text-muted mt-1">
        Here's an overview of your e-commerce catalog.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="block"
      >
        <UCard class="hover:bg-elevated transition-colors">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-primary/10">
              <UIcon
                :name="stat.icon"
                class="h-6 w-6 text-primary"
              />
            </div>
            <div>
              <p class="text-muted text-sm">{{ stat.label }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
