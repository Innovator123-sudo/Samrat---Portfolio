import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useJourney } from '../state/journeyStore'
import { CloseIcon } from './icons'

export function Toast() {
  const toast = useJourney((s) => s.toast)
  const toastId = useJourney((s) => s.toastId)
  const clearToast = useJourney((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(clearToast, 6000)
    return () => window.clearTimeout(timer)
  }, [toast, toastId, clearToast])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toastId}
            className="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            <p>{toast}</p>
            <button type="button" onClick={clearToast} aria-label="Dismiss message">
              <CloseIcon width={16} height={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
