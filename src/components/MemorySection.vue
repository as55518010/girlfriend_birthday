<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

defineProps<{
  title: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
}>()

const emit = defineEmits<{
  'image-click': []
}>()

const sectionRef = useTemplateRef<HTMLElement>('section')
const { isRevealed } = useScrollReveal(sectionRef)
</script>

<template>
  <section
    ref="section"
    class="memory"
    :class="{
      'memory--revealed': isRevealed,
      'memory--reverse': reverse,
    }"
  >
    <div class="memory__image-wrap">
      <div
        class="memory__image-frame"
        role="button"
        tabindex="0"
        :aria-label="`放大查看：${imageAlt}`"
        @click="emit('image-click')"
        @keydown.enter="emit('image-click')"
        @keydown.space.prevent="emit('image-click')"
      >
        <img :src="imageSrc" :alt="imageAlt" loading="lazy" />
        <div class="memory__image-glow" aria-hidden="true" />
      </div>
    </div>
    <div class="memory__text-wrap">
      <h2 class="memory__title">{{ title }}</h2>
      <div class="memory__body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.memory {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1060px;
  margin: 0 auto;
  padding: 80px 40px;
  opacity: 0;
  transform: translateY(50px);
  transition:
    opacity 0.9s var(--ease-out-expo),
    transform 0.9s var(--ease-out-expo);
}

.memory--revealed {
  opacity: 1;
  transform: translateY(0);
}

.memory--reverse {
  direction: rtl;
}

.memory--reverse > * {
  direction: ltr;
}

/* Image */
.memory__image-wrap {
  position: relative;
}

.memory__image-frame {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow:
    0 20px 50px rgba(100, 40, 50, 0.12),
    0 6px 16px rgba(100, 40, 50, 0.06);
  transition: transform 0.5s var(--ease-out-expo), box-shadow 0.5s ease;
}

.memory__image-frame:focus-visible {
  outline: 3px solid var(--rose-300);
  outline-offset: 4px;
}

.memory__image-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.memory__image-frame:hover {
  transform: scale(1.02) rotate(-0.5deg);
  box-shadow:
    0 28px 65px rgba(100, 40, 50, 0.18),
    0 8px 24px rgba(100, 40, 50, 0.1);
}

.memory__image-frame img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out-expo);
}

.memory__image-frame:hover img {
  transform: scale(1.05);
}

/* Text */
.memory__text-wrap {
  padding: 20px 0;
}

.memory__title {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--text-dark);
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.memory__title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, var(--rose-400), var(--rose-200));
  border-radius: 99px;
}

.memory__body {
  font-size: 1.05rem;
  line-height: 2;
  color: var(--text-body);
}

.memory__body :deep(strong) {
  color: var(--rose-500);
  font-weight: 700;
}

/* Hover glow */
.memory__image-glow {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: radial-gradient(
    ellipse at 50% 80%,
    rgba(251, 113, 133, 0.18) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.memory__image-frame:hover .memory__image-glow {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .memory {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 50px 24px;
  }

  .memory--reverse {
    direction: ltr;
  }

  .memory__title {
    font-size: 1.6rem;
  }

  .memory__image-frame img {
    aspect-ratio: 3 / 4;
  }
}
</style>
