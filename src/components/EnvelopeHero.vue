<script setup lang="ts">
import { shallowRef } from 'vue'

const emit = defineEmits<{
  opened: []
  'play-sfx': [type: string]
}>()

const isAnimating = shallowRef(false)
const showFlash = shallowRef(false)
const showShake = shallowRef(false)

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  emoji: string
  delay: number
}

interface SparkleParticle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const confetti = shallowRef<ConfettiPiece[]>([])
const sparkles = shallowRef<SparkleParticle[]>([])

const heartEmojis = ['❤️', '💕', '💗', '🩷', '💝', '✨', '🌸', '💖', '🎉', '🎊', '💫', '⭐']

function handleOpen() {
  if (isAnimating.value) return
  isAnimating.value = true

  // Screen flash
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 600)

  // Screen shake
  showShake.value = true
  setTimeout(() => { showShake.value = false }, 800)

  // Massive confetti burst — 3 waves
  const pieces: ConfettiPiece[] = []
  // Wave 1: inner burst
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2
    const radius = 100 + Math.random() * 200
    pieces.push({
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 120,
      rotation: Math.random() * 720 - 360,
      scale: 0.8 + Math.random() * 1.4,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      delay: Math.random() * 100,
    })
  }
  // Wave 2: outer explosion
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2 + 0.1
    const radius = 250 + Math.random() * 350
    pieces.push({
      id: 30 + i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 80,
      rotation: Math.random() * 1080 - 540,
      scale: 0.5 + Math.random() * 1.0,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      delay: 100 + Math.random() * 200,
    })
  }
  // Wave 3: upward fountain
  for (let i = 0; i < 20; i++) {
    const spread = (Math.random() - 0.5) * 300
    pieces.push({
      id: 60 + i,
      x: spread,
      y: -(200 + Math.random() * 400),
      rotation: Math.random() * 720 - 360,
      scale: 0.6 + Math.random() * 1.2,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      delay: 200 + Math.random() * 300,
    })
  }
  confetti.value = pieces

  // Sparkle particles
  const sparks: SparkleParticle[] = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 600,
    size: 2 + Math.random() * 6,
    delay: Math.random() * 800,
    duration: 600 + Math.random() * 800,
  }))
  sparkles.value = sparks

  emit('play-sfx', 'envelope-open')

  setTimeout(() => {
    emit('opened')
  }, 2200)
}
</script>

<template>
  <section
    class="envelope-screen"
    :class="{ 'envelope-screen--shake': showShake }"
    role="button"
    tabindex="0"
    aria-label="點擊開啟生日驚喜信封"
    @click="handleOpen"
    @keydown.enter="handleOpen"
    @keydown.space.prevent="handleOpen"
  >
    <!-- Screen flash overlay -->
    <Transition name="flash">
      <div v-if="showFlash" class="screen-flash" aria-hidden="true" />
    </Transition>

    <!-- Decorative rings -->
    <div class="deco-ring deco-ring--1" aria-hidden="true" />
    <div class="deco-ring deco-ring--2" aria-hidden="true" />
    <div class="deco-ring deco-ring--3" aria-hidden="true" />

    <!-- Floating hearts background -->
    <div class="floating-hearts" aria-hidden="true">
      <span v-for="i in 12" :key="i" class="floating-heart" :style="{ '--fh-i': i }">💗</span>
    </div>

    <!-- Envelope card -->
    <div class="envelope-card" :class="{ 'envelope-card--opened': isAnimating }">
      <div class="wax-seal" aria-hidden="true">♥</div>
      <span class="envelope-icon" aria-hidden="true">💌</span>
      <p class="envelope-to">TO：汶汶小公主</p>
      <p class="envelope-hint">— 點擊開啟驚喜 —</p>
      <div class="envelope-glow" aria-hidden="true" />
    </div>

    <!-- Sparkle particles -->
    <div v-if="sparkles.length" class="sparkle-layer" aria-hidden="true">
      <span
        v-for="s in sparkles"
        :key="s.id"
        class="sparkle-dot"
        :style="{
          '--sx': `${s.x}px`,
          '--sy': `${s.y}px`,
          '--ss': `${s.size}px`,
          '--sd': `${s.delay}ms`,
          '--sdur': `${s.duration}ms`,
        } as Record<string, string | number>"
      />
    </div>

    <!-- Confetti layer -->
    <div v-if="confetti.length" class="confetti-layer" aria-hidden="true">
      <span
        v-for="p in confetti"
        :key="p.id"
        class="confetti-piece"
        :style="{
          '--x': `${p.x}px`,
          '--y': `${p.y}px`,
          '--r': `${p.rotation}deg`,
          '--s': p.scale,
          '--d': `${p.delay}ms`,
        } as Record<string, string | number>"
      >{{ p.emoji }}</span>
    </div>
  </section>
</template>

