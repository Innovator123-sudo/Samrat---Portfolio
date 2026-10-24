import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASES, useJourney } from '../state/journeyStore'
import {
  boardPosition,
  carZ,
  clamp,
  damp,
  easeInOutCubic,
  smooth01,
  travel,
} from '../state/travel'

const UP = new THREE.Vector3(0, 1, 0)

export function CameraRig() {
  const { camera } = useThree()
  const smooth = useRef({
    pos: new THREE.Vector3(6, 3, 6),
    look: new THREE.Vector3(0, 1, -4),
    fov: 43,
    ready: false,
  })
  const target = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      board: new THREE.Vector3(),
      chasePos: new THREE.Vector3(),
      chaseLook: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    camera.up.copy(UP)
    camera.near = 0.1
    camera.far = 1200
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const phase = useJourney.getState().phase
    const carX = travel.x
    const cz = carZ()
    const elapsed = Math.max(0, travel.clock - travel.phaseStart)
    const speedF = clamp(travel.speed / 30, 0, 1.35)

    let posEase = 3.6
    let lookEase = 4
    let fov = 48
    let shake = 0

    const chase = () => {
      const back = 9.2 + speedF * 2.1
      const height = 2.62 + speedF * 0.2
      target.chasePos.set(carX - 0.48, height, cz + back)
      target.chaseLook.set(carX + 0.72, 1.12, cz - (8 + speedF * 6.5))
      return target.chasePos
    }

    const approach = () => {
      const idx = travel.activeStation >= 0 ? travel.activeStation : travel.promptStation
      target.pos.set(carX + 5.2, 3.28, cz + 10.4)
      target.look.set(carX + 1.2, 1.65, cz - 13)
      if (idx >= 0) {
        boardPosition(idx, target.board)
        target.look.lerp(target.board, 0.24)
        target.look.y += 0.35
      }
      posEase = 1.55
      lookEase = 1.9
      fov = 43
    }

    const orbitLanding = () => {
      const angle = 2.28 + travel.clock * 0.032
      target.pos.set(
        carX + Math.sin(angle) * 8.6,
        2.78 + Math.sin(travel.clock * 0.18) * 0.12,
        cz + Math.cos(angle) * 9.6,
      )
      target.look.set(carX + 0.1, 1.02, cz - 0.2)
      posEase = 1.1
      lookEase = 1.35
      fov = 40
    }

    const driverOrbit = (orbitClock) => {
      const dp = travel.driverPos
      const drift = Math.sin(orbitClock * 0.09) * 0.22
      const lift = Math.sin(orbitClock * 0.17) * 0.08
      target.pos.set(dp.x + 4.25 + drift, 1.7 + lift, dp.z - 6.6)
      target.look.set(dp.x - 0.08, dp.y + 0.34, dp.z - 1.35)
      posEase = 0.82
      lookEase = 0.95
      fov = 37
    }

    switch (phase) {
      case PHASES.BOOT:
      case PHASES.IDLE:
        orbitLanding()
        break

      case PHASES.STARTING: {
        orbitLanding()
        const k = easeInOutCubic(clamp(elapsed / 2.1, 0, 1))
        chase()
        target.pos.lerp(target.chasePos, k)
        target.look.lerp(target.chaseLook, k)
        fov = 40 + k * 8
        posEase = 2.4
        lookEase = 3
        break
      }

      case PHASES.DRIVING: {
        chase()
        target.pos.copy(target.chasePos)
        target.look.copy(target.chaseLook)
        fov = 46 + speedF * 7.5
        shake = Math.min(0.024, speedF * 0.012)
        if (travel.speed > 38) {
          fov += 4
          posEase = 2.7
        }
        break
      }

      case PHASES.APPROACHING:
      case PHASES.ASKING:
        approach()
        break

      case PHASES.VIEWING: {
        const idx = travel.activeStation >= 0 ? travel.activeStation : travel.promptStation
        target.pos.set(carX + 7.4, 3.42, cz + 9.4)
        target.look.set(carX + 1.4, 1.7, cz - 6)
        if (idx >= 0) {
          boardPosition(idx, target.board)
          target.look.lerp(target.board, 0.55)
        }
        posEase = 1.05
        lookEase = 1.3
        fov = 36
        break
      }

      case PHASES.RESUMING: {
        chase()
        target.pos.copy(target.chasePos)
        target.look.copy(target.chaseLook)
        fov = 47 + speedF * 4
        posEase = 2.2
        lookEase = 2.7
        break
      }

      case PHASES.FINALE_PARKING: {
        const drift = Math.sin(elapsed * 0.25) * 0.3
        target.pos.set(carX + 4.5 + drift, 3.75, cz + 14.4)
        target.look.set(carX + 2.15, 1.85, cz - 10)
        boardPosition(5, target.board)
        target.look.lerp(target.board, 0.09)
        posEase = 1.05
        lookEase = 1.25
        fov = 42
        break
      }

      case PHASES.DRIVER_OUT: {
        target.pos.set(carX + 7.6, 2.54, cz + 9.4)
        target.look.copy(travel.driverPos)
        target.look.y += 0.45
        target.look.z -= 0.8
        posEase = 1.15
        lookEase = 1.45
        fov = 40
        break
      }

      case PHASES.DRIVER_SITTING:
        driverOrbit(elapsed + 6)
        break

      case PHASES.DRIVER_RETURN: {
        target.pos.set(carX + 6.5, 2.5, cz + 10.2)
        target.look.copy(travel.driverPos)
        target.look.y += 0.35
        target.look.lerp(target.chaseLook, 0.2)
        posEase = 1.2
        lookEase = 1.5
        fov = 41
        break
      }

      case PHASES.DEPARTING: {
        const lift = smooth01(clamp(elapsed / 5.5, 0, 1))
        target.pos.set(carX + 5.9 - lift * 2.2, 2.8 + lift * 2.8, cz + 12.5 + lift * 3.5)
        target.look.set(carX + 0.5, 1.15 + lift * 1.5, cz - 9)
        posEase = 1.15
        lookEase = 1.35
        fov = 44 + lift * 4
        break
      }

      case PHASES.END_CARD: {
        target.pos.set(carX - 3.8, 14.5, cz + 28)
        target.look.set(carX, 11.5, cz - 74)
        posEase = 0.65
        lookEase = 0.8
        fov = 52
        break
      }

      case PHASES.LOOP_RESET: {
        target.pos.set(carX + 5.2, 5.2, cz + 13)
        target.look.set(carX, 1.4, cz - 6)
        posEase = 1.2
        lookEase = 1.4
        fov = 44
        break
      }

      default:
        chase()
        target.pos.copy(target.chasePos)
        target.look.copy(target.chaseLook)
    }

    const s = smooth.current
    if (!s.ready) {
      s.pos.copy(target.pos)
      s.look.copy(target.look)
      s.fov = fov
      s.ready = true
    }

    const pe = 1 - Math.exp(-posEase * dt)
    const le = 1 - Math.exp(-lookEase * dt)
    s.pos.lerp(target.pos, pe)
    s.look.lerp(target.look, le)
    s.fov = damp(s.fov, fov, 2.4, dt)

    camera.position.copy(s.pos)
    if (shake > 0.0001) {
      const t = state.clock.elapsedTime
      camera.position.x += Math.sin(t * 17.3) * shake
      camera.position.y += Math.cos(t * 13.7) * shake * 0.65
      camera.position.z += Math.sin(t * 7.1) * shake * 0.4
    }
    camera.lookAt(s.look)

    if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = s.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
