import type { EditableNote, TodoItem } from './types'
import { cloneEditable } from './validation'
import { PatchHistory, applyPatch, type Patch } from './patch-history'

interface Pending { field: string; before: string; after: string }

export class EditorSession {
  public draft: EditableNote
  private history = new PatchHistory()
  private pending: Pending | null = null
  private timer: ReturnType<typeof setTimeout> | undefined

  constructor(source: EditableNote) { this.draft = cloneEditable(source) }
  get canUndo() { return this.history.canUndo || !!this.pending && this.pending.before !== this.pending.after }
  get canRedo() { return this.history.canRedo }

  text(field: string, value: string) {
    const item = field === 'title' ? undefined : this.draft.todos.find(t => t.id === field)
    if (field !== 'title' && !item) return
    const old = field === 'title' ? this.draft.title : item!.text
    if (old === value) return
    if (this.pending && this.pending.field !== field) this.flush()
    this.history.clearFuture()
    this.pending ??= { field, before: old, after: value }
    this.pending.after = value
    if (field === 'title') this.draft.title = value
    else item!.text = value
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.flush(), 650)
  }
  flush() {
    clearTimeout(this.timer)
    const p = this.pending
    this.pending = null
    if (!p || p.before === p.after) return
    this.history.record(p.field === 'title'
      ? { kind: 'title', before: p.before, after: p.after }
      : { kind: 'text', id: p.field, before: p.before, after: p.after })
  }
  private commit(patch: Patch) {
    this.flush()
    applyPatch(this.draft, patch, 'redo')
    this.history.record(patch)
  }
  toggle(id: string) {
    const todo = this.draft.todos.find(t => t.id === id)
    if (todo) this.commit({ kind: 'completed', id, before: todo.completed, after: !todo.completed })
  }
  add(todo: TodoItem) {
    if (this.draft.todos.some(t => t.id === todo.id)) return
    this.commit({ kind: 'insert', index: this.draft.todos.length, todo: structuredClone(todo) })
  }
  remove(id: string) {
    this.flush()
    const index = this.draft.todos.findIndex(t => t.id === id)
    const todo = this.draft.todos[index]
    if (todo) this.commit({ kind: 'remove', index, todo: structuredClone({ ...todo }) })
  }
  undo() { this.flush(); this.history.undo(this.draft) }
  redo() { this.flush(); this.history.redo(this.draft) }
  reset() { clearTimeout(this.timer); this.pending = null; this.history.reset() }
  restore(draft: EditableNote) { this.reset(); this.draft = cloneEditable(draft) }
}
