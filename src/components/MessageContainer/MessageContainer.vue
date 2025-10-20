<script setup lang="ts">
interface Props {
  messageText?: string
}
const props = defineProps<Props>()

const displayText = computed(() => {
  return props.messageText ?? ''
})
</script>

<template>
  <div class="message-container">
    <TgwHighlighted color="var(--tgw-primary)" class="message-text">
      {{ displayText }}
    </TgwHighlighted>
  </div>
</template>

<style scoped lang="scss">
.message-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  :deep(.message-text) {
    font-size: 72px;
    line-height: 84px;
    font-weight: 400;
    font-family: Roboto, Helvetica, sans-serif;
    letter-spacing: 1px;
    color: var(--tgw-text-primary);
    user-select: none;

    .highlighted {
      font-weight: 700;
      color: var(--tgw-primary);
    }
  }
}
</style>
