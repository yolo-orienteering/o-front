// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['@/assets/css/app.scss'],
  modules: ['@nuxt/eslint', 'nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: ['Notify', 'LocalStorage'],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/css/quasar.variables.scss";`,
        },
      },
    },
  },
})
