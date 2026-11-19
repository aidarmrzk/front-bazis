import type { EditableNote, TodoItem } from './types'

export type Patch =
  | { kind: 'title'; before: string; after: string }
  | { kind: 'text'; id: string; before: string; after: string }
  | { kind: 'completed'; id: string; before: boolean; after: boolean }
  | { kind: 'insert' | 'remove'; index: number; todo: TodoItem }

export function applyPatch(draft: EditableNote, patch: Patch, direction: 'undo' | 'redo') {
  const forward = direction === 'redo'
  if (patch.kind === 'title') { draft.title = forward ? patch.after : patch.before; return }
  if (patch.kind === 'text' || patch.kind === 'completed') {
    const todo = draft.todos.find(t => t.id === patch.id)
    if (!todo) return
    if (patch.kind === 'text') todo.text = forward ? patch.after : patch.before
    else todo.completed = forward ? patch.after : patch.before
    return
  }
  if ((patch.kind === 'insert') === forward) {
    draft.todos.splice(patch.index, 0, structuredClone({ ...patch.todo }))
  } else {
    const index = draft.todos.findIndex(t => t.id === patch.todo.id)
    if (index !== -1) draft.todos.splice(index, 1)
  }
}

export class PatchHistory {
  private past: Patch[] = []
  private future: Patch[] = []
  get canUndo() { return this.past.length > 0 }
  get canRedo() { return this.future.length > 0 }
  clearFuture() { this.future = [] }
  record(patch: Patch) {
    this.past.push(structuredClone(patch))
    if (this.past.length > 50) this.past.shift()
    this.clearFuture()
  }
  undo(draft: EditableNote) {
    const patch = this.past.pop()
    if (patch) { applyPatch(draft, patch, 'undo'); this.future.push(patch) }
  }
  redo(draft: EditableNote) {
    const patch = this.future.pop()
    if (patch) { applyPatch(draft, patch, 'redo'); this.past.push(patch) }
  }
  reset() { this.past = []; this.future = [] }
}
