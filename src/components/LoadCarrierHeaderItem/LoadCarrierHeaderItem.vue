<script setup lang="ts">
interface Props {
  color?: string
  icon: string
  infoText: string
}
withDefaults(defineProps<Props>(), { color: 'var(--tgw-icon-secondary)' })
</script>

<template>
  <div class="load-carrier-info-item">
    <TgwIcon class="info-icon" :icon="icon" :color="color" />
    <span class="info-text">{{ infoText }}</span>
  </div>
</template>

<style scoped lang="scss">
.load-carrier-info-item {
  display: flex;
  align-items: center;
  .info-icon {
    transform: translateY(-2px);
    --icon-button-icon-size: 44px;
    width: var(--icon-button-icon-size) !important;
    height: var(--icon-button-icon-size) !important;

    :deep(svg) {
      width: var(--icon-button-icon-size);
      height: var(--icon-button-icon-size);
    }
  }

  .info-text {
    margin-left: 16px;
    font-size: 32px;
    color: var(--tgw-text-secondary);
    font-weight: 700;
    line-height: 24px;
    user-select: none;
  }
}
</style>
