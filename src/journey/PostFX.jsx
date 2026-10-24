import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export function PostFX() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.46}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.72}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.68} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.032} />
    </EffectComposer>
  )
}
