<script setup lang="ts">
interface Bubble {
  id: number
  size: number
  left: number
  duration: number
  delay: number
  opacity: number
  drift: number
  hue: number
  blur: number
}

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 6 + Math.random() * 45,
    left: Math.random() * 100,
    duration: 10 + Math.random() * 18,
    delay: -(Math.random() * 20),
    opacity: 0.08 + Math.random() * 0.22,
    drift: (Math.random() - 0.5) * 80,
    hue: 340 + Math.random() * 30,
    blur: Math.random() > 0.6 ? 2 + Math.random() * 6 : 0,
  }))
}

const bubbles = generateBubbles(40)
</script>

<template>
  <div class="bubbles-layer" aria-hidden="true">
    <div
      v-for="b in bubbles"
      :key="b.id"
      class="bubble"
      :style="{
        '--size': `${b.size}px`,
        '--left': `${b.left}vw`,
        '--duration': `${b.duration}s`,
        '--delay': `${b.delay}s`,
        '--opacity': b.opacity,
        '--drift': `${b.drift}px`,
        '--hue': b.hue,
        '--blur': `${b.blur}px`,
        '--end-scale': 0.6 + Math.random() * 0.8,
      } as Record<string, string | number>"
    />
  </div>
</template>

<style scoped>
.bubbles-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.bubble {
  position: absolute;
  bottom: -60px;
  left: var(--left);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    hsla(var(--hue), 80%, 85%, var(--opacity)),
    hsla(var(--hue), 70%, 70%, calc(var(--opacity) * 0.4))
  );
  box-shadow:
    inset 0 0 calc(var(--size) * 0.2) hsla(var(--hue), 90%, 90%, 0.3),
    0 0 calc(var(--size) * 0.4) hsla(var(--hue), 80%, 80%, calc(var(--opacity) * 0.5));
  filter: blur(var(--blur));
  animation: float-up var(--duration) var(--delay) linear infinite;
  will-change: transform, opacity;
}
</style>
