<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  isVisible: boolean
  errorMessage?: string
}
const props = defineProps<Props>()
const emit = defineEmits(['update:isVisible'])
const properties = toRefs(props)
const { getTranslation } = useTranslations('item-scan-failed-dialog')

const dialogVisible = computed({
  get() {
    return properties.isVisible.value
  },
  set(newValue) {
    emit('update:isVisible', newValue)
  },
})

const closeDialog = () => {
  dialogVisible.value = false
}

const description = computed(() => {
  if (props.errorMessage && props.errorMessage !== '') {
    return props.errorMessage
  } else {
    return getTranslation('description')
  }
})
</script>

<template>
  <TgwDialog
    v-model="dialogVisible"
    class="item-scan-failed-dialog"
    :destroy-on-close="true"
    :show-close="false"
    :lock-scroll="false"
    width="720px"
    :smart-overflow="false"
    @close="closeDialog"
  >
    <template #header>
      <div class="dialog-header">
        <TgwIcon
          class="dialog-header-icon"
          icon="status-error-circle"
          color="var(--tgw-status-error)"
        />
        <span class="dialog-header-text">{{ getTranslation('title') }}</span>
      </div>
    </template>
    <template #default>
      <div class="dialog-body">
        <span class="dialog-body-description">{{ description }}</span>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <TgwButton type="primary" class="dialog-button" @click="closeDialog">
          {{ getTranslation('ok') }}
        </TgwButton>
      </div>
    </template>
  </TgwDialog>
</template>

<style scoped lang="scss">
:deep(.tgw-dialog) .tgw-dialog-header-icons {
  display: none;
}

.item-scan-failed-dialog {
  .dialog-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    .dialog-header-icon {
      --dialog-header-icon-size: 48px;
      width: var(--dialog-header-icon-size) !important;
      height: var(--dialog-header-icon-size) !important;
      margin-bottom: 24px;

      :deep(svg) {
        width: var(--dialog-header-icon-size);
        height: var(--dialog-header-icon-size);
      }
    }
    .dialog-header-text {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      font-weight: 700;
      font-size: 28px;
      line-height: 37px;
      letter-spacing: 1px;
      color: var(--tgw-text-primary);
    }
  }

  .dialog-body {
    .dialog-body-description {
      display: block;
      width: 100%;
      font-weight: 400;
      font-size: 21px;
      line-height: 150%;
      text-align: center;
      color: var(--tgw-text-secondary);
    }
  }

  .dialog-footer {
    .dialog-button {
      font-size: 24px;
      line-height: 28px;
      font-weight: 700;
      border-radius: 8px;
      width: 100%;
      height: 88px !important;
      text-transform: uppercase;
    }
  }
}
</style>

<style lang="scss">
.tgw-dialog.item-scan-failed-dialog {
  .tgw-dialog__header {
    padding: 32px 40px 16px;
    margin-right: 0;
  }

  .tgw-dialog__body {
    padding: 0 40px;
  }

  .tgw-dialog__footer {
    padding: 32px 40px;
  }
}
</style>
