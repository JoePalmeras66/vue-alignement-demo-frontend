<script setup lang="ts">
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { CycleCountState } from '@/types/CycleCountState'
import { CompartmentType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

const props = withDefaults(defineProps<Props>(), { state: 'none' })
const emit = defineEmits<{
  compartmentClicked: [compartment: CompartmentType]
}>()
const { getTranslatedText } = useTextTranslator()
const {
  isCompartmentEmpty,
  isCompartmentCounted,
  getStockFromCompartment,
  isUnknownItem,
  getItemNumberDisplay,
} = useApiDataHelper()
interface Props {
  task?: TaskType
  compartment: CompartmentType
  state?: 'none' | 'active' | 'disable_selection'
  isMultiItem: boolean
  isCycleCount?: boolean
  showQuantity?: boolean
  compartmentCount: number
}
const isCurrentCompartmentEmpty = computed(() => {
  if (props.isCycleCount && !isCompartmentCounted(props.compartment)) {
    // In cycle counting we want to display only compartment data when it was counted before
    return true
  }
  return isCompartmentEmpty(props.compartment)
})

const stock = computed(() => {
  if (props.compartment) {
    return getStockFromCompartment(props.compartment, props.task)
  }
})
const item = computed(() => {
  return stock.value?.item
})
const isItemUnknown = computed(() => {
  return isUnknownItem(item.value)
})

const quantityDisplayText = computed(() => {
  if (!isCurrentCompartmentEmpty.value) {
    if (
      props.isCycleCount &&
      props.compartment.cycleCountState === CycleCountState.inProgress &&
      props.compartment.countedQuantity !== undefined &&
      props.compartment.countedQuantity !== null &&
      props.compartment.countedQuantity > 0
    ) {
      // When cycle counting is in progress we want to display the counted quantity
      return `${props.compartment.countedQuantity}`
    }
    return `${stock.value?.quantity}`
  }
})

const itemName = computed(() => {
  if (!isCurrentCompartmentEmpty.value) {
    return getTranslatedText(item.value?.name)
  }
})

const itemNumber = computed(() => {
  if (!isCurrentCompartmentEmpty.value) {
    return getItemNumberDisplay(item.value?.id)
  }
})

const hasImages = computed(() => {
  if (!isCurrentCompartmentEmpty.value && item.value?.images) {
    return item.value?.images.length > 0
  }
})

const firstImageUrl = computed(() => {
  if (hasImages.value && props.compartment && item.value?.images) {
    return item.value?.images[0].url
  }
})

const classes = computed(() => {
  let classes = ''

  if (props.state === 'disable_selection') {
    return 'disable-selection'
  }

  if (props.isMultiItem) {
    classes += 'is-multi-item '
  }
  if (props.state === 'active') {
    classes += `${props.state} `
  }
  if (!isCurrentCompartmentEmpty.value) {
    classes += 'filled'
  }
  return classes
})

const alignmentClass = computed(() => {
  let classes = ''
  if (props.isCycleCount) {
    classes += 'cycle-count '
  }
  if (props.compartmentCount === 1) {
    classes += 'single-compartment'
  } else if (props.compartmentCount === 3) {
    classes += 'tripple-compartment'
  }
  return classes
})

const onCompartmentClicked = () => {
  if (props.state !== 'active' && props.state !== 'disable_selection') {
    emit('compartmentClicked', props.compartment)
  }
}
</script>

<template>
  <div
    class="load-carrier-details-compartment"
    :class="classes"
    @click="onCompartmentClicked"
  >
    <div class="header-container" :class="alignmentClass">
      <span class="quantity">{{ quantityDisplayText }}</span>
      <div
        class="item-image-container"
        :class="{ 'unknown-item': isItemUnknown }"
      >
        <img
          v-if="hasImages"
          class="item-image"
          :class="alignmentClass"
          :src="firstImageUrl"
          :alt="firstImageUrl"
          draggable="false"
        />
      </div>
    </div>
    <div class="content-container" :class="alignmentClass">
      <span class="item-name">{{ itemName }}</span>
      <span class="item-number">{{ itemNumber }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.load-carrier-details-compartment {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 12px;
  background: var(--pcots-bg-load-carrier-section);
  box-shadow: var(--pcots-innershadow-load-carrier-section);
  user-select: none;
  border: 4px solid var(--pcots-stroke-deep-effect);
  row-gap: 4px;
  margin: 16px;
  cursor: pointer;
  opacity: 0.75;

  &.disable-selection {
    cursor: default;
  }

  &.active {
    opacity: 1;
    border: 6px solid var(--tgw-primary);
    cursor: default;

    &.filled {
      border: 6px solid var(--tgw-primary);
      background-color: var(--tgw-bg-40);
      padding: 10px;

      box-shadow: none;
    }
  }

  &.filled {
    background-color: var(--tgw-bg-30);
  }

  &.is-multi-item {
    padding: 16px;
    margin: 16px;
    aspect-ratio: 1/1;

    &.active {
      &.filled {
        background-color: var(--tgw-bg-40);
        border: 6px solid var(--tgw-primary);
        padding: 6px;
        cursor: default;
        box-shadow: none;
      }
    }

    &.filled {
      background-color: var(--tgw-bg-30);
      box-shadow: var(--tgw-dropshadow-soft);
      border: 1px solid var(--tgw-line-00);
      padding: 11px;
    }

    .header-container {
      .quantity {
        font-weight: 700;
        font-size: 48px;
        line-height: 56px;
        color: var(--tgw-text-primary);
      }

      &.single-compartment.cycle-count {
        justify-content: center;
        .item-image-container {
          display: block;
        }
      }
    }

    .content-container {
      display: flex;
      flex-direction: column;
      max-width: 100%;

      .item-name {
        font-weight: 700;
        font-size: 16px;
        line-height: 18px;
      }

      .item-number {
        font-weight: 400;
        font-size: 16px;
        line-height: 18px;
        color: var(--tgw-text-secondary);
      }
    }
  }

  &:not(.is-multi-item) {
    .header-container {
      &.single-compartment.cycle-count {
        grid-template-columns: auto;
        justify-content: center;
        .quantity {
          justify-self: center;
          order: 1;
        }
        .item-image-container {
          justify-self: center;
          display: block;
        }
      }

      &.tripple-compartment {
        grid-template-columns: 100%;
        justify-items: center;

        .quantity {
          grid-row-start: 2;
          grid-row-end: 3;
          justify-self: center;
        }

        .item-image-container {
          grid-row-start: 1;
          grid-row-end: 2;
          justify-self: center;
        }
      }
    }
  }

  .header-container {
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    flex: 1;
    max-width: 200px;
    max-height: 70%;

    .quantity {
      font-weight: 700;
      font-size: 60px;
      line-height: 70px;
      color: var(--tgw-text-primary);
      justify-self: flex-end;
      margin-right: 8px;
    }

    .item-image-container {
      display: flex;
      align-items: center;
      justify-content: center;
      justify-self: flex-end;
      aspect-ratio: 1/1;
      width: auto;
      max-width: 100%;
      max-height: 64%;
      box-shadow: var(--tgw-dropshadow-soft-elevated);
      border-radius: 4px;
      border: 1px solid var(--tgw-line-10);

      &.unknown-item {
        box-sizing: border-box;

        .item-image {
          width: 1000px;
          height: auto;
        }
      }

      .item-image {
        max-width: 100%;
        max-height: 100%;
      }
    }

    &.single-compartment {
      .item-image-container {
        display: none;
      }
    }
  }

  .content-container {
    display: grid;
    grid-auto-rows: min-content min-content;
    flex: 1;
    row-gap: 4px;
    justify-content: center;
    max-width: 200px;

    .item-name {
      font-weight: 700;
      font-size: 20px;
      line-height: 23px;
      color: var(--tgw-primary);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-number {
      font-weight: 400;
      font-size: 20px;
      line-height: 23px;
      color: var(--tgw-text-secondary);
      text-align: center;
    }
  }
}
</style>
