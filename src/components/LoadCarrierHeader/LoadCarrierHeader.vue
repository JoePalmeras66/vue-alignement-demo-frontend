<script setup lang="ts">
import { Position } from '@/types/Position'
import { useTranslations } from '@/composables/useTranslations'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { LoadCarrierType } from '@/types/Api/pcots/PcotsApiModel'

interface Props {
  pcotsLocation: PcotsLocationEnum
  loadCarrier?: LoadCarrierType
  position: Position
  headerData?: string
  noRead: boolean
}
const props = defineProps<Props>()
const { getTranslation } = useTranslations('load-carrier-header')
const headerText = computed((): string => {
  return getTranslation(PcotsLocationEnum[props.pcotsLocation].toLowerCase())
})
const headerInfoText = computed((): string => {
  if (props.loadCarrier && props.headerData) {
    return props.headerData
  }
  return ''
})
const headerInfoIcon = computed((): string => {
  if (props.pcotsLocation === PcotsLocationEnum.Source) {
    return 'load-carrier-on-its-way'
  }
  return 'load-carrier-send'
})
const headerItemAlignment = computed((): Position => {
  return props.position
})
defineExpose({ headerInfoIcon })
</script>

<template>
  <div class="load-carrier-header">
    <div class="header">
      <LoadCarrierHeaderItem
        v-if="headerInfoText && !noRead"
        class="header-item"
        :icon="headerInfoIcon"
        :class="headerItemAlignment"
        :info-text="headerInfoText"
      />
      <span class="header-text" :class="headerItemAlignment">
        {{ headerText }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.load-carrier-header {
  .header {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: var(--pcots-load-carrier-headline-height);
    width: 100%;

    .header-item {
      align-self: flex-start;

      &.left {
        position: absolute;
        top: -3px;
        left: 0;
      }

      &.right {
        position: absolute;
        top: -3px;
        right: 0;
        order: 3;
      }
    }

    .header-text {
      font-weight: 600;
      font-size: 36px;
      line-height: 36px;
      text-align: center;
      text-transform: uppercase;
      color: var(--tgw-text-secondary);
      user-select: none;

      &-bold {
        user-select: text;
        color: var(--tgw-text-primary);
        font-weight: 700;

        &.no-read {
          color: var(--tgw-status-error);
        }
      }
    }
  }
}
</style>
