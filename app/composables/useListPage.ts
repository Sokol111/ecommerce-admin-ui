import type { LocationQueryRaw } from 'vue-router'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export interface UseListPageOptions {
  defaultSize?: number
}

export async function useListPage<T>(endpoint: string, options: UseListPageOptions = {}) {
  const { defaultSize = 10 } = options
  const route = useRoute()

  // Query params
  const page = computed(() => Number(route.query.page) || 1)
  const size = computed(() => Number(route.query.size) || defaultSize)

  // Fetch data
  const { data, pending, error, refresh } = await useFetch<PaginatedResponse<T>>(endpoint, {
    query: {
      page,
      size
    },
    getCachedData: () => undefined
  })

  // Computed
  const items = computed(() => data.value?.items || [])
  const total = computed(() => data.value?.total || 0)
  const totalPages = computed(() => Math.ceil(total.value / size.value))

  // Navigation
  function handlePageChange(newPage: number) {
    navigateTo({
      query: {
        ...route.query,
        page: newPage
      } as LocationQueryRaw
    })
  }

  // Row actions helper
  function createRowActions<R extends { id: string }>(row: R, basePath: string) {
    return [
      [
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => navigateTo(`${basePath}/${row.id}/edit`)
        }
      ]
    ]
  }

  return {
    // Data
    data,
    items,
    total,
    pending,
    error,
    refresh,

    // Pagination
    page,
    size,
    totalPages,
    handlePageChange,

    // Helpers
    createRowActions
  }
}
