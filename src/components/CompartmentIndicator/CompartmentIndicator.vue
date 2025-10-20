<script setup lang="ts">
interface Props {
  small: boolean
  scannedAmount?: number
}
const props = defineProps<Props>()

const classes = computed(() => {
  return {
    'multi-item': props.scannedAmount !== undefined,
    small: props.small,
  }
})
</script>

<template>
  <div class="compartment-scanned-indicator" :class="classes">
    <TgwIcon icon="tick" color="var(--tgw-status-success-darken)" />
    <span v-if="scannedAmount !== undefined" class="scanned-amount">{{
      scannedAmount
    }}</span>
  </div>
</template>

<style scoped lang="scss">
.compartment-scanned-indicator {
  --indicator-size: 60px;
  --icon-button-icon-size: 24px;
  position: absolute;
  top: 16px;
  right: 16px;
  width: var(--indicator-size);
  height: var(--indicator-size);
  background-color: var(--tgw-bg-30);
  border-radius: 100%;
  box-shadow: var(--tgw-dropshadow-soft);
  border: 0.5px solid var(--tgw-line-10);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &.small {
    --indicator-size: 40px;
    --icon-button-icon-size: 24px;

    &.multi-item {
      --icon-button-icon-size: 16px;
    }

    .scanned-amount {
      font-size: 18px;
      line-height: 21px;
    }
  }

  .scanned-amount {
    font-weight: 700;
    font-size: 26px;
    line-height: 28px;
    color: var(--tgw-status-success-darken);
    margin-right: 2px;
  }

  :deep(.tgw-icon) {
    width: var(--icon-button-icon-size) !important;
    height: var(--icon-button-icon-size) !important;

    svg {
      width: var(--icon-button-icon-size);
      height: var(--icon-button-icon-size);
    }
  }
}
</style>
