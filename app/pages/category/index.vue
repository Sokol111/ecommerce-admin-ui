<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { CategoryResponse } from '@sokol111/ecommerce-catalog-service-api';

const {
  items,
  total,
  pending: _pending,
  error,
  page,
  size,
  totalPages,
  handlePageChange,
  createRowActions
} = await useListPage<CategoryResponse>('/api/catalog/categories')

// Table columns
const columns: TableColumn<CategoryResponse>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'attributes', header: 'Attributes' },
  { accessorKey: 'enabled', header: 'Status' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <div>
    <ClientOnly>
      <ListPageHeader
        title="Categories"
        :total="total"
        create-to="/category/create"
        create-label="Create Category"
        :error="error"
      />
    </ClientOnly>

    <!-- Table -->
    <UCard>
      <ClientOnly>
        <Transition
          name="fade"
          mode="out-in"
        >
          <UTable
            :key="page"
            :columns="columns"
            :data="items"
          >
            <template #name-cell="{ row }">
              <span class="font-medium">{{ row.original.name }}</span>
            </template>

            <template #attributes-cell="{ row }">
              <UBadge
                color="neutral"
                variant="subtle"
              >
                {{ row.original.attributes?.length || 0 }}
              </UBadge>
            </template>

            <template #enabled-cell="{ row }">
              <StatusBadge :enabled="row.original.enabled" />
            </template>

            <template #actions-cell="{ row }">
              <UDropdownMenu :items="createRowActions(row.original, '/category')">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-more-horizontal"
                  size="sm"
                />
              </UDropdownMenu>
            </template>
          </UTable>
        </Transition>

        <template #fallback>
          <TableSkeleton :columns="4" />
        </template>
      </ClientOnly>

      <!-- Pagination -->
      <template
        v-if="totalPages > 1"
        #footer
      >
        <div class="flex justify-center">
          <UPagination
            :default-page="page"
            :total="total"
            :items-per-page="size"
            @update:page="handlePageChange"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>
