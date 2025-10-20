import { useIdle } from '@vueuse/core'
import { useAppContainer } from '@/composables/useAppContainer'

// Share state
let isInitialized = false
let resetIdle: () => void = () => {}

export const useAppIdle = () => {
  const { triggerUserIdleEvent, triggerUserActiveEvent } = useAppContainer()

  const registerIdleSensor = () => {
    if (!isInitialized) {
      isInitialized = true

      const { idle, reset } = useIdle(5000) // Idle after 5 seconds
      resetIdle = reset

      watch(idle, (isIdle) => {
        if (isIdle) {
          triggerUserIdleEvent()
        } else {
          triggerUserActiveEvent()
        }
      })
    }
  }

  return {
    registerIdleSensor,
    resetAppIdle: resetIdle,
  }
}
