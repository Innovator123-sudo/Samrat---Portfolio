import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { STATIONS } from '../data/content'
import { FINALE_PHASES, useJourney } from '../state/journeyStore'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { CONTENT_COMPONENTS } from './content'
import { ArrowRight, CloseIcon } from './icons'

export function SectionCard() {
  const showCard = useJourney((s) => s.showCard)
  const phase = useJourney((s) => s.phase)
  const closeCard = useJourney((s) => s.closeCard)
  const noteInteraction = useJourney((s) => s.noteInteraction)
  const scrollRef = useRef(null)

  const station = STATIONS.find((stop) => stop.key === showCard)
  const index = station ? STATIONS.indexOf(station) : 0
  const next = STATIONS[index + 1]
  const Content = station ? CONTENT_COMPONENTS[station.key] : null
  const isFinalePause = FINALE_PHASES.has(phase)

  const close = useCallback(() => closeCard(), [closeCard])
  const trapRef = useFocusTrap(!!station, close)

  useEffect(() => {
    noteInteraction()
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [showCard, noteInteraction])

  if (!station || !Content) return null

  return (
    <motion.div
      className="card-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <motion.div
        className={`card card--${station.key}`}
        style={{ '--card-accent': station.accent }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-card-title"
        ref={trapRef}
        tabIndex={-1}
        initial={{ y: 26, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        onPointerDown={noteInteraction}
        onKeyDown={noteInteraction}
      >
        <div className="card__rail" aria-hidden="true">
          <span>{station.index}</span>
          <span>Samrat / {station.label}</span>
        </div>

        <div className="card__chrome">
          <div className="card__crumb">
            <span>Stop {station.index} of 06</span>
            <span className="card__crumb-line" aria-hidden="true" />
            <span>{station.content.eyebrow}</span>
          </div>
          <div className="card__dots" aria-hidden="true">
            {STATIONS.map((stop, dotIndex) => (
              <span
                key={stop.key}
                className={`${dotIndex === index ? 'is-active' : ''} ${
                  dotIndex < index ? 'is-past' : ''
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            className="card__close"
            onClick={close}
            aria-label="Close and keep driving"
            data-autofocus
          >
            <CloseIcon width={21} height={21} />
            <span>Close</span>
          </button>
        </div>

        <div className="card__scroll scroll-slim" ref={scrollRef}>
          <header className="card__header">
            <p className="card__eyebrow">
              <span aria-hidden="true" />
              {station.content.eyebrow}
            </p>
            <h2 id="section-card-title">{station.content.title}</h2>
            <p className="card__lede">{station.boardSub}</p>
          </header>

          <div className="card__body">
            <Content content={station.content} />
          </div>

          <footer className="card__footer">
            <div>
              <span className="card__footer-label">
                {isFinalePause ? 'The engine is off' : next ? 'Next stop' : 'End of the road'}
              </span>
              <strong>{isFinalePause ? 'Take your time' : next ? next.label : 'Nightfall'}</strong>
            </div>
            <button type="button" className="btn btn-primary" onClick={close}>
              {isFinalePause ? 'Back to the evening' : 'Back on the road'}
              <ArrowRight width={18} height={18} />
            </button>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  )
}
