/* ============================================================================
   JOURNEY AUDIO — a tiny, opt-in synthesized soundscape.
   No audio files, no network requests, no autoplay: every sound is generated
   with the Web Audio API after an explicit user gesture.
   ========================================================================== */

class JourneyAudio {
  constructor() {
    this.ctx = null
    this.enabled = false
    this.ready = false
    this.master = null
    this.engineGain = null
    this.engineOsc = null
    this.engineSub = null
    this.engineFilter = null
    this.windGain = null
    this.padGain = null
    this.lastUpdate = 0
    this.lastPhase = ''
  }

  init() {
    if (this.ctx) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    try {
      this.ctx = new Ctx()
    } catch {
      this.ctx = null
      return
    }

    const ctx = this.ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)

    /* ---- engine: two low oscillators through a moving low-pass ---- */
    this.engineFilter = ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.value = 240
    this.engineFilter.Q.value = 1.2

    this.engineGain = ctx.createGain()
    this.engineGain.gain.value = 0

    this.engineOsc = ctx.createOscillator()
    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.value = 46

    this.engineSub = ctx.createOscillator()
    this.engineSub.type = 'sine'
    this.engineSub.frequency.value = 23

    const subGain = ctx.createGain()
    subGain.gain.value = 0.55
    this.engineOsc.connect(this.engineFilter)
    this.engineSub.connect(subGain)
    subGain.connect(this.engineFilter)
    this.engineFilter.connect(this.engineGain)
    this.engineGain.connect(this.master)

    /* ---- wind: filtered looping noise ---- */
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = 0.985 * last + 0.015 * white
      data[i] = last * 3.2
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 720
    windFilter.Q.value = 0.45
    this.windGain = ctx.createGain()
    this.windGain.gain.value = 0
    noise.connect(windFilter)
    windFilter.connect(this.windGain)
    this.windGain.connect(this.master)

    /* ---- a distant, warm pad ---- */
    this.padGain = ctx.createGain()
    this.padGain.gain.value = 0
    const padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = 520
    padFilter.connect(this.padGain)
    this.padGain.connect(this.master)
    const padNotes = [110, 164.81, 220, 277.18]
    padNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      osc.detune.value = (i - 1.5) * 5
      const g = ctx.createGain()
      g.gain.value = i === 0 ? 0.12 : 0.055
      osc.connect(g)
      g.connect(padFilter)
      osc.start()
    })

    this.engineOsc.start()
    this.engineSub.start()
    noise.start()
    this.ready = true
  }

  async setEnabled(on) {
    this.enabled = !!on
    if (!on) {
      if (this.master && this.ctx) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime)
        this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12)
      }
      return
    }
    this.init()
    if (!this.ctx) return
    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
    } catch {
      return
    }
    this.master.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.4)
  }

  async resume() {
    if (!this.enabled || !this.ctx) return
    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
    } catch {
      /* browser declined; toggle will retry */
    }
  }

  update(speed = 0, phase = '', night = 0) {
    if (!this.ready || !this.enabled || !this.ctx) return
    const now = this.ctx.currentTime
    if (now - this.lastUpdate < 0.08 && phase === this.lastPhase) return
    this.lastUpdate = now
    this.lastPhase = phase

    const sf = Math.min(1, Math.max(0, speed / 32))
    const finalPause = phase === 'viewing' || phase === 'driver_sitting'
    this.engineOsc.frequency.setTargetAtTime(43 + sf * 38, now, 0.18)
    this.engineSub.frequency.setTargetAtTime(21.5 + sf * 17, now, 0.2)
    this.engineFilter.frequency.setTargetAtTime(190 + sf * 540, now, 0.25)
    this.engineGain.gain.setTargetAtTime(
      finalPause ? 0.012 : 0.018 + sf * 0.05,
      now,
      0.25,
    )
    this.windGain.gain.setTargetAtTime(sf * 0.045 * (1 - night * 0.2), now, 0.3)
    this.padGain.gain.setTargetAtTime(0.055 + night * 0.045, now, 1.2)
  }

  ding() {
    if (!this.ready || !this.enabled || !this.ctx) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(740, t)
    osc.frequency.exponentialRampToValueAtTime(932, t + 0.16)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(t)
    osc.stop(t + 1.2)
  }

  thud() {
    if (!this.ready || !this.enabled || !this.ctx) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(105, t)
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.22)
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(t)
    osc.stop(t + 0.32)
  }
}

export const journeyAudio = new JourneyAudio()
