import { shallowRef, onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollReveal(
  elementRef: Ref<HTMLElement | null>,
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const isRevealed = shallowRef(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isRevealed.value = true
          observer?.disconnect()
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px 0px -60px 0px',
      },
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isRevealed }
}