<style scoped>
.envelope-screen {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: linear-gradient(
    160deg,
    #fef0f5 0%,
    #fde2e8 30%,
    #fbc8d4 60%,
    #f9b0c1 100%
  );
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.envelope-screen--shake {
  animation: screen-shake 0.6s ease-out;
}

@keyframes screen-shake {
  0% { transform: translate(0, 0) rotate(0); }
  10% { transform: translate(-8px, -4px) rotate(-0.5deg); }
  20% { transform: translate(8px, 2px) rotate(0.5deg); }
  30% { transform: translate(-6px, 6px) rotate(-0.3deg); }
  40% { transform: translate(6px, -4px) rotate(0.3deg); }
  50% { transform: translate(-4px, 2px) rotate(-0.2deg); }
  60% { transform: translate(4px, -2px) rotate(0.2deg); }
  70% { transform: translate(-2px, 4px) rotate(0); }
  80% { transform: translate(2px, -2px); }
  90% { transform: translate(-1px, 1px); }
  100% { transform: translate(0, 0); }
}

/* Screen flash */
.screen-flash {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: radial-gradient(circle at center, rgba(255,255,255,0.95), rgba(255,200,220,0.6));
  pointer-events: none;
}

.flash-enter-active {
  transition: opacity 0.08s ease-out;
}
.flash-leave-active {
  transition: opacity 0.5s ease-in;
}
.flash-enter-from,
.flash-leave-to {
  opacity: 0;
}

/* Floating hearts background */
.floating-hearts {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-heart {
  position: absolute;
  font-size: calc(1rem + var(--fh-i) * 0.2rem);
  opacity: 0.15;
  animation: fh-float calc(6s + var(--fh-i) * 0.8s) ease-in-out infinite;
  animation-delay: calc(var(--fh-i) * -1.2s);
  left: calc(var(--fh-i) * 8%);
  top: calc(20% + var(--fh-i) * 5%);
}

@keyframes fh-float {
  0%, 100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 0.12; }
  25% { transform: translateY(-30px) translateX(15px) scale(1.1) rotate(10deg); opacity: 0.2; }
  50% { transform: translateY(-10px) translateX(-10px) scale(0.95) rotate(-5deg); opacity: 0.15; }
  75% { transform: translateY(-40px) translateX(20px) scale(1.05) rotate(8deg); opacity: 0.18; }
}

.envelope-screen:focus-visible .envelope-card {
  outline: 3px solid var(--rose-400);
  outline-offset: 6px;
}

/* Decorative animated rings */
.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(251, 113, 133, 0.15);
  animation: ring-breathe 6s ease-in-out infinite;
}

.deco-ring--1 {
  width: 500px;
  height: 500px;
  animation-delay: 0s;
}

.deco-ring--2 {
  width: 700px;
  height: 700px;
  animation-delay: -2s;
  border-color: rgba(253, 164, 175, 0.1);
}

.deco-ring--3 {
  width: 900px;
  height: 900px;
  animation-delay: -4s;
  border-color: rgba(254, 205, 211, 0.08);
}

@keyframes ring-breathe {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.08); opacity: 1; }
}

/* Envelope card */
.envelope-card {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 50px 60px;
  text-align: center;
  box-shadow:
    0 20px 60px rgba(216, 92, 123, 0.15),
    0 4px 16px rgba(216, 92, 123, 0.08);
  transition:
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  animation: gentle-pulse 3s ease-in-out infinite;
  z-index: 2;
}

.envelope-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 30px 80px rgba(216, 92, 123, 0.22),
    0 8px 24px rgba(216, 92, 123, 0.12);
}

.envelope-card:hover .envelope-glow {
  opacity: 1;
}

.envelope-card--opened {
  animation: envelope-fly-out 1.2s var(--ease-out-expo) forwards !important;
}

/* Envelope inner glow */
.envelope-glow {
  position: absolute;
  inset: -20px;
  border-radius: 34px;
  background: radial-gradient(circle, rgba(251,113,133,0.25), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: -1;
}

@keyframes envelope-fly-out {
  0% {
    transform: scale(1) rotateY(0deg);
    opacity: 1;
  }
  30% {
    transform: scale(1.15) rotateY(0deg);
    opacity: 1;
  }
  60% {
    transform: scale(1.15) rotateY(90deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.3) rotateY(180deg) translateY(-200px);
    opacity: 0;
  }
}

.wax-seal {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 52px;
  height: 52px;
  background: radial-gradient(circle at 35% 35%, #f43f5e, #be123c 60%, #881337);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3rem;
  box-shadow:
    0 3px 12px rgba(190, 18, 60, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.15);
  z-index: 3;
}

.envelope-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 16px;
  line-height: 1;
}

.envelope-to {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.envelope-hint {
  font-family: var(--font-accent);
  font-size: 1rem;
  color: var(--text-soft);
  letter-spacing: 3px;
  font-style: italic;
}

/* Confetti */
.confetti-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.confetti-piece {
  position: absolute;
  font-size: 1.6rem;
  animation: confetti-burst 1.4s var(--d) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  opacity: 0;
}

@keyframes confetti-burst {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(0);
    opacity: 1;
  }
  20% {
    opacity: 1;
    transform: translate(calc(var(--x) * 0.3), calc(var(--y) * 0.3)) rotate(calc(var(--r) * 0.3)) scale(var(--s));
  }
  100% {
    transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(0);
    opacity: 0;
  }
}

@media (max-width: 600px) {
  .envelope-card {
    padding: 36px 32px;
  }

  .envelope-icon {
    font-size: 60px;
  }

  .envelope-to {
    font-size: 1.4rem;
  }

  .deco-ring--1 { width: 300px; height: 300px; }
  .deco-ring--2 { width: 450px; height: 450px; }
  .deco-ring--3 { width: 600px; height: 600px; }
}

/* Sparkle particles */
.sparkle-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 15;
}

.sparkle-dot {
  position: absolute;
  width: var(--ss);
  height: var(--ss);
  border-radius: 50%;
  background: radial-gradient(circle, #fff, rgba(251,113,133,0.8));
  box-shadow:
    0 0 6px 2px rgba(255,255,255,0.8),
    0 0 12px 4px rgba(251,113,133,0.5);
  animation: sparkle-pop var(--sdur) var(--sd) ease-out forwards;
  opacity: 0;
}

@keyframes sparkle-pop {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  30% {
    opacity: 1;
    transform: translate(calc(var(--sx) * 0.5), calc(var(--sy) * 0.5)) scale(1.5);
  }
  100% {
    transform: translate(var(--sx), var(--sy)) scale(0);
    opacity: 0;
  }
}
</style>
