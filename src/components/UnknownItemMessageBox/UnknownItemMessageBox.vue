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

const { getTranslation } = useTranslations('unknown-item-message-box')
const { getTranslation: getMessageBoxTranslation } =
  useTranslations('message-box')
const messageBoxRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)
const options = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('unknown_item_title'),
    description: getTranslation('unknown_item_description'),
    okButton: {
      label: getMessageBoxTranslation('ok'),
      type: 'primary',
    },
    cancelButton: {
      hide: true,
    },
    closeIcon: false,
    dontShowAgain: true,
  } as MessageBoxOptionType
})

const showAndWait = async () => {
  return await messageBoxRef?.value?.show()
}

defineExpose({ showAndWait })
</script>

<template>
  <TgwMessageBox ref="messageBoxRef" :options="options" />
  <div class="unknown-item-message-box">
    <TgwMessageBox
      ref="messageBoxRef"
      :options="options"
      :is-touch="true"
      :append-to-body="appendToBody"
    />
  </div>
</template>

<style scoped lang="scss"></style>
