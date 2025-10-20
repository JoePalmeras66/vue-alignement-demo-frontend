<script setup lang="ts">
import { TgwMessageBox } from '@tgw-components/web'
import { MessageBoxOptionType } from '@tgw-components/core'
import { useTranslations } from '@/composables/useTranslations'
import { MessageBoxType } from '@/types/MessageBoxType'

interface Props {
  appendToBody?: boolean
}
withDefaults(defineProps<Props>(), {
  appendToBody: true,
})
const { getTranslation } = useTranslations('leave-page-dialog')
const messageBoxRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)
const options = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('title'),
    description: getTranslation('description'),
    okButton: {
      label: getTranslation('go_back'),
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

defineExpose({ showAndWait })
</script>

<template>
  <div class="leave-page-dialog">
    <TgwMessageBox
      ref="messageBoxRef"
      :options="options"
      :is-touch="true"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
    />
  </div>
</template>
