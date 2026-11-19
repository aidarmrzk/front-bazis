export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  typescript: { strict: true, typeCheck: true },
  app: { head: { title: 'Базис — заметки и задачи', htmlAttrs: { lang: 'ru' } } },
})
