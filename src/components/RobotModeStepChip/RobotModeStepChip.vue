<script setup lang="ts">
import { RobotModeStepChipType } from '@/types/RobotModeStepChipType'
import { useTranslations } from '@/composables/useTranslations'

const props = defineProps<Props>()

const { getTranslation } = useTranslations('robot-mode-step-chip')

interface Props {
  chipType?: RobotModeStepChipType
}
const chipContent = computed(() => {
  let icon
  let text
  let color

  if (props.chipType === RobotModeStepChipType.monitor_position_error) {
    icon = 'status-error-circle'
    text = 'monitor_pos_error'
    color = 'var(--tgw-status-error)'
  } else {
    icon = ''
    text = 'monitor_pos_ok'
    color = 'var(--tgw-status-success-darken)'
  }

  return {
    icon,
    text,
    color,
  }
})

const renderIcon = computed(() => {
  return chipContent.value.icon !== undefined && chipContent.value.icon !== ''
})

const classes = computed(() => {
  return props.chipType === RobotModeStepChipType.monitor_position_error
    ? 'error'
    : 'ok'
})
</script>

<template>
  <div class="robot-mode-step-chip" :class="classes">
    <div class="robot-mode-step-chip__bg" />
    <TgwIcon
      v-if="renderIcon"
      class="chip-icon"
      :icon="chipContent.icon"
      :color="chipContent.color"
      size="24px"
    />
    <span class="chip-text">{{ getTranslation(chipContent.text) }}</span>
  </div>
</template>

<style scoped lang="scss">
.robot-mode-step-chip {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding-left: 24px;
  padding-right: 24px;
  height: 48px;
  border-radius: 32px;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .robot-mode-step-chip__bg {
    width: 100%;
    height: 100%;
    opacity: 0.1;
    position: absolute;
  }

  .chip-text {
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: Roboto, sans-serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  &.error {
    border: 2px solid var(--tgw-status-error);

    .robot-mode-step-chip__bg {
      background: var(--tgw-status-error-g);
      //background-color: #{'rgba(var(--tgw-status-error-g), 0.1)'};
    }

    .chip-text {
      color: var(--tgw-status-error);
    }
  }

  &.ok {
    border: 2px solid var(--tgw-status-success-darken);

    .robot-mode-step-chip__bg {
      background: var(--tgw-status-success-g);
    }

    .chip-text {
      color: var(--tgw-status-success-darken);
    }
  }
}
</style>
