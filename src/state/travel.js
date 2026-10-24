/* ============================================================================
   TRAVEL — mutable, per-frame journey state.
   Kept outside React so the engine can update it at 60fps without re-rendering
   the interface. Discrete, render-worthy state lives in journeyStore.js.
   ========================================================================== */

import * as THREE from 'three'
import { DRIVE, STATIONS } from '../data/content'

export const STATION_SPACING = DRIVE.stationSpacing
export const ROAD_HALF_WIDTH = 5.5
export const CAR_LANE_X = 2.05
export const SEG_LEN = 46
export const ROAD_TILES = 25
export const WINDOW_AHEAD = 13
export const WINDOW_BEHIND = 5

export const stationZ = (index) => -((index + 1) * STATION_SPACING)
export const lastStationIndex = STATIONS.length - 1
export const FINAL_BOARD_Z = stationZ(lastStationIndex) + 75
export const FINAL_PARK_PROGRESS = lastStationIndex + 1 - 0.47
export const FINAL_PARK_Z = -FINAL_PARK_PROGRESS * STATION_SPACING
export const FINAL_CAR_X = 3.75
export const FINAL_SIT_X = 9.35
export const FINAL_SIT_Z = FINAL_PARK_Z - 0.65

export function boardPosition(index, target = new THREE.Vector3()) {
  const isFinal = index === lastStationIndex
  return target.set(isFinal ? 16.2 : 14.2, isFinal ? 6.4 : 5.9, isFinal ? FINAL_BOARD_Z : stationZ(index))
}

/* ------------------------------------------------------- seeded determinism */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const hashSeed = (i) => Math.imul(i ^ 0x9e3779b9, 0x85ebca6b) >>> 0

