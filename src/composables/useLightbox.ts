import { shallowRef, computed, readonly } from 'vue'

export interface LightboxPhoto {
  src: string
  alt: string
  caption?: string
}

/**
 * Composable for managing lightbox state, navigation, and keyboard controls.
 * Does NOT handle DOM events—the component wires those.
 */
export function useLightbox() {
  const photos = shallowRef<LightboxPhoto[]>([])
  const currentIndex = shallowRef(-1)

  const isOpen = computed(() => currentIndex.value >= 0)

  const currentPhoto = computed(() =>
    currentIndex.value >= 0 ? photos.value[currentIndex.value] ?? null : null,
  )

  const hasNext = computed(
    () => currentIndex.value < photos.value.length - 1,
  )

  const hasPrev = computed(() => currentIndex.value > 0)

  function open(items: LightboxPhoto[], startIndex = 0) {
    photos.value = items
    currentIndex.value = Math.max(
      0,
      Math.min(startIndex, items.length - 1),
    )
  }

  function close() {
    currentIndex.value = -1
  }

  function next() {
    if (hasNext.value) {
      currentIndex.value++
    }
  }

  function prev() {
    if (hasPrev.value) {
      currentIndex.value--
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < photos.value.length) {
      currentIndex.value = index
    }
  }

  return {
    photos: readonly(photos),
    currentIndex: readonly(currentIndex),
    isOpen,
    currentPhoto,
    hasNext,
    hasPrev,
    open,
    close,
    next,
    prev,
    goTo,
  }
}
