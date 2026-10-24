import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import {
  CAR_LANE_X,
  carZ,
  computeMood,
  travel,
} from '../state/travel'
import { makeGlowTexture, makeShadowTexture } from './textures'

const PAINT = '#315247'
const PAINT_DARK = '#223d35'
const CREAM = '#e7dcc7'
const CHROME = '#c9c0ae'
const GLASS = '#91b4ae'
const TIRE = '#1d201e'
const SADDLE = '#a97850'
const DASH = '#26302c'

function makeBodyGeometry() {
  const s = new THREE.Shape()
  s.moveTo(-2.24, 0.28)
  s.lineTo(-2.3, 0.42)
  s.quadraticCurveTo(-2.29, 0.55, -2.14, 0.61)
  s.quadraticCurveTo(-1.86, 0.7, -1.56, 0.82)
  s.quadraticCurveTo(-1.28, 0.91, -0.78, 0.94)
  s.lineTo(0.68, 0.96)
  s.quadraticCurveTo(1.32, 0.93, 1.7, 0.88)
  s.quadraticCurveTo(2.1, 0.8, 2.23, 0.67)
  s.quadraticCurveTo(2.31, 0.58, 2.26, 0.42)
  s.lineTo(2.2, 0.29)
  s.lineTo(-2.24, 0.28)

  const g = new THREE.ExtrudeGeometry(s, {
    depth: 1.84,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 12,
  })
  g.rotateY(-Math.PI / 2)
  g.translate(0.92, 0, 0)
  g.computeVertexNormals()
  return g
}

