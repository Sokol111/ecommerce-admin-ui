// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt', 'nuxt-oidc-auth'],

  devtools: {
    enabled: import.meta.dev
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (not exposed to client)
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
    provider: 'local'
  },

  icon: {
    serverBundle: 'local'
  },

  oidc: {
    providers: {
      zitadel: {
        clientId: '', // NUXT_OIDC_PROVIDERS_ZITADEL_CLIENT_ID
        clientSecret: '', // Empty for PKCE
        redirectUri: '', // NUXT_OIDC_PROVIDERS_ZITADEL_REDIRECT_URI
        baseUrl: '', // NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL
        audience: '', // NUXT_OIDC_PROVIDERS_ZITADEL_AUDIENCE (usually same as clientId)
        logoutRedirectUri: '', // NUXT_OIDC_PROVIDERS_ZITADEL_LOGOUT_REDIRECT_URI
        authenticationScheme: 'none', // PKCE, no client secret
        exposeAccessToken: true // Expose to server-side handlers for API calls
      }
    },
    middleware: {
      globalMiddlewareEnabled: true,
      customLoginPage: true
    }
  }
})
