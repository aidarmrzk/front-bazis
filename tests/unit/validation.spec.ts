import { describe, expect, it } from 'vitest'
import { isEditable, normalize, validationError } from '../../app/lib/validation'

describe('note validation', () => {
  it('allows a title without tasks', () => expect(validationError({ title: 'Планы', todos: [] })).toBe(''))
  it('rejects a title longer than 120 characters', () => {
    expect(validationError({ title: 'x'.repeat(121), todos: [] })).toBeTruthy()
  })
  it('rejects a task longer than 1000 characters', () => {
    expect(validationError({ title: 'Планы', todos: [{ id: 'a', text: 'x'.repeat(1001), completed: false }] })).toBeTruthy()
  })
  it('does not accept duplicate task ids or malformed booleans', () => {
    const todo = { id: 'a', text: 'x', completed: false }
    expect(isEditable({ title: 'Планы', todos: [todo, todo] })).toBe(false)
    expect(isEditable({ title: 'Планы', todos: [{ ...todo, completed: 'false' }] })).toBe(false)
  })
  it('normalizes boundary whitespace without modifying the draft', () => {
    const draft = { title: ' План ', todos: [{ id: 'a', text: ' Первый пункт ', completed: false }] }
    expect(normalize(draft)).toEqual({ title: 'План', todos: [{ id: 'a', text: 'Первый пункт', completed: false }] })
    expect(draft.title).toBe(' План ')
  })
})
