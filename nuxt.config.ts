// https://nuxt.com/docs/api/configuration/nuxt-config
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
  modules: ['@nuxtjs/seo'],
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
