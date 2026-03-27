// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],

  devtools: {
    enabled: import.meta.dev
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (not exposed to client)
    // Values are set from .env: NUXT_AUTH_API_URL, NUXT_CATALOG_API_URL, etc.
    authApiUrl: '',
    catalogApiUrl: '',
    imageApiUrl: '',

    // Cookie settings (override with NUXT_COOKIE_SECURE=false for local dev)
    cookieSecure: true,
    cookieSameSite: 'lax'
  },

  routeRules: {
    '/login': { ssr: true }
  },

  experimental: {
    typedPages: true
  },

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      allowedHosts: true
    }
  },

  hooks: {
    'pages:extend': function (pages) {
      interface NuxtPage { path: string, name?: string, children?: NuxtPage[] }
      function removePagesWithComponents(pages: NuxtPage[]) {
        for (let i = pages.length - 1; i >= 0; i--) {
          const page = pages[i]!
          if (page.path.includes('_components') || page.name?.includes('_components')) {
            pages.splice(i, 1)
          } else if (page.children) {
            removePagesWithComponents(page.children)
          }
        }
      }
      removePagesWithComponents(pages as NuxtPage[])
    }
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: false,
        commaDangle: 'never',
        braceStyle: '1tbs',
        arrowParens: true
      }
    }
  },

  fonts: {
    provider: 'none'
  },

  icon: {
    serverBundle: 'local'
  }
})
