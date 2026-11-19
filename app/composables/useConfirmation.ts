export function useConfirmation() {
  const dialog = reactive({ open: false, title: '', message: '', confirmText: '', cancelText: '', danger: false })
  let resolve: ((value: boolean) => void) | undefined
  function answer(value: boolean) {
    dialog.open = false
    resolve?.(value)
    resolve = undefined
  }
  function ask(title: string, message: string, confirmText: string, danger = false, cancelText = 'Остаться') {
    if (dialog.open) return Promise.resolve(false)
    Object.assign(dialog, { open: true, title, message, confirmText, cancelText, danger })
    return new Promise<boolean>(done => { resolve = done })
  }
  onBeforeUnmount(() => answer(false))
  return { dialog, ask, answer }
}
