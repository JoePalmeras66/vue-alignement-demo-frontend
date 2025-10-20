<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const { getTranslation } = useTranslations('not_counted')
const notCountedText = computed(() => {
  return getTranslation('not_counted')
})

const fallbackIllustrationBackground = computed(() => {
  if (isDark.value) {
    return `src/assets/fallback_bg_decoration-dark.svg`
  } else {
    return `src/assets/fallback_bg_decoration-light.svg`
  }
})
</script>

<template>
  <div class="not-counted">
    <img
      class="fallback-bg"
      :src="fallbackIllustrationBackground"
      :alt="fallbackIllustrationBackground"
    />
    <TgwIcon
      class="not-counted__image"
      icon="finger-touch"
      color="var(--tgw-line-30)"
    />
    <span class="not-counted__text">{{ notCountedText }}</span>
  </div>
</template>

<style scoped lang="scss">
.not-counted {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 58px;
  height: 100%;
  position: relative;

  .fallback-bg {
    position: absolute;
    height: 100%;
    width: auto;
    margin: auto;
    left: 32px;
    right: 0;
  }
  .not-counted__image {
    --no-content-icon-size: 130px;
    width: var(--no-content-icon-size) !important;
    height: var(--no-content-icon-size) !important;

    :deep(svg) {
      width: var(--no-content-icon-size);
      height: var(--no-content-icon-size);
    }
  }

  .not-counted__text {
    color: var(--tgw-icon-fallback);
    font-size: 28px;
    line-height: 33px;
    user-select: none;
    text-align: center;
  }
}
</style>
