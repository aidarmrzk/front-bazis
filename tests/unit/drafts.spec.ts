import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DraftPersistence } from '../../app/lib/drafts'

beforeEach(() => { vi.useFakeTimers(); sessionStorage.clear() })
afterEach(() => vi.useRealTimers())
const value = { title: 'Черновик', todos: [{ id: 't', text: '', completed: false }] }
describe('draft persistence', () => {
  it('reports failed removal and cancels the pending write anyway', () => {
    const p = new DraftPersistence(sessionStorage, 'new')
    p.schedule(value)
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('denied') })
    p.clear(); spy.mockRestore(); vi.runAllTimers()
    expect(p.read()).toBeNull()
  })
  it('debounces writes and recovers the latest version', () => {
    const p = new DraftPersistence(sessionStorage, 'new'); p.schedule(value)
    vi.advanceTimersByTime(300); p.schedule({ title: 'Последний', todos: [] })
    vi.advanceTimersByTime(349); expect(p.read()).toBeNull()
    vi.advanceTimersByTime(1)
    expect(new DraftPersistence(sessionStorage, 'new').read()).toEqual({ title: 'Последний', todos: [] })
  })
  it('flushes synchronously before pagehide', () => {
    const p = new DraftPersistence(sessionStorage, 'new'); p.schedule(value); p.flush()
    expect(p.read()).toEqual(value)
  })
  it('does not resurrect drafts after save or cancel', () => {
    const p = new DraftPersistence(sessionStorage, 'new'); p.schedule(value); p.clear(); vi.runAllTimers()
    expect(p.read()).toBeNull()
  })
  it('isolates drafts by note and copies pending data', () => {
    const p = new DraftPersistence(sessionStorage, 'one')
    const draft = { title: 'Один', todos: [] }; p.schedule(draft); draft.title = 'Два'; p.flush()
    expect(p.read()?.title).toBe('Один'); expect(new DraftPersistence(sessionStorage, 'two').read()).toBeNull()
  })
  it.each(['{', '{"schemaVersion":99,"draft":{"title":"x","todos":[]}}',
    '{"schemaVersion":1,"draft":{"title":"x","todos":[null]}}'])('ignores malformed drafts and reports the error', raw => {
    sessionStorage.setItem('notes-spa:draft:new', raw)
    let error = ''; const p = new DraftPersistence(sessionStorage, 'new', message => { error = message })
    expect(p.read()).toBeNull(); expect(error).toBeTruthy()
  })
  it('migrates drafts from the existing application', () => {
    sessionStorage.setItem('notes-spa:draft:new', JSON.stringify(value))
    expect(new DraftPersistence(sessionStorage, 'new').read()).toEqual(value)
  })
  it('reports unavailable draft storage', () => {
    let message = ''; const p = new DraftPersistence(undefined, 'new', text => { message = text })
    p.schedule(value); p.flush(); expect(message).toBeTruthy()
  })
})
