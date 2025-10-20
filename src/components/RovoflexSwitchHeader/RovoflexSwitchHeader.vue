<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
import { RovoflexState } from '@/types/RovoflexState'

const props = defineProps<Props>()
const { getTranslation } = useTranslations('rovoflex-switch-header')
interface Props {
  switchToState:
    | RovoflexState.RovoflexPicking
    | RovoflexState.ManualPickingRequested
  headerText?: string
  switchFromError: boolean
}

const errorStateImage = computed(() => {
  if (props.switchFromError) {
    return 'status-error-circle'
  }
  return undefined
})

const headerTextComputed = computed(() => {
  if (props.headerText) {
    return props.headerText
  } else if (props.switchToState === RovoflexState.RovoflexPicking) {
    return getTranslation('rovoflex_picking')
  }
  return getTranslation('manual_picking')
})

const manualPickingImagePath = computed(() => {
  let imagePath = 'src/assets/images/rovoflex/manual_picking'
  if (!isDark.value) {
    imagePath += '_light.png'
  } else {
    imagePath += '_dark.png'
  }
  return imagePath
})

const robotPickingImagePath = computed(() => {
  let imagePath = 'src/assets/images/rovoflex/robot_picking'

  if (errorStateImage.value !== undefined) {
    imagePath += '_icon'
  }

  if (!isDark.value) {
    imagePath += '_light.png'
  } else {
    imagePath += '_dark.png'
  }
  return imagePath
})

const firstImagePath = computed(() => {
  if (props.switchToState === RovoflexState.RovoflexPicking) {
    if (errorStateImage.value !== undefined) {
      return errorStateImage.value
    }
    return manualPickingImagePath.value
  }
  return robotPickingImagePath.value
})

const secondImagePath = computed(() => {
  if (props.switchToState === RovoflexState.RovoflexPicking) {
    return robotPickingImagePath.value
  }
  return manualPickingImagePath.value
})

const getArrowColor = computed(() => {
  if (errorStateImage.value !== undefined) {
    return 'var(--tgw-icon-primary-contrast)'
  }

  return 'var(--tgw-primary)'
})

const highlightedPartsClasses = computed(() => {
  if (errorStateImage.value !== undefined) {
    return 'rovoflex-switch-header__tgw-highlighted switch-from-error'
  }

  return 'rovoflex-switch-header__tgw-highlighted'
})
</script>

<template>
  <div class="rovoflex-switch-header">
    <TgwHighlighted color="var(--tgw-primary)" :class="highlightedPartsClasses">
      {{ headerTextComputed }}</TgwHighlighted
    >
    <div class="image-container">
      <img
        v-if="errorStateImage === undefined"
        :src="firstImagePath"
        :alt="firstImagePath"
        class="first-image"
      />
      <TgwIcon
        v-else
        class="header__icon"
        icon="status-error-circle"
        size="80px"
        color="var(--tgw-icon-primary-contrast)"
      />
      <TgwIcon
        icon="direction-up"
        class="arrow"
        size="32px"
        :color="getArrowColor"
      />
      <img :src="secondImagePath" :alt="secondImagePath" class="second-image" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.rovoflex-switch-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;

  :deep(.rovoflex-switch-header__tgw-highlighted) {
    margin-bottom: 32px;
    font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 36px;
    line-height: 48px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--tgw-text-primary);

    .highlighted {
      color: var(--tgw-primary);
    }
  }

  :deep(.rovoflex-switch-header__tgw-highlighted.switch-from-error) {
    color: var(--tgw-text-primary-contrast);
  }

  .image-container {
    display: flex;
    align-items: center;
    column-gap: 19px;

    .first-image {
      width: 100%;
      height: 100%;
      opacity: 0.4;
    }

    .arrow {
      rotate: 90deg;
    }

    .second-image {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
