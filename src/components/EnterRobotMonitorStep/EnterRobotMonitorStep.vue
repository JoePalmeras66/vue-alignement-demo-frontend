<script setup lang="ts">
import { RobotModeStepChipType } from '@/types/RobotModeStepChipType'
import { useTranslations } from '@/composables/useTranslations'

const props = withDefaults(defineProps<Props>(), {
  disablePositionError: false,
})

const { getTranslation } = useTranslations('enter-robot-monitor-step')

interface Props {
  monitorInPosition: boolean
  disablePositionError: boolean
}

const isMonitorInPosition = ref<boolean>(false)
const transitionMonitor = ref<string>('slide-monitor')
const transitionBottom = ref<string>('fade-text')

const chipType = computed(() => {
  return props.monitorInPosition
    ? RobotModeStepChipType.monitor_position_ok
    : RobotModeStepChipType.monitor_position_error
})

const bottomMarginText = computed(() => {
  if (chipType.value && !props.disablePositionError) {
    return '24px'
  } else {
    return '108px'
  }
})

const triggerMonitorAnimation = (monitorInPosition: boolean) => {
  isMonitorInPosition.value = !monitorInPosition
  if (!monitorInPosition) {
    setTimeout(() => {
      transitionMonitor.value = 'slide-monitor-reverse'
      transitionBottom.value = 'fade-text-reverse'
      isMonitorInPosition.value = monitorInPosition
    }, 1000)
  } else if (monitorInPosition) {
    setTimeout(() => {
      transitionMonitor.value = 'slide-monitor'
      transitionBottom.value = 'fade-text'
      isMonitorInPosition.value = monitorInPosition
    }, 1000)
  }
}

watch(
  () => props.monitorInPosition,
  (monitorInPosition) => {
    if (!props.disablePositionError) {
      triggerMonitorAnimation(monitorInPosition)
    }
  }
)
</script>

<template>
  <div class="enter-robot-monitor-step">
    <div class="image-container">
      <div class="image-container__animation-content">
        <Transition :name="transitionMonitor">
          <TgwIcon
            v-if="!isMonitorInPosition"
            icon="monitor"
            class="step-image-one"
            size="300px"
            color="var(--tgw-primary)"
          />
          <TgwIcon
            v-else
            icon="monitor"
            class="step-image-one-success"
            size="300px"
            color="var(--tgw-status-success)"
          />
        </Transition>
        <Transition name="fade-bg-monitor" mode="out-in">
          <TgwIcon
            v-show="!isMonitorInPosition"
            icon="monitor"
            class="step-image-two"
            size="300px"
            color="var(--tgw-primary)"
          />
        </Transition>
      </div>
      <Transition name="fade-icon" mode="out-in">
        <TgwIcon
          v-if="!isMonitorInPosition"
          icon="direction-up"
          size="80px"
          class="step-icon__rotate"
          color="var(--tgw-primary)"
        />
        <TgwIcon
          v-else
          icon="tick-checkbox"
          size="80px"
          class="step-icon"
          color="var(--tgw-status-success)"
        />
      </Transition>
    </div>
    <Transition :name="transitionBottom" mode="out-in">
      <div v-if="!isMonitorInPosition" class="hint-text-container">
        <TgwHighlighted
          color="var(--tgw-primary)"
          class="hint-text-container__tgw-highlighted"
          >{{ getTranslation('move_monitor') }}</TgwHighlighted
        >
        <RobotModeStepChip
          v-if="!disablePositionError"
          :chip-type="RobotModeStepChipType.monitor_position_error"
        />
      </div>
      <div v-else class="hint-text-container__success">
        <Transition name="slide-bottom">
          <RobotModeStepChip
            :chip-type="RobotModeStepChipType.monitor_position_ok"
            class="chip-success"
          />
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@keyframes slide-bottom {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-monitor {
  0% {
    transform: translateX(-44px);
  }
  33% {
    transform: translateX(-44px);
  }
  66% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(0px);
  }
}
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  33% {
    opacity: 0;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fade-in-two {
  0% {
    opacity: 0;
  }
  33% {
    opacity: 0;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 0.2;
  }
}

@keyframes fade-text {
  0% {
    opacity: 1;
  }
  33% {
    opacity: 0;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

.enter-robot-monitor-step {
  display: flex;
  flex-direction: column;
  align-items: center;

  .image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;

    .image-container__animation-content {
      display: flex;
      position: relative;
      width: 300px;
      height: 300px;

      .step-image-one,
      .step-image-one-success {
        position: absolute; // to overlap the two images
        top: 0;
        left: 0;
      }

      .step-image-one {
        transform: translateX(-44px);
      }

      .step-image-one-success {
        transform: translateX(0px);
        z-index: 1;
      }

      .slide-monitor-leave-active {
        animation: slide-monitor ease 1.5s;
      }
      .slide-monitor-enter-active {
        animation: fade-in ease 1.5s;
      }

      .slide-monitor-reverse-enter-active {
        animation: slide-monitor ease 1.5s reverse;
      }
      .slide-monitor-reverse-leave-active {
        animation: fade-in ease 1.5s reverse;
      }

      // if two step_image classes are present side by side the second one gets these settings
      .step-image-two {
        transform: translateX(44px);
        opacity: 0.2;
        z-index: -1;
        position: absolute; // to overlap the two images
      }

      .fade-bg-monitor-leave-active {
        animation: fade-in-two 1.5s ease reverse;
      }
      .fade-bg-monitor-enter-active {
        animation: fade-in-two 1.5s ease;
      }
    }

    .step-icon__rotate {
      transform: rotate(90deg);
    }
  }

  .hint-text-container {
    display: flex;
    margin-bottom: v-bind(bottomMarginText);
    flex-direction: column;
    gap: 32px;

    .hint-text-container__tgw-highlighted {
      margin-top: 24px;
      font-family: Roboto, Helvetica, sans-serif;
      font-weight: 900;
      font-size: 40px;
      line-height: 47px;
      letter-spacing: 1px;
      color: var(--tgw-text-primary);
      user-select: none;

      .highlighted {
        color: var(--tgw-primary);
      }
    }
  }

  .hint-text-container__success {
    display: flex;
    margin-top: 24px;
    margin-bottom: 103px;
    flex-direction: column;
    gap: 32px;
  }
}

// slide element from bottom
.fade-text-enter-active {
  animation: slide-bottom 0.5s ease-in-out;
}

// fade out text
.fade-text-leave-active {
  animation: fade-text 0.5s ease-in-out;
}

// fade in text
.fade-text-reverse-enter-active {
  animation: fade-text 1s ease-in-out reverse;
}

// slide element to bottom
.fade-text-reverse-leave-active {
  animation: slide-bottom 0.5s ease-in-out reverse;
}

.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: opacity 0.5s ease;
  transition-delay: 0.2s;
}

.fade-icon-enter-from,
.fade-icon-leave-to {
  opacity: 0;
}

// for normal full hd monitors or below
@media screen and (max-height: 920px) {
  .enter-robot-monitor-step {
    .image-container {
      .image-container__animation-content {
        width: 230px;
        height: 230px;

        .step-image-one,
        .step-image-one-success,
        .step-image-two {
          width: 230px;
          height: 230px;
        }
      }
    }
  }
}
</style>
