import { useEffect, useRef } from 'react'
import { STATIONS } from '../data/content'
import { PHASES, FINALE_PHASES, useJourney } from '../state/journeyStore'
import {
  FINAL_PARK_PROGRESS,
  carZ,
  hudRef,
  moodLabel,
  stationZ,
  travel,
} from '../state/travel'

const phaseCopy = {
  [PHASES.DRIVING]: 'Cruising',
  [PHASES.APPROACHING]: 'Billboard ahead',
  [PHASES.ASKING]: 'Your call',
  [PHASES.VIEWING]: 'Pulled over',
  [PHASES.RESUMING]: 'Back on the road',
  [PHASES.FINALE_PARKING]: 'Last stop',
  [PHASES.DRIVER_OUT]: 'Stretch break',
  [PHASES.DRIVER_SITTING]: 'Roadside pause',
  [PHASES.DRIVER_RETURN]: 'Time to go',
  [PHASES.DEPARTING]: 'Departing',
  [PHASES.END_CARD]: 'Night',
  [PHASES.LOOP_RESET]: 'Rewinding',
}

const formatEta = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds)) return '—'
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function HUD() {
  const phase = useJourney((s) => s.phase)
  const visited = useJourney((s) => s.visited)
  const promptKey = useJourney((s) => s.promptKey)
  const showCard = useJourney((s) => s.showCard)
  const nightMode = useJourney((s) => s.nightMode)

  const speedRef = useRef(null)
  const nextRef = useRef(null)
  const etaRef = useRef(null)
  const moodRef = useRef(null)
  const stateRef = useRef(null)
  const fillRef = useRef(null)
  const carRef = useRef(null)

  useEffect(() => {
    let frame
    let last = 0
    const loop = (time) => {
      if (time - last > 110) {
        last = time
        const station = STATIONS[hudRef.station] || STATIONS[0]
        if (speedRef.current) {
          speedRef.current.textContent = String(Math.max(0, hudRef.kph)).padStart(2, '0')
        }
        if (nextRef.current) nextRef.current.textContent = station.label
        if (etaRef.current) etaRef.current.textContent = formatEta(hudRef.nextEta)
        if (moodRef.current) moodRef.current.textContent = moodLabel(travel.journeyTime)
        if (stateRef.current) {
          stateRef.current.textContent = phaseCopy[hudRef.phase] || 'On the road'
        }
        const ratio = Math.max(0, Math.min(1, travel.progress / FINAL_PARK_PROGRESS))
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${ratio})`
        if (carRef.current) carRef.current.style.left = `${ratio * 100}%`
      }
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const currentKey = showCard || promptKey
  const isFinale = FINALE_PHASES.has(phase)
  const stopsVisited = Object.values(visited).filter(Boolean).length

  return (
    <>
      <div className={`hud ${isFinale ? 'hud--finale' : ''}`} aria-label="Drive status">
        <div className="hud__speed">
          <span className="hud__speed-value" ref={speedRef}>
            00
          </span>
          <span className="hud__speed-unit">
            km/h
            <small ref={stateRef}>On the road</small>
          </span>
        </div>
        <div className="hud__next">
          <span>Next stop</span>
          <strong ref={nextRef}>{STATIONS[0].label}</strong>
          <span className="hud__eta">
            in <b ref={etaRef}>—</b>
          </span>
        </div>
        <div className="hud__mood">
          <span>{nightMode ? 'Night' : 'Light'}</span>
          <strong ref={moodRef}>First light</strong>
        </div>
      </div>

      <div className="route-rail" aria-label={`Route progress: ${stopsVisited} of 6 stops visited`}>
        <div className="route-rail__line">
          <span className="route-rail__fill" ref={fillRef} />
          <span className="route-rail__car" ref={carRef} aria-hidden="true">
            <span />
          </span>
          {STATIONS.map((station, index) => {
            const isFinal = station.finale
            const current = currentKey === station.key
            const position = isFinal ? 1 : (index + 1) / FINAL_PARK_PROGRESS
            return (
              <span
                key={station.key}
                className={`route-rail__stop ${visited[station.key] ? 'is-visited' : ''} ${
                  current ? 'is-current' : ''
                } ${isFinal ? 'is-final' : ''}`}
                style={{ left: `${position * 100}%` }}
                aria-hidden="true"
              >
                <i />
                <span className="route-rail__label">{station.index}</span>
              </span>
            )
          })}
        </div>
        <p className="route-rail__hint">
          <span>1–6 jump</span>
          <span>N day/night</span>
          <span>M sound</span>
        </p>
      </div>
    </>
  )
}
