<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const blockRef = useTemplateRef<HTMLElement>('block')
const { isRevealed } = useScrollReveal(blockRef, { threshold: 0.3 })
</script>

<template>
  <footer
    ref="block"
    class="signature"
    :class="{ 'signature--revealed': isRevealed }"
  >
    <div class="signature__heart" aria-hidden="true">
      <span class="signature__heart-emoji">❤️</span>
    </div>
    <p class="signature__text">愛妳的</p>
    <p class="signature__name">DK 桑</p>
    <p class="signature__text">敬上</p>
    <p class="signature__date">2026.04.21</p>
    <div class="signature__flourish" aria-hidden="true">✦ ✦ ✦</div>
  </footer>
</template>

<style scoped>
.signature {
  text-align: center;
  padding: 80px 40px 120px;
  background: linear-gradient(to bottom, var(--cream), var(--blush));
  position: relative;
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.9s var(--ease-out-expo),
    transform 0.9s var(--ease-out-expo);
}

.signature--revealed {
  opacity: 1;
  transform: translateY(0);
}

.signature__heart {
  margin-bottom: 30px;
}

.signature__heart-emoji {
  font-size: 3.5rem;
  display: inline-block;
  animation: heart-beat 1.2s ease-in-out infinite;
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.25); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}

.signature__text {
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--text-body);
  margin-bottom: 4px;
}

.signature__name {
  font-family: var(--font-display);
  font-size: 3.5rem;
  color: var(--rose-500);
  line-height: 1.3;
  margin: 8px 0;
  background: linear-gradient(135deg, var(--rose-500), var(--champagne));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.signature__date {
  font-family: var(--font-accent);
  font-size: 1.1rem;
  color: var(--text-soft);
  letter-spacing: 3px;
  margin-top: 16px;
  font-style: italic;
}

.signature__flourish {
  margin-top: 30px;
  color: var(--rose-300);
  font-size: 0.9rem;
  letter-spacing: 12px;
}

@media (max-width: 600px) {
  .signature {
    padding: 60px 24px 100px;
  }

  .signature__name {
    font-size: 2.8rem;
  }
}
</style>
