<script setup lang="ts">
interface Props {
  icon?: string
  iconColor?: string
  text?: string
  iconAlignment?: 'top' | 'left'
  plain?: boolean
  disabled?: boolean
  type: 'accent' | 'error' | 'primary'
}
const props = withDefaults(defineProps<Props>(), {
  iconAlignment: 'top',
  plain: false,
  disabled: false,
})
const buttonText = computed((): string | undefined => {
  return props.text
})
const iconColorWithDefault = computed(() => {
  if (props.iconColor) {
    return props.iconColor
  }

  if (props.type === 'error') {
    return 'var(--tgw-status-error)'
  }

  if (!props.plain) {
    return 'var(--tgw-icon-primary-contrast)'
  }
  return 'var(--tgw-primary)'
})
const hasText = computed((): boolean => {
  return props.text !== '' && props.text !== undefined
})
const hasIconColor = computed((): boolean => {
  return iconColorWithDefault.value !== undefined
})
const colorCssVar = computed(() => {
  if (iconColorWithDefault.value) {
    return `--pcots-icon-button-color: ${iconColorWithDefault.value};`
  }
})
</script>

<template>
  <TgwButton
    class="icon-button"
    :plain="plain"
    :disabled="disabled"
    :type="type"
  >
    <div class="flex-container" :class="iconAlignment">
      <TgwIcon
        v-if="icon"
        :style="colorCssVar"
        class="button-icon"
        :class="{ 'no-text': !hasText, 'has-icon-color': hasIconColor }"
        :color="iconColor"
        :icon="icon"
      />
      <span class="button-text">
        {{ buttonText }}
      </span>
    </div>
  </TgwButton>
</template>

<style scoped lang="scss">
.icon-button {
  font-size: 28px;
  font-weight: 700;
  line-height: 28px;
  border-radius: 8px;
  text-align: center;
  outline-width: 2px;

  .flex-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &.left {
      flex-direction: row;
      justify-content: center;

      .button-icon {
        --icon-button-icon-size: 23px;
        margin-bottom: 0;
        margin-right: 12px;
      }
    }

    .button-text {
      white-space: pre-line;
    }

    .button-icon {
      margin-bottom: 8px;
      --icon-button-icon-size: 48px;
      width: var(--icon-button-icon-size) !important;
      height: var(--icon-button-icon-size) !important;

      :deep(svg) {
        width: var(--icon-button-icon-size);
        height: var(--icon-button-icon-size);
      }

      &.has-icon-color {
        :deep(svg path) {
          fill: var(--pcots-icon-button-color) !important;
          background: var(--tgw-icon-);
        }
      }

      &.no-text {
        margin-bottom: 0;
      }
    }
  }
}

.icon-button + .icon-button {
  margin-left: 48px;
}
</style>
