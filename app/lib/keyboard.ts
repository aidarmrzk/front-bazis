export function handleHistoryShortcut(event: KeyboardEvent, undo: () => void, redo: () => void) {
  if (event.defaultPrevented || event.isComposing || event.altKey
    || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
  const target = event.composedPath()[0] ?? event.target
  if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return
  if (document.querySelector('[aria-modal="true"]')) return
  event.preventDefault()
  if (event.shiftKey) redo()
  else undo()
}
