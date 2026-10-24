import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATIONS } from '../data/content'
import { useJourney, PHASES } from '../state/journeyStore'
import { boardPosition, computeMood, travel } from '../state/travel'
import { makeBillboardTexture, makeGlowTexture } from './textures'

export function Billboard({ station, index }) {
  const group = useRef()
  const screen = useRef()
  const frame = useRef()
  const glow = useRef()
  const [hovered, setHovered] = useState(false)
  const tex = useMemo(() => makeBillboardTexture(station), [station])
  const glowTex = useMemo(() => makeGlowTexture(), [])
  const currentTex = useRef(tex)
  const regenerated = useRef(false)
  const pos = useMemo(() => boardPosition(index), [index])
  const isFinal = !!station.finale

  useEffect(() => {
    return () => {
      currentTex.current.dispose()
      glowTex.dispose()
    }
  }, [])

  // Re-bake the billboard texture once webfonts are ready so the type
  // renders with Fraunces instead of the system fallback font.
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (regenerated.current) return
      try {
        await document.fonts.ready
      } catch {}
      if (cancelled) return
      const next = makeBillboardTexture(station)
      if (!screen.current || cancelled) return
      const prev = currentTex.current
      currentTex.current = next
      screen.current.map = next
      screen.current.emissiveMap = next
      screen.current.needsUpdate = true
      regenerated.current = true
      prev.dispose()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [station])

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const mood = travel.mood || computeMood()
    const active = travel.activeStation === index && !isFinal
    const aroundFinale = isFinal && travel.progress > 4.5
    const pulse =
      (active ? 0.32 + Math.sin(state.clock.elapsedTime * 3.2) * 0.12 : 0) +
      (aroundFinale ? 0.24 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1 : 0)
    const targetIntensity = mood.panel * (isFinal ? 1.55 : 1) + pulse + (hovered ? 0.35 : 0)

    if (screen.current) {
      screen.current.emissiveIntensity = THREE.MathUtils.damp(
        screen.current.emissiveIntensity,
        targetIntensity,
        4,
        d,
      )
    }
    if (frame.current) {
      frame.current.emissiveIntensity = THREE.MathUtils.damp(
        frame.current.emissiveIntensity,
        (active ? 0.9 : 0.18) + (isFinal && aroundFinale ? 0.8 : 0),
        4,
        d,
      )
    }
    if (glow.current) {
      glow.current.material.opacity = THREE.MathUtils.damp(
        glow.current.material.opacity,
        (active ? 0.22 : 0.07) + (aroundFinale ? 0.14 : 0),
        3,
        d,
      )
    }
  })

  const onActivate = (e) => {
    e.stopPropagation()
    const s = useJourney.getState()
    if (s.showCard) return
    if (s.promptKey === station.key) {
      s.chooseLook()
      return
    }
    if (
      s.phase === PHASES.DRIVING ||
      s.phase === PHASES.APPROACHING ||
      s.phase === PHASES.ASKING ||
      s.phase === PHASES.IDLE
    ) {
      s.goTo(station.key)
    }
  }

  return (
    <group ref={group} position={[pos.x, 0, pos.z]} rotation={[0, isFinal ? -0.035 : -0.08, 0]}>
      {/* anchors, weathered concrete */}
      {[-2.95, 2.95].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.15, 0]} castShadow>
            <boxGeometry args={[0.38, 4.3, 0.38]} />
            <meshStandardMaterial color="#847a69" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.85, 0.36, 0.85]} />
            <meshStandardMaterial color="#746a5b" roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.7, 0.21]}>
            <boxGeometry args={[0.42, 0.15, 0.04]} />
            <meshStandardMaterial color="#4b4b40" roughness={0.7} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* diagonal back braces */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 1.85, 3.15, -0.5]}
          rotation={[0.17, 0, side * 0.5]}
        >
          <boxGeometry args={[0.13, 3.8, 0.13]} />
          <meshStandardMaterial color="#3d463f" roughness={0.6} metalness={0.5} />
        </mesh>
      ))}

      {/* frame */}
      <group position={[0, isFinal ? 6.28 : 6.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[isFinal ? 10.35 : 9.4, isFinal ? 6.35 : 5.85, 0.34]} />
          <meshStandardMaterial color="#1c2621" roughness={0.58} metalness={0.38} />
        </mesh>
        <mesh position={[0, 0, 0.19]}>
          <planeGeometry args={[isFinal ? 9.82 : 8.86, isFinal ? 5.82 : 5.32]} />
          <meshStandardMaterial
            ref={screen}
            map={tex}
            emissiveMap={tex}
            emissive={new THREE.Color(station.accent)}
            emissiveIntensity={0.8}
            roughness={0.25}
            metalness={0.06}
            toneMapped={false}
          />
        </mesh>
        {/* thin accent edge that catches bloom */}
        <mesh position={[0, -(isFinal ? 3.12 : 2.87), 0.2]}>
          <boxGeometry args={[isFinal ? 9.9 : 8.94, 0.055, 0.04]} />
          <meshStandardMaterial
            ref={frame}
            color={station.accent}
            emissive={station.accent}
            emissiveIntensity={0.2}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, isFinal ? 3.12 : 2.87, 0.2]}>
          <boxGeometry args={[isFinal ? 9.9 : 8.94, 0.025, 0.03]} />
          <meshStandardMaterial color="#5e594d" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* service lamps */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * (isFinal ? 4.55 : 4.1), (isFinal ? 3.35 : 3.1), 0.36]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.19, 0.2, 10]} />
              <meshStandardMaterial color="#39433d" roughness={0.55} metalness={0.4} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <circleGeometry args={[0.12, 10]} />
              <meshStandardMaterial
                color="#f4d3a1"
                emissive="#ffdc9f"
                emissiveIntensity={0.4}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* soft aura to sell the glow at night */}
      <sprite ref={glow} position={[0, isFinal ? 6.28 : 6.05, 0.3]} scale={[isFinal ? 15 : 13, isFinal ? 9.5 : 8.5, 1]}>
        <spriteMaterial
          map={glowTex}
          color={station.accent}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* click target, generous and invisible */}
      <mesh
        position={[0, isFinal ? 6.28 : 6.05, 0.65]}
        onClick={onActivate}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <boxGeometry args={[isFinal ? 10.4 : 9.4, isFinal ? 6.4 : 5.9, 0.7]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* tiny roadside marker */}
      <mesh position={[-4.8, 0.34, 0.3]}>
        <boxGeometry args={[0.16, 0.68, 0.16]} />
        <meshStandardMaterial color="#d9d2c2" roughness={0.8} />
      </mesh>
      <mesh position={[-4.8, 0.54, 0.39]}>
        <boxGeometry args={[0.09, 0.1, 0.02]} />
        <meshStandardMaterial
          color={station.accent}
          emissive={station.accent}
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export function Billboards() {
  return (
    <>
      {STATIONS.map((station, i) => (
        <Billboard key={station.key} index={i} station={station} />
      ))}
    </>
  )
}
