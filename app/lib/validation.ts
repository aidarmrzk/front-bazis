import type { EditableNote, Note, TodoItem } from './types'

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
function id(value: unknown): value is string { return typeof value === 'string' && value.length > 0 }
export function isTodo(value: unknown): value is TodoItem {
  return object(value) && id(value.id) && typeof value.text === 'string' && typeof value.completed === 'boolean'
}
export function isEditable(value: unknown): value is EditableNote {
  if (!object(value) || typeof value.title !== 'string' || !Array.isArray(value.todos)) return false
  return value.todos.every(isTodo) && new Set(value.todos.map(t => t.id)).size === value.todos.length
}
export function isNote(value: unknown): value is Note {
  return object(value) && isEditable(value) && id(value.id) && value.id !== 'new'
    && typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt))
    && typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
}
export function validationError(draft: EditableNote): string {
  if (!draft.title.trim()) return 'Укажите название заметки.'
  if (draft.title.trim().length > 120) return 'Название должно быть не длиннее 120 символов.'
  if (draft.todos.some(t => !t.text.trim())) return 'Заполните текст каждого пункта или удалите пустой пункт.'
  if (draft.todos.some(t => t.text.trim().length > 1000)) return 'Текст пункта должен быть не длиннее 1000 символов.'
  return ''
}
export function cloneEditable(draft: EditableNote): EditableNote {
  return structuredClone({ title: draft.title, todos: draft.todos.map(t => ({ ...t })) })
}
export function normalize(draft: EditableNote): EditableNote {
  return { title: draft.title.trim(), todos: draft.todos.map(t => ({ ...t, text: t.text.trim() })) }
}
