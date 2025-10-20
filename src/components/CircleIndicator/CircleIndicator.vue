<script setup lang="ts">
interface Props {
  backgroundColor: string
  icon: string
  iconSize?: string
  color?: string
  secondaryColor?: string
  text?: string | number
}
defineProps<Props>()
</script>

<template>
  <div class="circle-indicator-container">
    <TgwIcon
      :icon="icon"
      :size="iconSize"
      :color="color"
      :secondary-color="secondaryColor"
    />
    <span v-if="text !== undefined" class="circle-indicator-text">{{
      text
    }}</span>
  </div>
</template>

<style scoped lang="scss">
.circle-indicator-container {
  background: v-bind(backgroundColor);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--tgw-dropshadow-medium);

  .circle-indicator-text {
    font-size: 32px;
    font-weight: 600;
    color: v-bind(color);
  }
}
</style>
