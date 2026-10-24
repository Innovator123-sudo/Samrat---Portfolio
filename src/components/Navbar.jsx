import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STATIONS } from '../data/content'
import { FINALE_PHASES, PHASES, useJourney } from '../state/journeyStore'
import {
  CloseIcon,
  MenuIcon,
  MoonIcon,
  ReadingIcon,
  SoundOffIcon,
  SoundOnIcon,
  SunIcon,
  Wordmark,
} from './icons'

export function Navbar({ onToggleSound, onRead, started }) {
  const soundOn = useJourney((s) => s.soundOn)
  const nightMode = useJourney((s) => s.nightMode)
  const toggleNightMode = useJourney((s) => s.toggleNightMode)
  const phase = useJourney((s) => s.phase)
  const ready = useJourney((s) => s.ready)
  const showCard = useJourney((s) => s.showCard)
  const promptKey = useJourney((s) => s.promptKey)
  const visited = useJourney((s) => s.visited)
  const menuOpen = useJourney((s) => s.menuOpen)
  const toggleMenu = useJourney((s) => s.toggleMenu)
  const closeMenu = useJourney((s) => s.closeMenu)
  const goTo = useJourney((s) => s.goTo)

  const activeKey = showCard || promptKey
  const navLocked =
    !ready ||
    FINALE_PHASES.has(phase) ||
    phase === PHASES.LOOP_RESET ||
    phase === PHASES.STARTING

  useEffect(() => {
    closeMenu()
  }, [showCard, closeMenu])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, closeMenu])

  const navigate = (key) => {
    closeMenu()
    goTo(key)
  }

  return (
    <>
      <header className={`nav ${started ? 'nav--journey' : 'nav--intro'}`}>
        <div className="nav__inner">
          <span className="nav__brand">
            <Wordmark compact />
          </span>

          {started && (
            <nav className="nav__route" aria-label="Journey stops">
              {STATIONS.map((station, index) => {
                const status = visited[station.key]
                const isCurrent = activeKey === station.key
                return (
                  <button
                    type="button"
                    key={station.key}
                    className={`nav__stop ${isCurrent ? 'is-current' : ''} ${
                      status ? 'is-visited' : ''
                    } ${station.finale ? 'is-final' : ''}`}
                    onClick={() => navigate(station.key)}
                    disabled={navLocked}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`Stop ${index + 1}: ${station.label}${
                      status ? ' (visited)' : ''
                    }`}
                  >
                    <span className="nav__stop-num">{station.index}</span>
                    <span className="nav__stop-label">{station.label}</span>
                  </button>
                )
              })}
            </nav>
          )}

          <div className="nav__tools">
            <button
              type="button"
              className="icon-button nav__night"
              onClick={toggleNightMode}
              aria-pressed={nightMode}
              aria-label={nightMode ? 'Switch to day drive' : 'Switch to night drive'}
              title={nightMode ? 'Switch to day drive (N)' : 'Switch to night drive (N)'}
            >
              {nightMode ? <SunIcon width={19} height={19} /> : <MoonIcon width={19} height={19} />}
            </button>
            <button
              type="button"
              className="icon-button nav__sound"
              onClick={onToggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
              title={soundOn ? 'Mute sound (M)' : 'Enable sound (M)'}
            >
              {soundOn ? <SoundOnIcon width={19} height={19} /> : <SoundOffIcon width={19} height={19} />}
            </button>
            <button
              type="button"
              className="icon-button nav__read"
              onClick={onRead}
              aria-label="Open reading edition"
              title="Reading edition"
            >
              <ReadingIcon width={19} height={19} />
            </button>
            {started && (
              <button
                type="button"
                className="icon-button nav__menu-button"
                onClick={toggleMenu}
                aria-expanded={menuOpen}
                aria-controls="mobile-route"
                aria-label={menuOpen ? 'Close route menu' : 'Open route menu'}
              >
                {menuOpen ? <CloseIcon width={21} height={21} /> : <MenuIcon width={21} height={21} />}
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {started && menuOpen && (
          <motion.div
            className="mobile-menu"
            id="mobile-route"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mobile-menu__label">Route / six stops</p>
            <ol>
              {STATIONS.map((station) => (
                <li key={station.key}>
                  <button
                    type="button"
                    onClick={() => navigate(station.key)}
                    disabled={navLocked}
                    className={activeKey === station.key ? 'is-current' : ''}
                  >
                    <span>{station.index}</span>
                    <strong>{station.label}</strong>
                    <span>{visited[station.key] ? 'Visited' : 'Open'}</span>
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="btn btn-ghost mobile-menu__read" onClick={onRead}>
              <ReadingIcon width={18} height={18} />
              Read the whole story
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
