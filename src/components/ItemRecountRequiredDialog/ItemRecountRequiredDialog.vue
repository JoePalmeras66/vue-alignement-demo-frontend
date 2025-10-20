<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  isVisible: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:isVisible'])
const properties = toRefs(props)
const { getTranslation } = useTranslations('item-recount-required-dialog')
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
</script>

<template>
  <TgwDialog
    v-model="dialogVisible"
    align-center
    class="item-recount-required-dialog"
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
          icon="repeat"
          color="var(--tgw-status-warning-darken)"
        />
        <span class="dialog-header-text">{{ getTranslation('title') }}</span>
      </div>
    </template>
    <template #default>
      <div class="dialog-body">
        <span class="dialog-body-description">{{
          getTranslation('description1')
        }}</span>
        <span class="dialog-body-description fatty">{{
          getTranslation('description2')
        }}</span>
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

.item-recount-required-dialog {
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

      &.fatty {
        font-weight: 700;
      }
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
