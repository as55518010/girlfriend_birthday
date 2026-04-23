<script setup lang="ts">
import { watch, onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import type { LightboxPhoto } from '../composables/useLightbox'

const props = defineProps<{
  isOpen: boolean
  photo: LightboxPhoto | null
  currentIndex: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
}>()

/* Touch swipe */
const touchStartX = shallowRef(0)
const touchDeltaX = shallowRef(0)
const isSwiping = shallowRef(false)

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchDeltaX.value = 0
  isSwiping.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value) return
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value
}

function onTouchEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  if (touchDeltaX.value > 60 && props.hasPrev) {
    emit('prev')
  } else if (touchDeltaX.value < -60 && props.hasNext) {
    emit('next')
  }
  touchDeltaX.value = 0
}

/* Keyboard */
function onKeyDown(e: KeyboardEvent) {
  if (!props.isOpen) return
  switch (e.key) {
    case 'Escape':
      emit('close')
      break
    case 'ArrowRight':
      if (props.hasNext) emit('next')
      break
    case 'ArrowLeft':
      if (props.hasPrev) emit('prev')
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

/* Body scroll lock */
watch(
  () => props.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

/* Focus trap: focus the dialog when opened */
const dialogRef = useTemplateRef<HTMLElement>('dialog')
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      requestAnimationFrame(() => dialogRef.value?.focus())
    }
  },
)

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('lightbox__backdrop')) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen && photo"
        ref="dialog"
        class="lightbox__backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`照片檢視 ${currentIndex + 1}/${total}`"
        tabindex="-1"
        @click="handleBackdropClick"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Close button -->
        <button
          class="lightbox__close"
          aria-label="關閉照片檢視"
          @click="emit('close')"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Counter -->
        <div class="lightbox__counter" aria-live="polite">
          {{ currentIndex + 1 }} / {{ total }}
        </div>

        <!-- Image container -->
        <div
          class="lightbox__image-wrap"
          :style="isSwiping ? { transform: `translateX(${touchDeltaX}px)` } : undefined"
        >
          <Transition name="lightbox-img" mode="out-in">
            <img
              :key="photo.src"
              :src="photo.src"
              :alt="photo.alt"
              class="lightbox__image"
              draggable="false"
            />
          </Transition>
        </div>

        <!-- Caption -->
        <p v-if="photo.caption" class="lightbox__caption">
          {{ photo.caption }}
        </p>

        <!-- Prev -->
        <button
          v-if="hasPrev"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="上一張照片"
          @click.stop="emit('prev')"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <!-- Next -->
        <button
          v-if="hasNext"
          class="lightbox__nav lightbox__nav--next"
          aria-label="下一張照片"
          @click.stop="emit('next')"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ─── Backdrop ─── */
.lightbox__backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(32, 14, 18, 0.85);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: default;
  outline: none;
  overscroll-behavior: contain;
}

/* ─── Transition: backdrop ─── */
.lightbox-enter-active,
.lightbox-leave-active {
  transition:
    opacity 0.5s var(--ease-out-expo),
    backdrop-filter 0.5s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* ─── Transition: image swap ─── */
.lightbox-img-enter-active {
  transition:
    opacity 0.4s var(--ease-out-expo),
    transform 0.4s var(--ease-out-expo);
}

.lightbox-img-leave-active {
  transition:
    opacity 0.25s ease-in,
    transform 0.25s ease-in;
}

.lightbox-img-enter-from {
  opacity: 0;
  transform: scale(0.94) translateY(8px);
}

.lightbox-img-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* ─── Close ─── */
.lightbox__close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.25s var(--ease-out-expo);
  touch-action: manipulation;
}

.lightbox__close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.1);
}

.lightbox__close:focus-visible {
  outline: 2px solid var(--rose-300);
  outline-offset: 3px;
}

/* ─── Counter ─── */
.lightbox__counter {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-accent);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 3px;
  user-select: none;
}

/* ─── Image ─── */
.lightbox__image-wrap {
  max-width: min(90vw, 900px);
  max-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.lightbox__image {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.4),
    0 10px 30px rgba(0, 0, 0, 0.2);
  user-select: none;
}

/* ─── Caption ─── */
.lightbox__caption {
  margin-top: 20px;
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 3px;
  text-align: center;
  user-select: none;
}

/* ─── Nav arrows ─── */
.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.25s var(--ease-out-expo);
  touch-action: manipulation;
}

.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.18);
  color: white;
  transform: translateY(-50%) scale(1.1);
}

.lightbox__nav:focus-visible {
  outline: 2px solid var(--rose-300);
  outline-offset: 3px;
}

.lightbox__nav--prev {
  left: 20px;
}

.lightbox__nav--next {
  right: 20px;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .lightbox__nav {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.15);
  }

  .lightbox__nav--prev {
    left: 8px;
  }

  .lightbox__nav--next {
    right: 8px;
  }

  .lightbox__image-wrap {
    max-width: 96vw;
    max-height: 65vh;
  }

  .lightbox__image {
    max-height: 65vh;
    border-radius: 6px;
  }

  .lightbox__close {
    top: max(12px, env(safe-area-inset-top, 12px));
    right: 12px;
  }

  .lightbox__counter {
    top: max(16px, env(safe-area-inset-top, 16px));
    font-size: 0.8rem;
  }

  .lightbox__caption {
    font-size: 1rem;
    margin-top: 14px;
  }
}
</style>
