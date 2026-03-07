<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AttributeResponse } from '@sokol111/ecommerce-catalog-service-api'

const {
  items,
  total,
  pending,
  error,
  page,
  size,
  totalPages,
  handlePageChange,
  createRowActions
} = await useListPage<AttributeResponse>('/api/catalog/attributes')

// Table columns
const columns: TableColumn<AttributeResponse>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'options', header: 'Options' },
  { accessorKey: 'enabled', header: 'Status' },
  { id: 'actions', header: '' }
]

// Type labels
const typeLabels: Record<string, string> = {
  single: 'Single',
  multiple: 'Multiple',
  range: 'Range',
  boolean: 'Boolean',
  text: 'Text'
}
</script>

<template>
  <div>
    <ClientOnly>
      <ListPageHeader
        title="Attributes"
        :total="total"
        create-to="/attribute/create"
        create-label="Create Attribute"
        :error="error"
      />
    </ClientOnly>

    <!-- Table -->
    <UCard>
      <ClientOnly>
        <UTable
          :columns="columns"
          :data="items"
        >
          <template #name-cell="{ row }">
            <span class="font-medium">{{ row.original.name }}</span>
          </template>

          <template #slug-cell="{ row }">
            <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ row.original.slug }}</code>
          </template>

          <template #type-cell="{ row }">
            <UBadge color="info" variant="subtle">
              {{ typeLabels[row.original.type] || row.original.type }}
            </UBadge>
          </template>

          <template #options-cell="{ row }">
            <UBadge color="neutral" variant="subtle">
              {{ row.original.options?.length || 0 }}
            </UBadge>
          </template>

          <template #enabled-cell="{ row }">
            <StatusBadge :enabled="row.original.enabled" />
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="createRowActions(row.original, '/attribute')">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-more-horizontal"
                size="sm"
              />
            </UDropdownMenu>
          </template>
        </UTable>

        <template #fallback>
          <TableSkeleton :columns="6" />
        </template>
      </ClientOnly>

      <!-- Pagination -->
      <template v-if="totalPages > 1" #footer>
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
