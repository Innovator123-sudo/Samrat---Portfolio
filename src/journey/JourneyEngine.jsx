import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DRIVE, STATIONS } from '../data/content'
import { PHASES, stationIndex, useJourney } from '../state/journeyStore'
import {
  CAR_LANE_X,
  FINAL_CAR_X,
  FINAL_PARK_PROGRESS,
  FINAL_PARK_Z,
  FINAL_SIT_X,
  FINAL_SIT_Z,
  STATION_SPACING,
  carZ,
  clamp,
  computeMood,
  damp,
  easeInOutCubic,
  hudRef,
  lastStationIndex,
  moveTowards,
  smooth01,
  stationZ,
  travel,
} from '../state/travel'
import { journeyAudio } from '../audio/journeyAudio'

const FINAL_KEY = STATIONS[lastStationIndex]?.key || 'hire'

function ridePose() {
  travel.driverPos.set(travel.x + 0.39, 0.71, carZ() + 0.22)
  travel.driverRotY = 0
  travel.driverSit = 0
}

function enterFinale(s) {
  travel.finaleStartedAt = travel.clock
  travel.activeStation = -1
  travel.promptStation = -1
  travel.sitCardShown = false
  s.setLetterbox(true)
  s.hidePrompt()
  s.markVisit(FINAL_KEY)
  useJourney.setState({ fastfwd: null, showCard: null, pendingLook: null })
  s.setPhase(PHASES.FINALE_PARKING)
}

