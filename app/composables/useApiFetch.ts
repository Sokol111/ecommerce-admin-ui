export function useApiFetch<T = Record<string, unknown>>(
  request: Parameters<typeof useFetch<T>>[0],
  options?: Parameters<typeof useFetch<T>>[1]
) {
  return useFetch<T>(request, {
    ...options,
    $fetch: useNuxtApp().$api
  })
}
