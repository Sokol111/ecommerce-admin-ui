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
      oidc: {
        clientId: '',
        clientSecret: 'pkce-unused',
        redirectUri: '',
        logoutRedirectUri: '',
        authorizationUrl: '', // External (browser): http://localhost:8080/oauth/v2/authorize
        tokenUrl: '', // Internal (pod→Zitadel): http://zitadel-api:8080/oauth/v2/token
        userinfoUrl: '', // Internal (pod→Zitadel): http://zitadel-api:8080/oidc/v1/userinfo
        logoutUrl: '', // External (browser): http://localhost:8080/oidc/v1/end_session
        authenticationScheme: 'none',
        pkce: true,
        state: true,
        nonce: false,
        scope: ['openid', 'profile', 'email'],
        responseMode: 'query',
        tokenRequestType: 'form-urlencoded',
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