function Wheel({ position, side }) {
  const spin = useRef()
  useFrame(() => {
    if (spin.current) spin.current.rotation.x = -travel.wheelSpin
  })

  return (
    <group position={position}>
      <group ref={spin}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.39, 0.39, 0.23, 20]} />
          <meshStandardMaterial color={TIRE} roughness={0.92} metalness={0.02} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.005, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.24, 18]} />
          <meshStandardMaterial color="#484841" roughness={0.65} metalness={0.25} />
        </mesh>
        <mesh position={[side * 0.126, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.185, 0.185, 0.018, 16]} />
          <meshStandardMaterial color={CHROME} roughness={0.25} metalness={0.9} />
        </mesh>
        <mesh position={[side * 0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.052, 0.052, 0.03, 12]} />
          <meshStandardMaterial color={PAINT_DARK} roughness={0.4} metalness={0.35} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[side * 0.138, 0, 0]}
            rotation={[0, i * (Math.PI * 2) / 5, Math.PI / 2]}
          >
            <boxGeometry args={[0.012, 0.32, 0.026]} />
            <meshStandardMaterial color="#4a4a42" roughness={0.55} metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Car() {
  const group = useRef()
  const body = useRef()
  const door = useRef()
  const cavity = useRef()
  const steering = useRef()
  const headMats = useRef([])
  const tailMats = useRef([])
  const headLight = useRef()
  const lightTarget = useRef()

  const bodyGeometry = useMemo(() => makeBodyGeometry(), [])
  const glowTex = useMemo(() => makeGlowTexture(), [])
  const shadowTex = useMemo(() => makeShadowTexture(), [])

  useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glowTex.dispose()
      shadowTex.dispose()
    }
  }, [bodyGeometry, glowTex, shadowTex])

  useEffect(() => {
    if (headLight.current && lightTarget.current) {
      headLight.current.target = lightTarget.current
    }
  }, [])

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    if (!group.current) return
    const mood = travel.mood || computeMood()
    group.current.position.x = travel.x
    group.current.position.z = carZ()

    const speedFactor = Math.min(1, travel.speed / 30)
    const idle = Math.sin(state.clock.elapsedTime * 3.1) * 0.003 + Math.sin(state.clock.elapsedTime * 0.7) * 0.002
    const rumble = speedFactor > 0.03 ? Math.sin(state.clock.elapsedTime * 28) * 0.008 * speedFactor : 0
    if (body.current) {
      body.current.position.y = idle + rumble
      body.current.rotation.x = THREE.MathUtils.damp(
        body.current.rotation.x,
        Math.min(travel.speed / 40, 0.02) * 0.3,
        4,
        d,
      )
      body.current.rotation.z = THREE.MathUtils.damp(
        body.current.rotation.z,
        -travel.steer * 0.03,
        5,
        d,
      )
    }
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      -travel.steer * 0.018,
      6,
      d,
    )

    if (door.current) door.current.rotation.y = travel.doorOpen * 1.18
    if (cavity.current) cavity.current.visible = travel.doorOpen > 0.04
    if (steering.current) {
      steering.current.rotation.z = THREE.MathUtils.damp(
        steering.current.rotation.z,
        travel.steer * 0.5,
        8,
        d,
      )
    }

    for (const mat of headMats.current) {
      if (mat) mat.emissiveIntensity = 1.8 + mood.night * 2.8
    }
    for (const mat of tailMats.current) {
      if (mat) mat.emissiveIntensity = 0.55 + travel.brakePaint * 3.9
    }
    if (headLight.current) {
      headLight.current.intensity = 4 + mood.night * 28
    }
  })

  return (
    <group ref={group} position={[CAR_LANE_X, 0, carZ()]}>
      {/* soft contact shadow follows the car */}
      <mesh position={[0, 0.014, 0.1]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[4.9, 6.7]} />
        <meshBasicMaterial
          map={shadowTex}
          transparent
          opacity={0.6}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={body}>
        {/* chassis */}
        <mesh castShadow geometry={bodyGeometry}>
          <meshPhysicalMaterial
            color={PAINT}
            roughness={0.33}
            metalness={0.38}
            clearcoat={0.7}
            clearcoatRoughness={0.25}
          />
        </mesh>

        {/* cream lower rocker stripe + chrome trim */}
        <mesh position={[0.985, 0.47, -0.05]}>
          <boxGeometry args={[0.014, 0.08, 3.55]} />
          <meshStandardMaterial color={CREAM} roughness={0.6} />
        </mesh>
        <mesh position={[-0.985, 0.47, -0.05]}>
          <boxGeometry args={[0.014, 0.08, 3.55]} />
          <meshStandardMaterial color={CREAM} roughness={0.6} />
        </mesh>
        <mesh position={[0.992, 0.72, 0.05]}>
          <boxGeometry args={[0.019, 0.027, 3.6]} />
          <meshStandardMaterial color={CHROME} roughness={0.22} metalness={0.88} />
        </mesh>
        <mesh position={[-0.992, 0.72, 0.05]}>
          <boxGeometry args={[0.019, 0.027, 3.6]} />
          <meshStandardMaterial color={CHROME} roughness={0.22} metalness={0.88} />
        </mesh>

        {/* chrome bumpers */}
        <RoundedBox args={[1.94, 0.16, 0.2]} radius={0.055} smoothness={3} position={[0, 0.46, -2.27]}>
          <meshStandardMaterial color={CHROME} roughness={0.24} metalness={0.86} />
        </RoundedBox>
        <RoundedBox args={[1.94, 0.16, 0.2]} radius={0.055} smoothness={3} position={[0, 0.46, 2.25]}>
          <meshStandardMaterial color={CHROME} roughness={0.24} metalness={0.86} />
        </RoundedBox>

        {/* grille and front details */}
        <mesh position={[0, 0.63, -2.275]}>
          <boxGeometry args={[0.86, 0.18, 0.035]} />
          <meshStandardMaterial color="#1d2724" roughness={0.5} metalness={0.25} />
        </mesh>
        {[-0.3, -0.15, 0, 0.15, 0.3].map((x) => (
          <mesh key={x} position={[x, 0.63, -2.296]}>
            <boxGeometry args={[0.022, 0.15, 0.012]} />
            <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* headlights */}
        {[-0.68, 0.68].map((x) => (
          <group key={x} position={[x, 0.68, -2.28]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.165, 0.18, 0.09, 22]} />
              <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.18} />
            </mesh>
            <mesh position={[0, 0, -0.055]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.135, 0.135, 0.02, 22]} />
              <meshStandardMaterial
                ref={(el) => {
                  if (el) headMats.current[x < 0 ? 0 : 1] = el
                }}
                color="#fff5d8"
                emissive="#ffdcaa"
                emissiveIntensity={3.2}
                roughness={0.08}
                toneMapped={false}
              />
            </mesh>
            <sprite position={[0, 0, -0.09]} scale={[1.35, 1.35, 1]}>
              <spriteMaterial
                map={glowTex}
                color="#ffd9a3"
                transparent
                opacity={0.6}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </sprite>
          </group>
        ))}

        {/* tail lights */}
        {[-0.68, 0.68].map((x) => (
          <group key={x} position={[x, 0.67, 2.275]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.145, 0.06, 18]} />
              <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.105, 0.105, 0.018, 18]} />
              <meshStandardMaterial
                ref={(el) => {
                  if (el) tailMats.current[x > 0 ? 0 : 1] = el
                }}
                color="#7c1f1d"
                emissive="#ff3e2f"
                emissiveIntensity={0.9}
                roughness={0.18}
                toneMapped={false}
              />
            </mesh>
            <sprite position={[0, 0, 0.08]} scale={[0.8, 0.8, 1]}>
              <spriteMaterial
                map={glowTex}
                color="#ff5c45"
                transparent
                opacity={0.36}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </sprite>
          </group>
        ))}

        {/* number plate */}
        <mesh position={[0, 0.38, 2.345]}>
          <boxGeometry args={[0.62, 0.17, 0.02]} />
          <meshStandardMaterial color="#e8dfcc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.38, 2.357]}>
          <boxGeometry args={[0.47, 0.075, 0.005]} />
          <meshStandardMaterial color="#27352f" roughness={0.8} />
        </mesh>

        {/* side mirrors */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.99, 1.08, -0.55]}>
            <mesh rotation={[0, 0, side * -0.9]}>
              <cylinderGeometry args={[0.018, 0.018, 0.17, 8]} />
              <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[side * 0.08, 0.02, 0]} scale={[0.65, 0.52, 1]}>
              <sphereGeometry args={[0.13, 12, 8]} />
              <meshStandardMaterial color={PAINT} roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh position={[side * 0.095, 0.02, -0.02]} scale={[0.35, 0.35, 0.75]}>
              <sphereGeometry args={[0.115, 10, 8]} />
              <meshStandardMaterial color={GLASS} roughness={0.1} metalness={0.5} />
            </mesh>
          </group>
        ))}

        {/* left side door detail */}
        <group position={[-0.985, 0, 0]}>
          <mesh position={[0, 0.69, 0.27]}>
            <boxGeometry args={[0.012, 0.63, 1.53]} />
            <meshStandardMaterial color={PAINT_DARK} roughness={0.4} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.74, 0.77]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.025, 0.028, 1.46]} />
            <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.24} />
          </mesh>
          <mesh position={[-0.02, 0.79, 0.45]}>
            <boxGeometry args={[0.035, 0.04, 0.22]} />
            <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* functional right door */}
        <group ref={door} position={[0.98, 0.84, -0.48]}>
          <mesh castShadow position={[0.015, -0.14, 0.75]}>
            <boxGeometry args={[0.065, 0.6, 1.52]} />
            <meshPhysicalMaterial
              color={PAINT}
              roughness={0.33}
              metalness={0.38}
              clearcoat={0.7}
              clearcoatRoughness={0.25}
            />
          </mesh>
          <mesh position={[0.05, -0.02, 0.75]}>
            <boxGeometry args={[0.022, 0.028, 1.45]} />
            <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.22} />
          </mesh>
          <mesh position={[0.015, 0.36, 0.73]}>
            <boxGeometry args={[0.025, 0.44, 1.28]} />
            <meshPhysicalMaterial
              color={GLASS}
              transparent
              opacity={0.35}
              roughness={0.1}
              metalness={0.2}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0.05, 0.12, 0.73]}>
            <boxGeometry args={[0.02, 0.015, 1.34]} />
            <meshStandardMaterial color={CREAM} roughness={0.6} />
          </mesh>
          <mesh position={[0.06, -0.03, 0.97]}>
            <boxGeometry args={[0.055, 0.045, 0.22]} />
            <meshStandardMaterial color={CHROME} metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0.015, 0.13, 0.79]}>
            <boxGeometry args={[0.03, 0.44, 0.045]} />
            <meshStandardMaterial color={PAINT_DARK} roughness={0.4} metalness={0.3} />
          </mesh>
        </group>

        {/* dark doorway seen when the door swings wide */}
        <mesh ref={cavity} position={[0.986, 0.76, 0.25]} rotation={[0, Math.PI / 2, 0]} visible={false}>
          <planeGeometry args={[1.45, 0.68]} />
          <meshStandardMaterial color="#121b18" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>

        {/* greenhouse */}
        <RoundedBox
          args={[1.54, 0.095, 1.65]}
          radius={0.04}
          smoothness={3}
          position={[0, 1.68, 0.28]}
        >
          <meshStandardMaterial color={CREAM} roughness={0.52} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, 0.995, 0.2]}>
          <boxGeometry args={[1.75, 0.04, 1.9]} />
          <meshStandardMaterial color={PAINT_DARK} roughness={0.5} metalness={0.3} />
        </mesh>
        {/* windshield */}
        <mesh position={[0, 1.34, -0.6]} rotation={[0.52, 0, 0]}>
          <planeGeometry args={[1.48, 0.79]} />
          <meshPhysicalMaterial
            color={GLASS}
            transparent
            opacity={0.34}
            roughness={0.08}
            metalness={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* rear glass */}
        <mesh position={[0, 1.33, 1.03]} rotation={[-0.44, Math.PI, 0]}>
          <planeGeometry args={[1.42, 0.66]} />
          <meshPhysicalMaterial
            color={GLASS}
            transparent
            opacity={0.36}
            roughness={0.08}
            metalness={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* fixed left window */}
        <mesh position={[-0.815, 1.31, 0.23]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.52, 0.5]} />
          <meshPhysicalMaterial
            color={GLASS}
            transparent
            opacity={0.3}
            roughness={0.08}
            metalness={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* pillars */}
        {[-0.79, 0.79].map((x) => (
          <mesh key={`a${x}`} position={[x, 1.34, -0.53]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.047, 0.75, 0.055]} />
            <meshStandardMaterial color={PAINT} roughness={0.35} metalness={0.35} />
          </mesh>
        ))}
        {[-0.79, 0.79].map((x) => (
          <mesh key={`b${x}`} position={[x, 1.34, 0.95]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.06, 0.68, 0.06]} />
            <meshStandardMaterial color={PAINT} roughness={0.35} metalness={0.35} />
          </mesh>
        ))}
        {[-0.79, 0.79].map((x) => (
          <mesh key={`trim${x}`} position={[x, 1.56, 0.24]}>
            <boxGeometry args={[0.025, 0.025, 1.6]} />
            <meshStandardMaterial color={CREAM} roughness={0.5} />
          </mesh>
        ))}

        {/* interior */}
        <mesh position={[0, 0.43, 0.1]}>
          <boxGeometry args={[1.68, 0.09, 2.4]} />
          <meshStandardMaterial color="#3b3a31" roughness={0.9} />
        </mesh>
        <RoundedBox
          args={[1.6, 0.22, 0.28]}
          radius={0.05}
          smoothness={3}
          position={[0, 0.83, -0.62]}
        >
          <meshStandardMaterial color={DASH} roughness={0.62} metalness={0.12} />
        </RoundedBox>
        {[-0.42, 0.42].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <RoundedBox args={[0.51, 0.14, 0.55]} radius={0.06} smoothness={3} position={[0, 0.63, 0.25]}>
              <meshStandardMaterial color={SADDLE} roughness={0.78} />
            </RoundedBox>
            <RoundedBox
              args={[0.51, 0.54, 0.15]}
              radius={0.06}
              smoothness={3}
              position={[0, 0.9, 0.53]}
              rotation={[-0.13, 0, 0]}
            >
              <meshStandardMaterial color={SADDLE} roughness={0.8} />
            </RoundedBox>
            <mesh position={[0, 1.21, 0.58]}>
              <boxGeometry args={[0.28, 0.17, 0.11]} />
              <meshStandardMaterial color="#966a47" roughness={0.82} />
            </mesh>
          </group>
        ))}
        {/* steering wheel */}
        <group ref={steering} position={[0.4, 1.14, -0.32]} rotation={[-0.45, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.185, 0.024, 8, 26]} />
            <meshStandardMaterial color="#2d2e28" roughness={0.55} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
            <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
            <meshStandardMaterial color="#2d2e28" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <boxGeometry args={[0.022, 0.19, 0.02]} />
            <meshStandardMaterial color="#2d2e28" roughness={0.6} />
          </mesh>
        </group>
        {/* dashboard instruments */}
        {[-0.27, 0.12].map((x) => (
          <mesh key={x} position={[x + 0.15, 1.11, -0.74]} rotation={[-0.2, 0, 0]}>
            <circleGeometry args={[0.07, 14]} />
            <meshStandardMaterial
              color="#cbbf9f"
              emissive="#e4bc76"
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
        ))}
        <mesh position={[0.57, 0.9, -0.12]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.02, 0.26, 6]} />
          <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.57, 1.04, -0.12]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color="#2e302a" roughness={0.6} />
        </mesh>
        {/* rear view mirror */}
        <mesh position={[0, 1.54, -0.46]}>
          <boxGeometry args={[0.3, 0.09, 0.05]} />
          <meshStandardMaterial color="#2a302b" roughness={0.4} metalness={0.4} />
        </mesh>

        {/* luggage on the back */}
        <group position={[0, 0.94, 1.7]}>
          <RoundedBox args={[0.82, 0.34, 0.48]} radius={0.055} smoothness={3} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#8b5c3d" roughness={0.82} />
          </RoundedBox>
          <RoundedBox
            args={[0.5, 0.24, 0.38]}
            radius={0.04}
            smoothness={3}
            position={[0.08, 0.36, 0.01]}
            rotation={[0, 0.22, 0]}
          >
            <meshStandardMaterial color="#b67649" roughness={0.8} />
          </RoundedBox>
          {[-0.26, 0.26].map((x) => (
            <mesh key={x} position={[x, 0.1, 0]}>
              <boxGeometry args={[0.055, 0.55, 0.55]} />
              <meshStandardMaterial color="#38322a" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0.08, 0.49, 0]}>
            <boxGeometry args={[0.15, 0.026, 0.16]} />
            <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        <mesh position={[-0.46, 0.26, 2.33]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 10]} />
          <meshStandardMaterial color="#5a554b" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* headlight throw */}
        <object3D ref={lightTarget} position={[0, 0.08, -24]} />
        <spotLight
          ref={headLight}
          position={[0, 0.8, -2.2]}
          angle={0.48}
          penumbra={0.72}
          distance={38}
          intensity={10}
          color="#ffe6bf"
          castShadow={false}
        />
      </group>

      <Wheel position={[-0.9, 0.41, -1.4]} side={-1} />
      <Wheel position={[0.9, 0.41, -1.4]} side={1} />
      <Wheel position={[-0.9, 0.41, 1.42]} side={-1} />
      <Wheel position={[0.9, 0.41, 1.42]} side={1} />
    </group>
  )
}
