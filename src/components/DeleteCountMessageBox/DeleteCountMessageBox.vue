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

const { getTranslation } = useTranslations('delete-count-message-box')
const { getTranslation: getMessageBoxTranslation } =
  useTranslations('message-box')
const messageBoxRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)

const options = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('delete_count_title'),
    // description: getTranslation('delete_count_description'),
    dontShowAgain: true,
    okButton: {
      label: getTranslation('delete'),
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
  return await messageBoxRef.value?.show()
}

const getDescriptionText = (index: 0 | 1) => {
  const str: string = getTranslation('delete_count_description')
  return str.split(';')[index]
}

const descriptionFirst = computed(() => {
  return getDescriptionText(0)
})

const descriptionSecond = computed(() => {
  return getDescriptionText(1)
})

defineExpose({ showAndWait })
</script>

<template>
  <div class="delete-count-message-box">
    <TgwMessageBox
      ref="messageBoxRef"
      :options="options"
      :is-touch="true"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
    >
      <template #default>
        <div class="delete-count-message-box__body">
          <div class="delete-count-message-box__body-text">
            {{ descriptionFirst }}
          </div>
          <div class="delete-count-message-box__body-text">
            {{ descriptionSecond }}
          </div>
        </div>
      </template>
    </TgwMessageBox>
  </div>
</template>

<style scoped lang="scss">
.tgw-dialog {
  .delete-count-message-box__body {
    .delete-count-message-box__body-text {
      align-self: stretch;
      color: var(--tgw-text-secondary);
      text-align: center;
      font-family: Roboto;
      font-size: 21px;
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
    }
  }
}
</style>
