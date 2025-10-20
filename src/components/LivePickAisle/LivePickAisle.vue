<script setup lang="ts">
import type { Ref, computed } from 'vue'
import { PropsLivePickLoadCarrier } from '@/components/LivePickLoadCarrier/LivePickLoadCarrier.vue'

const props = defineProps<{
  loadCarriers: PropsLivePickLoadCarriers[]
}>()

export interface PropsLivePickLoadCarriers {
  ref: Ref<any>
  propsLivePickLoadCarrier: PropsLivePickLoadCarrier
}

/* If you ever want multi-column, make this a prop and adjust rows = ceil(count/columns) */
const columns = 1
const rows = computed(() =>
  Math.max(1, Math.ceil(props.loadCarriers.length / columns))
)

/**
 * Map rows -> (width, aspect ratio) using your table:
 * rows | aspect-ratio (h/w) | width    |  gap
 * 1    |    268/400         | 400      |   0
 * 2    |    67/100          | 400      |   40
 * 3    |    204.00/304.48   | 304.478  |   40
 * 4    |    149.0/222.39    | 222.388  |   32
 * 5    |    112.80/168.36   | 168.358  |   32
 *
 * For rows > 5 we clamp to the 5-row config (can be changed if needed)
 */
const cardConfig = computed(() => {
  switch (true) {
    case rows.value === 1:
      return { width: 400, aspectRatio: 0.67, gap: 0 }
    case rows.value === 2:
      return { width: 400, aspectRatio: 0.67, gap: 40 }
    case rows.value === 3:
      return { width: 304.478, aspectRatio: 0.669999146, gap: 40 }
    case rows.value === 4:
      return { width: 222.388, aspectRatio: 0.67000018, gap: 32 }
    case rows.value === 5:
      return { width: 168.358, aspectRatio: 0.669992872, gap: 32 }
  }
  return { width: 168.358, aspectRatio: 0.669992872, gap: 32 }
})
</script>

<template>
  <div
    class="live-pick-aisle"
    :style="{
      '--lc-count': String(loadCarriers.length),
      '--lc-columns': String(columns),
      '--lc-rows': String(rows),
      '--lc-card-width': `${cardConfig.width}px`,
      '--lc-aspect-ratio': `${cardConfig.aspectRatio}`,
      '--lc-card-gap': `${cardConfig.gap}px`,
    }"
  >
    <LivePickLoadCarrier
      v-for="(carrier, sectorNumber) in loadCarriers"
      :key="sectorNumber"
      :ref="carrier.ref"
      class="load-carrier"
      v-bind="carrier.propsLivePickLoadCarrier"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/load-carrier' as *; /* import shared SCSS partial */

.live-pick-aisle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--lc-card-gap);
  padding: 48px 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;

  .live-pick-aisle-item {
    /* make the child .load-carrier participate as the flex item */
    display: contents;
    /* remove any visual box here, since it won't render with display: contents */
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  // Override .load-carrier sizing with CSS variables
  .load-carrier {
    .content {
      /* Width from rows mapping */
      width: var(--lc-card-width, 100%);

      /* Height computed from width and aspect-ratio */
      height: calc(var(--lc-card-width, 100%) * var(--lc-aspect-ratio));
    }
  }
}
</style>
