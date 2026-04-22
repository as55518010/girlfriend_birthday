<script setup lang="ts">
import { shallowRef, computed } from 'vue'

const props = defineProps<{
  isPlaying: boolean
  isMuted: boolean
  volume: number
}>()

const emit = defineEmits<{
  toggle: []
  'toggle-mute': []
  'update:volume': [value: number]
}>()

const isExpanded = shallowRef(false)

const volumePercent = computed(() => Math.round(props.volume * 100))

function handleVolumeInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:volume', Number(target.value) / 100)
}

function handleToggleClick() {
  emit('toggle')
}

function handleExpandToggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div
    class="music-toggle"
    :class="{ 'music-toggle--expanded': isExpanded }"
  >
    <!-- Volume panel (expands upward) -->
    <Transition name="panel-slide">
      <div v-show="isExpanded" class="music-toggle__panel">
        <button
          class="music-toggle__mute-btn"
          :aria-label="isMuted ? '取消靜音' : '靜音'"
          @click="emit('toggle-mute')"
        >
          <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </button>

        <div class="music-toggle__volume-track">
          <input
            type="range"
            min="0"
            max="100"
            :value="volumePercent"
            class="music-toggle__volume-slider"
            aria-label="音量調整"
            @input="handleVolumeInput"
          />
        </div>
      </div>
    </Transition>

    <!-- Main floating button -->
    <div class="music-toggle__buttons">
      <button
        class="music-toggle__play-btn"
        :class="{ 'music-toggle__play-btn--playing': isPlaying }"
        :aria-label="isPlaying ? '暫停背景音樂' : '播放背景音樂'"
        @click="handleToggleClick"
      >
        <div class="music-toggle__disc" aria-hidden="true">
          <div class="music-toggle__disc-inner" />
        </div>
        <!-- Musical note overlay -->
        <svg class="music-toggle__note" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </button>

      <button
        class="music-toggle__expand-btn"
        :aria-label="isExpanded ? '收合音量控制' : '展開音量控制'"
        aria-haspopup="true"
        :aria-expanded="isExpanded"
        @click="handleExpandToggle"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline :points="isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.music-toggle {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* ─── Volume Panel ─── */
.music-toggle__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 14px 10px;
  box-shadow:
    0 8px 32px rgba(100, 40, 50, 0.1),
    0 2px 8px rgba(100, 40, 50, 0.06);
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    opacity 0.35s var(--ease-out-expo),
    transform 0.35s var(--ease-out-expo);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.music-toggle__mute-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
  touch-action: manipulation;
}

.music-toggle__mute-btn:hover {
  color: var(--rose-500);
  background: var(--rose-50);
}

.music-toggle__mute-btn:focus-visible {
  outline: 2px solid var(--rose-400);
  outline-offset: 2px;
}

.music-toggle__volume-track {
  width: 32px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-toggle__volume-slider {
  writing-mode: vertical-lr;
  direction: rtl;
  appearance: none;
  -webkit-appearance: none;
  width: 90px;
  height: 4px;
  background: var(--rose-200);
  border-radius: 99px;
  outline: none;
  cursor: pointer;
}

.music-toggle__volume-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--rose-400);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(244, 63, 94, 0.3);
  cursor: pointer;
}

.music-toggle__volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--rose-400);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(244, 63, 94, 0.3);
  cursor: pointer;
}

.music-toggle__volume-slider:focus-visible {
  outline: 2px solid var(--rose-400);
  outline-offset: 4px;
}

/* ─── Button group ─── */
.music-toggle__buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 99px;
  padding: 4px;
  box-shadow:
    0 8px 32px rgba(100, 40, 50, 0.1),
    0 2px 8px rgba(100, 40, 50, 0.06);
}

/* ─── Play Button (Vinyl Disc) ─── */
.music-toggle__play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--rose-400), var(--rose-500));
  color: white;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition:
    transform 0.3s var(--ease-out-expo),
    box-shadow 0.3s ease;
  touch-action: manipulation;
}

.music-toggle__play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(244, 63, 94, 0.35);
}

.music-toggle__play-btn:focus-visible {
  outline: 3px solid var(--rose-300);
  outline-offset: 3px;
}

.music-toggle__disc {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(255, 255, 255, 0.05) 0deg,
    rgba(255, 255, 255, 0.15) 40deg,
    rgba(255, 255, 255, 0.03) 80deg,
    rgba(255, 255, 255, 0.12) 160deg,
    rgba(255, 255, 255, 0.05) 200deg,
    rgba(255, 255, 255, 0.18) 280deg,
    rgba(255, 255, 255, 0.05) 360deg
  );
  animation: disc-spin 3s linear infinite;
  animation-play-state: paused;
}

.music-toggle__play-btn--playing .music-toggle__disc {
  animation-play-state: running;
}

@keyframes disc-spin {
  to { transform: rotate(360deg); }
}

.music-toggle__disc-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
}

.music-toggle__note {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

/* ─── Expand Button ─── */
.music-toggle__expand-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
  touch-action: manipulation;
}

.music-toggle__expand-btn:hover {
  color: var(--rose-500);
  background: var(--rose-50);
}

.music-toggle__expand-btn:focus-visible {
  outline: 2px solid var(--rose-400);
  outline-offset: 2px;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .music-toggle {
    bottom: 16px;
    right: 16px;
  }

  .music-toggle__play-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
