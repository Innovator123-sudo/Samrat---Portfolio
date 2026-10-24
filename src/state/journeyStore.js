/* ============================================================================
   JOURNEY STORE — explicit state machine + discrete UI state.
   ========================================================================== */

import { create } from 'zustand'
import { SITE, STATIONS } from '../data/content'
import { DEFAULT_MUSIC_TRACK, MUSIC_TRACKS } from '../data/music'
import { resetTravel, travel } from './travel'

export const PHASES = {
  BOOT: 'boot',
  IDLE: 'idle',
  STARTING: 'starting',
  DRIVING: 'driving',
  APPROACHING: 'approaching',
  ASKING: 'asking',
  VIEWING: 'viewing',
  RESUMING: 'resuming',
  FINALE_PARKING: 'finale_parking',
  DRIVER_OUT: 'driver_out',
  DRIVER_SITTING: 'driver_sitting',
  DRIVER_RETURN: 'driver_return',
  DEPARTING: 'departing',
  END_CARD: 'end_card',
  LOOP_RESET: 'loop_reset',
}

export const FINALE_PHASES = new Set([
  PHASES.FINALE_PARKING,
  PHASES.DRIVER_OUT,
  PHASES.DRIVER_SITTING,
  PHASES.DRIVER_RETURN,
  PHASES.DEPARTING,
  PHASES.END_CARD,
])

export const stationIndex = (key) => STATIONS.findIndex((s) => s.key === key)
export const stationKey = (i) =>
  STATIONS[Math.max(0, Math.min(STATIONS.length - 1, i))]?.key

