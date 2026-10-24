import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { STATIONS } from './data/content'
import { FINALE_PHASES, PHASES, useJourney } from './state/journeyStore'
import { journeyAudio } from './audio/journeyAudio'

const Scene = lazy(() => import('./journey/Scene'))
import { Landing } from './components/Landing'
import { Navbar } from './components/Navbar'
import { HUD } from './components/HUD'
import { RoutePrompt } from './components/RoutePrompt'
import { SectionCard } from './components/SectionCard'
import { EndCard } from './components/EndCard'
import { StaticPortfolio } from './components/StaticPortfolio'
import { Toast } from './components/Toast'

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('webgl')
    if (!gl) return false
    /* Tearing down in the same tick can make the very next getContext() fail
       on some browsers — a false "unsupported". Free it a few beats later. */
    window.setTimeout(() => gl.getExtension('WEBGL_lose_context')?.loseContext(), 400)
    return true
  } catch {
    return false
  }
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    this.props.onFailure?.(error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function App() {
  const [webglSupported] = useState(canUseWebGL)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const ready = useJourney((s) => s.ready)
  const phase = useJourney((s) => s.phase)
  const started = useJourney((s) => s.started)
  const staticMode = useJourney((s) => s.staticMode)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const theme = useJourney((s) => s.theme)
  const soundOn = useJourney((s) => s.soundOn)
  const loadProgress = useJourney((s) => s.loadProgress)
  const letterbox = useJourney((s) => s.letterbox)
  const showCard = useJourney((s) => s.showCard)
  const promptKey = useJourney((s) => s.promptKey)
  const markReady = useJourney((s) => s.markReady)
  const setLoadProgress = useJourney((s) => s.setLoadProgress)
  const deepLinkDone = useRef(false)

  const effectiveStatic = staticMode || !webglSupported || sceneFailed
  const readingReason = !webglSupported
    ? 'unsupported'
    : sceneFailed
      ? 'scene-crash'
      : reducedMotion
        ? 'reduced-motion'
        : 'choice'
  const showChrome =
    !effectiveStatic &&
    ready &&
    sceneReady &&
    phase !== PHASES.END_CARD &&
    phase !== PHASES.LOOP_RESET
  const showLanding =
    !effectiveStatic &&
    !started &&
    !showCard &&
    phase !== PHASES.END_CARD &&
    phase !== PHASES.LOOP_RESET

  useEffect(() => {
    document.body.classList.toggle('mode-static', effectiveStatic)
    if (effectiveStatic) window.scrollTo(0, 0)
    return () => document.body.classList.remove('mode-static')
  }, [effectiveStatic])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const color = effectiveStatic
        ? theme === 'dark'
          ? '#10120e'
          : '#f4eee4'
        : '#16131f'
      meta.setAttribute('content', color)
    }
  }, [theme, effectiveStatic])

  useEffect(() => {
    if (effectiveStatic) return undefined
    let progress = Math.max(0.06, useJourney.getState().loadProgress)
    const timer = window.setInterval(() => {
      progress = Math.min(0.97, progress + 0.022 + Math.random() * 0.018)
      setLoadProgress(progress)
    }, 160)
    return () => window.clearInterval(timer)
  }, [effectiveStatic, setLoadProgress])

  useEffect(() => {
    if (effectiveStatic || !sceneReady) return undefined
    let cancelled = false
    setLoadProgress(1)
    const finish = async () => {
      try {
        await document.fonts?.ready
      } catch {
        /* fonts will fall back cleanly */
      }
      await new Promise((resolve) => window.setTimeout(resolve, 520))
      if (cancelled) return
      setLoadProgress(1)
      markReady()
    }
    finish()
    return () => {
      cancelled = true
    }
  }, [effectiveStatic, sceneReady, setLoadProgress, markReady])

  useEffect(() => {
    journeyAudio.setEnabled(!effectiveStatic && soundOn)
  }, [effectiveStatic, soundOn])

  useEffect(() => {
    const resume = () => {
      const s = useJourney.getState()
      if (s.soundOn && !s.staticMode) journeyAudio.setEnabled(true)
    }
    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })
    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }, [])

  useEffect(() => {
    if (!ready || effectiveStatic || deepLinkDone.current) return
    deepLinkDone.current = true
    const hash = decodeURIComponent(window.location.hash.replace('#', ''))
    const station = STATIONS.find((stop) => stop.key === hash)
    if (station && !useJourney.getState().started) {
      useJourney.getState().goTo(station.key)
    }
  }, [ready, effectiveStatic])

  const handleSceneReady = useCallback(() => setSceneReady(true), [])

  const handleSceneFailure = useCallback((error) => {
    if (import.meta.env.DEV) console.error(error)
    setSceneFailed(true)
    useJourney.getState().setStaticMode(true)
    useJourney
      .getState()
      .notify('The 3D drive could not start, so the reading edition is open instead.')
  }, [])

  const handleContextLost = useCallback(() => {
    handleSceneFailure(new Error('WebGL context lost'))
  }, [handleSceneFailure])

  const startJourney = useCallback(() => {
    const s = useJourney.getState()
    if (!s.ready || s.staticMode) return
    if (s.soundOn) journeyAudio.setEnabled(true)
    s.startJourney()
  }, [])

  const toggleSound = useCallback(() => {
    const s = useJourney.getState()
    if (s.staticMode) return
    const next = s.toggleSound()
    journeyAudio.setEnabled(next)
  }, [])

  const openReading = useCallback(() => {
    journeyAudio.setEnabled(false)
    useJourney.getState().setStaticMode(true)
    window.scrollTo(0, 0)
  }, [])

  const enterExperience = useCallback(() => {
    if (!webglSupported) {
      useJourney
        .getState()
        .notify('This browser cannot render the 3D drive. The reading edition has everything.')
      return
    }
    /* A previous crash is retryable — remount the scene cleanly. */
    setSceneFailed(false)
    setSceneReady(false)
    useJourney.setState({ ready: false, loadProgress: 0.08 })
    useJourney.getState().setStaticMode(false)
    window.scrollTo(0, 0)
  }, [webglSupported])

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      )
    }
    const isInteractive = (target) => {
      if (!(target instanceof HTMLElement)) return false
      return !!target.closest('button, a, input, textarea, select, [contenteditable]')
    }

    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const s = useJourney.getState()
      if (isTypingTarget(event.target)) return

      if (event.key === 'Escape') {
        if (s.menuOpen) {
          s.closeMenu()
          return
        }
        return
      }

      if (s.staticMode || !s.ready) return

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        const night = s.toggleNightMode()
        s.notify(night ? 'Night drive on.' : 'Day drive on.')
        return
      }

      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault()
        const next = s.toggleSound()
        journeyAudio.setEnabled(next)
        return
      }

      if (event.key === 'Enter' && !s.started && !isInteractive(event.target)) {
        event.preventDefault()
        startJourney()
        return
      }

      if (/^[1-6]$/.test(event.key) && !s.showCard && s.started) {
        if (FINALE_PHASES.has(s.phase) || s.phase === PHASES.LOOP_RESET) return
        const station = STATIONS[Number(event.key) - 1]
        if (!station) return
        event.preventDefault()
        s.goTo(station.key)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startJourney])

  return (
    <div className={`app ${effectiveStatic ? 'is-static' : 'is-experience'}`}>
      {!effectiveStatic && (
        <div className="scene" aria-hidden="true">
          <SceneBoundary onFailure={handleSceneFailure}>
            <Suspense fallback={null}>
              <Scene onSceneReady={handleSceneReady} onContextLost={handleContextLost} />
            </Suspense>
          </SceneBoundary>
          <p className="sr-only">
            A vintage coupe drives a desert highway at dawn, past six large billboards that hold
            Samrat’s portfolio.
          </p>
        </div>
      )}

      {effectiveStatic && (
        <StaticPortfolio
          onEnterExperience={enterExperience}
          reason={readingReason}
        />
      )}

      {!effectiveStatic && (
        <>
          <div className="scene-scrim" aria-hidden="true" />
          <div className="film-grain" aria-hidden="true" />
        </>
      )}

      {showChrome && (
        <div
          className="experience-chrome"
          aria-hidden={showCard ? 'true' : undefined}
        >
          <Navbar
            started={started}
            onToggleSound={toggleSound}
            onRead={openReading}
          />
          {started && showCard == null && <HUD />}
          {started && showCard == null && <RoutePrompt />}
        </div>
      )}

      <AnimatePresence>
        {showLanding && (
          <Landing
            key="landing"
            onStart={startJourney}
            onRead={openReading}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            ready={ready && sceneReady}
            progress={loadProgress}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCard && !effectiveStatic && <SectionCard key={showCard} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASES.END_CARD && !effectiveStatic && (
          <EndCard key="end-card" onRead={openReading} />
        )}
      </AnimatePresence>

      <div className={`letterbox ${letterbox && ready ? 'is-on' : ''}`} aria-hidden="true">
        <span />
        <span />
      </div>

      <Toast />
    </div>
  )
}
