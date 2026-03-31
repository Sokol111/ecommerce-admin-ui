export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.error('[vue:error]', { error, info, component: instance?.$options?.name })
  })

  nuxtApp.hook('app:error', (error) => {
    console.error('[app:error]', error)
  })
})
