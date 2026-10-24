import { AnimatePresence, motion } from 'framer-motion'
import { STATIONS } from '../data/content'
import { useJourney } from '../state/journeyStore'
import { ArrowRight, RoadIcon } from './icons'

export function RoutePrompt() {
  const promptKey = useJourney((s) => s.promptKey)
  const chooseLook = useJourney((s) => s.chooseLook)
  const declineLook = useJourney((s) => s.declineLook)
  const station = STATIONS.find((stop) => stop.key === promptKey)

  return (
    <AnimatePresence>
      {station && (
        <motion.aside
          className="prompt"
          role="region"
          aria-label={`Billboard ahead: ${station.label}`}
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.985 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="prompt__tail" aria-hidden="true" />
          <div className="prompt__meta">
            <span>
              <RoadIcon width={15} height={15} />
              Stop {station.index}
            </span>
            <span>{station.label}</span>
          </div>
          <p className="prompt__question">
            Wanna have a look?
            <span>The driver can pull over for a minute.</span>
          </p>
          <div className="prompt__actions">
            <button type="button" className="btn btn-signal btn-small" onClick={chooseLook}>
              Look at the sign
              <ArrowRight width={17} height={17} />
            </button>
            <button type="button" className="btn btn-text btn-small" onClick={declineLook}>
              Keep driving
            </button>
          </div>
          <p className="prompt__hint">No stopping required. The road keeps rolling.</p>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
