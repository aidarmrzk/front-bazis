import { useNotesStore } from '~/stores/notes'
import { NOTES_STORAGE_KEY } from '~/lib/storage'

export default defineNuxtPlugin(nuxtApp => {
  const store = useNotesStore()
  store.init()
  const sync = (event: StorageEvent) => {
    if (event.key === NOTES_STORAGE_KEY || event.key === null) store.refresh()
  }
  window.addEventListener('storage', sync)
  nuxtApp.vueApp.onUnmount(() => window.removeEventListener('storage', sync))
})
