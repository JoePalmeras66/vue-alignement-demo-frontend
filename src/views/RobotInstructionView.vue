<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTranslations } from '@/composables/useTranslations'
import RovoflexSwitchHeader from '@/components/RovoflexSwitchHeader/RovoflexSwitchHeader.vue'
import { RovoflexState } from '@/types/RovoflexState'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import RovoflexStepperBackground from '@/components/RovoflexStepperBackground/RovoflexStepperBackground.vue'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'
import { RovoflexInstructionEnum } from '@/types/RovoflexInstructionEnum'
import EnterRobotMonitorStep from '@/components/EnterRobotMonitorStep/EnterRobotMonitorStep.vue'

const { getTranslation } = useTranslations('robot-instruction-view')
const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const rovoflexStore = useRovoflexStore()
const { hasMonitorPositionError } = storeToRefs(rovoflexStore)
const { onHandlePcotsEvent } = usePcotsEventHandler()
const route = useRoute()

const supportsMonitorErrorSensor = ref<boolean>(false)

const instruction = computed(() => {
  if (route?.params?.instruction === RovoflexInstructionEnum.Switch) {
    return RovoflexInstructionEnum.Switch
  } else if (route?.params?.instruction === RovoflexInstructionEnum.Continue) {
    return RovoflexInstructionEnum.Continue
  }
})

const headerText = computed(() => {
  if (instruction.value === RovoflexInstructionEnum.Continue) {
    return getTranslation('continue_robot_picking')
  }
})

const getImageByStep = (stepNo: number) => {
  let imagePath = 'src/assets/images/rovoflex/'
  if (stepNo === 1) {
    imagePath += 'monitors'
  } else if (stepNo === 2) {
    imagePath += 'walk'
  } else if (stepNo === 3) {
    imagePath += 'buzzer'
  }
  if (!isDark.value) {
    imagePath += '_light.svg'
  } else {
    imagePath += '_dark.svg'
  }
  return imagePath
}

const monitorInPosition = computed(() => {
  return !hasMonitorPositionError.value
})

onMounted(async () => {
  connectPcotsEvents(onHandlePcotsEvent)

  await rovoflexStore.loadStates()
})

onUnmounted(() => {
  disconnectPcotsEvents()
})

watch(
  hasMonitorPositionError,
  () => {
    if (
      supportsMonitorErrorSensor.value !== undefined &&
      !supportsMonitorErrorSensor.value
    ) {
      supportsMonitorErrorSensor.value = hasMonitorPositionError.value
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="robot-instruction-view">
    <div class="header">
      <RovoflexSwitchHeader
        :switch-to-state="RovoflexState.RovoflexPicking"
        :header-text="headerText"
        :switch-from-error="false"
      />
    </div>
    <div class="content">
      <RovoflexStepperBackground :step-amount="3" />
      <EnterRobotModeStep
        v-if="!supportsMonitorErrorSensor"
        class="step one"
        :step-number="1"
        :hint-text="getTranslation('move_monitor')"
        :image-path="getImageByStep(1)"
      >
        <EnterRobotMonitorStep
          :monitor-in-position="monitorInPosition"
          :disable-position-error="true"
        />
      </EnterRobotModeStep>
      <EnterRobotModeStep
        v-else
        class="step one"
        :step-number="1"
        :hint-text="getTranslation('move_monitor')"
        :image-path="getImageByStep(1)"
      >
        <EnterRobotMonitorStep
          :monitor-in-position="monitorInPosition"
          :disable-position-error="false"
        />
      </EnterRobotModeStep>
      <EnterRobotModeStep
        class="step two"
        :step-number="2"
        :hint-text="getTranslation('leave_station')"
        :image-path="getImageByStep(2)"
      />
      <EnterRobotModeStep
        class="step three"
        :step-number="3"
        :hint-text="getTranslation('press_buttons')"
        :image-path="getImageByStep(3)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.robot-instruction-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;

  .header {
    z-index: 10;
    background: var(--tgw-bg-10);
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

    :deep(.step.three) {
      .step_image {
        margin-left: 40px;
      }
    }
  }
}
</style>
