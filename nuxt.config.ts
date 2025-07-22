// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['@/css/app.scss'],
  modules: ['@nuxt/eslint', 'nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: ['Notify', 'LocalStorage'],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/css/quasar.variables.scss";`,
        },
      },
    },
  },
})
