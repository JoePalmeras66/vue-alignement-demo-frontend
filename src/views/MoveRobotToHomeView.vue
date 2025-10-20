<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import RovoflexStepperBackground from '@/components/RovoflexStepperBackground/RovoflexStepperBackground.vue'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'
import { RovoflexState } from '@/types/RovoflexState'
import RovoflexSwitchHeader from '@/components/RovoflexSwitchHeader/RovoflexSwitchHeader.vue'

const { getTranslation } = useTranslations('move-robot-to-home-view')
const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const rovoflexStore = useRovoflexStore()
const { onHandlePcotsEvent } = usePcotsEventHandler()

const getImageByStep = (stepNo: number) => {
  let imagePath = 'src/assets/images/rovoflex/'
  if (stepNo === 1) {
    imagePath += 'ack_press'
  } else if (stepNo === 2) {
    imagePath += 'ack_long_press'
  }
  if (!isDark.value) {
    imagePath += '_light.svg'
  } else {
    imagePath += '_dark.svg'
  }
  return imagePath
}

const headerText = computed(() => {
  return getTranslation('reset_robot_position')
})

onMounted(async () => {
  connectPcotsEvents(onHandlePcotsEvent)

  await rovoflexStore.loadStates()
})

onUnmounted(() => {
  disconnectPcotsEvents()
})
</script>

<template>
  <div class="move-robot-to-home-view">
    <div class="header">
      <RovoflexSwitchHeader
        :switch-to-state="RovoflexState.RovoflexPicking"
        :header-text="headerText"
        :switch-from-error="true"
      />
    </div>
    <div class="content">
      <RovoflexStepperBackground :step-amount="2" />
      <EnterRobotModeStep
        class="step one"
        :step-number="1"
        :hint-text="getTranslation('press_ack')"
        :image-path="getImageByStep(1)"
      />
      <EnterRobotModeStep
        class="step two"
        :step-number="2"
        :hint-text="getTranslation('long_press_ack')"
        :image-path="getImageByStep(2)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.move-robot-to-home-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;

  .header {
    z-index: 10;
    background: var(--tgw-status-error-g);
  }

  .content {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    border-top: 2px solid var(--tgw-line-10);

    .step {
      flex: 1;
      z-index: 100;
    }

    :deep(.step.two) {
      .step_image {
        margin-left: 40px;
      }
    }
  }
}
</style>
