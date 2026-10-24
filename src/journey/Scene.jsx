import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourney } from '../state/journeyStore'
import { Experience } from './Experience'

/* Slim wrapper: holds the R3F Canvas + renderer config so the whole three.js
   stack can be lazy-loaded — the reading edition never touches it. */
export default function Scene({ onSceneReady, onContextLost }) {
  const quality = useJourney((s) => s.quality)

  return (
    <Canvas
      shadows={quality === 'high'}
      dpr={quality === 'high' ? [1, 1.8] : [1, 1.25]}
      camera={{ position: [6, 3, 6], fov: 40, near: 0.1, far: 1200 }}
      gl={{
        antialias: quality === 'high',
        alpha: false,
        stencil: false,
        powerPreference: 'high-performance',
      }}
      performance={{ min: 0.6 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        gl.domElement.addEventListener('webglcontextlost', onContextLost, {
          once: true,
        })
      }}
    >
      <Experience onSceneReady={onSceneReady} />
    </Canvas>
  )
}
