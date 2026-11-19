import { afterEach, describe, expect, it } from 'vitest'
import { handleHistoryShortcut } from '../../app/lib/keyboard'
import { activateModal } from '../../app/lib/modal-focus'

afterEach(() => { document.body.innerHTML = '' })
describe('history shortcuts', () => {
  it.each([{ ctrlKey: true }, { metaKey: true }])('undo and redo outside inputs', modifier => {
    let count = 0
    const undo = () => count--; const redo = () => count++
    const e = new KeyboardEvent('keydown', { key: 'z', ...modifier, cancelable: true })
    handleHistoryShortcut(e, undo, redo); expect(count).toBe(-1); expect(e.defaultPrevented).toBe(true)
    handleHistoryShortcut(new KeyboardEvent('keydown', { key: 'Z', ...modifier, shiftKey: true }), undo, redo)
    expect(count).toBe(0)
  })
  it.each(['input', 'textarea', 'div'])('preserves native undo in %s', tag => {
    const field = document.createElement(tag)
    if (tag === 'div') field.setAttribute('contenteditable', 'true')
    document.body.append(field); let count = 0
    field.addEventListener('keydown', e => handleHistoryShortcut(e as KeyboardEvent, () => count++, () => count++))
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true })
    field.dispatchEvent(event); expect(count).toBe(0); expect(event.defaultPrevented).toBe(false)
  })
  it('ignores shortcuts while a modal is open', () => {
    document.body.innerHTML = '<section aria-modal="true"></section>'; let count = 0
    handleHistoryShortcut(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }), () => count++, () => count++)
    expect(count).toBe(0)
  })
})
describe('modal focus', () => {
  it('wraps focus, blocks the background, closes on Escape and restores focus', () => {
    document.body.innerHTML = '<div id="__nuxt"><button id="opener">Open</button></div><section tabindex="-1"><button id="first">Cancel</button><button id="disabled" disabled>Disabled</button><button id="last">Confirm</button></section>'
    const opener = document.querySelector<HTMLButtonElement>('#opener')!; opener.focus()
    const panel = document.querySelector('section')!; let closed = false
    const stop = activateModal(panel, () => { closed = true })
    expect(document.activeElement?.id).toBe('first')
    document.querySelector<HTMLButtonElement>('#last')!.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    expect(document.activeElement?.id).toBe('first')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }))
    expect(document.activeElement?.id).toBe('last')
    expect(document.querySelector('#__nuxt')?.hasAttribute('inert')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); expect(closed).toBe(true)
    stop(); expect(document.activeElement).toBe(opener)
    expect(document.querySelector('#__nuxt')?.hasAttribute('inert')).toBe(false)
  })
  it('focuses the panel if all buttons are disabled', () => {
    const panel = document.createElement('section'); panel.tabIndex = -1; document.body.append(panel)
    const stop = activateModal(panel, () => {})
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    expect(document.activeElement).toBe(panel); stop()
  })
})
