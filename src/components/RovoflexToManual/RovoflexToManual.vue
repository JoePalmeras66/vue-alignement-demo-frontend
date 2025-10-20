<script setup lang="ts">
import { RovoflexState } from '@/types/RovoflexState'

interface Props {
  leftToRight: boolean
  state: RovoflexState
}
const props = defineProps<Props>()
const rovoflexImagePath = computed(() => {
  if (props.state === RovoflexState.Error) {
    return 'src/assets/images/rovoflex/robot_picking_icon_black.png'
  }
  return 'src/assets/images/rovoflex/robot_picking_icon_yellow.png'
})
const manualPickingImagePath = computed(() => {
  return 'src/assets/images/rovoflex/manual_picking_icon.png'
})
const directionClass = computed(() => {
  if (!props.leftToRight) {
    return 'right-to-left'
  }
})
const isManualPickingRequested = computed(() => {
  return props.state === RovoflexState.ManualPickingRequested
})

const tgwIconPrimaryContrastLight = computed(() => {
  return 'rgba(255, 255, 255, 0.9)'
})
</script>

<template>
  <div class="rovoflex-to-manual" :class="directionClass">
    <img
      class="image-rovoflex"
      :class="{
        'is-manual-picking-requested': isManualPickingRequested,
      }"
      :src="rovoflexImagePath"
      :alt="rovoflexImagePath"
    />

    <Transition name="slide">
      <TgwIcon
        v-if="isManualPickingRequested"
        class="arrow-icon"
        icon="direction-up"
        size="48px"
        :color="tgwIconPrimaryContrastLight"
      />
    </Transition>
    <Transition name="scale">
      <div v-if="isManualPickingRequested" class="pulse-container">
        <div class="pulse-ring small" />
        <div class="pulse-ring large" />

        <img
          class="image-manual-picking"
          :src="manualPickingImagePath"
          :alt="manualPickingImagePath"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.rovoflex-to-manual {
  display: flex;
  align-items: center;

  &.right-to-left {
    flex-direction: row-reverse;

    .image-rovoflex {
      transform: scaleX(-1);
    }

    .arrow-icon {
      rotate: 270deg;
      margin-left: 0;
      margin-right: 28px;
    }
  }

  .arrow-icon {
    margin-left: 28px;
    rotate: 90deg;
  }

  .image-rovoflex {
    user-select: none;
    height: auto;
    width: auto;

    &.is-manual-picking-requested {
      opacity: 0.4;
    }
  }

  .image-manual-picking {
    user-select: none;
    height: auto;
    width: auto;
  }

  .pulse-container {
    position: relative;

    .pulse-ring {
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.9);
      border: 20px solid rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      opacity: 0;
      position: absolute;
      left: 7px;
      top: 7px;
      animation-duration: 2s;
      animation-iteration-count: infinite;
      animation-delay: 1s;

      &.small {
        animation-name: pulsate-small;
      }
      &.large {
        animation-name: pulsate-large;
      }
    }
  }

  @keyframes pulsate-small {
    0% {
      opacity: 0;
    }
    33.3% {
      opacity: 0.1;
      transform: scale(1);
    }
    66.6% {
      opacity: 0.1;
      transform: scale(1.1);
    }
    100% {
      transform: scale(1.2);
    }
  }

  @keyframes pulsate-large {
    0% {
      opacity: 0;
    }
    33.3% {
      opacity: 0.1;
      transform: scale(1);
    }
    66.6% {
      opacity: 0.1;
      transform: scale(1.4);
    }
    100% {
      transform: scale(1.8);
    }
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(30px);
  }

  .slide-enter-active {
    transition: all 0.4s ease;
  }

  .scale-enter-from,
  .scale-leave-to {
    opacity: 0;
    transform: scale(0.1);
  }

  .scale-enter-active {
    transition: all 0.4s ease 0.4s;
  }
}
</style>
