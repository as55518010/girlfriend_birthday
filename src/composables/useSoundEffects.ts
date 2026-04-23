/**
 * Web Audio API synthesizer for dramatic sound effects.
 * No external audio files needed — generates everything programmatically.
 */
export function useSoundEffects() {
  let ctx: AudioContext | null = null

  function getCtx(): AudioContext {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  /** Dramatic envelope-open burst: layered swoosh + sparkle + deep boom */
  function playEnvelopeOpen() {
    const ac = getCtx()
    const now = ac.currentTime
    const master = ac.createGain()
    master.gain.value = 0.6
    master.connect(ac.destination)

    // Layer 1: Deep boom
    const boom = ac.createOscillator()
    const boomGain = ac.createGain()
    boom.type = 'sine'
    boom.frequency.setValueAtTime(80, now)
    boom.frequency.exponentialRampToValueAtTime(30, now + 0.8)
    boomGain.gain.setValueAtTime(0.7, now)
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
    boom.connect(boomGain).connect(master)
    boom.start(now)
    boom.stop(now + 1.0)

    // Layer 2: Magical shimmer sweep (rising)
    for (let i = 0; i < 5; i++) {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      const baseFreq = 800 + i * 400
      osc.frequency.setValueAtTime(baseFreq, now + 0.05 * i)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.4 + 0.05 * i)
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.12, now + 0.05 + 0.04 * i)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + 0.08 * i)
      osc.connect(g).connect(master)
      osc.start(now + 0.02 * i)
      osc.stop(now + 0.8 + 0.08 * i)
    }

    // Layer 3: White noise swoosh
    const bufLen = ac.sampleRate * 1.2
    const noiseBuf = ac.createBuffer(1, bufLen, ac.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.5
    const noise = ac.createBufferSource()
    noise.buffer = noiseBuf
    const noiseFilter = ac.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(1000, now)
    noiseFilter.frequency.exponentialRampToValueAtTime(6000, now + 0.3)
    noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 1.0)
    noiseFilter.Q.value = 0.8
    const noiseGain = ac.createGain()
    noiseGain.gain.setValueAtTime(0, now)
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.1)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
    noise.connect(noiseFilter).connect(noiseGain).connect(master)
    noise.start(now)
    noise.stop(now + 1.2)

    // Layer 4: Sparkle chimes (delayed)
    for (let i = 0; i < 8; i++) {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      const freq = 2000 + Math.random() * 3000
      const t = now + 0.3 + Math.random() * 0.6
      osc.frequency.setValueAtTime(freq, t)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.06, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + Math.random() * 0.3)
      osc.connect(g).connect(master)
      osc.start(t)
      osc.stop(t + 0.6)
    }
  }

  /** Whoosh for section reveals */
  function playWhoosh() {
    const ac = getCtx()
    const now = ac.currentTime
    const bufLen = ac.sampleRate * 0.5
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1)
    const src = ac.createBufferSource()
    src.buffer = buf
    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(400, now)
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.15)
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.45)
    filter.Q.value = 1.5
    const gain = ac.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.15, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    src.connect(filter).connect(gain).connect(ac.destination)
    src.start(now)
    src.stop(now + 0.5)
  }

  /** Sparkle/twinkle for photo interactions */
  function playSparkle() {
    const ac = getCtx()
    const now = ac.currentTime
    const master = ac.createGain()
    master.gain.value = 0.3
    master.connect(ac.destination)
    for (let i = 0; i < 3; i++) {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      const freq = 2500 + i * 600 + Math.random() * 300
      const t = now + i * 0.06
      osc.frequency.setValueAtTime(freq, t)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.15, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      osc.connect(g).connect(master)
      osc.start(t)
      osc.stop(t + 0.25)
    }
  }

  /** Rising magical chime for hero reveal */
  function playHeroReveal() {
    const ac = getCtx()
    const now = ac.currentTime
    const master = ac.createGain()
    master.gain.value = 0.25
    master.connect(ac.destination)
    const notes = [523, 659, 784, 1047, 1319] // C5 E5 G5 C6 E6
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      const t = now + i * 0.12
      osc.frequency.setValueAtTime(freq, t)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.2, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      osc.connect(g).connect(master)
      osc.start(t)
      osc.stop(t + 0.9)
    })
  }

  /** Heart pop sound */
  function playHeartPop() {
    const ac = getCtx()
    const now = ac.currentTime
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15)
    g.gain.setValueAtTime(0.12, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.connect(g).connect(ac.destination)
    osc.start(now)
    osc.stop(now + 0.2)
  }

  /** Grand finale firework burst */
  function playFireworks() {
    const ac = getCtx()
    const now = ac.currentTime
    const master = ac.createGain()
    master.gain.value = 0.35
    master.connect(ac.destination)

    // Rising whistle
    const whistle = ac.createOscillator()
    const wg = ac.createGain()
    whistle.type = 'sine'
    whistle.frequency.setValueAtTime(400, now)
    whistle.frequency.exponentialRampToValueAtTime(3000, now + 0.5)
    wg.gain.setValueAtTime(0.15, now)
    wg.gain.linearRampToValueAtTime(0.2, now + 0.4)
    wg.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    whistle.connect(wg).connect(master)
    whistle.start(now)
    whistle.stop(now + 0.6)

    // Burst crackle at 0.5s
    const burstTime = now + 0.5
    const bufLen = ac.sampleRate * 0.8
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1)
    const noise = ac.createBufferSource()
    noise.buffer = buf
    const nf = ac.createBiquadFilter()
    nf.type = 'highpass'
    nf.frequency.value = 2000
    const ng = ac.createGain()
    ng.gain.setValueAtTime(0, burstTime)
    ng.gain.linearRampToValueAtTime(0.4, burstTime + 0.03)
    ng.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.7)
    noise.connect(nf).connect(ng).connect(master)
    noise.start(burstTime)
    noise.stop(burstTime + 0.8)

    // Sparkle tail
    for (let i = 0; i < 6; i++) {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      const freq = 1500 + Math.random() * 3000
      const t = burstTime + 0.1 + Math.random() * 0.5
      osc.frequency.setValueAtTime(freq, t)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.06, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.connect(g).connect(master)
      osc.start(t)
      osc.stop(t + 0.5)
    }
  }

  return {
    playEnvelopeOpen,
    playWhoosh,
    playSparkle,
    playHeroReveal,
    playHeartPop,
    playFireworks,
  }
}