const getDeviceQuality = () => {
  if (typeof window === 'undefined') return 'high'
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  if (coarse || cores <= 4 || memory <= 4) return 'low'
  return 'high'
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const readBoolean = (key, fallback = false) => {
  try {
    const v = window.localStorage.getItem(key)
    return v == null ? fallback : v === 'true'
  } catch {
    return fallback
  }
}

const readString = (key, fallback = '') => {
  try {
    return window.localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

const writePreference = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    /* private mode is fine */
  }
}

const deviceQuality = getDeviceQuality()
const initialLite = readBoolean('samrat-lite', deviceQuality === 'low')
const initialNight = readBoolean('samrat-night', false)
const systemPrefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
const storedTheme = readString('samrat-theme', '')
const initialTheme =
  storedTheme === 'dark' || storedTheme === 'light'
    ? storedTheme
    : systemPrefersDark
      ? 'dark'
      : 'light'
const storedTrack = readString('samrat-track', DEFAULT_MUSIC_TRACK)
const initialTrack = MUSIC_TRACKS.some((track) => track.id === storedTrack)
  ? storedTrack
  : DEFAULT_MUSIC_TRACK

export const useJourney = create((set, get) => ({
  /* -------------------------------------------------------------- machine */
  phase: PHASES.IDLE,
  started: false,
  visited: {},
  fastfwd: null,
  promptKey: null,
  pendingLook: null,
  showCard: null,
  letterbox: false,
  modalDismissedAt: 0,

  /* ------------------------------------------------------------- ui state */
  quality: initialLite ? 'low' : deviceQuality,
  liteMode: initialLite,
  nightMode: initialNight,
  theme: initialTheme,
  reducedMotion: !!prefersReducedMotion,
  staticMode: false,
  soundOn: readBoolean('samrat-sound', false),
  musicTrack: initialTrack,
  ready: false,
  loadProgress: 0,
  toast: '',
  toastId: 0,
  menuOpen: false,
  endCardVisible: false,

  /* --------------------------------------------------------------- actions */
  setPhase(phase) {
    if (get().phase === phase) return
    travel.phaseStart = travel.clock
    set({ phase })
  },

  setLoadProgress(p) {
    set({ loadProgress: Math.min(1, Math.max(0, p)) })
  },

  markReady() {
    set({ ready: true, loadProgress: 1 })
  },

  setStaticMode(v) {
    set({ staticMode: v, menuOpen: false, soundOn: false, endCardVisible: false })
  },

  startJourney() {
    const s = get()
    if (!s.ready || s.phase === PHASES.STARTING) return
    set({
      started: true,
      phase: PHASES.STARTING,
      letterbox: true,
      promptKey: null,
      pendingLook: null,
      showCard: null,
      fastfwd: null,
      endCardVisible: false,
    })
    travel.phaseStart = travel.clock
  },

  markVisit(key, kind = 'visited') {
    const cur = get().visited[key]
    if (cur === 'visited' || cur === kind) return
    set({ visited: { ...get().visited, [key]: kind } })
  },

  showPrompt(key) {
    if (get().promptKey === key) return
    set({ promptKey: key, letterbox: false })
  },

  hidePrompt() {
    set({ promptKey: null })
  },

  chooseLook() {
    const key = get().promptKey
    if (!key) return
    travel.pendingSince = travel.clock
    set({
      pendingLook: key,
      promptKey: null,
      letterbox: true,
      phase: PHASES.VIEWING,
    })
  },

  declineLook() {
    const key = get().promptKey
    const s = get()
    if (key) s.markVisit(key, 'passed')
    travel.activeStation = -1
    travel.promptStation = -1
    set({
      promptKey: null,
      pendingLook: null,
      letterbox: false,
      phase: PHASES.DRIVING,
    })
  },

  openCard(key) {
    if (!key) return
    const s = get()
    if (s.showCard === key) return
    set({
      showCard: key,
      pendingLook: null,
      promptKey: null,
      letterbox: true,
      phase: FINALE_PHASES.has(s.phase) ? s.phase : PHASES.VIEWING,
      modalDismissedAt: 0,
    })
    travel.targetSpeed = 0
    get().markVisit(key)
  },

  closeCard() {
    if (get().showCard == null) return
    set({ showCard: null, modalDismissedAt: Date.now() })
  },

  noteInteraction() {
    set({ modalDismissedAt: Date.now() })
  },

  goTo(key) {
    const s = get()
    const i = stationIndex(key)
    if (i < 0) return

    if (!s.started || s.phase === PHASES.IDLE || s.phase === PHASES.BOOT) {
      s.startJourney()
    }

    const current = get()
    if (current.showCard) set({ showCard: null })

    if (FINALE_PHASES.has(current.phase)) {
      if (key === 'hire') get().openCard('hire')
      else set({ showCard: key, letterbox: true })
      return
    }

    /* If the sign is already behind us, open its content where we are. */
    if (travel.progress >= i + 1.1) {
      get().openCard(key)
      return
    }

    travel.pendingSince = 0
    set({
      fastfwd: key,
      promptKey: null,
      pendingLook: null,
      letterbox: key !== 'hire',
      phase: PHASES.DRIVING,
    })
    travel.targetSpeed = travel.boost
  },

  beginLoopReset() {
    set({ phase: PHASES.LOOP_RESET, letterbox: true })
    travel.targetSpeed = 0
  },

  driveAgain() {
    resetTravel()
    set({
      phase: PHASES.IDLE,
      started: false,
      visited: {},
      fastfwd: null,
      promptKey: null,
      pendingLook: null,
      showCard: null,
      letterbox: false,
      endCardVisible: false,
      modalDismissedAt: 0,
    })
    travel.phaseStart = travel.clock
  },

  showEndCard() {
    set({ endCardVisible: true, letterbox: true, showCard: null })
  },

  setLetterbox(v) {
    const s = get()
    if (s.letterbox === v) return
    set({ letterbox: v })
  },

  setSound(on) {
    const next = !!on
    writePreference('samrat-sound', next)
    set({ soundOn: next })
    return next
  },

  toggleSound() {
    return get().setSound(!get().soundOn)
  },

  setLiteMode(on) {
    const next = !!on
    writePreference('samrat-lite', next)
    set({ liteMode: next, quality: next ? 'low' : 'high' })
  },

  setTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light'
    writePreference('samrat-theme', next)
    set({ theme: next })
    return next
  },

  toggleTheme() {
    return get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
  },

  toggleNightMode() {
    const next = !get().nightMode
    writePreference('samrat-night', next)
    set({ nightMode: next })
    return next
  },

  setMusicTrack(id) {
    const track = MUSIC_TRACKS.find((item) => item.id === id)
    if (!track) return get().musicTrack
    writePreference('samrat-track', track.id)
    set({ musicTrack: track.id })
    return track.id
  },

  cycleMusicTrack() {
    const index = MUSIC_TRACKS.findIndex((track) => track.id === get().musicTrack)
    const next = MUSIC_TRACKS[(index + 1) % MUSIC_TRACKS.length]
    return get().setMusicTrack(next.id)
  },

  setQuality(q) {
    set({ quality: q })
  },

  toggleMenu() {
    set({ menuOpen: !get().menuOpen })
  },

  closeMenu() {
    set({ menuOpen: false })
  },

  notify(message) {
    set({ toast: message, toastId: get().toastId + 1 })
  },

  clearToast() {
    set({ toast: '' })
  },

  ownerEmail() {
    return SITE.email
  },
}))
