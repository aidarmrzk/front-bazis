import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useNotesStore } from '~/stores/notes'
import { validationError } from '~/lib/validation'
import { handleHistoryShortcut } from '~/lib/keyboard'

export function useNoteEditor() {
  const route = useRoute()
  const router = useRouter()
  const store = useNotesStore()
  const id = String(route.params.id)
  const isNew = id === 'new'
  const original = store.byId(id)
  const originalVersion = original?.updatedAt
  const missing = !isNew && !original
  const draft = useEditorDraft(id, original ?? { title: '', todos: [] })
  const { dialog, ask, answer } = useConfirmation()
  let allowLeave = false
  const validation = computed(() => validationError(draft.session.draft))
  const conflict = computed(() => !isNew && !missing && (!store.byId(id) ? 'deleted'
    : store.byId(id)?.updatedAt !== originalVersion ? 'changed' : ''))
  async function exit(message: string) {
    draft.clear(); allowLeave = true; store.toastMessage = message
    await router.push('/')
  }
  async function save(copy = false) {
    draft.flush()
    if (validation.value) return
    const saved = isNew || copy ? store.createNoteFromDraft(draft.session.draft)
      : store.updateNote(id, draft.session.draft, originalVersion)
    if (saved) await exit(copy ? 'Копия заметки сохранена' : 'Заметка сохранена')
  }
  async function cancel() {
    if (await ask('Отменить редактирование?', 'Несохранённые изменения будут удалены.', 'Отменить редактирование', true)) await exit('Редактирование отменено')
  }
  async function removeNote() {
    if (!await ask('Удалить заметку?', 'Заметка и её задачи будут удалены без возможности восстановления.', 'Удалить', true)) return
    if (store.deleteNote(id)) await exit('Заметка удалена')
  }
  async function guard() {
    if (allowLeave || !draft.dirty.value) return true
    const leave = await ask('Выйти без сохранения?', 'Изменения не сохранены. При выходе они будут удалены.', 'Выйти без сохранения', true)
    if (leave) { draft.clear(); allowLeave = true }
    return leave
  }
  onBeforeRouteLeave(guard)
  onBeforeRouteUpdate(guard)
  const keydown = (event: KeyboardEvent) => handleHistoryShortcut(event, draft.undo, draft.redo)
  onMounted(async () => {
    window.addEventListener('keydown', keydown)
    if (draft.recoverable && !missing) {
      if (await ask('Восстановить черновик?', 'Найдено несохранённое редактирование этой заметки.', 'Восстановить', false, 'Удалить черновик')) draft.restore()
      else draft.clear()
    }
  })
  onBeforeUnmount(() => window.removeEventListener('keydown', keydown))
  return { ...draft, isNew, missing, validation, conflict, dialog, answer, save, cancel, removeNote }
}
