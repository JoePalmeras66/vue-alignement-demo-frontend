<script setup lang="ts">
import { ScanButtonAction } from '@/types/ScanButtonAction'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  disabledButtons: ScanButtonAction[]
}
const props = defineProps<Props>()
const emit = defineEmits<{
  buttonClicked: [scanButtonAction: ScanButtonAction]
}>()
const { getTranslation } = useTranslations('scan-footer')
const buttonClicked = (scanButtonAction: ScanButtonAction) => {
  emit('buttonClicked', scanButtonAction)
}
const isBackButtonDisabled = computed((): boolean => {
  return props.disabledButtons.includes(ScanButtonAction.back)
})
const isCreateButtonDisabled = computed((): boolean => {
  return props.disabledButtons.includes(ScanButtonAction.create_scan)
})
const isDeleteButtonDisabled = computed((): boolean => {
  return props.disabledButtons.includes(ScanButtonAction.delete_scan)
})
</script>

<template>
  <div class="scan-footer">
    <div class="content">
      <div class="content-left">
        <IconButton
          plain
          type="primary"
          class="back-button"
          icon="arrow-left"
          :disabled="isBackButtonDisabled"
          @click="buttonClicked(ScanButtonAction.back)"
        />
      </div>
      <div class="content-mid">
        <IconButton
          type="primary"
          class="create-scan-button"
          icon="add"
          :disabled="isCreateButtonDisabled"
          :text="getTranslation(ScanButtonAction.create_scan)"
          @click="buttonClicked(ScanButtonAction.create_scan)"
        />
        <IconButton
          type="error"
          plain
          class="delete-scan-button"
          icon="delete"
          :disabled="isDeleteButtonDisabled"
          :text="getTranslation(ScanButtonAction.delete_scan)"
          @click="buttonClicked(ScanButtonAction.delete_scan)"
        />
      </div>
      <div class="content-right" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.scan-footer {
  height: var(--pcots-footer-bottom-height);
  background-color: var(--tgw-bg-navbar);
  box-sizing: border-box;
  border-top: 1px solid var(--tgw-line-20);
  padding: 0 var(--pcots-outside-padding);

  .content {
    height: 100%;
    display: flex;
    align-items: center;

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

    .content-left {
      flex: 1;

      .back-button {
        left: var(--pcots-outer-margin);
        height: var(--pcots-footer-button-height);
        aspect-ratio: 1/1;
        border-width: 2px;
      }
    }

    .content-mid {
      display: flex;
      justify-content: center;
      flex: 2;

      .create-scan-button,
      .delete-scan-button {
        width: 100%;
        max-width: 276px;
        height: var(--pcots-footer-button-height);
      }
    }

    .content-right {
      flex: 1;
    }
  }
}
</style>
