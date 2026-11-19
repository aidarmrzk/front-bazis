import { EditorSession } from '~/lib/editor-session'
import { DraftPersistence } from '~/lib/drafts'
import { createId } from '~/lib/ids'
import type { EditableNote } from '~/lib/types'
import { cloneEditable } from '~/lib/validation'

export function useEditorDraft(noteId: string, source: EditableNote) {
  const baseline = JSON.stringify(cloneEditable(source))
  const session = reactive(new EditorSession(source))
  const draftError = ref('')
  let storage: Storage | undefined
  try { storage = window.sessionStorage } catch { draftError.value = 'Черновики недоступны в этом браузере.' }
  const persistence = new DraftPersistence(storage, noteId, message => { draftError.value = message })
  const dirty = computed(() => JSON.stringify(cloneEditable(session.draft)) !== baseline)
  const recoverable = persistence.read()
  function changed(action: () => void) {
    action()
    if (dirty.value) persistence.schedule(session.draft)
    else persistence.clear()
  }
  const text = (field: string, value: string) => changed(() => session.text(field, value))
  const toggle = (id: string) => changed(() => session.toggle(id))
  const remove = (id: string) => changed(() => session.remove(id))
  async function add() {
    const todo = { id: createId('todo'), text: '', completed: false }
    changed(() => session.add(todo))
    await nextTick()
    document.getElementById(`todo-${todo.id}`)?.focus()
  }
  const undo = () => changed(() => session.undo())
  const redo = () => changed(() => session.redo())
  const flush = () => session.flush()
  function clear() { session.reset(); persistence.clear() }
  function restore() { if (recoverable) changed(() => session.restore(recoverable)) }
  function pagehide() { session.flush(); persistence.flush() }
  onMounted(() => window.addEventListener('pagehide', pagehide))
  onBeforeUnmount(() => { window.removeEventListener('pagehide', pagehide); persistence.flush(); session.reset() })
  return { session, dirty, draftError, recoverable, text, toggle, remove, add, undo, redo, flush, clear, restore }
}
