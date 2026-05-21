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
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'date-fns',
        'zod'
      ]
    },
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
      oidc: {
        clientId: '',
        clientSecret: 'pkce-unused',
        redirectUri: '',
        logoutRedirectUri: '',
        authorizationUrl: '', // External (browser): http://localhost:3001/oidc/auth
        tokenUrl: '', // Internal (pod→Logto): http://logto:3001/oidc/token
        userinfoUrl: '', // Internal (pod→Logto): http://logto:3001/oidc/me
        logoutUrl: '', // External (browser): http://localhost:3001/oidc/session/end
        authenticationScheme: 'body',
        pkce: true,
        state: true,
        nonce: false,
        scope: [
          'openid', 'profile', 'email',
          'products:read', 'products:write', 'products:delete',
          'categories:read', 'categories:write', 'categories:delete',
          'attributes:read', 'attributes:write', 'attributes:delete',
          'users:read', 'tenants:read', 'tenants:write'
        ],
        responseMode: 'query',
        tokenRequestType: 'form-urlencoded',
        additionalAuthParameters: {
          resource: 'https://api.sokolshop.com'
        },
        additionalTokenParameters: {
          resource: 'https://api.sokolshop.com'
        },
        exposeAccessToken: true,
        validateAccessToken: false,
        validateIdToken: false
      }
    },
    session: {
      cookie: {
        secure: false,
        sameSite: 'lax'
      }
    },
    middleware: {
      globalMiddlewareEnabled: false,
      customLoginPage: true
    }
  }
})
