import { motion } from 'framer-motion'
import { IDENTITY, STATIONS } from '../data/content'
import { ArrowRight, PlayIcon, ReadingIcon, RoadIcon } from './icons'

const ease = [0.22, 1, 0.36, 1]

export function Landing({ onStart, onRead, soundOn, onToggleSound, ready, progress = 0, reducedMotion }) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100)
  return (
    <motion.section
      className="landing"
      aria-labelledby="landing-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.8, ease } }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease } }}
    >
      <div className="landing__veil" aria-hidden="true" />

      <div className="landing__content">
        <motion.p
          className="landing__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease }}
        >
          <span className="status-dot" aria-hidden="true" />
          {IDENTITY.status}
        </motion.p>

        <motion.h1
          id="landing-title"
          className="landing__title"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.9, ease }}
        >
          Take the long way
          <em>to the work.</em>
        </motion.h1>

        <motion.p
          className="landing__intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.75, ease }}
        >
          {IDENTITY.intro}
        </motion.p>

        <motion.div
          className="landing__actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7, ease }}
        >
          <button
            type="button"
            className="btn btn-signal landing__start"
            onClick={onStart}
            disabled={!ready}
            aria-describedby="landing-load-status"
          >
            <PlayIcon width={19} height={19} />
            Start the drive
            <span className="landing__key" aria-hidden="true">
              {ready ? '↵' : `${pct}%`}
            </span>
          </button>
          <button
            type="button"
            className="btn btn-ghost landing__read"
            onClick={onRead}
            aria-label="Exit to the reading edition"
          >
            <ReadingIcon width={19} height={19} />
            Exit
          </button>
        </motion.div>

        <motion.p
          className={`landing__load ${ready ? 'is-ready' : ''}`}
          id="landing-load-status"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.68, duration: 0.6 }}
        >
          <span className="landing__load-line" aria-hidden="true">
            <span style={{ transform: `scaleX(${ready ? 1 : Math.max(0.05, progress)})` }} />
          </span>
          {ready ? 'The road is ready · 100%' : `Preparing the road · ${pct}%`}
          <span className="landing__exit-note">Exit opens the full portfolio as a reading page.</span>
        </motion.p>

        <motion.div
          className="landing__meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <span>
            <RoadIcon width={16} height={16} /> 6 billboards
          </span>
          <span>about 4 minutes</span>
          {reducedMotion && <span className="landing__reduced">Reduced motion on</span>}
          <button type="button" className="landing__sound" onClick={onToggleSound}>
            {soundOn ? 'Sound on' : 'Sound off'}
            <span className={`switch ${soundOn ? 'is-on' : ''}`} aria-hidden="true">
              <span />
            </span>
          </button>
        </motion.div>
      </div>

      <motion.aside
        className="landing__route"
        aria-label="Route"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.65, duration: 0.8, ease }}
      >
        <div className="landing__route-head">
          <span>Scenic route</span>
          <span>06 stops</span>
        </div>
        <ol>
          {STATIONS.map((station) => (
            <li key={station.key}>
              <span>{station.index}</span>
              <span>{station.label}</span>
              <span className="route-dash" aria-hidden="true" />
            </li>
          ))}
        </ol>
        <div className="landing__route-foot">
          <span>Devdaha → wherever</span>
          <ArrowRight width={17} height={17} />
        </div>
      </motion.aside>

      <motion.div
        className="landing__corner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span>Independent front-end developer</span>
        <span>© 2026 Samrat Bhusal</span>
      </motion.div>
    </motion.section>
  )
}
