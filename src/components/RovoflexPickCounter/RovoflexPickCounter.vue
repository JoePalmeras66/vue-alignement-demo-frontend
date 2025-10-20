<script setup lang="ts">
interface Props {
  currentCount: number
  targetCount: number
}
const props = defineProps<Props>()

const percentage = computed(() => {
  if (props.currentCount > props.targetCount) {
    return 100
  }
  return (props.currentCount / props.targetCount) * 100
})
</script>

<template>
  <div class="rovoflex-pick-counter">
    <div class="rovoflex-pick-counter__label">
      <span class="rovoflex-pick-counter__current-count">{{
        currentCount
      }}</span>
      <span class="rovoflex-pick-counter__target-count"
        >/{{ targetCount }}</span
      >
    </div>
    <ElProgress
      class="rovoflex-pick-counter__progress-bar"
      :percentage="percentage"
      :stroke-width="24"
      :show-text="false"
    />
  </div>
</template>

<style scoped lang="scss">
.rovoflex-pick-counter {
  display: flex;
  flex-direction: column;
  align-items: center;

  .rovoflex-pick-counter__label {
    display: flex;
    justify-content: center;
    align-items: center;

    span {
      font-size: 72px;

      &.rovoflex-pick-counter__current-count {
        color: var(--tgw-text-primary);
        font-weight: 900;
      }

      &.rovoflex-pick-counter__target-count {
        color: var(--tgw-text-sub);
        font-weight: 500;
      }
    }
  }

  :deep(.rovoflex-pick-counter__progress-bar) {
    width: 400px;

    .el-progress-bar {
      .el-progress-bar__outer {
        border-radius: 4px;
        background: var(--pcots-rovoflex-pick-counter-progressbar-outer);
        box-shadow: inset 0 4px 4px rgba(0, 0, 0, 0.24);
      }
      .el-progress-bar__inner {
        background: var(--tgw-status-success-lighten-g);
        border-radius: 4px 0 0 4px;
      }
    }
  }
}
</style>
