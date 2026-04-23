<script setup lang="ts">
import { shallowRef, onMounted, onUnmounted } from 'vue'

interface Firework {
  id: number
  x: number
  y: number
  hue: number
  particles: FireworkParticle[]
}

interface FireworkParticle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  hue: number
}

const fireworks = shallowRef<Firework[]>([])
let fwId = 0
let interval: ReturnType<typeof setInterval> | null = null

function spawnFirework() {
  const id = ++fwId
  const x = 15 + Math.random() * 70 // 15–85% viewport width
  const y = 10 + Math.random() * 40 // 10–50% viewport height
  const hue = 330 + Math.random() * 40 // pink–red range

  const particles: FireworkParticle[] = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2
    const dist = 40 + Math.random() * 80
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 100,
      hue: hue + Math.random() * 30 - 15,
    }
  })

  const fw: Firework = { id, x, y, hue, particles }
  fireworks.value = [...fireworks.value, fw]

  setTimeout(() => {
    fireworks.value = fireworks.value.filter(f => f.id !== id)
  }, 2000)
}

onMounted(() => {
  // Spawn a few immediately
  spawnFirework()
  setTimeout(spawnFirework, 300)
  setTimeout(spawnFirework, 700)

  // Then periodically
  interval = setInterval(() => {
    spawnFirework()
    if (Math.random() > 0.5) {
      setTimeout(spawnFirework, 200 + Math.random() * 400)
    }
  }, 1500 + Math.random() * 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="fireworks-layer" aria-hidden="true">
    <div
      v-for="fw in fireworks"
      :key="fw.id"
      class="firework"
      :style="{ left: `${fw.x}%`, top: `${fw.y}%` }"
    >
      <!-- Rising trail -->
      <div class="firework__trail" :style="{ '--fw-hue': fw.hue }" />
      <!-- Burst particles -->
      <span
        v-for="p in fw.particles"
        :key="p.id"
        class="firework__particle"
        :style="{
          '--p-x': `${p.x}px`,
          '--p-y': `${p.y}px`,
          '--p-size': `${p.size}px`,
          '--p-delay': `${p.delay}ms`,
          '--p-hue': p.hue,
        } as Record<string, string | number>"
      />
    </div>
  </div>
</template>

<style scoped>
.fireworks-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}

.firework {
  position: absolute;
  transform: translate(-50%, -50%);
}

.firework__trail {
  position: absolute;
  width: 3px;
  height: 60px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    to top,
    hsla(var(--fw-hue), 80%, 70%, 0),
    hsla(var(--fw-hue), 80%, 80%, 0.8)
  );
  animation: trail-rise 0.4s ease-out forwards;
  border-radius: 2px;
}

@keyframes trail-rise {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(80px) scaleY(0);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scaleY(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scaleY(0.3);
  }
}

.firework__particle {
  position: absolute;
  width: var(--p-size);
  height: var(--p-size);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    hsla(var(--p-hue), 90%, 80%, 1),
    hsla(var(--p-hue), 80%, 60%, 0.6)
  );
  box-shadow:
    0 0 4px 1px hsla(var(--p-hue), 90%, 80%, 0.6),
    0 0 8px 2px hsla(var(--p-hue), 80%, 70%, 0.3);
  animation: particle-burst 1.2s var(--p-delay) ease-out forwards;
  opacity: 0;
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform:
      translate(
        calc(var(--p-x) * 0.3),
        calc(var(--p-y) * 0.3)
      )
      scale(1.2);
  }
  100% {
    transform:
      translate(
        var(--p-x),
        calc(var(--p-y) + 30px)
      )
      scale(0);
    opacity: 0;
  }
}
</style>
