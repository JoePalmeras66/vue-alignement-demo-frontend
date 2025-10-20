<script setup lang="ts">
import { TgwMessageBox } from '@tgw-components/web'
import { MessageBoxOptionType } from '@tgw-components/web/dist/packages/core/src'
import { useTranslations } from '@/composables/useTranslations'
import { MessageBoxType } from '@/types/MessageBoxType'

interface Props {
  appendToBody?: boolean
}
withDefaults(defineProps<Props>(), {
  appendToBody: true,
})

const { getTranslation } = useTranslations('switch-to-robot-mode-dialog')
const messageBoxRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)

const options = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('switch_to_robot_mode'),
    okButton: {
      label: getTranslation('switch'),
      type: 'primary',
    },
    cancelButton: {
      label: getTranslation('cancel'),
      type: 'default',
    },
    closeIcon: false,
  } as MessageBoxOptionType
})

const showAndWait = async () => {
  return await messageBoxRef?.value?.show()
}

defineExpose({
  showAndWait,
})
</script>

<template>
  <TgwMessageBox
    ref="messageBoxRef"
    class="switch-to-robot-mode-dialog"
    :options="options"
    :is-touch="true"
    :close-on-click-modal="false"
    width="720px"
    :append-to-body="appendToBody"
  >
    <span class="switch-to-robot-mode-dialog__description">
      {{ getTranslation('description1') }}
    </span>
    <span class="switch-to-robot-mode-dialog__description highlighted">
      {{ getTranslation('description2') }}
    </span>
  </TgwMessageBox>
</template>

<style scoped lang="scss">
.switch-to-robot-mode-dialog {
  .switch-to-robot-mode-dialog__description {
    margin-top: 24px;
    font-size: 21px;
    color: var(--tgw-text-secondary);

    &.highlighted {
      margin-top: 32px;
      font-weight: 600;
    }
  }
}
</style>

<style lang="scss">
.tgw-component-overlay {
  .tgw-dialog.tgw-message-box.switch-to-robot-mode-dialog {
    .tgw-dialog__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 40px;
    }
  }
}
</style>
