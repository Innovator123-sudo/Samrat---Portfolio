import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ASSET_BASE, FINALE as HIRE, IDENTITY, STATIONS } from '../data/content'
import { useJourney } from '../state/journeyStore'
import { ArrowRight, GitHubIcon, MailIcon, PlayIcon, ReadingIcon } from './icons'

export function EndCard({ onRead }) {
  const visited = useJourney((s) => s.visited)
  const beginLoopReset = useJourney((s) => s.beginLoopReset)
  const driveAgain = useJourney((s) => s.driveAgain)
  const timer = useRef(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const restart = () => {
    beginLoopReset()
    timer.current = window.setTimeout(() => driveAgain(), 900)
  }

  const seen = STATIONS.filter((station) => visited[station.key]).length

  return (
    <motion.section
      className="end-card"
      aria-labelledby="end-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        className="end-card__photo"
        src={`${ASSET_BASE}photos/open-road.jpg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <div className="end-card__veil" aria-hidden="true" />

      <header className="end-card__top">
        <span>End of the road</span>
        <span>
          {seen} of {STATIONS.length} stops
        </span>
      </header>

      <div className="end-card__content">
        <motion.p
          className="end-card__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          You made it to the last light.
        </motion.p>
        <motion.h2
          id="end-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          The road ends.
          <em>The work doesn’t.</em>
        </motion.h2>
        <motion.p
          className="end-card__lede"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {HIRE.lede} {HIRE.note}
        </motion.p>

        <motion.div
          className="end-card__actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
        >
          <a className="btn btn-signal" href={HIRE.ctas.emailHref}>
            <MailIcon width={18} height={18} />
            Email Samrat
          </a>
          <a
            className="btn btn-ghost-invert"
            href={HIRE.ctas.resumeHref}
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon width={18} height={18} />
            {HIRE.ctas.resumeLabel}
          </a>
          <button type="button" className="btn btn-ghost-invert" onClick={onRead}>
            <ReadingIcon width={18} height={18} />
            Reading edition
          </button>
        </motion.div>

        <motion.div
          className="end-card__foot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <button type="button" className="end-card__restart" onClick={restart}>
            <PlayIcon width={16} height={16} />
            Drive it again
            <ArrowRight width={16} height={16} />
          </button>
          <span className="end-card__status">
            <i aria-hidden="true" />
            {IDENTITY.availability}
          </span>
        </motion.div>
      </div>

      <footer className="end-card__credits">
        <span>Built by Samrat with React Three Fiber</span>
        <span>Type: Fraunces, Manrope & IBM Plex Mono</span>
        <span>Road photograph: Unsplash</span>
      </footer>
    </motion.section>
  )
}
