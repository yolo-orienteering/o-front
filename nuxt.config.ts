// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
    },
  },

  css: ['@/assets/css/app.scss'],
  modules: ['@nuxt/eslint', 'nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: ['Notify', 'LocalStorage'],
  },
})
