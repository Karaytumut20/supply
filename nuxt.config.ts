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
  app: { pageTransition: { name: 'page', mode: 'out-in' } },
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    viewTransition: true,
  },
  routeRules: {
    '/': { isr: 60 * 60 }, // Ana sayfayı 1 saat önbelleğe al
    '/api/projects': { swr: 60 * 5 }, // Projeler API'sini 5 dk önbelleğe al
    '/api/categories': { swr: 60 * 60 * 24 } // Kategorileri 24 saat önbelleğe al
  },
  vite: {
    build: {
      cssMinify: 'esbuild',
      minify: 'terser',
      terserOptions: { compress: { drop_console: true } }
    }
  }
})