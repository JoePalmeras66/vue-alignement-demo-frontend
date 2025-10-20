<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const { getTranslation } = useTranslations('troubleshooting.header')
</script>

<template>
  <div class="troubleshooting-header">
    <h1 class="heading">
      {{ getTranslation('report_problem') }}
    </h1>
    <span class="sub-heading"> {{ getTranslation('sub_heading') }} </span>
  </div>
</template>

<style scoped lang="scss">
.troubleshooting-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 14px 24px;

  .heading {
    font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
    font-weight: 700;
    font-size: var(--pcots-font-size-lg);
    line-height: 28px;
    color: var(--tgw-text-primary);
    text-transform: uppercase;
    margin: 12px 0;
  }

  .sub-heading {
    font-size: 22px;
    line-height: 36px;
    text-align: center;
    color: var(--tgw-text-secondary);
  }
}
</style>
