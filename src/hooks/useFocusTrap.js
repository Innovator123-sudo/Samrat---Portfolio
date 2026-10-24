import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active, onClose) {
  const containerRef = useRef(null)
  const returnFocus = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!active) return undefined
    returnFocus.current = document.activeElement
    const node = containerRef.current
    if (!node) return undefined

    const focusFirst = window.requestAnimationFrame(() => {
      const target =
        node.querySelector('[data-autofocus]') ||
        node.querySelector(FOCUSABLE) ||
        node
      target.focus?.({ preventScroll: true })
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(
        (element) =>
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true' &&
          element.getClientRects().length > 0,
      )
      if (!items.length) {
        event.preventDefault()
        node.focus?.()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.cancelAnimationFrame(focusFirst)
      document.removeEventListener('keydown', handleKeyDown, true)
      const previous = returnFocus.current
      if (previous && previous.isConnected) {
        window.requestAnimationFrame(() => previous.focus?.({ preventScroll: true }))
      }
    }
  }, [active])

  return containerRef
}
