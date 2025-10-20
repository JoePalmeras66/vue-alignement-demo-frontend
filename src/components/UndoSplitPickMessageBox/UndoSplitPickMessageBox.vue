<script setup lang="ts">
import { TgwMessageBox } from '@tgw-components/web'
import { MessageBoxOptionType } from '@tgw-components/web/dist/packages/core/src'
import { MessageBoxType } from '@/types/MessageBoxType'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  appendToBody?: boolean
}
withDefaults(defineProps<Props>(), {
  appendToBody: true,
})

const { getTranslation } = useTranslations('undo-split-pick-message-box')
const { getTranslation: getMessageBoxTranslation } =
  useTranslations('message-box')
const messageBoxRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)
const options = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('undo_split_pick_title'),
    description: getTranslation('undo_split_pick_description'),
    okButton: {
      label: getMessageBoxTranslation('confirm'),
      type: 'primary',
    },
    cancelButton: {
      label: getMessageBoxTranslation('cancel'),
      type: 'default',
    },
    closeIcon: false,
  } as MessageBoxOptionType
})

const showAndWait = async () => {
  return await messageBoxRef?.value?.show()
}

defineExpose({ showAndWait })
</script>

<template>
  <div class="undo-split-pick-message-box">
    <TgwMessageBox
      ref="messageBoxRef"
      :options="options"
      :is-touch="true"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
    />
  </div>
</template>
