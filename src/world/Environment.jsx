import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  FINAL_BOARD_Z,
  FINAL_PARK_Z,
  ROAD_HALF_WIDTH,
  ROAD_TILES,
  SEG_LEN,
  carZ,
  computeMood,
  mulberry32,
  smooth01,
  stationZ,
  travel,
} from '../state/travel'
import { STATIONS } from '../data/content'
import { useJourney } from '../state/journeyStore'
import { makeAsphaltTexture, makeGravelTexture, makeGlowTexture, makeRouteSignTexture } from './textures'
import { Billboards } from './Billboard'

/* --------------------------------------------------------------- fog + sky */

const CREAM = new THREE.Color('#faf4e6')

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFrag = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uSunStrength;
  uniform float uSunset;
  varying vec3 vDir;

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.04, 0.18, h));
    col = mix(col, uTop, smoothstep(0.14, 0.75, h));

    float sunDot = max(dot(d, normalize(uSunDir)), 0.0);
    float disc = smoothstep(0.99925, 0.99972, sunDot);
    float horizonGlow = pow(1.0 - clamp(abs(h), 0.0, 1.0), 7.0);
    col += uSunColor * disc * 4.6 * uSunStrength;
    col += uSunColor * pow(sunDot, 380.0) * 0.72 * uSunStrength;
    col += uSunColor * pow(sunDot, 16.0) * 0.22 * uSunStrength;
    col += uSunColor * horizonGlow * (0.05 + uSunset * 0.2) * uSunStrength;
    col += uSunColor * pow(sunDot, 3.0) * uSunset * 0.3 * pow(1.0 - clamp(h, 0.0, 1.0), 3.0);

    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.008;

    gl_FragColor = vec4(col, 1.0);
  }
