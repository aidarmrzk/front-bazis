import { describe, expect, it } from 'vitest'
import { parseNotesStorage, serializeNotesStorage } from '../../app/lib/storage'

export const note = {
  id: 'note-1', title: 'Планы', todos: [{ id: 't1', text: 'Задача', completed: false }],
  createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
}
describe('versioned storage', () => {
  it('round trips existing v1 notes', () => {
    expect(parseNotesStorage(serializeNotesStorage([note]))).toEqual([note])
  })
  it('accepts an empty database', () => expect(parseNotesStorage(null)).toEqual([]))
  it.each(['{', '{}', '{"schemaVersion":99,"notes":[]}',
    JSON.stringify({ schemaVersion: 1, notes: [{ ...note, todos: null }] }),
    JSON.stringify({ schemaVersion: 1, notes: [{ ...note, updatedAt: 'yesterday' }] }),
    JSON.stringify({ schemaVersion: 1, notes: [note, note] }),
    JSON.stringify({ schemaVersion: 1, notes: [{ ...note, todos: [note.todos[0], note.todos[0]] }] }),
  ])('rejects malformed or unsupported data without overwriting it: %s', raw => {
    expect(() => parseNotesStorage(raw)).toThrow()
  })
  it('migrates v0 items and done flags', () => {
    const legacy = { version: 0, notes: [{ ...note, todos: undefined,
      items: [{ id: 't1', text: 'Задача', done: true }] }] }
    expect(parseNotesStorage(JSON.stringify(legacy))).toEqual([
      { ...note, todos: [{ id: 't1', text: 'Задача', completed: true }] },
    ])
  })
})
