<script setup lang="ts">
interface Props {
  text: string
}
const props = defineProps<Props>()
const highlightedTextParts = computed(() => {
  const parts = []
  const regex = /\[highlighted](.*?)\[\/highlighted]/g
  let match

  let lastIndex = 0
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(props.text))) {
    const start = match.index
    const end = regex.lastIndex
    const beforeText = props.text.substring(lastIndex, start)
    const highlightedText = props.text.substring(start + 13, end - 14)

    if (beforeText) {
      parts.push({ text: beforeText, highlighted: false })
    }

    if (highlightedText) {
      parts.push({ text: highlightedText, highlighted: true })
    }

    lastIndex = regex.lastIndex
  }

  const remainingText = props.text.substring(lastIndex)
  if (remainingText) {
    parts.push({ text: remainingText, highlighted: false })
  }

  return parts.map((part) => ({
    ...part,
    text: part.text
      .replace(/\[highlighted]/g, '')
      .replace(/\[\/highlighted]/g, ''),
  }))
})
</script>

<template>
  <div class="text-with-highlighted-parts">
    <span
      v-for="(part, index) in highlightedTextParts"
      :key="index"
      class="text"
      :class="{ highlighted: part.highlighted }"
    >
      {{ part.text }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.text-with-highlighted-parts {
  .text {
    font-family: Roboto, Helvetica, sans-serif;
    font-weight: 900;
    font-size: 40px;
    line-height: 47px;
    letter-spacing: 1px;
    color: var(--tgw-text-primary);
    user-select: none;

    &.highlighted {
      color: var(--tgw-primary);
    }
  }
}
</style>