export function JourneyEngine() {
  const initialized = useRef(false)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    travel.clock += dt
    const s = useJourney.getState()
    const phase = s.phase
    const elapsed = Math.max(0, travel.clock - travel.phaseStart)
    travel.nightMode = !!s.nightMode
    travel.nightBlend = damp(travel.nightBlend, travel.nightMode ? 1 : 0, 1.55, dt)
    const mood = computeMood()

    if (!initialized.current) {
      ridePose()
      initialized.current = true
    }

    let targetSpeed = 0
    let targetX = CAR_LANE_X
    let doorTarget = 0
    let shouldWave = false
    let walking = false
    const cz = carZ()

    if (!s.ready || phase === PHASES.BOOT || phase === PHASES.IDLE) {
      travel.speed = 0
      targetSpeed = 0
      ridePose()
    } else {
      switch (phase) {
        case PHASES.STARTING: {
          targetSpeed = DRIVE.cruise
          ridePose()
          if (elapsed > 2.2) {
            s.setLetterbox(false)
            s.setPhase(PHASES.DRIVING)
          }
          break
        }

        case PHASES.DRIVING: {
          targetSpeed = DRIVE.cruise
          ridePose()

          /* The finale starts early enough to brake from any speed. */
          const parkDistance = carZ() - FINAL_PARK_Z
          const brakingRoom = (travel.speed * travel.speed) / (2 * DRIVE.deceleration)
          if (parkDistance < Math.max(62, brakingRoom + 26)) {
            enterFinale(s)
            break
          }

          /* Fast-forward from the navbar: skip the middle, arrive at a stop. */
          if (s.fastfwd) {
            const targetIdx = stationIndex(s.fastfwd)
            targetSpeed = DRIVE.boost
            if (targetIdx >= 0 && targetIdx !== lastStationIndex) {
              const dist = carZ() - stationZ(targetIdx)
              const stopping = Math.sqrt(
                Math.max(0, 2 * DRIVE.deceleration * Math.max(0, dist - 9)),
              )
              targetSpeed = Math.min(DRIVE.boost, stopping)

              if (dist < 26 && travel.speed < 5) {
                travel.activeStation = targetIdx
                const key = s.fastfwd
                useJourney.setState({ fastfwd: null })
                s.openCard(key)
              }
            }
          } else {
            let candidate = -1
            for (let i = 0; i < STATIONS.length; i++) {
              const station = STATIONS[i]
              if (station.finale || s.visited[station.key]) continue
              const dist = carZ() - stationZ(i)
              if (dist > 2 && dist < DRIVE.approachDistance) {
                candidate = i
                break
              }
            }

            if (candidate >= 0) {
              travel.activeStation = candidate
              travel.promptStation = -1
              s.setPhase(PHASES.APPROACHING)
              targetSpeed = DRIVE.approach
            }
          }
          break
        }

        case PHASES.APPROACHING: {
          targetSpeed = DRIVE.approach
          ridePose()
          const idx = travel.activeStation
          if (idx < 0) {
            s.setPhase(PHASES.DRIVING)
            break
          }
          const station = STATIONS[idx]
          const dist = carZ() - stationZ(idx)
          if (dist < DRIVE.stationPromptDistance && dist > -DRIVE.promptGrace) {
            travel.promptStation = idx
            travel.promptSince = travel.clock
            travel.driverMode = 'wave'
            shouldWave = true
            s.showPrompt(station.key)
            s.setPhase(PHASES.ASKING)
            journeyAudio.ding()
          } else if (dist < -DRIVE.promptGrace) {
            s.markVisit(station.key, 'passed')
            travel.activeStation = -1
            travel.promptStation = -1
            travel.driverMode = 'ride'
            s.hidePrompt()
            s.setPhase(PHASES.DRIVING)
          }
          break
        }

        case PHASES.ASKING: {
          targetSpeed = DRIVE.approach
          ridePose()
          travel.driverMode = 'wave'
          shouldWave = true
          const idx = travel.activeStation
          if (idx < 0) {
            s.setPhase(PHASES.DRIVING)
            break
          }
          const station = STATIONS[idx]
          const dist = carZ() - stationZ(idx)
          if (dist < -DRIVE.promptGrace) {
            s.markVisit(station.key, 'passed')
            travel.activeStation = -1
            travel.promptStation = -1
            travel.driverMode = 'ride'
            s.hidePrompt()
            s.setPhase(PHASES.DRIVING)
          }
          break
        }

        case PHASES.VIEWING: {
          targetSpeed = 0
          travel.driverMode = 'ride'
          ridePose()

          if (s.pendingLook && !s.showCard) {
            if (travel.speed < 0.6 || travel.clock - travel.pendingSince > 1.8) {
              s.openCard(s.pendingLook)
            }
          } else if (!s.showCard && !s.pendingLook) {
            travel.activeStation = -1
            travel.promptStation = -1
            s.setPhase(PHASES.RESUMING)
            s.setLetterbox(false)
          }
          break
        }

        case PHASES.RESUMING: {
          targetSpeed = DRIVE.cruise
          travel.driverMode = 'ride'
          ridePose()
          s.setLetterbox(false)
          if (elapsed > 1.15) s.setPhase(PHASES.DRIVING)
          break
        }

        case PHASES.FINALE_PARKING: {
          targetX = FINAL_CAR_X
          ridePose()
          const remaining = FINAL_PARK_PROGRESS - travel.progress
          const metres = remaining * STATION_SPACING
          if (metres > 0.2) {
            const safeSpeed = Math.sqrt(2 * DRIVE.deceleration * metres) * 0.94
            targetSpeed = Math.min(travel.speed, safeSpeed)
          }
          if (metres < 0.25) {
            targetSpeed = 0
            if (travel.speed < 0.25) travel.speed = 0
          }
          if (travel.speed < 0.25 && elapsed > 1.15) doorTarget = 1
          if (travel.speed < 0.2 && travel.doorOpen > 0.82 && elapsed > 2.5) {
            s.setPhase(PHASES.DRIVER_OUT)
            s.setLetterbox(true)
          }
          break
        }

        case PHASES.DRIVER_OUT: {
          targetX = FINAL_CAR_X
          doorTarget = 1
          const u = elapsed
          const seatX = travel.x + 0.39
          const seatZ = carZ() + 0.22
          const standX = travel.x + 1.86
          const standZ = carZ() + 0.3
          const approachX = FINAL_SIT_X - 0.18
          const approachZ = FINAL_SIT_Z + 0.16

          if (u < 1.25) {
            travel.driverMode = 'exit'
            travel.driverSit = 0
            const k = easeInOutCubic(clamp(u / 1.25, 0, 1))
            travel.driverPos.set(
              seatX + (standX - seatX) * k,
              0.71 + 0.2 * k,
              seatZ + (standZ - seatZ) * k,
            )
            travel.driverRotY = -Math.PI / 2
          } else if (u < 1.9) {
            travel.driverMode = 'stand'
            travel.driverSit = 0
            travel.driverPos.set(standX, 0.91, standZ)
            travel.driverRotY = -Math.PI / 2
          } else if (u < 4.6) {
            travel.driverMode = 'walk'
            travel.driverSit = 0
            walking = true
            const k = smooth01((u - 1.9) / 2.7)
            travel.driverPos.set(
              standX + (approachX - standX) * k,
              0.91,
              standZ + (approachZ - standZ) * k,
            )
            travel.driverRotY = -Math.PI / 2
          } else {
            travel.driverMode = 'sit'
            const k = smooth01((u - 4.6) / 0.95)
            travel.driverSit = k
            travel.driverPos.set(
              approachX + (FINAL_SIT_X - approachX) * k,
              0.91 - 0.45 * k,
              approachZ + (FINAL_SIT_Z - approachZ) * k,
            )
            travel.driverRotY = -0.28
          }

          if (u > 5.6) {
            travel.driverMode = 'sit'
            travel.driverSit = 1
            travel.driverPos.set(FINAL_SIT_X, 0.46, FINAL_SIT_Z)
            travel.driverRotY = -0.28
            travel.sitCardShown = false
            s.setPhase(PHASES.DRIVER_SITTING)
            s.setLetterbox(true)
          }
          break
        }

        case PHASES.DRIVER_SITTING: {
          targetX = FINAL_CAR_X
          doorTarget = 1
          travel.driverMode = 'sit'
          travel.driverSit = 1
          travel.driverPos.set(FINAL_SIT_X, 0.46, FINAL_SIT_Z)
          travel.driverRotY = -0.28

          if (s.showCard) {
            travel.sitCardShown = true
            const idleFor = Date.now() - s.modalDismissedAt
            if (elapsed > 32 && idleFor > 16000) s.closeCard()
          } else if (!travel.sitCardShown && elapsed > 2.6) {
            travel.sitCardShown = true
            s.openCard(FINAL_KEY)
            journeyAudio.ding()
          } else if (
            travel.sitCardShown &&
            s.modalDismissedAt &&
            Date.now() - s.modalDismissedAt > 1800
          ) {
            s.setPhase(PHASES.DRIVER_RETURN)
          }
          break
        }

        case PHASES.DRIVER_RETURN: {
          targetX = FINAL_CAR_X
          doorTarget = 1
          const u = elapsed
          const seatX = travel.x + 0.39
          const seatZ = carZ() + 0.22
          const standX = travel.x + 1.86
          const standZ = carZ() + 0.3
          const approachX = FINAL_SIT_X - 0.18
          const approachZ = FINAL_SIT_Z + 0.16

          if (u < 0.9) {
            travel.driverMode = 'sit'
            const k = smooth01(u / 0.9)
            travel.driverSit = 1 - k
            travel.driverPos.set(FINAL_SIT_X, 0.46 + 0.45 * k, FINAL_SIT_Z)
            travel.driverRotY = -0.2
          } else if (u < 3.4) {
            travel.driverMode = 'walk'
            travel.driverSit = 0
            walking = true
            const k = smooth01((u - 0.9) / 2.5)
            travel.driverPos.set(
              approachX + (standX - approachX) * k,
              0.91,
              approachZ + (standZ - approachZ) * k,
            )
            travel.driverRotY = Math.PI / 2
          } else if (u < 4.2) {
            travel.driverMode = 'exit'
            travel.driverSit = 0
            const k = smooth01((u - 3.4) / 0.8)
            travel.driverPos.set(
              standX + (seatX - standX) * k,
              0.91 - 0.2 * k,
              standZ + (seatZ - standZ) * k,
            )
            travel.driverRotY = 0
          } else {
            travel.driverMode = 'ride'
            ridePose()
            doorTarget = 0
          }

          if (u > 5.1) {
            s.setPhase(PHASES.DEPARTING)
            s.setLetterbox(true)
          }
          break
        }

        case PHASES.DEPARTING: {
          targetSpeed = DRIVE.cruise + 4
          doorTarget = 0
          ridePose()
          if (elapsed > 5.4) {
            s.setPhase(PHASES.END_CARD)
            s.showEndCard()
            journeyAudio.ding()
          }
          break
        }

        case PHASES.END_CARD: {
          targetSpeed = elapsed < 1.8 ? DRIVE.cruise : 0
          ridePose()
          break
        }

        case PHASES.LOOP_RESET: {
          targetSpeed = 0
          ridePose()
          break
        }

        default:
          targetSpeed = 0
      }
    }

    /* ---- integrate the car ---- */
    travel.targetSpeed = targetSpeed
    const rate =
      targetSpeed > travel.speed ? DRIVE.acceleration : DRIVE.deceleration
    travel.speed = moveTowards(travel.speed, targetSpeed, rate * dt)
    if (Math.abs(travel.speed) < 0.01) travel.speed = 0

    travel.progress += (travel.speed * dt) / STATION_SPACING
    if (
      phase === PHASES.FINALE_PARKING &&
      travel.progress >= FINAL_PARK_PROGRESS
    ) {
      travel.progress = FINAL_PARK_PROGRESS
      if (travel.speed < 0.4) travel.speed = 0
    }

    travel.x = damp(travel.x, targetX, 1.55, dt)
    const lateral = targetX - travel.x
    travel.steer = damp(travel.steer, clamp(lateral * 0.2, -0.35, 0.35), 3.5, dt)
    travel.wheelSpin += (travel.speed * dt) / 0.39
    travel.doorOpen = damp(travel.doorOpen, doorTarget, 1.75, dt)

    const braking =
      travel.speed > 0.2 && travel.targetSpeed < travel.speed - 0.15
        ? 1
        : phase === PHASES.VIEWING || phase === PHASES.DRIVER_SITTING
          ? 0.85
          : 0.12
    travel.brakePaint = damp(travel.brakePaint, braking, 5, dt)

    if (travel.driverMode === 'walk' || travel.driverMode === 'walkBack') {
      if (walking) travel.driverWalkPhase += dt * 7.2
      travel.driverMoving = true
    } else {
      travel.driverMoving = false
    }

    if (shouldWave && travel.driverMode !== 'wave') travel.driverMode = 'wave'
    if (phase === PHASES.APPROACHING || phase === PHASES.ASKING) {
      /* The pose must follow the car while the driver waves from the window. */
      ridePose()
      if (shouldWave) travel.driverMode = 'wave'
    }

    /* ---- values consumed by the HUD at ~10fps ---- */
    hudRef.kph = Math.round(travel.speed * 4.15)
    hudRef.progress = travel.progress
    hudRef.phase = useJourney.getState().phase
    let next = -1
    const aheadOfCar = carZ() - 2
    for (let i = 0; i < STATIONS.length; i++) {
      if (!useJourney.getState().visited[STATIONS[i].key] && stationZ(i) < aheadOfCar) {
        next = i
        break
      }
    }
    if (next < 0) next = lastStationIndex
    hudRef.station = next
    hudRef.nextEta =
      travel.speed > 0.8 && next >= 0
        ? Math.max(0, (carZ() - stationZ(next)) / travel.speed)
        : null

    journeyAudio.update(travel.speed, useJourney.getState().phase, mood.night)
  })

  return null
}
