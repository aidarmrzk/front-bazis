import type { Note } from './types'
import { STORAGE_SCHEMA_VERSION } from './types'
import { isNote } from './validation'

export const NOTES_STORAGE_KEY = 'notes-spa:data'

export function parseNotesStorage(raw: string | null): Note[] {
  if (raw === null) return []
  const parsed = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid database')
  let notes: unknown = parsed.notes
  if (parsed.version === 0 && Array.isArray(notes)) {
    notes = notes.map(n => ({ ...n, todos: Array.isArray(n.items)
      ? n.items.map((t: Record<string, unknown>) => ({ id: t.id, text: t.text, completed: t.done })) : null }))
  } else if (parsed.schemaVersion !== STORAGE_SCHEMA_VERSION) {
    throw new Error('Unsupported database version')
  }
  if (!Array.isArray(notes) || !notes.every(isNote) || new Set(notes.map(n => n.id)).size !== notes.length) {
    throw new Error('Invalid notes')
  }
  return notes.map(n => ({ id: n.id, title: n.title, todos: n.todos.map(t => ({ ...t })),
    createdAt: n.createdAt, updatedAt: n.updatedAt }))
}
export function serializeNotesStorage(notes: Note[]): string {
  return JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION, notes })
}
