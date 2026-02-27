export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@nuxtjs/seo',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt'
  ],
  auth: {
    globalAppMiddleware: false,
    provider: {
      type: 'authjs'
    }
  },
  site: {
    url: 'http://localhost:3000',
    name: 'Inspo Clone',
    description: 'A visual replication of inspo.page',
    defaultLocale: 'en'
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