/* ------------------------------------------------------------ anim helpers */
export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))
export const moveTowards = (current, target, maxDelta) => {
  if (Math.abs(target - current) <= maxDelta) return target
  return current + Math.sign(target - current) * maxDelta
}
export const smooth01 = (t) => {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
export const easeInOutCubic = (t) => {
  const x = clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

/* --------------------------------------------------------------- the world */
export const travel = {
  progress: DRIVE.initialProgress,
  speed: 0,
  targetSpeed: 0,
  wheelSpin: 0,
  brakePaint: 0,
  headlights: 1,
  doorOpen: 0,
  x: CAR_LANE_X,
  targetX: CAR_LANE_X,
  steer: 0,
  bodyRoll: 0,

  /* companion */
  driverMode: 'ride',
  driverPos: new THREE.Vector3(CAR_LANE_X + 0.39, 0.71, -DRIVE.initialProgress * STATION_SPACING + 0.22),
  driverRotY: 0,
  driverWalkPhase: 0,
  driverMoving: false,
  driverSit: 0,

  /* stops */
  activeStation: -1,
  promptStation: -1,
  promptSince: 0,
  pendingSince: 0,
  finaleStartedAt: 0,
  sitCardShown: false,

  /* clocks & mood */
  clock: 0,
  phaseStart: 0,
  showcaseAngle: 0,
  mood: null,
  journeyTime: 0,
  night: 0,
  nightMode: false,
  nightBlend: 0,
}

export const carZ = () => -travel.progress * STATION_SPACING

/* HUD values — read in a throttled rAF loop, never via React state per frame. */
export const hudRef = {
  kph: 0,
  nextEta: null,
  progress: 0,
  phase: 'idle',
  station: -1,
}

/* --------------------------------------------------- mood / colour narrative */
const C = (hex) => new THREE.Color(hex)
const PALETTE = [
  {
    p: 0,
    skyTop: C('#718aa0'),
    skyMid: C('#d8ad9b'),
    horizon: C('#f6cfaa'),
    fog: C('#dcc2ad'),
    sun: C('#ffd1a0'),
    sunI: 1.05,
    hemi: C('#b7a9b9'),
    hemiI: 0.6,
    amb: C('#665d68'),
    ambI: 0.82,
    star: 0,
    lamp: 0.18,
    panel: 0.45,
    ground: C('#7d9275'),
    mountain: C('#6a7181'),
    night: 0,
  },
  {
    p: 0.18,
    skyTop: C('#6fa2bf'),
    skyMid: C('#c1dcdd'),
    horizon: C('#edf0dc'),
    fog: C('#d2dfd8'),
    sun: C('#fff2d4'),
    sunI: 1.38,
    hemi: C('#a7d0e3'),
    hemiI: 0.72,
    amb: C('#71858f'),
    ambI: 0.78,
    star: 0,
    lamp: 0,
    panel: 0.28,
    ground: C('#8eae7d'),
    mountain: C('#7f96a1'),
    night: 0,
  },
  {
    p: 0.42,
    skyTop: C('#4a8fbd'),
    skyMid: C('#9ac8d7'),
    horizon: C('#e7ead9'),
    fog: C('#d1e0dc'),
    sun: C('#fff8e5'),
    sunI: 1.5,
    hemi: C('#9ccbe2'),
    hemiI: 0.78,
    amb: C('#778b92'),
    ambI: 0.72,
    star: 0,
    lamp: 0,
    panel: 0.22,
    ground: C('#94b57f'),
    mountain: C('#718b9f'),
    night: 0,
  },
  {
    p: 0.63,
    skyTop: C('#5579a1'),
    skyMid: C('#dfa377'),
    horizon: C('#f8d196'),
    fog: C('#dfba91'),
    sun: C('#ffd39a'),
    sunI: 1.32,
    hemi: C('#c5a8b3'),
    hemiI: 0.56,
    amb: C('#6e5c68'),
    ambI: 0.9,
    star: 0,
    lamp: 0.34,
    panel: 0.65,
    ground: C('#9c9364'),
    mountain: C('#786b83'),
    night: 0.08,
  },
  {
    p: 0.81,
    skyTop: C('#393658'),
    skyMid: C('#886070'),
    horizon: C('#df927d'),
    fog: C('#77606a'),
    sun: C('#ff9e72'),
    sunI: 0.68,
    hemi: C('#826f8a'),
    hemiI: 0.48,
    amb: C('#3f3444'),
    ambI: 1,
    star: 0.5,
    lamp: 0.86,
    panel: 1.05,
    ground: C('#4a5749'),
    mountain: C('#3e3551'),
    night: 0.5,
  },
  {
    p: 0.9,
    skyTop: C('#2b294b'),
    skyMid: C('#a35f6d'),
    horizon: C('#ff9a6a'),
    fog: C('#7a5560'),
    sun: C('#ff8256'),
    sunI: 0.55,
    hemi: C('#8c6d82'),
    hemiI: 0.44,
    amb: C('#3a2f42'),
    ambI: 1.02,
    star: 0.25,
    lamp: 0.9,
    panel: 1.1,
    ground: C('#4d5045'),
    mountain: C('#372f49'),
    night: 0.38,
  },
  {
    p: 1,
    skyTop: C('#09121b'),
    skyMid: C('#1a2533'),
    horizon: C('#9f5c63'),
    fog: C('#1b2530'),
    sun: C('#8897b7'),
    sunI: 0.2,
    hemi: C('#3b4a5f'),
    hemiI: 0.38,
    amb: C('#1d2531'),
    ambI: 1.12,
    star: 1,
    lamp: 1,
    panel: 1.45,
    ground: C('#18211b'),
    mountain: C('#151c28'),
    night: 1,
  },
]

const NIGHT_MOOD = PALETTE[PALETTE.length - 1]

const moodCache = {
  skyTop: new THREE.Color(),
  skyMid: new THREE.Color(),
  horizon: new THREE.Color(),
  fog: new THREE.Color(),
  sun: new THREE.Color(),
  hemi: new THREE.Color(),
  amb: new THREE.Color(),
  ground: new THREE.Color(),
  mountain: new THREE.Color(),
  sunI: 0,
  hemiI: 0,
  ambI: 0,
  star: 0,
  lamp: 0,
  panel: 0,
  night: 0,
  name: 'dawn',
}
let lastMoodT = -1
let lastNightBlend = -1

export function journeyT() {
  return clamp(travel.progress / (lastStationIndex + 1.18), 0, 1)
}

export function computeMood(force = false) {
  const t = journeyT()
  const nightBlend = clamp(travel.nightBlend || 0, 0, 1)
  travel.journeyTime = t
  if (
    !force &&
    Math.abs(t - lastMoodT) < 0.0002 &&
    Math.abs(nightBlend - lastNightBlend) < 0.0005
  ) {
    travel.mood = moodCache
    return moodCache
  }
  lastMoodT = t
  lastNightBlend = nightBlend
  let a = PALETTE[0]
  let b = PALETTE[PALETTE.length - 1]
  for (let i = 0; i < PALETTE.length - 1; i++) {
    if (t >= PALETTE[i].p && t <= PALETTE[i + 1].p) {
      a = PALETTE[i]
      b = PALETTE[i + 1]
      break
    }
  }
  const span = b.p - a.p || 1
  const f = smooth01((t - a.p) / span)
  const mix = (target, ca, cb) => target.copy(ca).lerp(cb, f)
  mix(moodCache.skyTop, a.skyTop, b.skyTop)
  mix(moodCache.skyMid, a.skyMid, b.skyMid)
  mix(moodCache.horizon, a.horizon, b.horizon)
  mix(moodCache.fog, a.fog, b.fog)
  mix(moodCache.sun, a.sun, b.sun)
  mix(moodCache.hemi, a.hemi, b.hemi)
  mix(moodCache.amb, a.amb, b.amb)
  mix(moodCache.ground, a.ground, b.ground)
  mix(moodCache.mountain, a.mountain, b.mountain)
  moodCache.sunI = lerp(a.sunI, b.sunI, f)
  moodCache.hemiI = lerp(a.hemiI, b.hemiI, f)
  moodCache.ambI = lerp(a.ambI, b.ambI, f)
  moodCache.star = lerp(a.star, b.star, f)
  moodCache.lamp = lerp(a.lamp, b.lamp, f)
  moodCache.panel = lerp(a.panel, b.panel, f)
  moodCache.night = lerp(a.night, b.night, f)

  if (nightBlend > 0.0001) {
    const mixNight = (target, nightColor) => target.lerp(nightColor, nightBlend)
    mixNight(moodCache.skyTop, NIGHT_MOOD.skyTop)
    mixNight(moodCache.skyMid, NIGHT_MOOD.skyMid)
    mixNight(moodCache.horizon, NIGHT_MOOD.horizon)
    mixNight(moodCache.fog, NIGHT_MOOD.fog)
    mixNight(moodCache.sun, NIGHT_MOOD.sun)
    mixNight(moodCache.hemi, NIGHT_MOOD.hemi)
    mixNight(moodCache.amb, NIGHT_MOOD.amb)
    mixNight(moodCache.ground, NIGHT_MOOD.ground)
    mixNight(moodCache.mountain, NIGHT_MOOD.mountain)
    moodCache.sunI = lerp(moodCache.sunI, NIGHT_MOOD.sunI, nightBlend)
    moodCache.hemiI = lerp(moodCache.hemiI, NIGHT_MOOD.hemiI, nightBlend)
    moodCache.ambI = lerp(moodCache.ambI, NIGHT_MOOD.ambI, nightBlend)
    moodCache.star = Math.max(moodCache.star, nightBlend)
    moodCache.lamp = Math.max(moodCache.lamp, nightBlend)
    moodCache.panel = lerp(moodCache.panel, 1.45, nightBlend)
    moodCache.night = Math.max(moodCache.night, nightBlend)
  }

  moodCache.name = nightBlend > 0.55 ? 'night' : f < 0.5 ? a.name || 'dawn' : b.name || 'night'
  travel.mood = moodCache
  travel.night = moodCache.night
  return moodCache
}

export function moodLabel(t = travel.journeyTime) {
  if (travel.nightMode && travel.nightBlend > 0.55) return 'Night drive'
  if (t < 0.13) return 'First light'
  if (t < 0.32) return 'Morning'
  if (t < 0.56) return 'High sun'
  if (t < 0.74) return 'Golden hour'
  if (t < 0.94) return 'Sunset'
  return 'Night'
}

export function resetTravel() {
  travel.progress = DRIVE.initialProgress
  travel.speed = 0
  travel.targetSpeed = 0
  travel.x = CAR_LANE_X
  travel.targetX = CAR_LANE_X
  travel.steer = 0
  travel.bodyRoll = 0
  travel.wheelSpin = 0
  travel.brakePaint = 0
  travel.headlights = 1
  travel.doorOpen = 0
  travel.driverMode = 'ride'
  travel.driverPos.set(CAR_LANE_X + 0.39, 0.71, carZ() + 0.22)
  travel.driverRotY = 0
  travel.driverWalkPhase = 0
  travel.driverMoving = false
  travel.driverSit = 0
  travel.activeStation = -1
  travel.promptStation = -1
  travel.promptSince = 0
  travel.pendingSince = 0
  travel.finaleStartedAt = 0
  travel.sitCardShown = false
  travel.clock = 0
  travel.phaseStart = 0
  travel.showcaseAngle = 0
  travel.nightBlend = 0
  computeMood(true)
}
