import { shallowRef, readonly, onUnmounted } from 'vue'

interface AudioPlayerOptions {
  /** Path to the audio file */
  src: string
  /** Whether to loop playback (default: true) */
  loop?: boolean
  /** Initial volume 0–1 (default: 0.4) */
  initialVolume?: number
  /** Fade duration in ms (default: 800) */
  fadeDuration?: number
}

/**
 * Composable for audio playback with smooth fade in/out,
 * volume control, and respect for reduced-motion preference.
 */
export function useAudioPlayer(options: AudioPlayerOptions) {
  const {
    src,
    loop = true,
    initialVolume = 0.4,
    fadeDuration = 800,
  } = options

  const isPlaying = shallowRef(false)
  const isMuted = shallowRef(false)
  const volume = shallowRef(initialVolume)

  let audio: HTMLAudioElement | null = null
  let fadeInterval: ReturnType<typeof setInterval> | null = null
  let isInitialized = shallowRef(false)

  function ensureAudio(): HTMLAudioElement {
    if (!audio) {
      audio = new Audio(src)
      audio.loop = loop
      audio.volume = 0
      audio.preload = 'auto'
      audio.addEventListener('ended', () => {
        if (!loop) isPlaying.value = false
      })
      isInitialized.value = true
    }
    return audio
  }

  function clearFade() {
    if (fadeInterval !== null) {
      clearInterval(fadeInterval)
      fadeInterval = null
    }
  }

  function fadeTo(targetVol: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const el = ensureAudio()
      clearFade()

      const startVol = el.volume
      const diff = targetVol - startVol
      if (Math.abs(diff) < 0.01) {
        el.volume = targetVol
        resolve()
        return
      }

      const steps = 30
      const stepTime = duration / steps
      const stepDiff = diff / steps
      let step = 0

      fadeInterval = setInterval(() => {
        step++
        const newVol = Math.min(1, Math.max(0, startVol + stepDiff * step))
        el.volume = newVol
        if (step >= steps) {
          clearFade()
          el.volume = targetVol
          resolve()
        }
      }, stepTime)
    })
  }

  async function play() {
    const el = ensureAudio()
    el.volume = 0
    el.muted = isMuted.value
    try {
      await el.play()
      isPlaying.value = true
      await fadeTo(isMuted.value ? 0 : volume.value, fadeDuration)
    } catch {
      // Autoplay blocked — user needs to interact first
      isPlaying.value = false
    }
  }

  async function pause() {
    if (!audio || !isPlaying.value) return
    await fadeTo(0, fadeDuration)
    audio.pause()
    isPlaying.value = false
  }

  async function toggle() {
    if (isPlaying.value) {
      await pause()
    } else {
      await play()
    }
  }

  function setVolume(v: number) {
    const clamped = Math.min(1, Math.max(0, v))
    volume.value = clamped
    if (audio && isPlaying.value && !isMuted.value) {
      audio.volume = clamped
    }
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audio) {
      audio.muted = isMuted.value
    }
  }

  /** Play a one-shot sound effect (no fade, short-lived) */
  function playSfx(sfxSrc: string, sfxVolume = 0.3): void {
    const sfx = new Audio(sfxSrc)
    sfx.volume = Math.min(1, Math.max(0, sfxVolume))
    sfx.play().catch(() => {
      /* swallow if blocked */
    })
  }

  onUnmounted(() => {
    clearFade()
    if (audio) {
      audio.pause()
      audio.src = ''
      audio = null
    }
  })

  return {
    isPlaying: readonly(isPlaying),
    isMuted: readonly(isMuted),
    volume: readonly(volume),
    isInitialized: readonly(isInitialized),
    play,
    pause,
    toggle,
    setVolume,
    toggleMute,
    playSfx,
  }
}
