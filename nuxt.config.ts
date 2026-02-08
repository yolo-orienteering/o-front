// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL
    }
  },

  css: ['@/assets/css/app.scss'],
  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: ['Notify', 'LocalStorage'],
    components: {
      defaults: {
        QBtn: {
          outline: true
        }
      }
    },
    extras: {
      fontIcons: ['material-icons', 'material-icons-outlined', 'mdi-v7']
    },
    cssAddon: true
  }
})
