import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { travel } from '../state/travel'
import { PHASES, useJourney } from '../state/journeyStore'

const damp = THREE.MathUtils.damp
const clamp01 = (value) => Math.min(1, Math.max(0, value))
const dampE = (euler, x, y, z, lambda, dt) => {
  euler.x = damp(euler.x, x, lambda, dt)
  euler.y = damp(euler.y, y, lambda, dt)
  euler.z = damp(euler.z, z, lambda, dt)
}

const SKIN = '#c98b64'
const SKIN_LIGHT = '#d49a73'
const SKIN_SHADE = '#b97955'
const JACKET = '#b96045'
const JACKET_DARK = '#94452f'
const JACKET_LIGHT = '#c97255'
const SHIRT = '#eee4d2'
const TROUSER = '#2b3b41'
const HAIR = '#241c18'
const SHOE = '#342a23'
const SOLE = '#1f1b18'
const FRAME = '#26332e'
const BRASS = '#b58a52'

export function Driver() {
  const root = useRef()
  const hips = useRef()
  const breath = useRef()
  const torso = useRef()
  const head = useRef()
  const hipL = useRef()
  const hipR = useRef()
  const kneeL = useRef()
  const kneeR = useRef()
  const shoulderL = useRef()
  const shoulderR = useRef()
  const elbowL = useRef()
  const elbowR = useRef()
  const handL = useRef()
  const handR = useRef()
  const footL = useRef()
  const footR = useRef()
  const phone = useRef()
  const eyeL = useRef()
  const eyeR = useRef()

  const materials = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.8 }),
      skinLight: new THREE.MeshStandardMaterial({ color: SKIN_LIGHT, roughness: 0.78 }),
      skinShade: new THREE.MeshStandardMaterial({ color: SKIN_SHADE, roughness: 0.84 }),
      jacket: new THREE.MeshStandardMaterial({ color: JACKET, roughness: 0.76 }),
      jacketDark: new THREE.MeshStandardMaterial({ color: JACKET_DARK, roughness: 0.8 }),
      jacketLight: new THREE.MeshStandardMaterial({ color: JACKET_LIGHT, roughness: 0.72 }),
      shirt: new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.9 }),
      trouser: new THREE.MeshStandardMaterial({ color: TROUSER, roughness: 0.88 }),
      hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.94 }),
      shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.74 }),
      sole: new THREE.MeshStandardMaterial({ color: SOLE, roughness: 0.92 }),
      frame: new THREE.MeshStandardMaterial({ color: FRAME, roughness: 0.32, metalness: 0.45 }),
      brass: new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.34, metalness: 0.7 }),
      lens: new THREE.MeshStandardMaterial({
        color: '#d2dfd8',
        roughness: 0.1,
        metalness: 0.25,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      }),
      eyeWhite: new THREE.MeshStandardMaterial({ color: '#f4ede1', roughness: 0.45 }),
      iris: new THREE.MeshStandardMaterial({ color: '#4d3425', roughness: 0.42 }),
      pupil: new THREE.MeshStandardMaterial({ color: '#12100e', roughness: 0.3 }),
      phone: new THREE.MeshStandardMaterial({
        color: '#101716',
        roughness: 0.22,
        metalness: 0.58,
        emissive: '#9db9aa',
        emissiveIntensity: 0.42,
      }),
    }),
    [],
  )

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.04)
    if (!root.current) return
    const mode = travel.driverMode
    const elapsed = state.clock.elapsedTime
    const walk = travel.driverWalkPhase
    const striding = mode === 'walk' || mode === 'walkBack'
    const journey = useJourney.getState()
    const lookingAtBoard =
      journey.phase === PHASES.APPROACHING ||
      journey.phase === PHASES.ASKING ||
      journey.phase === PHASES.VIEWING ||
      !!journey.showCard
    const blinkWindow = (elapsed * 0.86 + 1.4) % 5.2
    const blink =
      blinkWindow < 0.16 ? 1 - Math.sin((blinkWindow / 0.16) * Math.PI) * 0.9 : 1
    if (eyeL.current) eyeL.current.scale.y = blink
    if (eyeR.current) eyeR.current.scale.y = blink

    if (breath.current) {
      const breathRate = mode === 'ride' || mode === 'wave' ? 1.55 : 1.22
      breath.current.scale.x = 1 + Math.sin(elapsed * breathRate) * 0.005
      breath.current.scale.y = 1 + Math.sin(elapsed * breathRate) * 0.009
    }

    let bob = striding ? Math.abs(Math.sin(walk)) * 0.024 : 0
    let headX = 0
    let headY = Math.sin(elapsed * 0.35) * 0.12
    let headZ = 0
    let torsoX = 0.02
    let torsoY = 0
    let torsoZ = 0
    let handWave = 0

    if (mode === 'sit') {
      const sit = clamp01(travel.driverSit ?? 1)
      const stand = 1 - sit
      const sitTime = Math.max(0, travel.clock - travel.phaseStart)
      const phoneWindow = sit > 0.95 && sitTime % 26 > 15 && sitTime % 26 < 20
      const waveWindow = sit > 0.95 && sitTime % 26 > 6.5 && sitTime % 26 < 9.5
      const footSwing = Math.sin(elapsed * 1.35) * 0.075 * sit
      const toeTap = Math.max(0, Math.sin(elapsed * 3.1)) * 0.045 * sit
      const leanSway = Math.sin(elapsed * 0.42) * 0.018 * sit
      if (phone.current) phone.current.visible = phoneWindow
      bob = Math.sin(elapsed * 0.7) * 0.003 * sit + Math.sin(elapsed * 3.1) * 0.0015 * sit
      torsoX = 0.2 - 0.075 * sit + leanSway
      const idleHeadX = 0.03 * sit - 0.04 * stand + Math.sin(elapsed * 0.19) * 0.025 * sit
      const idleHeadY =
        Math.sin(elapsed * 0.21) * 0.26 * sit - 0.1 * stand - 0.12 * sit
      headX = phoneWindow ? 0.32 : lookingAtBoard ? -0.05 : idleHeadX
      headY =
        (phoneWindow ? -0.24 : lookingAtBoard ? -0.42 : idleHeadY) +
        (waveWindow ? -0.18 : 0)
      headZ = phoneWindow ? 0.04 : Math.sin(elapsed * 0.17) * 0.035 * sit
      dampE(torso.current.rotation, torsoX, 0.03, Math.sin(elapsed * 0.33) * 0.012 * sit, 5, d)
      dampE(head.current.rotation, headX, headY, headZ, 3, d)
      dampE(
        hipL.current.rotation,
        0.02 + 1.45 * sit + footSwing * 0.35,
        0.05 * sit,
        -0.07 * sit - footSwing * 0.15,
        6,
        d,
      )
      dampE(
        hipR.current.rotation,
        0.01 + 1.38 * sit + Math.sin(elapsed * 5.1) * 0.035 * sit + toeTap * 0.3,
        -0.03 * sit,
        0.1 * sit,
        6,
        d,
      )
      dampE(
        kneeL.current.rotation,
        -0.04 - 1.31 * sit - footSwing * 0.55,
        0,
        0.05 * sit,
        6,
        d,
      )
      dampE(
        kneeR.current.rotation,
        -0.02 + (-1.18 + (Math.sin(elapsed * 5.1) > 0.62 ? 0.3 : 0)) * sit - toeTap * 0.4,
        0,
        0,
        6,
        d,
      )
      dampE(footL.current.rotation, -0.1 * sit + footSwing * 0.9, 0, 0, 5, d)
      dampE(footR.current.rotation, 0.1 * sit + toeTap, 0, 0, 5, d)

      if (phoneWindow) {
        dampE(shoulderR.current.rotation, 1.02, 0.18, 0.24, 5, d)
        dampE(elbowR.current.rotation, 1.82, 0, 0.18, 5, d)
        dampE(shoulderL.current.rotation, 0.24, 0.08, -0.2, 5, d)
        dampE(elbowL.current.rotation, 0.82, 0, 0, 5, d)
      } else if (waveWindow) {
        dampE(shoulderR.current.rotation, 0.08, 0.18, 2.08, 5, d)
        dampE(
          elbowR.current.rotation,
          -0.28,
          0.22,
          -0.26 + Math.sin(elapsed * 8.5) * 0.24,
          7,
          d,
        )
        handWave = Math.sin(elapsed * 9.4) * 0.28
        dampE(shoulderL.current.rotation, 0.2, -0.08, -0.2, 5, d)
        dampE(elbowL.current.rotation, 0.76, 0, 0, 5, d)
      } else {
        dampE(
          shoulderR.current.rotation,
          0.16 * sit + 0.2 * stand,
          0.16 * sit,
          0.18 * sit + 0.68 * stand,
          4.4,
          d,
        )
        dampE(elbowR.current.rotation, 0.95 * sit + 0.32 * stand, 0, 0.08 * sit, 4.4, d)
        dampE(
          shoulderL.current.rotation,
          0.13 * sit + 0.18 * stand,
          -0.16 * sit,
          -0.16 * sit - 0.62 * stand,
          4.4,
          d,
        )
        dampE(elbowL.current.rotation, 0.92 * sit + 0.3 * stand, 0, 0, 4.4, d)
      }
    } else if (mode === 'ride' || mode === 'wave') {
      if (phone.current) phone.current.visible = false
      bob = Math.sin(elapsed * 7) * 0.0015
      const idleSway = Math.sin(elapsed * 0.8) * 0.012
      torsoX = 0.06 + idleSway
      torsoY = 0.02
      torsoZ = -travel.steer * 0.025
      headX = -0.02 + Math.sin(elapsed * 0.6) * 0.006
      headY = lookingAtBoard ? -0.48 : idleSway * 1.5
      headZ = lookingAtBoard ? -0.035 : 0
      dampE(torso.current.rotation, torsoX, torsoY, torsoZ, 6, d)
      dampE(head.current.rotation, headX, headY, headZ, 4.2, d)
      dampE(hipL.current.rotation, 1.37, 0.06, -0.03, 7, d)
      dampE(hipR.current.rotation, 1.3, -0.04, 0.03, 7, d)
      dampE(kneeL.current.rotation, -1.3, 0, 0, 7, d)
      dampE(kneeR.current.rotation, -1.22, 0, 0, 7, d)
      dampE(footL.current.rotation, -0.18, 0, 0, 6, d)
      dampE(footR.current.rotation, -0.14, 0, 0, 6, d)

      dampE(shoulderL.current.rotation, 0.86, 0.06, 0.13, 6, d)
      dampE(elbowL.current.rotation, 1.16, 0, 0, 6, d)
      if (mode === 'wave') {
        dampE(shoulderR.current.rotation, 0.16, 0.22, 2.04, 5.5, d)
        dampE(
          elbowR.current.rotation,
          -0.24,
          0.25,
          -0.28 + Math.sin(elapsed * 8.4) * 0.24,
          8,
          d,
        )
        handWave = Math.sin(elapsed * 9.2) * 0.3
      } else {
        dampE(shoulderR.current.rotation, 0.83, -0.06, -0.13, 6, d)
        dampE(elbowR.current.rotation, 1.13, 0, 0, 6, d)
      }
    } else if (mode === 'exit') {
      if (phone.current) phone.current.visible = false
      dampE(torso.current.rotation, 0.2, 0, 0, 7, d)
      dampE(head.current.rotation, -0.04, -0.1, 0, 5, d)
      dampE(hipL.current.rotation, 0.42, 0.04, -0.05, 7, d)
      dampE(hipR.current.rotation, 0.5, -0.04, 0.05, 7, d)
      dampE(kneeL.current.rotation, -0.48, 0, 0, 7, d)
      dampE(kneeR.current.rotation, -0.55, 0, 0, 7, d)
      dampE(shoulderL.current.rotation, 0.18, 0, -0.62, 6, d)
      dampE(shoulderR.current.rotation, 0.2, 0, 0.68, 6, d)
      dampE(elbowL.current.rotation, 0.3, 0, 0, 6, d)
      dampE(elbowR.current.rotation, 0.32, 0, 0, 6, d)
      dampE(footL.current.rotation, 0, 0, 0, 5, d)
      dampE(footR.current.rotation, 0, 0, 0, 5, d)
    } else if (striding) {
      if (phone.current) phone.current.visible = false
      const swing = Math.sin(walk) * 0.62
      const armSwing = Math.sin(walk) * 0.52
      dampE(hipL.current.rotation, swing, 0, 0, 14, d)
      dampE(hipR.current.rotation, -swing, 0, 0, 14, d)
      dampE(kneeL.current.rotation, Math.max(0, -swing) * 1.7, 0, 0, 14, d)
      dampE(kneeR.current.rotation, Math.max(0, swing) * 1.7, 0, 0, 14, d)
      dampE(footL.current.rotation, -swing * 0.28, 0, 0, 12, d)
      dampE(footR.current.rotation, swing * 0.28, 0, 0, 12, d)
      dampE(shoulderL.current.rotation, -armSwing, 0.08, -0.14, 12, d)
      dampE(shoulderR.current.rotation, armSwing, -0.08, 0.14, 12, d)
      dampE(elbowL.current.rotation, 0.48, 0, 0, 10, d)
      dampE(elbowR.current.rotation, 0.48, 0, 0, 10, d)
      dampE(torso.current.rotation, 0.075, Math.sin(walk) * 0.035, 0, 8, d)
      dampE(head.current.rotation, 0.01, Math.sin(walk) * 0.035, 0, 5, d)
    } else {
      if (phone.current) phone.current.visible = false
      dampE(torso.current.rotation, 0.02, 0, 0, 5, d)
      dampE(head.current.rotation, 0, Math.sin(elapsed * 0.35) * 0.14, 0, 4, d)
      dampE(hipL.current.rotation, -0.04, 0.04, 0, 7, d)
      dampE(hipR.current.rotation, 0.03, -0.04, 0, 7, d)
      dampE(kneeL.current.rotation, 0.02, 0, 0, 6, d)
      dampE(kneeR.current.rotation, 0.02, 0, 0, 6, d)
      dampE(footL.current.rotation, 0, 0, 0, 5, d)
      dampE(footR.current.rotation, 0, 0, 0, 5, d)
      dampE(shoulderL.current.rotation, 0.06, 0, -0.08, 5, d)
      dampE(shoulderR.current.rotation, 0.08, 0, 0.08, 5, d)
      dampE(elbowL.current.rotation, 0.12, 0, 0, 5, d)
      dampE(elbowR.current.rotation, 0.12, 0, 0, 5, d)
    }

    if (handR.current) {
      handR.current.rotation.z = damp(handR.current.rotation.z, handWave, 8, d)
    }
    if (handL.current) {
      handL.current.rotation.z = damp(handL.current.rotation.z, 0, 8, d)
    }

    const targetY = travel.driverPos.y + bob
    root.current.position.set(travel.driverPos.x, targetY, travel.driverPos.z)
    root.current.rotation.y = damp(root.current.rotation.y, travel.driverRotY, 7, d)
    root.current.rotation.z = damp(
      root.current.rotation.z,
      striding ? Math.sin(walk) * 0.015 : 0,
      9,
      d,
    )
  })

  return (
    <group ref={root} position={[0, 1.02, 0]} rotation={[0, 0, 0]}>
      <group ref={hips}>
        <mesh castShadow>
          <capsuleGeometry args={[0.145, 0.12, 4, 10]} />
          <primitive object={materials.trouser} attach="material" />
        </mesh>
        <mesh position={[0, 0.035, -0.145]}>
          <boxGeometry args={[0.31, 0.055, 0.025]} />
          <primitive object={materials.jacketDark} attach="material" />
        </mesh>
        <mesh position={[0, 0.035, -0.16]}>
          <boxGeometry args={[0.055, 0.048, 0.012]} />
          <primitive object={materials.brass} attach="material" />
        </mesh>

        <group ref={torso} position={[0, 0.08, 0]}>
          <group ref={breath}>
            <mesh castShadow position={[0, 0.27, 0]}>
              <capsuleGeometry args={[0.218, 0.29, 5, 12]} />
              <primitive object={materials.jacket} attach="material" />
            </mesh>
            <mesh position={[0, 0.405, -0.12]}>
              <boxGeometry args={[0.24, 0.22, 0.075]} />
              <primitive object={materials.shirt} attach="material" />
            </mesh>
            <mesh position={[0, 0.17, -0.205]} rotation={[0.07, 0, 0]}>
              <boxGeometry args={[0.024, 0.36, 0.012]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <mesh position={[-0.082, 0.465, -0.155]} rotation={[0.04, 0, 0.52]}>
              <boxGeometry args={[0.095, 0.25, 0.026]} />
              <primitive object={materials.shirt} attach="material" />
            </mesh>
            <mesh position={[0.082, 0.465, -0.155]} rotation={[0.04, 0, -0.52]}>
              <boxGeometry args={[0.095, 0.25, 0.026]} />
              <primitive object={materials.shirt} attach="material" />
            </mesh>
            <mesh position={[-0.115, 0.472, -0.13]} rotation={[0.04, 0.08, 0.5]}>
              <boxGeometry args={[0.11, 0.28, 0.036]} />
              <primitive object={materials.jacketLight} attach="material" />
            </mesh>
            <mesh position={[0.115, 0.472, -0.13]} rotation={[0.04, -0.08, -0.5]}>
              <boxGeometry args={[0.11, 0.28, 0.036]} />
              <primitive object={materials.jacketLight} attach="material" />
            </mesh>
            <mesh position={[0, 0.505, -0.055]}>
              <torusGeometry args={[0.118, 0.021, 6, 18, Math.PI]} />
              <primitive object={materials.shirt} attach="material" />
            </mesh>

            <mesh position={[-0.1, 0.36, -0.202]}>
              <boxGeometry args={[0.105, 0.085, 0.014]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <mesh position={[-0.1, 0.398, -0.212]}>
              <boxGeometry args={[0.11, 0.012, 0.01]} />
              <primitive object={materials.jacketLight} attach="material" />
            </mesh>
            <mesh position={[-0.14, 0.14, -0.202]} rotation={[0, 0.08, 0]}>
              <boxGeometry args={[0.12, 0.055, 0.016]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <mesh position={[0.14, 0.14, -0.202]} rotation={[0, -0.08, 0]}>
              <boxGeometry args={[0.12, 0.055, 0.016]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            {[0.11, 0.22, 0.33].map((y) => (
              <mesh key={y} position={[0.008, y, -0.215]}>
                <sphereGeometry args={[0.011, 8, 6]} />
                <primitive object={materials.brass} attach="material" />
              </mesh>
            ))}
            <mesh position={[0, 0.055, 0]}>
              <torusGeometry args={[0.218, 0.018, 6, 20]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
          </group>

          <mesh position={[0, 0.505, 0]}>
            <cylinderGeometry args={[0.057, 0.062, 0.09, 10]} />
            <primitive object={materials.skin} attach="material" />
          </mesh>
          <group ref={head} position={[0, 0.636, 0]}>
            <mesh castShadow scale={[1, 1.06, 0.97]}>
              <sphereGeometry args={[0.177, 22, 18]} />
              <primitive object={materials.skinLight} attach="material" />
            </mesh>
            <mesh position={[0, -0.078, -0.035]} scale={[0.78, 0.5, 0.72]}>
              <sphereGeometry args={[0.16, 14, 10]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>
            <mesh position={[-0.17, -0.002, 0.005]} scale={[0.55, 1, 0.7]}>
              <sphereGeometry args={[0.055, 10, 8]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>
            <mesh position={[0.17, -0.002, 0.005]} scale={[0.55, 1, 0.7]}>
              <sphereGeometry args={[0.055, 10, 8]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>

            <mesh position={[0, 0.052, 0.014]} scale={[1.035, 0.82, 1.035]}>
              <sphereGeometry args={[0.18, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0.018, 0.02, 0.14]} scale={[0.92, 0.74, 0.58]}>
              <sphereGeometry args={[0.15, 14, 10]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0.035, 0.145, -0.062]} rotation={[0.18, -0.1, -0.2]} scale={[0.62, 0.3, 0.55]}>
              <sphereGeometry args={[0.14, 12, 10]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[-0.14, 0.03, -0.015]} scale={[0.28, 1.1, 0.45]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0.14, 0.03, -0.015]} scale={[0.28, 1.1, 0.45]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>

            <group ref={eyeL} position={[-0.058, 0.014, -0.169]}>
              <mesh scale={[1, 0.72, 0.55]}>
                <sphereGeometry args={[0.025, 12, 10]} />
                <primitive object={materials.eyeWhite} attach="material" />
              </mesh>
              <mesh position={[0, 0, -0.015]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.012, 14]} />
                <primitive object={materials.iris} attach="material" />
              </mesh>
              <mesh position={[0, 0, -0.017]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.0055, 10]} />
                <primitive object={materials.pupil} attach="material" />
              </mesh>
            </group>
            <group ref={eyeR} position={[0.058, 0.014, -0.169]}>
              <mesh scale={[1, 0.72, 0.55]}>
                <sphereGeometry args={[0.025, 12, 10]} />
                <primitive object={materials.eyeWhite} attach="material" />
              </mesh>
              <mesh position={[0, 0, -0.015]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.012, 14]} />
                <primitive object={materials.iris} attach="material" />
              </mesh>
              <mesh position={[0, 0, -0.017]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.0055, 10]} />
                <primitive object={materials.pupil} attach="material" />
              </mesh>
            </group>

            <mesh position={[-0.059, 0.058, -0.164]} rotation={[0, 0, 0.1]}>
              <boxGeometry args={[0.062, 0.014, 0.012]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0.059, 0.058, -0.164]} rotation={[0, 0, -0.1]}>
              <boxGeometry args={[0.062, 0.014, 0.012]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>

            <mesh position={[0, -0.006, -0.186]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.025, 0.068, 7]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>
            <mesh position={[0, 0.024, -0.183]} scale={[0.55, 1, 0.6]}>
              <sphereGeometry args={[0.028, 8, 6]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>
            <mesh position={[0, -0.076, -0.159]}>
              <boxGeometry args={[0.058, 0.008, 0.014]} />
              <primitive object={materials.skinShade} attach="material" />
            </mesh>
            <mesh position={[0, -0.09, -0.157]}>
              <boxGeometry args={[0.04, 0.01, 0.012]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>
            <mesh position={[0, -0.118, -0.133]} scale={[1, 0.55, 0.5]}>
              <sphereGeometry args={[0.055, 10, 8]} />
              <primitive object={materials.skinShade} attach="material" />
            </mesh>

            <mesh position={[-0.058, 0.016, -0.181]} rotation={[0, Math.PI, 0]}>
              <torusGeometry args={[0.049, 0.0055, 5, 20]} />
              <primitive object={materials.frame} attach="material" />
            </mesh>
            <mesh position={[0.058, 0.016, -0.181]} rotation={[0, Math.PI, 0]}>
              <torusGeometry args={[0.049, 0.0055, 5, 20]} />
              <primitive object={materials.frame} attach="material" />
            </mesh>
            <mesh position={[0, 0.025, -0.184]}>
              <boxGeometry args={[0.026, 0.006, 0.005]} />
              <primitive object={materials.frame} attach="material" />
            </mesh>
            <mesh position={[-0.112, 0.02, -0.12]} rotation={[0, -0.2, 0]}>
              <boxGeometry args={[0.11, 0.006, 0.005]} />
              <primitive object={materials.frame} attach="material" />
            </mesh>
            <mesh position={[0.112, 0.02, -0.12]} rotation={[0, 0.2, 0]}>
              <boxGeometry args={[0.11, 0.006, 0.005]} />
              <primitive object={materials.frame} attach="material" />
            </mesh>
            <mesh position={[-0.058, 0.016, -0.178]}>
              <circleGeometry args={[0.047, 18]} />
              <primitive object={materials.lens} attach="material" />
            </mesh>
            <mesh position={[0.058, 0.016, -0.178]}>
              <circleGeometry args={[0.047, 18]} />
              <primitive object={materials.lens} attach="material" />
            </mesh>
          </group>

          <group ref={shoulderL} position={[-0.245, 0.43, 0]} rotation={[0.08, 0, -0.12]}>
            <mesh castShadow position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.064, 0.2, 4, 10]} />
              <primitive object={materials.jacket} attach="material" />
            </mesh>
            <mesh position={[0, -0.31, 0]}>
              <cylinderGeometry args={[0.069, 0.066, 0.07, 10]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <group ref={elbowL} position={[0, -0.32, 0]}>
              <mesh castShadow position={[0, -0.13, 0]}>
                <capsuleGeometry args={[0.052, 0.17, 4, 10]} />
                <primitive object={materials.skin} attach="material" />
              </mesh>
              <mesh position={[0, -0.045, 0]}>
                <cylinderGeometry args={[0.058, 0.055, 0.05, 10]} />
                <primitive object={materials.shirt} attach="material" />
              </mesh>
              <mesh position={[0, -0.245, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.058, 0.012, 6, 14]} />
                <primitive object={materials.jacketDark} attach="material" />
              </mesh>
              <mesh position={[-0.065, -0.265, -0.005]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.038, 0.038, 0.022, 12]} />
                <primitive object={materials.brass} attach="material" />
              </mesh>
              <mesh position={[-0.078, -0.265, -0.005]}>
                <boxGeometry args={[0.008, 0.045, 0.04]} />
                <primitive object={materials.jacketDark} attach="material" />
              </mesh>
              <group ref={handL} position={[0, -0.335, -0.012]}>
                <mesh scale={[0.78, 1.05, 0.55]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <primitive object={materials.skin} attach="material" />
                </mesh>
                {[-0.027, 0, 0.027].map((x) => (
                  <mesh key={x} position={[x, -0.07, -0.005]} rotation={[0.18, 0, 0]}>
                    <capsuleGeometry args={[0.014, 0.045, 3, 6]} />
                    <primitive object={materials.skin} attach="material" />
                  </mesh>
                ))}
                <mesh position={[-0.055, -0.015, -0.015]} rotation={[0.2, 0, -0.55]}>
                  <capsuleGeometry args={[0.016, 0.04, 3, 6]} />
                  <primitive object={materials.skin} attach="material" />
                </mesh>
              </group>
            </group>
          </group>

          <group ref={shoulderR} position={[0.245, 0.43, 0]} rotation={[0.06, 0, 0.12]}>
            <mesh castShadow position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.064, 0.2, 4, 10]} />
              <primitive object={materials.jacket} attach="material" />
            </mesh>
            <mesh position={[0, -0.31, 0]}>
              <cylinderGeometry args={[0.069, 0.066, 0.07, 10]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <group ref={elbowR} position={[0, -0.32, 0]}>
              <mesh castShadow position={[0, -0.13, 0]}>
                <capsuleGeometry args={[0.052, 0.17, 4, 10]} />
                <primitive object={materials.skin} attach="material" />
              </mesh>
              <mesh position={[0, -0.045, 0]}>
                <cylinderGeometry args={[0.058, 0.055, 0.05, 10]} />
                <primitive object={materials.shirt} attach="material" />
              </mesh>
              <mesh position={[0, -0.245, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.058, 0.012, 6, 14]} />
                <primitive object={materials.jacketDark} attach="material" />
              </mesh>
              <group ref={handR} position={[0, -0.335, -0.012]}>
                <mesh scale={[0.78, 1.05, 0.55]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <primitive object={materials.skin} attach="material" />
                </mesh>
                {[-0.027, 0, 0.027].map((x) => (
                  <mesh key={x} position={[x, -0.07, -0.005]} rotation={[0.18, 0, 0]}>
                    <capsuleGeometry args={[0.014, 0.045, 3, 6]} />
                    <primitive object={materials.skin} attach="material" />
                  </mesh>
                ))}
                <mesh position={[0.055, -0.015, -0.015]} rotation={[0.2, 0, 0.55]}>
                  <capsuleGeometry args={[0.016, 0.04, 3, 6]} />
                  <primitive object={materials.skin} attach="material" />
                </mesh>
                <mesh ref={phone} position={[0, -0.085, -0.085]} rotation={[-0.55, 0, 0]} visible={false}>
                  <boxGeometry args={[0.088, 0.165, 0.012]} />
                  <primitive object={materials.phone} attach="material" />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        <group ref={hipL} position={[-0.115, -0.02, 0]} rotation={[0, 0, -0.02]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.095, 0.24, 4, 10]} />
            <primitive object={materials.trouser} attach="material" />
          </mesh>
          <mesh position={[-0.092, -0.18, 0]}>
            <boxGeometry args={[0.008, 0.24, 0.08]} />
            <primitive object={materials.jacketDark} attach="material" />
          </mesh>
          <group ref={kneeL} position={[0, -0.4, 0]}>
            <mesh castShadow position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.079, 0.24, 4, 10]} />
              <primitive object={materials.trouser} attach="material" />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.083, 0.08, 0.06, 10]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <group ref={footL} position={[0, -0.39, 0]}>
              <mesh castShadow position={[0, -0.03, -0.065]}>
                <boxGeometry args={[0.155, 0.09, 0.27]} />
                <primitive object={materials.shoe} attach="material" />
              </mesh>
              <mesh position={[0, -0.012, -0.17]} scale={[0.95, 0.65, 0.6]}>
                <sphereGeometry args={[0.085, 10, 8]} />
                <primitive object={materials.shoe} attach="material" />
              </mesh>
              <mesh position={[0, -0.065, -0.06]}>
                <boxGeometry args={[0.162, 0.025, 0.275]} />
                <primitive object={materials.sole} attach="material" />
              </mesh>
              {[-0.04, 0, 0.04].map((z) => (
                <mesh key={z} position={[0, 0.018, z - 0.07]} rotation={[0, 0, Math.PI / 2]}>
                  <boxGeometry args={[0.008, 0.07, 0.008]} />
                  <primitive object={materials.brass} attach="material" />
                </mesh>
              ))}
            </group>
          </group>
        </group>

        <group ref={hipR} position={[0.115, -0.02, 0]} rotation={[0, 0, 0.02]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.095, 0.24, 4, 10]} />
            <primitive object={materials.trouser} attach="material" />
          </mesh>
          <mesh position={[0.092, -0.18, 0]}>
            <boxGeometry args={[0.008, 0.24, 0.08]} />
            <primitive object={materials.jacketDark} attach="material" />
          </mesh>
          <group ref={kneeR} position={[0, -0.4, 0]}>
            <mesh castShadow position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.079, 0.24, 4, 10]} />
              <primitive object={materials.trouser} attach="material" />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.083, 0.08, 0.06, 10]} />
              <primitive object={materials.jacketDark} attach="material" />
            </mesh>
            <group ref={footR} position={[0, -0.39, 0]}>
              <mesh castShadow position={[0, -0.03, -0.065]}>
                <boxGeometry args={[0.155, 0.09, 0.27]} />
                <primitive object={materials.shoe} attach="material" />
              </mesh>
              <mesh position={[0, -0.012, -0.17]} scale={[0.95, 0.65, 0.6]}>
                <sphereGeometry args={[0.085, 10, 8]} />
                <primitive object={materials.shoe} attach="material" />
              </mesh>
              <mesh position={[0, -0.065, -0.06]}>
                <boxGeometry args={[0.162, 0.025, 0.275]} />
                <primitive object={materials.sole} attach="material" />
              </mesh>
              {[-0.04, 0, 0.04].map((z) => (
                <mesh key={z} position={[0, 0.018, z - 0.07]} rotation={[0, 0, Math.PI / 2]}>
                  <boxGeometry args={[0.008, 0.07, 0.008]} />
                  <primitive object={materials.brass} attach="material" />
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
