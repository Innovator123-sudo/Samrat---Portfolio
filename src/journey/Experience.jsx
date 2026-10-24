import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { useJourney } from '../state/journeyStore'
import { JourneyEngine } from './JourneyEngine'
import { CameraRig } from './CameraRig'
import { PostFX } from './PostFX'
import { World } from '../world/Environment'
import { Car } from '../world/Car'
import { Driver } from '../world/Driver'

function SceneReady({ onReady }) {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady?.()
  })
  return null
}

export function Experience({ onSceneReady }) {
  const quality = useJourney((s) => s.quality)
  return (
    <>
      <JourneyEngine />
      <CameraRig />
      <World />
      <Car />
      <Driver />
      {quality === 'high' && <PostFX />}
      <AdaptiveDpr pixelated />
      <Preload all />
      <SceneReady onReady={onSceneReady} />
    </>
  )
}
