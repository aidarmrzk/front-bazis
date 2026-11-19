import type { EditableNote } from './types'
import { cloneEditable, isEditable } from './validation'

export class DraftPersistence {
  private timer: ReturnType<typeof setTimeout> | undefined
  private pending: EditableNote | null = null
  private key: string
  constructor(private storage: Storage | undefined, noteId: string, private onError = (_message: string) => {}) {
    this.key = `notes-spa:draft:${noteId}`
  }
  read(): EditableNote | null {
    try {
      const raw = this.storage?.getItem(this.key)
      if (!raw) return null
      const payload = JSON.parse(raw)
      const draft = payload.schemaVersion === undefined ? payload : payload.draft
      if (payload.schemaVersion !== undefined && payload.schemaVersion !== 1 || !isEditable(draft)) {
        throw new Error('Invalid draft')
      }
      return cloneEditable(draft)
    } catch { this.onError('Не удалось восстановить черновик: хранилище недоступно или данные повреждены.'); return null }
  }
  schedule(draft: EditableNote) {
    this.pending = cloneEditable(draft)
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.flush(), 350)
  }
  flush() {
    clearTimeout(this.timer)
    if (!this.pending) return
    try {
      if (!this.storage) throw new Error('Storage unavailable')
      this.storage.setItem(this.key, JSON.stringify({ schemaVersion: 1, draft: this.pending }))
      this.pending = null
    } catch { this.onError('Черновик не сохранён. Проверьте доступ к хранилищу браузера и свободное место.') }
  }
  clear() {
    clearTimeout(this.timer)
    this.pending = null
    try { this.storage?.removeItem(this.key) }
    catch { this.onError('Не удалось удалить черновик из хранилища браузера.') }
  }
}
