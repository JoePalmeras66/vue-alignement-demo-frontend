<script setup lang="ts">
interface Props {
  stepNumber: number
  imagePath: string
  hintText: string
}
defineProps<Props>()
</script>

<template>
  <div class="enter-robot-mode-step">
    <span class="step_number">0{{ stepNumber }}</span>
    <slot>
      <img :src="imagePath" :alt="imagePath" class="step_image" />
      <div class="hint-text-container">
        <TgwHighlighted
          color="var(--tgw-primary)"
          class="hint-text-container__tgw-highlighted"
          >{{ hintText }}</TgwHighlighted
        >
      </div>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.enter-robot-mode-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  .step_number {
    font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 120px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--tgw-primary);
    opacity: 0.2;
    user-select: none;
    margin-top: 40px;
  }

  .step_image {
    width: auto;
    height: auto;
  }

  .hint-text-container {
    display: flex;
    margin-bottom: 108px;
    flex-direction: column;
    gap: 32px;

    :deep(.hint-text-container__tgw-highlighted) {
      font-family: Roboto, Helvetica, sans-serif;
      font-weight: 900;
      font-size: 40px;
      line-height: 47px;
      letter-spacing: 1px;
      color: var(--tgw-text-primary);
      user-select: none;

      .highlighted {
        color: var(--tgw-primary);
      }
    }
  }
}
</style>
