<script setup lang="ts">
import { RovoflexState } from '@/types/RovoflexState'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'
import { isDark } from '@/composables/useTheme'
import { router } from '@/router'

const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const rovoflexStore = useRovoflexStore()
const loadCarrierStore = useLoadCarrierStore()
const taskStore = useTaskStore()
const { onHandlePcotsEvent } = usePcotsEventHandler()

const animationLink = computed(() => {
  if (isDark.value) {
    return 'src/assets/animations/lottie/rovoflex_loader_dark.json'
  } else {
    return 'src/assets/animations/lottie/rovoflex_loader_light.json'
  }
})

onMounted(async () => {
  connectPcotsEvents(onHandlePcotsEvent)

  await rovoflexStore.loadStates()
  useTimeoutFn(async () => {
    // Reset all to reload data after routing
    loadCarrierStore.resetSourceLoadCarrier()
    loadCarrierStore.resetTargetLoadCarrier()
    taskStore.resetTask()

    await router.push({ name: 'home' })
  }, 2000)
})

onUnmounted(() => {
  disconnectPcotsEvents()
})
</script>

<template>
  <div class="exit-robot-mode-view">
    <div class="header">
      <RovoflexSwitchHeader
        :switch-to-state="RovoflexState.ManualPickingRequested"
        :switch-from-error="false"
      />
    </div>
    <div class="content">
      <LottieAnimation
        :key="animationLink"
        :auto-play="true"
        :loop="true"
        class="lottie-player"
        :animation-link="animationLink"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.exit-robot-mode-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;

  .header :deep(.rovoflex-switch-header) {
    margin-top: 108px;
  }

  .content {
    background: var(--tgw-bg-10);

    .lottie-player {
      width: 445px;
      height: 180px;
    }
  }
}
</style>
