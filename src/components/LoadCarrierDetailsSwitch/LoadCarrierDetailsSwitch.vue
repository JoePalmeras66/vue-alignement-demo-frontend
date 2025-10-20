<script setup lang="ts">
import { LoadCarrierDetailsPageEnum } from '@/types/LoadCarrierDetailsPageEnum'

const modelValue = defineModel<LoadCarrierDetailsPageEnum>()
const { getTranslation } = useTranslations('load-carrier-details-switch')

const onClick = (value: LoadCarrierDetailsPageEnum) => {
  if (modelValue.value === value) {
    return
  }
  modelValue.value = value
}
</script>

<template>
  <div class="load-carrier-details-switch">
    <span
      v-for="pageName in LoadCarrierDetailsPageEnum"
      :key="pageName"
      class="toggle-option"
      :class="{
        active: modelValue === pageName,
      }"
      @click="onClick(pageName)"
      >{{ getTranslation(pageName) }}</span
    >
  </div>
</template>

<style scoped lang="scss">
.load-carrier-details-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--tgw-bg-40);
  box-shadow: var(--tgw-dropshadow-soft);
  padding: 12px;
  height: var(--pcots-footer-button-height);
  border-radius: 100px;
  box-sizing: border-box;
  user-select: none;

  .toggle-option {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 40px;
    line-height: 46px;
    height: calc(var(--pcots-footer-button-height) - 24px);
    padding: 0 36px;
    border-radius: 100px;
    color: var(--tgw-primary);
    cursor: pointer;

    &.active {
      background: var(--tgw-primary-g);
      color: var(--tgw-text-primary-contrast);
      box-shadow: var(--tgw-innershadow-clicked);
      cursor: not-allowed;
    }
  }
}
</style>
