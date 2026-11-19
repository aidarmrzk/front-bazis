import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorSession } from '../../app/lib/editor-session'
import { reactive } from 'vue'

const initial = () => ({ title: 'Начало', todos: [{ id: 'a', text: 'Первый', completed: false }] })
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())
describe('editing session', () => {
  it('supports the reactive session used by the editor', () => {
    const s = reactive(new EditorSession(initial()))
    s.add({ id: 'b', text: 'Второй', completed: false }); s.undo(); s.redo()
    s.text('b', 'Правка'); s.remove('b'); s.undo(); s.undo()
    expect(s.draft.todos[1]?.text).toBe('Второй')
  })
  it('groups continuous input until blur', () => {
    const s = new EditorSession(initial()); s.text('title', 'Н'); s.text('title', 'Новый')
    s.flush(); s.undo(); expect(s.draft.title).toBe('Начало')
    expect(s.canUndo).toBe(false); s.redo(); expect(s.draft.title).toBe('Новый')
  })
  it('commits after 650 ms of inactivity', () => {
    const s = new EditorSession(initial()); s.text('title', 'Один'); vi.advanceTimersByTime(650)
    s.text('title', 'Два'); vi.advanceTimersByTime(650)
    s.undo(); expect(s.draft.title).toBe('Один'); s.undo(); expect(s.draft.title).toBe('Начало')
  })
  it('separates fields and checkbox changes', () => {
    const s = new EditorSession(initial()); s.text('title', 'Название'); s.text('a', 'Текст'); s.toggle('a')
    s.undo(); expect(s.draft.todos[0]?.completed).toBe(false)
    s.undo(); expect(s.draft.todos[0]?.text).toBe('Первый')
    s.undo(); expect(s.draft.title).toBe('Начало')
  })
  it('restores removed items at the original position with their latest text', () => {
    const s = new EditorSession(initial()); s.add({ id: 'b', text: 'Второй', completed: true })
    s.text('a', 'Правка'); s.remove('a'); s.undo()
    expect(s.draft.todos.map(t => t.id)).toEqual(['a', 'b'])
    expect(s.draft.todos[0]?.text).toBe('Правка')
    s.undo(); expect(s.draft.todos[0]?.text).toBe('Первый')
    s.undo(); expect(s.draft.todos.map(t => t.id)).toEqual(['a'])
    s.redo(); s.redo(); s.redo(); expect(s.draft.todos.map(t => t.id)).toEqual(['b'])
  })
  it('drops redo immediately on new typing', () => {
    const s = new EditorSession(initial()); s.toggle('a'); s.undo(); expect(s.canRedo).toBe(true)
    s.text('title', 'Правка'); expect(s.canRedo).toBe(false)
  })
  it('does not clear redo for a no-op', () => {
    const s = new EditorSession(initial()); s.toggle('a'); s.undo(); s.text('title', 'Начало')
    expect(s.canRedo).toBe(true)
  })
  it('retains exactly 50 atomic operations', () => {
    const s = new EditorSession(initial())
    for (let n = 1; n <= 70; n++) { s.text('title', String(n)); s.flush() }
    let count = 0
    while (s.canUndo) { s.undo(); count++ }
    expect(count).toBe(50); expect(s.draft.title).toBe('20')
  })
  it('resets pending input, past and future on save or cancel', () => {
    const s = new EditorSession(initial()); s.toggle('a'); s.text('title', 'Правка'); s.reset()
    vi.runAllTimers(); expect(s.canUndo).toBe(false); expect(s.canRedo).toBe(false)
  })
  it('copies incoming note and inserted item', () => {
    const source = initial(); const s = new EditorSession(source); source.todos[0]!.text = 'Постороннее'
    const item = { id: 'b', text: 'Второй', completed: false }; s.add(item); item.text = 'Постороннее'
    expect(s.draft.todos.map(t => t.text)).toEqual(['Первый', 'Второй'])
  })
  it('ignores missing items and empty undo/redo', () => {
    const s = new EditorSession(initial()); s.remove('missing'); s.toggle('missing'); s.text('missing', 'x')
    s.undo(); s.redo(); expect(s.draft).toEqual(initial()); expect(s.canUndo).toBe(false)
  })
  it('restores a draft without creating history', () => {
    const s = new EditorSession(initial()); s.toggle('a'); s.restore({ title: 'Черновик', todos: [] })
    expect(s.draft).toEqual({ title: 'Черновик', todos: [] }); expect(s.canUndo).toBe(false)
  })
  it('treats a new item and its checkbox as separate actions', () => {
    const s = new EditorSession(initial()); s.add({ id: 'b', text: '', completed: false }); s.toggle('b')
    s.undo(); expect(s.draft.todos[1]?.completed).toBe(false)
    s.undo(); expect(s.draft.todos).toHaveLength(1)
  })
})
