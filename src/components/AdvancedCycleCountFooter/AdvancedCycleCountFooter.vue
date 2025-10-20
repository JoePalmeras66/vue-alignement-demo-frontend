<script setup lang="ts">
import { AdvancedCycleCountButtonAction } from '@/types/AdvancedCycleCountButtonAction'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  disabledButtons: AdvancedCycleCountButtonAction[]
  hiddenButtons: AdvancedCycleCountButtonAction[]
}
const props = defineProps<Props>()
const emit = defineEmits<{
  buttonClicked: [action: AdvancedCycleCountButtonAction]
}>()
const { getTranslation } = useTranslations('advanced-cycle-count-footer')

const isButtonDisabled = (button: AdvancedCycleCountButtonAction) => {
  if (props.disabledButtons && props.disabledButtons.length > 0) {
    return props.disabledButtons.includes(button)
  }
  return false
}
const isButtonHidden = (button: AdvancedCycleCountButtonAction) => {
  if (props.hiddenButtons && props.hiddenButtons.length > 0) {
    return props.hiddenButtons.includes(button)
  }
  return false
}
const isDeleteScanButtonDisabled = computed(() => {
  return isButtonDisabled(AdvancedCycleCountButtonAction.delete_scan)
})
const isDeleteCountButtonDisabled = computed(() => {
  return isButtonDisabled(AdvancedCycleCountButtonAction.delete_count)
})
const isDeleteScanButtonHidden = computed(() => {
  return isButtonHidden(AdvancedCycleCountButtonAction.delete_scan)
})
const isDeleteCountButtonHidden = computed(() => {
  return isButtonHidden(AdvancedCycleCountButtonAction.delete_count)
})
const onButtonClicked = async (button: AdvancedCycleCountButtonAction) => {
  if (isButtonDisabled(button)) {
    return
  }
  emit('buttonClicked', button)
}
</script>

<template>
  <div class="advanced-cycle-count-footer">
    <IconButton
      plain
      type="primary"
      class="back-button"
      icon="arrow-left"
      @click="onButtonClicked(AdvancedCycleCountButtonAction.back)"
    />
    <IconButton
      :class="{ hidden: isDeleteScanButtonHidden }"
      plain
      type="error"
      class="delete-scan-button"
      :disabled="isDeleteScanButtonDisabled"
      icon="close"
      :text="getTranslation(AdvancedCycleCountButtonAction.delete_scan)"
      @click="onButtonClicked(AdvancedCycleCountButtonAction.delete_scan)"
    />
    <IconButton
      plain
      type="error"
      class="delete-count-button"
      :class="{ hidden: isDeleteCountButtonHidden }"
      :disabled="isDeleteCountButtonDisabled"
      icon="delete"
      :text="getTranslation(AdvancedCycleCountButtonAction.delete_count)"
      @click="onButtonClicked(AdvancedCycleCountButtonAction.delete_count)"
    />
  </div>
</template>

<style scoped lang="scss">
.advanced-cycle-count-footer {
  width: 100%;
  height: var(--pcots-footer-bottom-height);
  background-color: var(--tgw-bg-navbar);
  box-sizing: border-box;
  border-top: 1px solid var(--tgw-line-20);
  padding: 0 var(--pcots-outside-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .icon-button {
    :deep(.flex-container) {
      .tgw-icon.button-icon {
        --icon-button-icon-size: var(--pcots-footer-icon-size);
      }
      .button-text {
        font-size: var(--pcots-font-size-md);
        line-height: calc(
          var(--pcots-font-size-md) + var(--pcots-font-size-offset-md)
        );
      }
    }
  }

  .icon-button.back-button {
    left: var(--pcots-outer-margin);
    height: var(--pcots-footer-button-height);
    aspect-ratio: 1/1;
    border-width: 2px;
  }

  .delete-scan-button,
  .delete-count-button {
    height: var(--pcots-footer-button-height);
    width: 260px;
    border-width: 2px;

    &.hidden {
      visibility: hidden;
    }
  }
}
</style>
