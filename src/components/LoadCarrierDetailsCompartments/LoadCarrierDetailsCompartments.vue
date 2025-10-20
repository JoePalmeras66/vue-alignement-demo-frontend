<script setup lang="ts">
import {
  CompartmentType,
  LoadCarrierType,
  LoadCarrierTypeType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { CycleCountState } from '@/types/CycleCountState'
import { useCompartmentStyler } from '@/composables/useCompartmentStyler/useCompartmentStyler'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

const props = defineProps<Props>()
const emit = defineEmits<{
  selectedCompartmentChanged: [compartment: CompartmentType]
}>()
const {
  isCompartmentEmpty,
  isCompartmentCounted,
  isMultiItem,
  getCompartmentByTask,
} = useApiDataHelper()
const { getCompartmentStyle } = useCompartmentStyler()
const { getStockCompartments, createCompartmentKey } = useApiDataHelper()
interface Props {
  loadCarrier?: LoadCarrierType
  pcotsLocation?: PcotsLocationEnum
  task?: TaskType
  isCycleCount?: boolean
  showQuantity?: boolean
  selectedCompartment: CompartmentType | undefined
}
const { loadCarrier, selectedCompartment: selectedCompartmentProperty } =
  toRefs(props)

const selectedCompartment = computed({
  get() {
    return selectedCompartmentProperty.value
  },
  set(newValue) {
    if (newValue) {
      emit('selectedCompartmentChanged', newValue)
    }
  },
})

const isMultiItemComputed = computed(() => {
  return isMultiItem(props.loadCarrier?.compartments)
})

const compartments = computed((): CompartmentType[] => {
  if (loadCarrier?.value?.compartments) {
    if (isMultiItemComputed.value && props.isCycleCount) {
      const countedCompartments = getStockCompartments(
        loadCarrier?.value?.compartments
      )
        .filter((compartment) => isCompartmentCounted(compartment))
        .filter((stock) => stock.items.length > 0)

      // noinspection JSIncompatibleTypesComparison
      if (countedCompartments === undefined) {
        return []
      }
      return countedCompartments
    } else if (isMultiItemComputed.value && !props.isCycleCount) {
      // if multi item load carrier only show filled compartments
      return getStockCompartments(loadCarrier?.value?.compartments).filter(
        (stock) => stock.items.length > 0
      )
    } else if (!isMultiItemComputed.value && props.isCycleCount) {
      return loadCarrier?.value?.compartments
    }
    return getStockCompartments(loadCarrier?.value?.compartments)
  }
  return []
})

const hasOneEmptyCompartment = computed(() => {
  // noinspection RedundantIfStatementJS
  if (
    !props.isCycleCount &&
    compartments.value &&
    compartments.value.length === 1 &&
    isCompartmentEmpty(compartments.value[0])
  ) {
    return true
  }
  return false
})

const isScrollable = computed(() => {
  return isMultiItemComputed.value && compartments.value.length > 6
})

const getCompartmentStyleInternal = (
  loadCarrierType: LoadCarrierTypeType | undefined,
  compartment: CompartmentType,
  rotation = 0
) => {
  if (isMultiItemComputed.value) {
    // In case of multi item compartment styling will be done in css
    return ''
  }
  return getCompartmentStyle(loadCarrierType, compartment, rotation)
}

const getCompartmentState = (
  compartment: CompartmentType
): 'none' | 'active' | 'disable_selection' => {
  if (
    props.loadCarrier?.compartments &&
    props.loadCarrier?.compartments.length === 1 &&
    isCompartmentEmpty(props.loadCarrier.compartments[0])
  ) {
    // Selection is disabled because we only have one emtpy sector
    return 'disable_selection'
  }
  if (
    selectedCompartment.value &&
    selectedCompartment.value.id === compartment.id &&
    selectedCompartment.value.stockIndex === compartment.stockIndex
  ) {
    return 'active'
  }
  return 'none'
}
const onCompartmentClicked = (compartment: CompartmentType) => {
  if (selectedCompartment.value !== compartment) {
    selectedCompartment.value = compartment
  }
}

const getCompartmentFromTask = () => {
  let compartment: CompartmentType | undefined
  if (props.loadCarrier && props.pcotsLocation && props.task) {
    const loadCarrierClone = JSON.parse(
      JSON.stringify(props.loadCarrier)
    ) as LoadCarrierType
    loadCarrierClone.compartments = compartments.value
    compartment = getCompartmentByTask(
      props.pcotsLocation,
      loadCarrierClone,
      props.task
    )
  }
  return compartment
}

const preSelectCompartment = () => {
  if (props.isCycleCount) {
    // In cycle counting we want to preselect the compartment which is in progress
    const compartmentInProgress = compartments.value.find(
      (compartment) =>
        compartment.cycleCountState === CycleCountState.inProgress
    )
    if (compartmentInProgress) {
      onCompartmentClicked(compartmentInProgress)
      return
    }
    const firstFilledCompartment = compartments.value.find(
      (compartment) => compartment.items.length > 0
    )
    if (firstFilledCompartment) {
      onCompartmentClicked(firstFilledCompartment)
      return
    }
    onCompartmentClicked(compartments.value[0])
    return
  }

  const compartmentFromTask = getCompartmentFromTask()
  const filledCompartment = compartments.value.find(
    (compartment: CompartmentType) => !isCompartmentEmpty(compartment)
  )
  const emptyCompartment = compartments.value.find((compartment) =>
    isCompartmentEmpty(compartment)
  )

  if (compartmentFromTask) {
    onCompartmentClicked(compartmentFromTask)
  } else if (filledCompartment) {
    onCompartmentClicked(filledCompartment)
  } else if (emptyCompartment) {
    onCompartmentClicked(emptyCompartment)
  }
}

onMounted(() => {
  preSelectCompartment()
})

watch(
  () => props.loadCarrier,
  () => {
    if (props.loadCarrier) {
      preSelectCompartment()
    }
  }
)
</script>

<template>
  <TgwScrollbar
    class="scroll-container"
    :class="{
      'is-multi-item': isMultiItemComputed,
      'one-empty-compartment': hasOneEmptyCompartment,
      'is-scrollable': isScrollable,
    }"
    height="100%"
  >
    <div
      class="load-carrier-details-compartments"
      :class="{ 'is-multi-item': isMultiItemComputed }"
    >
      <LoadCarrierDetailsCompartment
        v-for="compartment in compartments"
        :key="createCompartmentKey(compartment)"
        class="load-carrier-details-compartment"
        :task="task"
        :compartment="compartment"
        :state="getCompartmentState(compartment)"
        :style="
          getCompartmentStyleInternal(
            loadCarrier?.loadCarrierType,
            compartment,
            isMultiItemComputed ? 0 : loadCarrier?.rotation
          )
        "
        :is-multi-item="isMultiItemComputed"
        :is-cycle-count="isCycleCount"
        :show-quantity="showQuantity"
        :compartment-count="compartments.length"
        @compartment-clicked="onCompartmentClicked"
      />
    </div>
  </TgwScrollbar>
</template>

<style scoped lang="scss">
.scroll-container {
  width: 100%;
  height: 100%;

  &:not(.is-scrollable) {
    :deep(.tgw-scrollbar-wrapper) {
      display: flex;
      height: 100%;
    }
  }

  &.is-multi-item {
    &:not(.one-empty-compartment) {
      background-color: var(--pcots-bg-load-carrier-section);
      box-shadow: var(--pcots-innershadow-load-carrier-section);
      border-radius: 5px;
      box-sizing: border-box;
      border: 4px solid var(--pcots-stroke-deep-effect);

      :deep(.tgw-scrollbar-wrapper) {
        padding: 24px;
        box-sizing: border-box;
      }
    }
  }

  .load-carrier-details-compartments {
    width: 100%;
    height: 100%;
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-rows: minmax(0, 1fr);
    aspect-ratio: var(--pcots-lc-aspect-ratio);

    &.is-multi-item {
      grid-auto-rows: 1fr;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: repeat(2, 1fr);
    }
  }
}
</style>