`

function SkyDome() {
  const mesh = useRef()
  const { camera } = useThree()
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color('#718aa0') },
      uMid: { value: new THREE.Color('#d8ad9b') },
      uHorizon: { value: new THREE.Color('#f6cfaa') },
      uSunColor: { value: new THREE.Color('#ffd1a0') },
      uSunDir: { value: new THREE.Vector3(-0.35, 0.18, -1).normalize() },
      uSunStrength: { value: 1 },
      uSunset: { value: 0 },
    }),
    [],
  )

  useFrame(() => {
    const mood = travel.mood || computeMood()
    uniforms.uTop.value.copy(mood.skyTop)
    uniforms.uMid.value.copy(mood.skyMid)
    uniforms.uHorizon.value.copy(mood.horizon)
    uniforms.uSunColor.value.copy(mood.sun)
    uniforms.uSunStrength.value =
      Math.max(0.15, mood.sunI) * (1 - (travel.nightBlend || 0) * 0.55)
    const t = Math.min(1, Math.max(0, travel.journeyTime))
    const rise = smooth01(t / 0.52)
    const set = smooth01((t - 0.54) / 0.43)
    const elevation = 0.035 + rise * 0.47 - set * 0.52
    const azimuth = -0.62 + t * 1.02
    uniforms.uSunDir.value.set(
      Math.sin(azimuth) * Math.cos(elevation),
      Math.sin(elevation),
      -Math.cos(azimuth) * Math.cos(elevation),
    )
    uniforms.uSunset.value =
      smooth01((0.3 - elevation) / 0.32) *
      (0.3 + 0.7 * smooth01(t * 1.6)) *
      (1 - (travel.nightBlend || 0) * 0.8)
    if (mesh.current) mesh.current.position.copy(camera.position)
  })

  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[700, 32, 20]} />
      <shaderMaterial
        vertexShader={skyVert}
        fragmentShader={skyFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function Stars() {
  const group = useRef()
  const mat = useRef()
  const { camera } = useThree()
  const quality = useJourney((s) => s.quality)
  const { positions, sizes } = useMemo(() => {
    const rand = mulberry32(9831)
    const n = quality === 'low' ? 420 : 680
    const positions = new Float32Array(n * 3)
    const sizes = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const theta = rand() * Math.PI * 2
      const y = 0.05 + rand() * 0.93
      const r = Math.sqrt(1 - y * y)
      positions[i * 3] = Math.cos(theta) * r * 430
      positions[i * 3 + 1] = y * 430
      positions[i * 3 + 2] = Math.sin(theta) * r * 430
      sizes[i] = 0.8 + rand() * 1.9
    }
    return { positions, sizes }
  }, [quality])

  useFrame((state) => {
    const mood = travel.mood || computeMood()
    if (group.current) {
      group.current.position.copy(camera.position)
      group.current.rotation.y = state.clock.elapsedTime * 0.002
    }
    if (mat.current) {
      mat.current.opacity = mood.star * 0.9
      mat.current.size = 1.2
    }
  })

  return (
    <group ref={group} renderOrder={-9}>
      <points key={quality}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          ref={mat}
          color="#f1e6d3"
          size={1.2}
          sizeAttenuation={false}
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </points>
    </group>
  )
}

function FogAndLights() {
  const { scene } = useThree()
  const quality = useJourney((s) => s.quality)
  const sun = useRef()
  const target = useRef()
  const hemi = useRef()
  const amb = useRef()
  const fill = useRef()

  useEffect(() => {
    const fog = new THREE.Fog('#dcc2ad', 48, 320)
    scene.fog = fog
    return () => {
      scene.fog = null
    }
  }, [scene])

  useEffect(() => {
    if (sun.current && target.current) sun.current.target = target.current
  }, [])

  useFrame(() => {
    const mood = travel.mood || computeMood()
    if (scene.fog) {
      scene.fog.color.copy(mood.fog)
      scene.fog.near = 35 + (1 - mood.night) * 20
      scene.fog.far = 300 - mood.night * 65
    }
    const z = carZ()
    if (sun.current) {
      const sunHeight = 72 - 50 * smooth01((travel.journeyTime - 0.5) / 0.48)
      sun.current.color.copy(mood.sun)
      sun.current.intensity = mood.sunI * 2.8
      sun.current.position.set(travel.x - 48, sunHeight, z - 55)
    }
    if (target.current) target.current.position.set(travel.x, 0, z - 14)
    if (hemi.current) {
      hemi.current.color.copy(mood.hemi)
      hemi.current.groundColor.copy(mood.ground)
      hemi.current.intensity = mood.hemiI
    }
    if (amb.current) {
      amb.current.color.copy(mood.amb)
      amb.current.intensity = mood.ambI * 0.65
    }
    if (fill.current) {
      fill.current.color.copy(mood.skyMid)
      fill.current.intensity = 0.25 + mood.night * 0.25
    }
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={0.65} />
      <ambientLight ref={amb} intensity={0.65} />
      <directionalLight
        ref={sun}
        position={[-48, 72, -55]}
        intensity={2.6}
        castShadow={quality === 'high'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={180}
        shadow-bias={-0.0003}
      />
      <object3D ref={target} />
      <directionalLight ref={fill} position={[32, 28, 35]} intensity={0.3} color="#afc5c0" />
    </>
  )
}

/* ------------------------------------------------------------------ terrain */

const TERRAIN_BASE = -0.07
const TERRAIN_CENTER_Z = -700
const FLAT_SPOTS = [
  ...STATIONS.map((_, index) =>
    index === STATIONS.length - 1
      ? { x: 16.2, z: FINAL_BOARD_Z, r: 18 }
      : { x: 14.2, z: stationZ(index), r: 13 },
  ),
  { x: 11.4, z: -78, r: 8 },
  { x: 10, z: FINAL_PARK_Z, r: 24 },
]

function flatAmount(x, z) {
  let flat = 0
  for (const spot of FLAT_SPOTS) {
    const dist = Math.hypot((x - spot.x) * 0.9, z - spot.z)
    if (dist < spot.r) {
      flat = Math.max(flat, 1 - smooth01((dist - spot.r * 0.58) / (spot.r * 0.42)))
    }
  }
  return flat
}

function terrainHeight(x, z) {
  const corridor = smooth01((Math.abs(x) - 8.5) / 20)
  const swells =
    Math.sin(z * 0.016 + x * 0.011) * 1.55 +
    Math.sin(z * 0.039 - x * 0.022) * 0.72 +
    Math.sin(z * 0.081 + x * 0.047) * 0.32 +
    Math.sin(x * 0.058 + z * 0.007) * 0.5
  const ridge =
    smooth01((Math.abs(x) - 52) / 118) *
    (4.6 +
      Math.sin(z * 0.009 + x * 0.0045) * 2.6 +
      Math.sin(z * 0.021 - x * 0.011) * 1.15)
  const bank = smooth01((Math.abs(x) - 20) / 45) * 0.45
  return (
    TERRAIN_BASE +
    corridor * (swells + ridge + bank) * (1 - flatAmount(x, z))
  )
}

function Ground() {
  const mat = useRef()
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(760, 2400, 120, 300)
    const position = geo.attributes.position
    const colors = new Float32Array(position.count * 3)
    const color = new THREE.Color()
    const dry = new THREE.Color(1.16, 1.05, 0.82)
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const z = -position.getY(i) + TERRAIN_CENTER_Z
      const h = terrainHeight(x, z)
      position.setZ(i, h)
      const grain =
        0.5 +
        0.5 *
          Math.sin(x * 0.21 + z * 0.063) *
          Math.sin(x * 0.047 - z * 0.117)
      const patch = smooth01((h - TERRAIN_BASE) / 2.4) * (0.28 + grain * 0.42)
      color.setRGB(0.8 + grain * 0.24, 0.86 + grain * 0.2, 0.72 + grain * 0.17)
      color.lerp(dry, patch)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const mood = travel.mood || computeMood()
    if (mat.current) mat.current.color.copy(mood.ground)
  })

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, TERRAIN_CENTER_Z]}
      receiveShadow
    >
      <meshStandardMaterial ref={mat} vertexColors color="#7d9275" roughness={1} />
    </mesh>
  )
}

const matrixHelper = new THREE.Object3D()

function Mountains() {
  const ref = useRef()
  const mat = useRef()
  const quality = useJourney((s) => s.quality)
  const items = useMemo(() => {
    const rand = mulberry32(771)
    const arr = []
    const count = quality === 'low' ? 16 : 26
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 1 : -1
      arr.push({
        x: side * (88 + rand() * 130),
        z: 80 - rand() * 1800,
        sx: 28 + rand() * 50,
        sy: 38 + rand() * 82,
        sz: 28 + rand() * 48,
        ry: rand() * Math.PI,
      })
    }
    return arr
  }, [quality])

  useLayoutEffect(() => {
    if (!ref.current) return
    items.forEach((it, i) => {
      matrixHelper.position.set(it.x, it.sy * 0.5 - 3, it.z)
      matrixHelper.rotation.set(0, it.ry, 0)
      matrixHelper.scale.set(it.sx, it.sy, it.sz)
      matrixHelper.updateMatrix()
      ref.current.setMatrixAt(i, matrixHelper.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])

  useFrame(() => {
    const mood = travel.mood || computeMood()
    if (mat.current) mat.current.color.copy(mood.mountain)
  })

  return (
    <instancedMesh
      key={quality}
      ref={ref}
      args={[null, null, items.length]}
      frustumCulled={false}
    >
      <coneGeometry args={[1, 1, 6, 1]} />
      <meshStandardMaterial ref={mat} color="#6a7181" roughness={1} flatShading />
    </instancedMesh>
  )
}

function makeTrees(quality) {
  const rand = mulberry32(12983)
  const trees = []
  const boards = STATIONS.map((_, index) => ({
    x: index === STATIONS.length - 1 ? 16.2 : 14.2,
    z: index === STATIONS.length - 1 ? FINAL_BOARD_Z : stationZ(index),
  }))
  const count = quality === 'low' ? 300 : 560

  for (let i = 0; i < count; i++) {
    const z = 150 - rand() * 1950
    const side = rand() > 0.5 ? 1 : -1
    const near = rand() < 0.62
    const x = side * (11.5 + (near ? Math.pow(rand(), 1.65) * 38 : 38 + rand() * 118))
    if (z < FINAL_BOARD_Z + 52 && z > FINAL_BOARD_Z - 75 && Math.abs(x) < 28) continue
    if (boards.some((board) => Math.abs(z - board.z) < 19 && Math.abs(x - board.x) < 19)) {
      continue
    }
    if (Math.abs(z + 78) < 12 && Math.abs(x - 11.4) < 11) continue

    const base = terrainHeight(x, z)
    const pine = rand() < 0.4
    trees.push({
      x,
      z,
      base,
      pine,
      h: 1.3 + rand() * 2.35,
      w: 0.7 + rand() * 1.05,
      tint: new THREE.Color().setHSL(
        0.255 + rand() * 0.055,
        0.23 + rand() * 0.15,
        0.23 + rand() * 0.13,
      ),
      bark: new THREE.Color().setHSL(
        0.075 + rand() * 0.025,
        0.22 + rand() * 0.12,
        0.22 + rand() * 0.1,
      ),
      ry: rand() * Math.PI * 2,
    })
  }
  return trees
}

function Forest() {
  const quality = useJourney((s) => s.quality)
  const trees = useMemo(() => makeTrees(quality), [quality])
  const trunkRef = useRef()
  const pineRef = useRef()
  const broadRef = useRef()
  const pine = useMemo(() => trees.filter((t) => t.pine), [trees])
  const broad = useMemo(() => trees.filter((t) => !t.pine), [trees])

  useLayoutEffect(() => {
    if (!trunkRef.current) return
    trees.forEach((tree, i) => {
      matrixHelper.position.set(tree.x, tree.base + tree.h * 0.5, tree.z)
      matrixHelper.rotation.set(0, tree.ry, 0)
      matrixHelper.scale.set(tree.w, tree.h, tree.w)
      matrixHelper.updateMatrix()
      trunkRef.current.setMatrixAt(i, matrixHelper.matrix)
      trunkRef.current.setColorAt(i, tree.bark)
    })
    trunkRef.current.instanceMatrix.needsUpdate = true
    if (trunkRef.current.instanceColor) trunkRef.current.instanceColor.needsUpdate = true

    pine.forEach((tree, i) => {
      const tiers = [
        { y: 0.62, sx: 1.55, sy: 1.35, sz: 1.55, light: 0 },
        { y: 1.18, sx: 1.2, sy: 1.15, sz: 1.2, light: 0.025 },
        { y: 1.68, sx: 0.8, sy: 0.95, sz: 0.8, light: 0.055 },
      ]
      tiers.forEach((tier, tierIndex) => {
        const instance = i * 3 + tierIndex
        matrixHelper.position.set(
          tree.x,
          tree.base + tree.h + tier.y * tree.w,
          tree.z,
        )
        matrixHelper.rotation.set(0, tree.ry + tierIndex * 0.4, 0)
        matrixHelper.scale.set(
          tree.w * tier.sx,
          tree.w * tier.sy,
          tree.w * tier.sz,
        )
        matrixHelper.updateMatrix()
        pineRef.current.setMatrixAt(instance, matrixHelper.matrix)
        pineRef.current.setColorAt(
          instance,
          tree.tint.clone().offsetHSL(0, 0.01, tier.light),
        )
      })
    })
    pineRef.current.instanceMatrix.needsUpdate = true
    if (pineRef.current.instanceColor) pineRef.current.instanceColor.needsUpdate = true

    broad.forEach((tree, i) => {
      const cos = Math.cos(tree.ry)
      const sin = Math.sin(tree.ry)
      const blobs = [
        { x: 0, z: 0, y: 1.02, s: 1.14, sy: 0.92, l: 0 },
        { x: -0.78, z: 0.18, y: 0.84, s: 0.86, sy: 0.78, l: -0.03 },
        { x: 0.72, z: -0.22, y: 0.92, s: 0.8, sy: 0.8, l: 0.035 },
        { x: 0.08, z: -0.62, y: 0.72, s: 0.68, sy: 0.7, l: 0.02 },
        { x: -0.14, z: 0.58, y: 1.1, s: 0.72, sy: 0.68, l: -0.015 },
      ]
      blobs.forEach((blob, blobIndex) => {
        const instance = i * 5 + blobIndex
        const ox = (blob.x * cos + blob.z * sin) * tree.w
        const oz = (-blob.x * sin + blob.z * cos) * tree.w
        matrixHelper.position.set(
          tree.x + ox,
          tree.base + tree.h + blob.y * tree.w,
          tree.z + oz,
        )
        matrixHelper.rotation.set(0, tree.ry + blobIndex * 0.7, 0)
        matrixHelper.scale.set(
          tree.w * blob.s * 1.08,
          tree.w * blob.s * blob.sy,
          tree.w * blob.s,
        )
        matrixHelper.updateMatrix()
        broadRef.current.setMatrixAt(instance, matrixHelper.matrix)
        broadRef.current.setColorAt(
          instance,
          tree.tint.clone().offsetHSL(0.01, 0.03, blob.l),
        )
      })
    })
    broadRef.current.instanceMatrix.needsUpdate = true
    if (broadRef.current.instanceColor) broadRef.current.instanceColor.needsUpdate = true
  }, [trees, pine, broad])

  return (
    <group key={quality}>
      <instancedMesh ref={trunkRef} args={[null, null, trees.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.1, 0.19, 1, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={pineRef}
        args={[null, null, pine.length * 3]}
        frustumCulled={false}
      >
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh
        ref={broadRef}
        args={[null, null, broad.length * 5]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  )
}

function Rocks() {
  const ref = useRef()
  const quality = useJourney((s) => s.quality)
  const items = useMemo(() => {
    const rand = mulberry32(8881)
    return Array.from({ length: quality === 'low' ? 70 : 120 }, () => {
      const side = rand() > 0.5 ? 1 : -1
      const x = side * (8 + rand() * 64)
      const z = 120 - rand() * 1780
      const s = 0.25 + rand() * 1.9
      return {
        x,
        y: terrainHeight(x, z) + s * 0.18,
        z,
        s,
        ry: rand() * Math.PI,
        tint: new THREE.Color().setHSL(
          0.09 + rand() * 0.03,
          0.08 + rand() * 0.1,
          0.42 + rand() * 0.14,
        ),
      }
    })
  }, [quality])

  useLayoutEffect(() => {
    if (!ref.current) return
    items.forEach((it, i) => {
      matrixHelper.position.set(it.x, it.y, it.z)
      matrixHelper.rotation.set(0, it.ry, 0)
      matrixHelper.scale.set(it.s * 1.3, it.s * 0.7, it.s)
      matrixHelper.updateMatrix()
      ref.current.setMatrixAt(i, matrixHelper.matrix)
      ref.current.setColorAt(i, it.tint)
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items])

  return (
    <instancedMesh
      key={quality}
      ref={ref}
      args={[null, null, items.length]}
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" roughness={0.98} flatShading />
    </instancedMesh>
  )
}

function Shrubs() {
  const ref = useRef()
  const quality = useJourney((s) => s.quality)
  const items = useMemo(() => {
    const rand = mulberry32(5527)
    return Array.from({ length: quality === 'low' ? 100 : 180 }, () => {
      const side = rand() > 0.5 ? 1 : -1
      const x = side * (7.4 + rand() * 30)
      const z = 140 - rand() * 1880
      const s = 0.28 + rand() * 0.72
      return {
        x,
        z,
        y: terrainHeight(x, z) + s * 0.32,
        s,
        sy: 0.62 + rand() * 0.5,
        ry: rand() * Math.PI,
        tint: new THREE.Color().setHSL(
          0.22 + rand() * 0.08,
          0.24 + rand() * 0.18,
          0.24 + rand() * 0.14,
        ),
      }
    })
  }, [quality])

  useLayoutEffect(() => {
    if (!ref.current) return
    items.forEach((it, i) => {
      matrixHelper.position.set(it.x, it.y, it.z)
      matrixHelper.rotation.set(0, it.ry, 0)
      matrixHelper.scale.set(it.s * 1.2, it.s * it.sy, it.s)
      matrixHelper.updateMatrix()
      ref.current.setMatrixAt(i, matrixHelper.matrix)
      ref.current.setColorAt(i, it.tint)
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items])

  return (
    <instancedMesh
      key={quality}
      ref={ref}
      args={[null, null, items.length]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" roughness={0.94} flatShading />
    </instancedMesh>
  )
}

function makeGrassGeometry() {
  const rand = mulberry32(3341)
  const positions = []
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 + rand() * 0.7
    const radius = rand() * 0.1
    const bx = Math.cos(angle) * radius
    const bz = Math.sin(angle) * radius
    const height = 0.38 + rand() * 0.34
    const lean = 0.06 + rand() * 0.18
    const width = 0.022 + rand() * 0.016
    const px = Math.cos(angle + Math.PI / 2) * width
    const pz = Math.sin(angle + Math.PI / 2) * width
    positions.push(
      bx - px,
      0,
      bz - pz,
      bx + px,
      0,
      bz + pz,
      bx + Math.cos(angle) * lean,
      height,
      bz + Math.sin(angle) * lean,
    )
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

function GrassTufts() {
  const ref = useRef()
  const quality = useJourney((s) => s.quality)
  const geometry = useMemo(makeGrassGeometry, [])
  const items = useMemo(() => {
    const rand = mulberry32(9917)
    return Array.from({ length: quality === 'low' ? 440 : 880 }, () => {
      const side = rand() > 0.5 ? 1 : -1
      const x = side * (7.2 + rand() * 19)
      const z = 145 - rand() * 1890
      const sx = 0.8 + rand() * 0.55
      const sy = 0.7 + rand() * 0.8
      return {
        x,
        z,
        y: terrainHeight(x, z) - 0.01,
        sx,
        sy,
        ry: rand() * Math.PI,
        tint: new THREE.Color().setHSL(
          0.2 + rand() * 0.08,
          0.3 + rand() * 0.15,
          0.34 + rand() * 0.12,
        ),
      }
    })
  }, [quality])

  useEffect(() => () => geometry.dispose(), [geometry])

  useLayoutEffect(() => {
    if (!ref.current) return
    items.forEach((it, i) => {
      matrixHelper.position.set(it.x, it.y, it.z)
      matrixHelper.rotation.set(0, it.ry, 0)
      matrixHelper.scale.set(it.sx, it.sy, it.sx)
      matrixHelper.updateMatrix()
      ref.current.setMatrixAt(i, matrixHelper.matrix)
      ref.current.setColorAt(i, it.tint)
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items])

  return (
    <instancedMesh
      key={quality}
      ref={ref}
      args={[null, null, items.length]}
      geometry={geometry}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.95}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

/* -------------------------------------------------------------------- road */

function RoadSystem() {
  const asphalt = useMemo(makeAsphaltTexture, [])
  const gravel = useMemo(makeGravelTexture, [])
  const tiles = useRef([])

  useEffect(() => {
    return () => {
      asphalt.dispose()
      gravel.dispose()
    }
  }, [asphalt, gravel])

  useFrame(() => {
    const center = Math.round(carZ() / SEG_LEN)
    const start = center - 18
    for (let i = 0; i < ROAD_TILES; i++) {
      const tile = tiles.current[i]
      if (tile) tile.position.z = (start + i) * SEG_LEN
    }
  })

  return (
    <group>
      {Array.from({ length: ROAD_TILES }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            tiles.current[i] = el
          }}
          position={[0, 0, -i * SEG_LEN]}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[ROAD_HALF_WIDTH * 2, SEG_LEN + 0.05]} />
            <meshStandardMaterial
              map={asphalt}
              roughness={0.94}
              metalness={0.03}
              color="#d8d4ca"
            />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[side * (ROAD_HALF_WIDTH + 0.65), 0.012, 0]}
            >
              <planeGeometry args={[1.3, SEG_LEN + 0.06]} />
              <meshStandardMaterial map={gravel} color="#b6a990" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Delineators() {
  const postRef = useRef()
  const glowRef = useRef()
  const items = useMemo(() => {
    const arr = []
    for (let z = 80; z > -1560; z -= 26) {
      arr.push({ x: -6.25, z })
      arr.push({ x: 6.25, z })
    }
    return arr
  }, [])

  useLayoutEffect(() => {
    if (!postRef.current) return
    items.forEach((it, i) => {
      matrixHelper.position.set(it.x, 0.35, it.z)
      matrixHelper.rotation.set(0, 0, 0)
      matrixHelper.scale.set(1, 1, 1)
      matrixHelper.updateMatrix()
      postRef.current.setMatrixAt(i, matrixHelper.matrix)
      matrixHelper.position.set(it.x - Math.sign(it.x) * 0.055, 0.55, it.z)
      matrixHelper.scale.set(0.75, 0.55, 0.75)
      matrixHelper.updateMatrix()
      glowRef.current.setMatrixAt(i, matrixHelper.matrix)
    })
    postRef.current.instanceMatrix.needsUpdate = true
    glowRef.current.instanceMatrix.needsUpdate = true
  }, [items])

  return (
    <group>
      <instancedMesh ref={postRef} args={[null, null, items.length]} frustumCulled={false}>
        <boxGeometry args={[0.11, 0.7, 0.11]} />
        <meshStandardMaterial color="#ddd5c3" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[null, null, items.length]} frustumCulled={false}>
        <boxGeometry args={[0.08, 0.09, 0.08]} />
        <meshStandardMaterial
          color="#f3b57a"
          emissive="#f3a866"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

function RouteSign() {
  const tex = useMemo(makeRouteSignTexture, [])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <group position={[11.4, 0, -78]} rotation={[0, -0.16, 0]}>
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} position={[x, 1.9, 0]}>
          <boxGeometry args={[0.14, 3.8, 0.14]} />
          <meshStandardMaterial color="#6a6152" roughness={0.65} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 4.6, 0.08]}>
        <planeGeometry args={[4.4, 2.64]} />
        <meshStandardMaterial map={tex} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4.6, -0.03]}>
        <boxGeometry args={[4.55, 2.8, 0.12]} />
        <meshStandardMaterial color="#26372f" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  )
}

function RoadsideLamps() {
  const quality = useJourney((s) => s.quality)
  const glowTex = useMemo(makeGlowTexture, [])
  const bulbMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f1d5a4',
        emissive: '#ffd69b',
        emissiveIntensity: 0.1,
        toneMapped: false,
      }),
    [],
  )
  const spriteMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTex,
        color: '#ffd09a',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [glowTex],
  )

  useEffect(() => {
    return () => {
      glowTex.dispose()
      bulbMat.dispose()
      spriteMat.dispose()
    }
  }, [glowTex, bulbMat, spriteMat])

  const lamps = useMemo(() => {
    const arr = []
    for (let i = 0; i < 14; i++) {
      arr.push({ x: 8.7, z: 30 - i * 92 })
    }
    return arr
  }, [])

  useFrame(() => {
    const mood = travel.mood || computeMood()
    bulbMat.emissiveIntensity = mood.lamp * 2.5
    spriteMat.opacity = mood.lamp * 0.2
  })

  return (
    <group>
      {lamps.map((lamp) => (
        <group key={lamp.z} position={[lamp.x, 0, lamp.z]}>
          <mesh position={[0, 2.05, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 4.1, 7]} />
            <meshStandardMaterial color="#414a43" roughness={0.55} metalness={0.52} />
          </mesh>
          <mesh position={[-0.48, 4.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 1.0, 6]} />
            <meshStandardMaterial color="#414a43" roughness={0.55} metalness={0.52} />
          </mesh>
          <mesh position={[-0.98, 4.04, 0]}>
            <boxGeometry args={[0.34, 0.11, 0.22]} />
            <meshStandardMaterial color="#38423c" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[-0.98, 3.975, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 10]} />
            <primitive object={bulbMat} attach="material" />
          </mesh>
          {quality === 'high' && (
            <sprite position={[-0.98, 3.93, 0]} scale={[2.4, 2.4, 1]}>
              <primitive object={spriteMat} attach="material" />
            </sprite>
          )}
        </group>
      ))}
    </group>
  )
}

/* --------------------------------------------------------------- atmosphere */

function Clouds() {
  const quality = useJourney((s) => s.quality)
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#f2e4d4',
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const refs = useRef([])
  const clouds = useMemo(() => {
    const rand = mulberry32(6811)
    return Array.from({ length: quality === 'low' ? 6 : 10 }, (_, i) => ({
      x: -80 + rand() * 160,
      y: 26 + rand() * 28,
      z: 50 - i * 175 - rand() * 50,
      s: 3 + rand() * 5,
      phase: rand() * Math.PI * 2,
    }))
  }, [quality])

  useEffect(() => () => material.dispose(), [material])

  useFrame((state) => {
    const mood = travel.mood || computeMood()
    material.color.copy(mood.horizon).lerp(CREAM, 0.44)
    material.opacity = 0.23 + (1 - mood.night) * 0.3
    refs.current.forEach((g, i) => {
      if (!g) return
      const c = clouds[i]
      g.position.x = c.x + Math.sin(state.clock.elapsedTime * 0.025 + c.phase) * 7
    })
  })

  return (
    <group key={quality}>
      {clouds.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[c.x, c.y, c.z]}
        >
          <mesh scale={[c.s, c.s * 0.32, c.s * 0.6]} material={material}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
          <mesh
            position={[c.s * 0.75, -c.s * 0.05, 0.2]}
            scale={[c.s * 0.7, c.s * 0.26, c.s * 0.55]}
            material={material}
          >
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
          <mesh
            position={[-c.s * 0.7, -c.s * 0.08, -0.2]}
            scale={[c.s * 0.8, c.s * 0.24, c.s * 0.45]}
            material={material}
          >
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Birds() {
  const { camera } = useThree()
  const group = useRef()
  const birdRefs = useRef([])
  const birds = useMemo(() => {
    const rand = mulberry32(3311)
    return Array.from({ length: 7 }, (_, i) => ({
      x: -18 + rand() * 36,
      y: 9 + rand() * 10,
      z: -12 - rand() * 50,
      speed: 0.35 + rand() * 0.4,
      phase: rand() * Math.PI * 2,
      size: 0.55 + rand() * 0.6,
      i,
    }))
  }, [])

  const wingGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [0, 0, 0, -0.85, 0.18, 0.05, -0.05, 0, 0.2, 0, 0, 0, 0.85, 0.18, 0.05, 0.05, 0, 0.2],
        3,
      ),
    )
    g.computeVertexNormals()
    return g
  }, [])

  useFrame((state) => {
    if (group.current) {
      group.current.position.set(camera.position.x, 0, carZ() - 20)
    }
    birdRefs.current.forEach((bird, i) => {
      if (!bird) return
      const b = birds[i]
      const t = state.clock.elapsedTime * b.speed + b.phase
      bird.position.set(
        b.x + Math.sin(t) * 13,
        b.y + Math.sin(t * 1.7) * 1.2,
        b.z + Math.cos(t * 0.8) * 15,
      )
      bird.rotation.y = Math.sin(t) * 0.35
      bird.rotation.z = Math.sin(t * 3.2) * 0.14
    })
  })

  return (
    <group ref={group}>
      {birds.map((b, i) => (
        <group
          key={i}
          ref={(el) => {
            birdRefs.current[i] = el
          }}
          scale={b.size}
        >
          <mesh geometry={wingGeo}>
            <meshBasicMaterial color="#2d3430" side={THREE.DoubleSide} fog={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Fireflies() {
  const pointsRef = useRef()
  const mat = useRef()
  const { camera } = useThree()
  const count = 150
  const positions = useMemo(() => {
    const rand = mulberry32(933)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 50
      arr[i * 3 + 1] = 0.4 + rand() * 5
      arr[i * 3 + 2] = (rand() - 0.5) * 80
    }
    return arr
  }, [])

  useFrame((state, dt) => {
    const mood = travel.mood || computeMood()
    if (pointsRef.current) {
      pointsRef.current.position.set(camera.position.x, 0, carZ())
    }
    if (mat.current) {
      mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, mood.night * 0.7, 2, dt)
      mat.current.size = 0.2
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        color="#f2c77b"
        size={0.2}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  )
}

function TireDust() {
  const quality = useJourney((s) => s.quality)
  const ref = useRef()
  const mat = useRef()
  const data = useRef(
    Array.from({ length: 64 }, () => ({ age: 99, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 })),
  )
  const positions = useMemo(() => new Float32Array(64 * 3), [])

  useFrame((state, dt) => {
    if (quality === 'low' || !ref.current) return
    const d = Math.min(dt, 0.05)
    const geo = ref.current.geometry
    const attr = geo.getAttribute('position')
    positions.fill(-999)
    const moving = travel.speed > 3
    for (let i = 0; i < 64; i++) {
      const p = data.current[i]
      p.age += d
      if (p.age > 1.35 && moving) {
        const side = i % 2 ? 1 : -1
        p.age = Math.random() * 0.2
        p.x = travel.x + side * 0.9 + (Math.random() - 0.5) * 0.4
        p.y = 0.08 + Math.random() * 0.1
        p.z = carZ() + 1.55 + Math.random() * 0.3
        p.vx = (Math.random() - 0.5) * 0.35
        p.vy = 0.15 + Math.random() * 0.35
        p.vz = 0.4 + Math.random() * 0.8
      }
      if (p.age < 1.35) {
        p.x += p.vx * d
        p.y += p.vy * d
        p.z += p.vz * d
        positions[i * 3] = p.x
        positions[i * 3 + 1] = p.y
        positions[i * 3 + 2] = p.z
      } else {
        positions[i * 3] = -999
        positions[i * 3 + 1] = -999
        positions[i * 3 + 2] = -999
      }
    }
    attr.needsUpdate = true
    if (mat.current) mat.current.opacity = Math.min(0.3, travel.speed / 120)
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        color="#b9ad98"
        size={0.34}
        transparent
        opacity={0.15}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function FinalVista() {
  const gravel = useMemo(makeGravelTexture, [])
  const glowTex = useMemo(makeGlowTexture, [])
  const light = useRef()
  const bulb = useRef()

  useEffect(() => {
    return () => {
      gravel.dispose()
      glowTex.dispose()
    }
  }, [gravel, glowTex])

  useFrame(() => {
    const mood = travel.mood || computeMood()
    if (light.current) light.current.intensity = 8 + mood.lamp * 20
    if (bulb.current) bulb.current.opacity = 0.2 + mood.lamp * 0.4
  })

  return (
    <group position={[0, 0, FINAL_PARK_Z]}>
      {/* gravel lay-by */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.8, 0.016, -4]}>
        <planeGeometry args={[10.5, 58]} />
        <meshStandardMaterial map={gravel} color="#c1b49c" roughness={1} />
      </mesh>
      {/* curb / verge */}
      <mesh position={[9.75, 0.15, -3]}>
        <boxGeometry args={[0.72, 0.3, 48]} />
        <meshStandardMaterial color="#b9ae9b" roughness={0.9} />
      </mesh>
      <mesh position={[10.25, 0.32, -3]}>
        <boxGeometry args={[0.22, 0.04, 48]} />
        <meshStandardMaterial color="#d5c9b2" roughness={0.84} />
      </mesh>
      {/* grass strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12.7, 0.02, -3]}>
        <planeGeometry args={[4.6, 58]} />
        <meshStandardMaterial color="#3b4c3d" roughness={1} />
      </mesh>

      {/* roadside bench for the last scene */}
      <group position={[9.35, 0, -0.43]}>
        {[-0.28, 0, 0.28].map((z) => (
          <mesh key={z} castShadow position={[0, 0.43, z]}>
            <boxGeometry args={[2.25, 0.075, 0.24]} />
            <meshStandardMaterial color="#7b5a3e" roughness={0.86} />
          </mesh>
        ))}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[2.15, 0.05, 0.76]} />
          <meshStandardMaterial color="#5c4634" roughness={0.92} />
        </mesh>
        {[-0.88, 0.88].map((x) => (
          <group key={x} position={[x, 0, 0.33]}>
            <mesh castShadow position={[0, 0.64, 0]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.075, 0.5, 0.07]} />
              <meshStandardMaterial color="#4d4a40" roughness={0.55} metalness={0.38} />
            </mesh>
          </group>
        ))}
        {[0.67, 0.83].map((y) => (
          <mesh key={y} position={[0, y, 0.38]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[2.18, 0.1, 0.055]} />
            <meshStandardMaterial color="#7b5a3e" roughness={0.86} />
          </mesh>
        ))}
        {[-0.9, 0.9].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.2, -0.25]}>
              <boxGeometry args={[0.07, 0.4, 0.07]} />
              <meshStandardMaterial color="#3b3932" roughness={0.6} metalness={0.42} />
            </mesh>
            <mesh position={[x, 0.2, 0.25]}>
              <boxGeometry args={[0.07, 0.4, 0.07]} />
              <meshStandardMaterial color="#3b3932" roughness={0.6} metalness={0.42} />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.9, 0.52, -0.18]}>
          <boxGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color="#4d4a40" roughness={0.55} metalness={0.38} />
        </mesh>
        <mesh position={[0.9, 0.52, -0.18]}>
          <boxGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color="#4d4a40" roughness={0.55} metalness={0.38} />
        </mesh>
      </group>

      {/* street lamp that watches over the last stop */}
      <group position={[10.9, 0, -5.2]}>
        <mesh position={[0, 2.45, 0]}>
          <cylinderGeometry args={[0.07, 0.12, 4.9, 8]} />
          <meshStandardMaterial color="#333d36" roughness={0.55} metalness={0.55} />
        </mesh>
        <mesh position={[-0.6, 4.85, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 1.2, 7]} />
          <meshStandardMaterial color="#333d36" roughness={0.55} metalness={0.55} />
        </mesh>
        <mesh position={[-1.22, 4.78, 0]}>
          <coneGeometry args={[0.31, 0.34, 8]} />
          <meshStandardMaterial color="#303b34" roughness={0.5} metalness={0.4} />
        </mesh>
        <sprite ref={bulb} position={[-1.22, 4.64, 0]} scale={[4.4, 4.4, 1]}>
          <spriteMaterial
            map={glowTex}
            color="#ffd39b"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
        <mesh position={[-1.22, 4.68, 0]}>
          <sphereGeometry args={[0.24, 10, 8]} />
          <meshStandardMaterial
            color="#fff0cd"
            emissive="#ffd699"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          ref={light}
          position={[-1.22, 4.45, 0]}
          color="#ffd3a0"
          intensity={18}
          distance={24}
          decay={2}
        />
      </group>

      {/* final marker */}
      <mesh position={[8.2, 0.42, 10]}>
        <boxGeometry args={[0.1, 0.84, 0.1]} />
        <meshStandardMaterial color="#817665" roughness={0.8} />
      </mesh>
      <mesh position={[8.2, 0.78, 10.01]}>
        <boxGeometry args={[0.28, 0.25, 0.03]} />
        <meshStandardMaterial
          color="#e4d6be"
          emissive="#d89a62"
          emissiveIntensity={0.15}
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------- world */

export function World() {
  const quality = useJourney((s) => s.quality)
  return (
    <>
      <SkyDome />
      <Stars />
      <FogAndLights />
      <Ground />
      <Mountains />
      <Forest />
      <Shrubs />
      <GrassTufts />
      <Rocks />
      <RoadSystem />
      <Delineators />
      <RouteSign />
      <RoadsideLamps />
      <Clouds />
      {quality !== 'low' && <Birds />}
      {quality !== 'low' && <Fireflies />}
      {quality !== 'low' && <TireDust />}
      <Billboards />
      <FinalVista />
    </>
  )
}
