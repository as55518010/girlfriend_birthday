import { shallowRef, onMounted, onUnmounted, readonly } from 'vue'

/**
 * Detects user's prefers-reduced-motion setting reactively.
 * Returns a readonly boolean ref.
 */
export function useReducedMotion() {
  const isReduced = shallowRef(false)
  let mql: MediaQueryList | null = null

  function update() {
    isReduced.value = mql?.matches ?? false
  }

  onMounted(() => {
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    isReduced.value = mql.matches
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return { isReduced: readonly(isReduced) }
}
