import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotesStore } from '../../app/stores/notes'
import { NOTES_STORAGE_KEY, serializeNotesStorage } from '../../app/lib/storage'

const draft = { title: ' План ', todos: [{ id: 't1', text: ' Дело ', completed: false }] }
beforeEach(() => { setActivePinia(createPinia()); localStorage.clear() })
function setup() { const s = useNotesStore(); s.init(localStorage); return s }
describe('notes store', () => {
  it('normalizes and persists explicit saves synchronously', () => {
    const s = setup(); const id = s.createNoteFromDraft(draft)
    expect(s.byId(id!)?.title).toBe('План')
    expect(s.byId(id!)?.todos[0]?.text).toBe('Дело')
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!).notes).toHaveLength(1)
    draft.todos[0]!.text = ' Дело '
  })
  it('updates and deletes saved notes', () => {
    const s = setup(); const id = s.createNoteFromDraft(draft)!
    expect(s.updateNote(id, { title: 'Новый', todos: [] })).toBe(true)
    expect(s.byId(id)?.title).toBe('Новый')
    expect(s.deleteNote(id)).toBe(true)
    expect(s.byId(id)).toBeUndefined()
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!).notes).toEqual([])
  })
  it.each([{ title: ' ', todos: [] }, { title: 'Есть', todos: [{ id: 'a', text: ' ', completed: false }] }])('rejects empty fields', value => {
    const s = setup(); expect(s.createNoteFromDraft(value)).toBeNull(); expect(s.notes).toEqual([])
  })
  it('does not mutate saved data if quota is exceeded', () => {
    const s = setup()
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(s.createNoteFromDraft(draft)).toBeNull()
    expect(s.notes).toEqual([]); expect(s.error).toBeTruthy(); spy.mockRestore()
  })
  it('keeps notes saved by another tab before a local save', () => {
    const a = setup(); const id = a.createNoteFromDraft(draft)!
    setActivePinia(createPinia()); const b = setup()
    const second = b.createNoteFromDraft({ title: 'Другая', todos: [] })!
    expect(a.updateNote(id, { title: 'Правка', todos: [] })).toBe(true)
    expect(a.byId(second)?.title).toBe('Другая')
  })
  it('does not resurrect an externally deleted note', () => {
    const s = setup(); const id = s.createNoteFromDraft(draft)!
    localStorage.setItem(NOTES_STORAGE_KEY, serializeNotesStorage([]))
    expect(s.updateNote(id, draft)).toBe(false); expect(s.byId(id)).toBeUndefined()
  })
  it('refuses stale updates to an externally edited note', () => {
    const a = setup(); const id = a.createNoteFromDraft(draft)!
    const version = a.byId(id)!.updatedAt
    setActivePinia(createPinia()); const b = setup(); b.updateNote(id, { title: 'Чужая', todos: [] })
    expect(a.updateNote(id, draft, version)).toBe(false)
    expect(a.byId(id)?.title).toBe('Чужая')
  })
  it('preserves unsupported storage on attempted save', () => {
    const raw = '{"schemaVersion":999,"notes":[]}'
    localStorage.setItem(NOTES_STORAGE_KEY, raw); const s = setup()
    expect(s.createNoteFromDraft(draft)).toBeNull()
    expect(localStorage.getItem(NOTES_STORAGE_KEY)).toBe(raw)
  })
  it('handles denied storage reads', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    const s = setup(); expect(s.error).toBeTruthy(); expect(s.createNoteFromDraft(draft)).toBeNull()
    spy.mockRestore()
  })
})
