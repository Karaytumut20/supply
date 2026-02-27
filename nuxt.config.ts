export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: { tailwindcss: {}, autoprefixer: {} },
  },
  modules: [
    '@nuxtjs/seo',
    '@pinia/nuxt'
  ],
  site: {
    url: 'http://localhost:3000',
    name: 'Inspo Clone'
  },
  app: { pageTransition: { name: 'page', mode: 'out-in' } }
})