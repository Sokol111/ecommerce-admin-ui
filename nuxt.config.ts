// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (not exposed to client)
    // Values are set from .env: NUXT_AUTH_API_URL, NUXT_CATALOG_API_URL, etc.
    authApiUrl: '',
    catalogApiUrl: '',
    imageApiUrl: '',

    // Cookie settings
    cookieSecure: false,
    cookieSameSite: 'lax',

    // Public (exposed to client)
    public: {
      authApiUrl: '',
      catalogApiUrl: '',
      imageApiUrl: ''
    }
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
      function removePagesWithComponents(pages: any[]) {
        for (let i = pages.length - 1; i >= 0; i--) {
          const page = pages[i]
          if (page.path.includes('_components') || page.name?.includes('_components')) {
            pages.splice(i, 1)
          } else if (page.children) {
            removePagesWithComponents(page.children)
          }
        }
      }
      removePagesWithComponents(pages)
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

  icon: {
    serverBundle: 'local'
  }
})
