const selector = 'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function activateModal(panel: HTMLElement, close: () => void): () => void {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const root = document.getElementById('__nuxt')
  const wasInert = root?.hasAttribute('inert') ?? false
  const overflow = document.body.style.overflow
  root?.setAttribute('inert', '')
  document.body.style.overflow = 'hidden'
  const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(selector))
    .filter(el => !el.closest('[hidden], [inert]') && el.getAttribute('aria-hidden') !== 'true')
  const focusFirst = () => (panel.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? panel).focus()
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return }
    if (event.key !== 'Tab') return
    const items = focusables(); const first = items[0]; const last = items.at(-1)
    if (!first || !last) { event.preventDefault(); panel.focus(); return }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
      event.preventDefault(); first.focus()
    }
  }
  function focusin(event: FocusEvent) {
    if (event.target instanceof Node && !panel.contains(event.target)) focusFirst()
  }
  document.addEventListener('keydown', keydown, true)
  document.addEventListener('focusin', focusin)
  focusFirst()
  return () => {
    document.removeEventListener('keydown', keydown, true)
    document.removeEventListener('focusin', focusin)
    if (!wasInert) root?.removeAttribute('inert')
    document.body.style.overflow = overflow
    if (previous?.isConnected) previous.focus()
  }
}
