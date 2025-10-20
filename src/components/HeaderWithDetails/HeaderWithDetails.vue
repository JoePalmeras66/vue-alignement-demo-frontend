<script setup lang="ts">
interface Props {
  text: string
  subTexts: string[]
}
defineProps<Props>()
</script>

<template>
  <div class="header-with-details">
    <h1 class="header-text">{{ text }}</h1>
    <div class="sub-text-items">
      <div v-for="subText in subTexts" :key="subText" class="sub-text-item">
        <span class="sub-text-item__text">{{ subText }}</span>
        <div
          v-if="subTexts.indexOf(subText) < subTexts.length - 1"
          class="sub-text-item__dot"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-with-details {
  display: flex;
  flex-direction: column;
  align-items: center;

  .header-text {
    color: var(--tgw-text-primary);
    font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 36px;
    line-height: 48px;
    letter-spacing: 1px;
    margin: 32px 0 16px 0;
    user-select: none;
  }

  .sub-text-items {
    display: flex;

    .sub-text-item {
      display: flex;
      align-items: center;

      .sub-text-item__text {
        color: var(--tgw-text-sub);
        font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
        font-weight: 700;
        font-size: 24px;
        line-height: 28px;
        letter-spacing: 1px;
        user-select: none;
      }

      .sub-text-item__dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--tgw-icon-sub);
        margin: 0 16px;
      }
    }
  }
}
</style>
