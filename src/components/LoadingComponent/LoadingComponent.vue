<script setup lang="ts">
import { colorMode } from '@/composables/useTheme'

const loadingImage = computed(() => {
  if (colorMode.value === ThemeEnum.light) {
    return `src/assets/animations/loadingSpinner/loading_light.svg`
  } else {
    return `src/assets/animations/loadingSpinner/loading_dark.svg`
  }
})
</script>

<template>
  <div class="loading-component">
    <img
      :src="loadingImage"
      alt="loading animation svg"
      width="243"
      height="auto"
    />
  </div>
</template>

<style scoped lang="scss">
.loading-component {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
