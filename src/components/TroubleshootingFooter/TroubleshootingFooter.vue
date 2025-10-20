<script setup lang="ts">
import { TroubleshootingButtonAction } from '@/types/TroubleshootingButtonAction'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  disabledButtons: TroubleshootingButtonAction[]
  overallSelectedProblems: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  actionButtonClicked: [buttonAction: TroubleshootingButtonAction]
}>()

const { getTranslation } = useTranslations('troubleshooting.footer')

const disableBackButton = computed(() => {
  return props.disabledButtons.includes(TroubleshootingButtonAction.back)
})

const disableSaveButton = computed(() => {
  return props.disabledButtons.includes(TroubleshootingButtonAction.save)
})

const overallSelectedProblemsText = computed(() => {
  return getTranslation('n_problems', props.overallSelectedProblems)
})

const buttonClicked = async (buttonAction: TroubleshootingButtonAction) => {
  emit('actionButtonClicked', buttonAction)
}
</script>

<template>
  <footer class="troubleshooting-footer">
    <div class="content-left">
      <IconButton
        type="primary"
        plain
        class="back-button"
        icon="arrow-left"
        :disabled="disableBackButton"
        @click="buttonClicked(TroubleshootingButtonAction.back)"
      />
    </div>
    <div class="content-mid">
      <IconButton
        icon="save"
        type="primary"
        class="save-button"
        :text="getTranslation('save')"
        :disabled="disableSaveButton"
        @click="buttonClicked(TroubleshootingButtonAction.save)"
      />
    </div>
    <div class="content-right">
      <div v-if="overallSelectedProblems > 0" class="selected-problems">
        <TgwIcon
          icon="status-warning-triangle"
          size="48"
          color="var(--tgw-primary)"
        />
        <span>{{ overallSelectedProblemsText }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.troubleshooting-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--tgw-bg-navbar);
  width: 100%;
  max-height: var(--pcots-footer-height);
  height: var(--pcots-footer-bottom-height);
  border-top: 1px solid var(--tgw-line-20);
  box-sizing: border-box;
  padding: 0 var(--pcots-outside-padding);

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
      height: var(--pcots-footer-button-height) !important;
      aspect-ratio: 1/1;
      border-width: 2px;
    }
  }

  .content-mid {
    display: flex;
    justify-content: center;
    flex: 2;
    .save-button {
      height: var(--pcots-footer-button-height) !important;
      width: 100%;
      max-width: 400px;
    }
  }

  .content-right {
    flex: 1;
    .selected-problems {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 28px;
      line-height: 31px;
      font-weight: 700;
      color: var(--tgw-text-primary);
      span {
        margin-left: 2px;
      }
    }
  }
}
</style>
