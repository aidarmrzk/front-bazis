import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createId } from '../lib/ids'
import { NOTES_STORAGE_KEY, parseNotesStorage, serializeNotesStorage } from '../lib/storage'
import { normalize, validationError } from '../lib/validation'
import type { EditableNote, Note } from '../lib/types'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const initialized = ref(false)
  const error = ref('')
  const toastMessage = ref('')
  let storage: Storage | undefined
  const byId = (id: string) => notes.value.find(n => n.id === id)
  function refresh(): boolean {
    try {
      if (!storage) throw new Error('Storage unavailable')
      notes.value = parseNotesStorage(storage.getItem(NOTES_STORAGE_KEY))
      error.value = ''
      return true
    } catch {
      error.value = 'Не удалось прочитать хранилище. Данные могут быть повреждены или созданы новой версией. Существующие данные не перезаписаны.'
      return false
    }
  }
  function init(source?: Storage) {
    if (initialized.value) return
    try { storage = source ?? window.localStorage } catch { /* refresh reports unavailable storage */ }
    initialized.value = true
    refresh()
  }
  function persist(next: Note[]): boolean {
    try {
      if (!storage) throw new Error('Storage unavailable')
      storage.setItem(NOTES_STORAGE_KEY, serializeNotesStorage(next))
      notes.value = next
      error.value = ''
      return true
    } catch {
      error.value = 'Не удалось сохранить изменения. Проверьте свободное место и доступ к хранилищу браузера.'
      return false
    }
  }
  function valid(draft: EditableNote): boolean {
    error.value = validationError(draft)
    return !error.value
  }
  function createNoteFromDraft(draft: EditableNote): string | null {
    if (!valid(draft) || !refresh()) return null
    const id = createId('note')
    const timestamp = new Date().toISOString()
    return persist([{ ...normalize(draft), id, createdAt: timestamp, updatedAt: timestamp }, ...notes.value]) ? id : null
  }
  function updateNote(id: string, draft: EditableNote, expectedUpdatedAt?: string): boolean {
    if (!valid(draft) || !refresh()) return false
    const existing = byId(id)
    if (!existing) { error.value = 'Заметка удалена в другой вкладке. Сохраните изменения как новую заметку.'; return false }
    if (expectedUpdatedAt && existing.updatedAt !== expectedUpdatedAt) {
      error.value = 'Заметка изменена в другой вкладке. Сохраните свою версию как копию.'
      return false
    }
    const updatedAt = new Date(Math.max(Date.now(), Date.parse(existing.updatedAt) + 1)).toISOString()
    return persist(notes.value.map(n => n.id === id ? { ...n, ...normalize(draft), updatedAt } : n))
  }
  function deleteNote(id: string): boolean {
    if (!refresh()) return false
    return persist(notes.value.filter(n => n.id !== id))
  }
  return { notes, initialized, error, toastMessage, byId, init, refresh, createNoteFromDraft, updateNote, deleteNote }
})
