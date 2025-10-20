<script setup lang="ts">
import type {
  BarcodeDataType,
  CompartmentType,
  ConsolidationTaskType,
  CycleCountTaskType,
  MultiItemCycleCountTaskType,
  PickingTaskType,
  PurgeAndRecallTaskType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { CompartmentState } from '@/types/CompartmentState'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { TriggerCompartmentAnimationData } from '@/types/TriggerCompartmentAnimationData'
import { CompartmentAnimationName } from '@/types/CompartmentAnimationName'
import { useTranslations } from '@/composables/useTranslations'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { PcotsLocationType } from '@/types/PcotsLocationType'

const props = withDefaults(defineProps<Props>(), {
  state: CompartmentState.none,
  showIndicator: false,
})
const emit = defineEmits<{ compartmentClicked: [compartmentId: string] }>()
const { getTranslatedText } = useTextTranslator()
interface Props {
  compartment: CompartmentType
  scannedBarcodes?: BarcodeDataType[]
  pcotsLocation: PcotsLocationType
  state?: CompartmentState
  task: TaskType | null | undefined
  showZeroCrossing?: boolean
  hideDetails?: boolean
  compartmentCount: number
  isMultiItem: boolean
  consolidationMode?: ConsolidationModeEnum
  showIndicator?: boolean
  countedCompartments?: number
}
const {
  isConsolidationTask,
  isPickingTask,
  isPurgeAndRecallTask,
  isManualConsolidationTask,
  isCycleCountTask,
  isMultiItemCycleCountTask,
  isPickingOrPurgeAndRecallTask,
  getCycleCountOrMultiItemCycleCountTask,
  isFirstScanFinished,
  getStockFromCompartment,
  isSourceToSourceCount,
  getItemNumberDisplay,
} = useApiDataHelper()
const { getTranslation } = useTranslations('load-carrier-compartment')
const barcodeStore = useBarcodeStore()
const loadCarrierStore = useLoadCarrierStore()

const isActive = computed((): boolean => {
  return props.state === CompartmentState.active
})
const isSelectable = computed((): boolean => {
  return props.state === CompartmentState.selectable
})
const stock = computed(() => {
  if (props.compartment) {
    return getStockFromCompartment(props.compartment, props.task)
  }
})
const item = computed(() => {
  if (isPickingTask(props.task) || isPurgeAndRecallTask(props.task)) {
    if (props.pcotsLocation === PcotsLocationEnum.Target) {
      return undefined
    } else {
      return stock.value?.item
    }
  } else if (isConsolidationTask(props.task)) {
    if (isActive.value) {
      const consolidationTask = props.task as ConsolidationTaskType
      return consolidationTask.item
    } else {
      return stock.value?.item
    }
  } else if (isManualConsolidationTask(props.task)) {
    return stock.value?.item
  } else if (isCycleCountTask(props.task) && isActive.value) {
    return stock.value?.item
  } else if (
    isMultiItemCycleCountTask(props.task) &&
    isActive.value &&
    props.pcotsLocation === PcotsLocationEnum.Source
  ) {
    const sourceLoadCarrier = loadCarrierStore.sourceLoadCarrier
    return barcodeStore.getLastScannedItem(sourceLoadCarrier)
  }
})
const isConsolidationActionSelected = computed(() => {
  return (
    props.consolidationMode &&
    isActive.value &&
    props.consolidationMode === ConsolidationModeEnum.MANUAL
  )
})
const showItemDetails = computed(() => {
  return (
    !(isActive.value && props.pcotsLocation === PcotsLocationEnum.Target) ||
    isConsolidationActionSelected.value
  )
})
const itemName = computed((): string | undefined => {
  if (showItemDetails.value) {
    return getItemNumberDisplay(item.value?.id)
  }
})
const itemDescription = computed((): string | undefined => {
  if (showItemDetails.value) {
    return getTranslatedText(item.value?.name)
  }
})
const getConsolidationQuantity = () => {
  const consolidationTask = props.task as ConsolidationTaskType

  if (
    consolidationTask &&
    (!isActive.value ||
      props.consolidationMode === ConsolidationModeEnum.MANUAL)
  ) {
    if (stock.value?.quantity) {
      return stock.value?.quantity > 0 ? stock.value?.quantity : undefined
    }
    return undefined
  } else if (
    consolidationTask &&
    isActive.value &&
    consolidationTask.quantity
  ) {
    return consolidationTask.quantity.value
  }
}
const quantity = computed(() => {
  if (
    isPickingOrPurgeAndRecallTask(props.task) &&
    props.pcotsLocation === PcotsLocationEnum.Source
  ) {
    const workingTask = props.task as PickingTaskType | PurgeAndRecallTaskType
    if (workingTask?.quantity && isActive.value) {
      return workingTask.quantity.value
    }
  } else if (
    (isConsolidationTask(props.task) ||
      isManualConsolidationTask(props.task)) &&
    showItemDetails.value
  ) {
    return getConsolidationQuantity()
  }
})
const quantityDisplayText = computed(() => {
  if (quantity.value || quantity.value === 0) {
    return `${quantity.value}`
  }
})
const classes = computed(() => {
  let loadCarrierClasses = PcotsLocationEnum[props.pcotsLocation].toLowerCase()
  if (props.state !== 'none') {
    loadCarrierClasses += ` ${props.state}`
  }

  if (isPickingOrPurgeAndRecallTask(props.task)) {
    loadCarrierClasses += ' picking'
  } else if (
    isConsolidationTask(props.task) ||
    isManualConsolidationTask(props.task)
  ) {
    loadCarrierClasses += ' consolidation'
  } else if (getCycleCountOrMultiItemCycleCountTask(props.task)) {
    loadCarrierClasses += ' cycle-count'
  }

  if (props.consolidationMode === ConsolidationModeEnum.MANUAL) {
    loadCarrierClasses += ' manual'
  }

  if (stock.value?.quantity && stock.value?.quantity > 0) {
    loadCarrierClasses += ' has-item'
  }
  return loadCarrierClasses
})

const getCycleCountActionText = (
  task: CycleCountTaskType | MultiItemCycleCountTaskType
) => {
  if (
    !isFirstScanFinished(task, props.scannedBarcodes) ||
    isMultiItemCycleCountTask(task)
  ) {
    return getTranslation('scan')
  }
  return getTranslation('count')
}

const actionText = computed(() => {
  const cycleCountOrMultiItemCycleCountTask =
    getCycleCountOrMultiItemCycleCountTask(props.task)
  if (
    isActive.value &&
    cycleCountOrMultiItemCycleCountTask &&
    !props.hideDetails
  ) {
    if (props.pcotsLocation === PcotsLocationEnum.Source) {
      return getCycleCountActionText(cycleCountOrMultiItemCycleCountTask)
    }
  }
  return false
})

// const isQuantityHighlighted = computed((): boolean => {
//   if (
//     isPickingTask(props.task) ||
//     isPurgeAndRecallTask(props.task) ||
//     ((isManualConsolidationTask(props.task) ||
//       isConsolidationTask(props.task)) &&
//       isActive.value)
//   ) {
//     return quantity.value !== undefined && quantity.value > 1
//   }
//   return false
// })

const getItemCountClass = (quantityDisplayText: string) => {
  let itemClass = ''

  // currently not needed anymore
  // if (isQuantityHighlighted.value) {
  //   itemClass = 'highlighted '
  // }

  if (quantityDisplayText.length > 8) {
    itemClass += 'size-mini'
  } else if (quantityDisplayText.length > 6) {
    itemClass += 'size-small'
  } else if (quantityDisplayText.length > 4) {
    itemClass += 'size-medium'
  }

  return itemClass
}
const sizeClass = computed(() => {
  if (props.compartmentCount >= 6) {
    return 'size-small'
  }
})
const compartmentClicked = () => {
  if (isSelectable.value) {
    emit('compartmentClicked', props.compartment.id)
  }
}

const showCompartmentIndicator = computed(() => {
  return (
    props.task &&
    (isCycleCountTask(props.task) ||
      (isMultiItemCycleCountTask(props.task) && !props.isMultiItem)) &&
    props.showIndicator &&
    !props.hideDetails
  )
})

const isCompartmentIndicatorSmall = computed(() => {
  return props.compartmentCount > 1
})

const indicatorAmount = computed(() => {
  if (props.isMultiItem) {
    return props.countedCompartments
  }
  return undefined
})

const transitionDelayMs = ref<number>(0)
const transitionName = ref<CompartmentAnimationName>()
// set to 4 because each transition has 2 steps with 2 elements
const transitionCount = ref(4)
const resetTransitionData = () => {
  transitionName.value = undefined
  transitionDelayMs.value = 0
  transitionCount.value = 4
}
const quantityTransitionName = computed(() => {
  if (transitionName.value === CompartmentAnimationName.jump) {
    return CompartmentAnimationName.jump
  }
})
const compartmentTransitionName = computed(() => {
  if (transitionName.value === CompartmentAnimationName.scale) {
    return CompartmentAnimationName.scale
  }
})
const keyForTransition = computed(() => {
  let key
  if (transitionName.value === CompartmentAnimationName.scale) {
    key = `${props.compartment.id} `
  }
  return key
})
const onQuantityTransitionEnd = (transitionEvent: TransitionEvent) => {
  if (
    transitionEvent.propertyName === 'transform' &&
    transitionName.value === CompartmentAnimationName.jump
  ) {
    // Reset if the last animation part ended -> 1. opacity 2. transform
    resetTransitionData()
  }
}
const onCompartmentTransitionEnd = (transitionEvent: TransitionEvent) => {
  transitionCount.value--
  if (
    transitionEvent.propertyName === 'scale' &&
    transitionName.value === CompartmentAnimationName.scale &&
    transitionCount.value <= 0
  ) {
    resetTransitionData()
  }
}
const transitionCssVars = computed(() => {
  return `--pcots-compartment-transition-delay: ${transitionDelayMs.value}ms;`
})
const triggerAnimation = (data: TriggerCompartmentAnimationData) => {
  transitionName.value = data.transitionName
  transitionDelayMs.value = data.transitionDelayMs
}
const showPutIndicator = computed(() => {
  if (isActive.value) {
    const cycleCountOrMultiItemCycleCountTask =
      getCycleCountOrMultiItemCycleCountTask(props.task)
    if (cycleCountOrMultiItemCycleCountTask) {
      return (
        (props.pcotsLocation === PcotsLocationEnum.Target &&
          !isSourceToSourceCount(cycleCountOrMultiItemCycleCountTask)) ||
        (props.pcotsLocation === PcotsLocationEnum.Source &&
          isSourceToSourceCount(cycleCountOrMultiItemCycleCountTask) &&
          isFirstScanFinished(
            cycleCountOrMultiItemCycleCountTask,
            props.scannedBarcodes
          ))
      )
    } else {
      return (
        (props.pcotsLocation === PcotsLocationEnum.Target ||
          props.hideDetails) &&
        props.consolidationMode !== ConsolidationModeEnum.MANUAL
      )
    }
  }
})
const compartmentPutIndicatorPath = computed(() => {
  if (showPutIndicator.value) {
    let imagePath = 'src/assets/images/compartment/compartment_put_indicator'
    if (!isDark.value) {
      imagePath += '_light.svg'
    } else {
      imagePath += '_dark.svg'
    }
    return imagePath
  }
  return undefined
})

const showPickIndicator = computed(() => {
  if (isActive.value) {
    const cycleCountOrMultiItemCycleCountTask =
      getCycleCountOrMultiItemCycleCountTask(props.task)
    if (cycleCountOrMultiItemCycleCountTask) {
      return (
        (props.pcotsLocation === PcotsLocationEnum.Source &&
          !isSourceToSourceCount(cycleCountOrMultiItemCycleCountTask)) ||
        (props.pcotsLocation === PcotsLocationEnum.Source &&
          !isFirstScanFinished(
            cycleCountOrMultiItemCycleCountTask,
            props.scannedBarcodes
          ))
      )
    } else {
      return (
        props.pcotsLocation === PcotsLocationEnum.Source &&
        props.consolidationMode !== ConsolidationModeEnum.MANUAL
      )
    }
  }
})
const compartmentPickIndicatorPath = computed(() => {
  if (showPickIndicator.value) {
    let imagePath = 'src/assets/images/compartment/compartment_pick_indicator'
    if (!isDark.value) {
      imagePath += '_light.svg'
    } else {
      imagePath += '_dark.svg'
    }
    return imagePath
  }
  return undefined
})
defineExpose({ triggerAnimation, compartment: props.compartment })
</script>

<template>
  <div
    class="lc-compartment"
    :class="classes"
    :style="transitionCssVars"
    @click="compartmentClicked"
  >
    <div v-if="showZeroCrossing" class="zero-crossing-container">
      <span class="zero-crossing-text">?</span>
    </div>
    <Transition
      :name="compartmentTransitionName"
      mode="out-in"
      @transitionend="onCompartmentTransitionEnd"
      @transitioncancel="onCompartmentTransitionEnd"
    >
      <div v-if="!showZeroCrossing" :key="keyForTransition" class="lc-data">
        <img
          v-if="compartmentPutIndicatorPath"
          :src="compartmentPutIndicatorPath"
          alt="compartment-put-indicator"
          class="compartment-put-indicator"
        />
        <img
          v-if="
            compartmentPickIndicatorPath &&
            getCycleCountOrMultiItemCycleCountTask(props.task)
          "
          :src="compartmentPickIndicatorPath"
          alt="compartment-pick-indicator"
          class="compartment-pick-indicator"
        />
        <span v-if="actionText" class="lc-item-helper-text" :class="sizeClass">
          {{ actionText }}
        </span>

        <template
          v-if="
            !hideDetails &&
            (quantity !== undefined ||
              isConsolidationTask(task) ||
              isManualConsolidationTask(task) ||
              isCycleCountTask(task) ||
              isMultiItemCycleCountTask(task))
          "
        >
          <Transition
            :name="quantityTransitionName"
            mode="out-in"
            @transitionend="onQuantityTransitionEnd"
          >
            <div
              v-if="
                quantity !== undefined ||
                (compartmentPickIndicatorPath &&
                  !getCycleCountOrMultiItemCycleCountTask(props.task))
              "
              class="quantity-container"
            >
              <span
                v-if="quantity !== undefined"
                :key="quantityDisplayText"
                class="lc-item-count"
                :class="getItemCountClass(quantityDisplayText ?? '')"
              >
                {{ quantityDisplayText }}
              </span>
              <img
                v-if="compartmentPickIndicatorPath"
                :src="compartmentPickIndicatorPath"
                alt="compartment-pick-indicator"
                class="compartment-pick-indicator"
              />
            </div>
          </Transition>
          <span
            v-if="itemDescription !== undefined"
            class="lc-item-description tgw-truncate-2"
          >
            {{ itemDescription }}
          </span>
          <span v-if="itemName !== undefined" class="lc-item-name">{{
            itemName
          }}</span>
        </template>
      </div>
    </Transition>
    <CompartmentIndicator
      v-if="showCompartmentIndicator"
      :small="isCompartmentIndicatorSmall"
      :scanned-amount="indicatorAmount"
    />
  </div>
</template>

<style scoped lang="scss">
/*#region jump animation*/
.jump-enter-from,
.jump-leave-to {
  transform: translateY(-40px);
  opacity: 0;
}

.jump-enter-active,
.jump-leave-active {
  transition: all 0.3s ease;
  transition-delay: var(--pcots-compartment-transition-delay);
}
/*endregion*/

/*#region scale animation*/
.scale-enter-from,
.scale-leave-to {
  scale: 0.5;
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
  transition-delay: var(--pcots-compartment-transition-delay);
}
/*endregion*/

.lc-compartment {
  container-type: size;
  container-name: lcCompartment;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background: var(--pcots-bg-load-carrier-section);
  box-shadow: var(--pcots-innershadow-load-carrier-section);
  user-select: none;
  border: 3px solid var(--pcots-stroke-deep-effect);
  --arrow--icon-size: 24px;

  .zero-crossing-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .zero-crossing-text {
      color: var(--tgw-text-primary);
      font-weight: 700;
      font-size: 128px;
      line-height: 150px;
    }
  }

  .lc-data {
    height: 100%;
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--tgw-text-primary);
    width: 100%;
    padding: 8px;
    box-sizing: border-box;

    .quantity-container {
      width: 100%;
      display: grid;
      align-items: center;
      grid-template-columns: 1fr auto 1fr;
      margin-bottom: 24px;

      .lc-item-count {
        font-weight: 700;
        font-size: 120px;
        line-height: 75%;
        grid-column: 2 / span 1;
        text-align: center;

        &.size-medium {
          font-size: 3vw;
          line-height: 3vw;
        }
        &.size-small {
          font-size: 2.2vw;
          line-height: 2.2vw;
        }
        &.size-mini {
          font-size: 2vw;
          line-height: 2vw;
        }

        &.highlighted {
          color: var(--tgw-accent);
          -webkit-text-stroke: 2px #8b6009;
        }

        &.align-left {
          align-self: flex-start;
          text-align: left;
        }
      }
      .compartment-pick-indicator {
        grid-column: 3 / span 1;
        align-self: flex-end;
      }
    }

    .lc-item-description {
      --description-size: 32px;
      color: var(--tgw-primary);
      font-weight: 700;
      font-size: var(--description-size);
      line-height: calc(var(--description-size) + 4px);
      min-height: var(--description-size);
      text-align: center;
      margin-bottom: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      letter-spacing: 1px;
      word-break: break-word;

      &.align-left {
        align-self: flex-start;
        text-align: left;
      }
    }

    .lc-item-name {
      font-size: 24px;
      line-height: 24px;
      color: var(--tgw-text-secondary);
      text-align: center;

      &.align-left {
        align-self: flex-start;
        text-align: left;
      }
    }

    .lc-item-helper-text {
      width: 100%;
      text-align: center;
      font-weight: 900;
      font-size: 32px;
      line-height: 37px;
      color: var(--tgw-primary);
      text-transform: uppercase;

      &.size-small {
        font-size: 24px;
        line-height: 28px;
        --arrow--icon-size: 16px;
      }
    }

    .lc-item-helper-text:last-child {
      margin-bottom: 24px;

      &.size-small {
        margin-bottom: 18px;
      }
    }

    .compartment-put-indicator {
      width: 180px;
      height: auto;
    }
    .compartment-pick-indicator {
      height: 80px;
      width: auto;
    }
  }

  &.active {
    background-color: var(--tgw-bg-40);
    border: 6px solid var(--tgw-primary);
    box-shadow: none;
    z-index: 1;
  }

  &.consolidation {
    &.has-item {
      padding: 3px;
      background-color: var(--tgw-bg-30);
      box-shadow: var(--pcots-innershadow-load-carrier-section);

      &:not(.active, .selectable, .manual) {
        .lc-data {
          opacity: 0.6;

          .lc-item-description {
            color: var(--tgw-text-primary);
          }
        }
      }

      &.active {
        background-color: var(--tgw-bg-40);
        box-shadow: none;
        padding: 0;
      }
    }

    &.selectable {
      padding: 3px;
      background-color: var(--tgw-bg-40);
      box-shadow: none;
      border: 3px solid transparent;
      outline: 6px dashed var(--tgw-line-30);
      outline-offset: -6px;
      cursor: pointer;
    }

    &.active &:not(.manual) {
      .lc-data {
        height: 100%;

        .lc-item-description {
          margin-top: 16px;
        }
      }

      &.target {
        .lc-data {
          justify-content: center;

          .lc-item-helper-text {
            margin-bottom: 12px;
          }
        }
      }
    }

    &.manual {
      .lc-data {
        .lc-item-description {
          color: var(--tgw-text-primary);
        }
      }

      &.selectable,
      &.active {
        .lc-data {
          .lc-item-description {
            color: var(--tgw-primary);
          }
        }
      }
    }
  }

  &.cycle-count {
    .lc-data {
      .lc-item-helper-text {
        color: var(--tgw-text-primary);
      }
    }
    &.has-item {
      .lc-data {
        .lc-item-helper-text {
          margin-top: 16px;
        }
        .lc-item-description {
          margin: 24px 0;
        }
        .compartment-pick-indicator {
          height: 72px;
        }
      }
    }
  }

  @container lcCompartment (width < 400px) or (height < 400px) {
    .lc-data {
      .quantity-container {
        margin-bottom: 16px;

        .lc-item-count {
          font-size: 120px;
        }
        .compartment-pick-indicator {
          height: 80px;
        }
      }
      .compartment-put-indicator {
        width: 180px;
      }
      .lc-item-description {
        font-weight: 600;
        --description-size: 28px;
        margin-bottom: 4px;
      }
      .lc-item-name {
        font-size: 20px;
        line-height: 20px;
      }
    }
    &.cycle-count {
      &.has-item {
        .lc-data {
          .lc-item-helper-text {
            margin-top: 8px;
          }
          .lc-item-description {
            margin: 16px 0;
          }
          .compartment-pick-indicator {
            height: 64px;
          }
        }
        &.source {
          .lc-data {
            .compartment-put-indicator {
              height: 64px;
            }
          }
        }
      }
    }
  }
  @container lcCompartment (width < 240px) or (height < 240px) {
    .lc-data {
      .quantity-container {
        margin-bottom: 8px;

        .lc-item-count {
          font-size: 72px;
        }
        .compartment-pick-indicator {
          height: 64px;
        }
      }
      .compartment-put-indicator {
        width: 140px;
      }
      .lc-item-description {
        --description-size: 28px;
      }
      .lc-item-name {
        font-size: 20px;
        line-height: 20px;
      }
    }
    &.cycle-count {
      &.has-item {
        .lc-data {
          .lc-item-helper-text {
            margin-top: 4px;
          }
          .lc-item-description {
            margin: 8px 0;
          }
          .compartment-pick-indicator {
            height: 56px;
          }
        }
        &.source {
          .lc-data {
            .compartment-put-indicator {
              height: 56px;
            }
          }
        }
      }
    }
  }
  @container lcCompartment (width < 200px) or (height < 200px) {
    .lc-data {
      .quantity-container {
        .lc-item-count {
          font-size: 56px;
        }
        .compartment-pick-indicator {
          height: 48px;
        }
      }
      .compartment-put-indicator {
        width: 100px;
      }
      .lc-item-description {
        --description-size: 20px;
      }
      .lc-item-name {
        font-size: 16px;
        line-height: 16px;
      }
    }
    &.cycle-count {
      &.has-item {
        .lc-data {
          .lc-item-helper-text {
            font-size: 22px;
            margin-top: 0;
          }
          .lc-item-description {
            margin: 4px 0;
          }
          .compartment-pick-indicator {
            height: 40px;
          }
        }
        &.source {
          .lc-data {
            .compartment-put-indicator {
              height: 40px;
            }
          }
        }
      }
    }
  }
  @container lcCompartment (width < 150px) or (height < 150px) {
    .lc-data {
      .compartment-put-indicator {
        width: 80px;
      }
      .quantity-container {
        .compartment-pick-indicator {
          height: 40px;
        }
      }
    }
  }
}
</style>
