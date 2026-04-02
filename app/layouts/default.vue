<script setup lang="ts">
const { user, logout, isLoading, isAuthenticated } = useAuth()

const requestUrl = useRequestURL()
const storeUrl = computed(() => `${requestUrl.protocol}//${requestUrl.host.replace(/^admin\./, '')}`)

const navigation = [
  {
    label: 'Home',
    to: '/',
    icon: 'i-lucide-home'
  },
  {
    label: 'Products',
    to: '/product',
    icon: 'i-lucide-package'
  },
  {
    label: 'Categories',
    to: '/category',
    icon: 'i-lucide-folder-tree'
  },
  {
    label: 'Attributes',
    to: '/attribute',
    icon: 'i-lucide-tags'
  }
]

const userMenuItems = computed(() => [
  [
    {
      label: user.value?.email || 'User',
      slot: 'account',
      disabled: true
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: () => logout()
    }
  ]
])
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-default bg-default shrink-0">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center h-16 px-4 border-b border-default">
          <NuxtLink
            to="/"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-store"
              class="h-6 w-6 text-primary"
            />
            <span class="font-semibold text-lg">Admin Panel</span>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4">
          <ul class="space-y-1">
            <li
              v-for="item in navigation"
              :key="item.to"
            >
              <ULink
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-elevated"
                active-class="bg-primary/10 text-primary"
              >
                <UIcon
                  :name="item.icon"
                  class="h-5 w-5"
                />
                {{ item.label }}
              </ULink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 border-b border-default bg-default flex items-center justify-between px-6">
        <div />

        <div class="flex items-center gap-4">
          <ClientOnly>
            <UColorModeButton />
          </ClientOnly>

          <UDropdownMenu
            v-if="isAuthenticated && !isLoading"
            :items="userMenuItems"
          >
            <UButton
              color="neutral"
              variant="ghost"
              :label="user?.email?.split('@')[0] || 'User'"
              trailing-icon="i-lucide-chevron-down"
            />
          </UDropdownMenu>
        </div>
      </header>

      <div class="bg-primary/10 text-primary text-center text-sm py-2 px-4">
        This is the admin panel. Visit the
        <a
          :href="storeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 font-medium"
        >online store</a>
        to see the customer-facing site.
      </div>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
