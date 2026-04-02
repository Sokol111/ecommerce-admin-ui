<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { ProductResponse } from '@sokol111/ecommerce-catalog-service-api';

const {
  items,
  total,
  pending: _pending,
  error,
  page,
  size,
  totalPages,
  handlePageChange,
  createRowActions,
  deleteTarget,
  deleteLoading,
  confirmDelete,
  cancelDelete
} = await useListPage<ProductResponse>('/api/catalog/products')

// Table columns
const columns: TableColumn<ProductResponse>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'quantity', header: 'Quantity' },
  { accessorKey: 'enabled', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <div>
    <ClientOnly>
      <ListPageHeader
        title="Products"
        :total="total"
        create-to="/product/create"
        create-label="Create Product"
        :error="error"
      />
    </ClientOnly>

    <!-- Table -->
    <UCard>
      <ClientOnly>
        <UTable
          :columns="columns"
          :data="items"
          class="transition-opacity duration-200"
          :class="{ 'opacity-50': _pending }"
        >
          <template #name-cell="{ row }">
            <span class="font-medium">{{ row.original.name }}</span>
          </template>

          <template #price-cell="{ row }">
            ${{ row.original.price.toFixed(2) }}
          </template>

          <template #quantity-cell="{ row }">
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ row.original.quantity }}
            </UBadge>
          </template>

          <template #enabled-cell="{ row }">
            <StatusBadge :enabled="row.original.enabled" />
          </template>

          <template #createdAt-cell="{ row }">
            <div class="text-sm">
              <div>{{ formatDate(row.original.createdAt).date }}</div>
              <div class="text-muted">
                {{ formatDate(row.original.createdAt).time }}
              </div>
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="createRowActions(row.original, '/product', { deleteEndpoint: '/api/catalog/products' })">
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

    <!-- Delete Confirmation Modal -->
    <UModal
      :open="!!deleteTarget"
      @update:open="(val: boolean) => !val && cancelDelete()"
    >
      <template #header>
        <h3 class="text-lg font-semibold">
          Delete Product
        </h3>
      </template>

      <template #body>
        <p>
          Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>? This action cannot be undone.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            label="Cancel"
            @click="cancelDelete"
          />
          <UButton
            color="error"
            label="Delete"
            :loading="deleteLoading"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
