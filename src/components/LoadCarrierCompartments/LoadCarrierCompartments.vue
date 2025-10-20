<script setup lang="ts">
import {
  BarcodeDataType,
  CompartmentType,
  LoadCarrierType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { CompartmentInfo } from '@/types/CompartmentInfo'
import { CompartmentState } from '@/types/CompartmentState'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { TriggerCompartmentAnimationData } from '@/types/TriggerCompartmentAnimationData'
import LoadCarrierCompartment from '@/components/LoadCarrierCompartment/LoadCarrierCompartment.vue'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useCompartmentStyler } from '@/composables/useCompartmentStyler/useCompartmentStyler'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { PcotsLocationType } from '@/types/PcotsLocationType'

const props = defineProps<Props>()
const emit = defineEmits<{
  activeCompartmentChanged: [compartment: CompartmentType]
}>()
const {
  getCycleCountOrMultiItemCycleCountTask,
  isFirstScanFinished,
  isScanningRequired,
  isMultiItem,
  createCompartmentKey,
} = useApiDataHelper()
const { getCompartmentStyle } = useCompartmentStyler()
interface Props {
  loadCarrier?: LoadCarrierType
  scannedBarcodes?: BarcodeDataType[]
  pcotsLocation: PcotsLocationType
  task: TaskType | null | undefined
  showZeroCrossing: boolean
  hideDetails?: boolean
  compartmentInfos?: CompartmentInfo[]
  consolidationMode?: ConsolidationModeEnum
  countedCompartments?: CountedCompartmentsType
}
const activeCompartment = ref<CompartmentType>()
const compartmentRefs = ref<(typeof LoadCarrierCompartment)[]>([])

const hasLoadCarrier = computed(() => {
  return props.loadCarrier !== undefined
})
const isMultiItemComputed = computed(() => {
  return isMultiItem(props.loadCarrier?.compartments)
})

const compartments = computed(() => {
  if (props.loadCarrier?.compartments) {
    return props.loadCarrier.compartments
  }
  return []
})
const hasCompartmentState = (
  compartment: CompartmentType,
  compartmentState: CompartmentState
): boolean => {
  return !!(
    props.compartmentInfos &&
    props.compartmentInfos.filter(
      (compartmentInfo) =>
        compartmentInfo.id === compartment.id &&
        compartmentInfo.state === compartmentState
    ).length > 0
  )
}
const getShowZeroCrossing = (compartment: CompartmentType): boolean => {
  return (
    hasCompartmentState(compartment, CompartmentState.active) &&
    props.showZeroCrossing
  )
}
const getCompartmentState = (
  compartment: CompartmentType
): CompartmentState => {
  if (props.compartmentInfos && props.compartmentInfos.length > 0) {
    const compartmentState = props.compartmentInfos.find(
      (compartmentInfo) =>
        (compartmentInfo.id === compartment.id &&
          compartment.stockIndex !== undefined &&
          compartmentInfo.stockIndex === compartment.stockIndex) ||
        (compartment.stockIndex === undefined &&
          compartmentInfo.id === compartment.id)
    )?.state
    if (compartmentState) {
      if (compartmentState === CompartmentState.active) {
        if (
          props.task &&
          getCycleCountOrMultiItemCycleCountTask(props.task) &&
          isScanningRequired(props.task) &&
          !isFirstScanFinished(props.task, props.scannedBarcodes) &&
          props.pcotsLocation === PcotsLocationEnum.Target
        ) {
          return CompartmentState.none
        }
        activeCompartment.value = compartment
      }
      return compartmentState
    }
  }
  return CompartmentState.none
}
const onCompartmentClicked = (compartment: CompartmentType) => {
  activeCompartment.value = compartment
}
watch(activeCompartment, (value, oldValue) => {
  if (value !== oldValue) {
    emit('activeCompartmentChanged', value as CompartmentType)
  }
})
watch(
  () => props.compartmentInfos,
  () => {
    if (props.compartmentInfos?.length) {
      if (
        props.compartmentInfos.filter(
          (compartmentInfo) => compartmentInfo.state === CompartmentState.active
        ).length === 0
      ) {
        // No compartment active
        activeCompartment.value = undefined
      }
    } else {
      // No compartment active
      activeCompartment.value = undefined
    }
  }
)

const showCompartmentIndicator = (compartmentId: string) => {
  if (props.pcotsLocation === PcotsLocationEnum.Source) {
    if (
      isMultiItemComputed.value &&
      activeCompartment.value &&
      activeCompartment.value.id === compartmentId
    ) {
      return true
    }

    if (props.countedCompartments) {
      return compartmentId in props.countedCompartments
    } else {
      return false
    }
  }
  return false
}

const getCountedCompartmentAmount = (compartmentId: string): number => {
  if (props.countedCompartments?.[compartmentId]) {
    return props.countedCompartments[compartmentId].length
  } else {
    return 0
  }
}

const triggerAnimation = (data: TriggerCompartmentAnimationData) => {
  const compartmentRef = compartmentRefs.value.find(
    (compartmentRef) => compartmentRef.compartment.id === data.compartmentId
  )
  if (compartmentRef) {
    compartmentRef.triggerAnimation(data)
  }
}

defineExpose({
  triggerAnimation,
  onCompartmentClicked,
  getCountedCompartmentAmount,
  showCompartmentIndicator,
})
</script>

<template>
  <div v-if="hasLoadCarrier" class="load-carrier-compartments">
    <LoadCarrierCompartment
      v-for="compartment in compartments"
      ref="compartmentRefs"
      :key="createCompartmentKey(compartment)"
      :class="`compartment-${compartment.id}`"
      :compartment="compartment"
      :scanned-barcodes="scannedBarcodes"
      :pcots-location="pcotsLocation"
      :state="getCompartmentState(compartment)"
      :style="
        getCompartmentStyle(
          loadCarrier?.loadCarrierType,
          compartment,
          loadCarrier?.rotation
        )
      "
      :task="task"
      :show-zero-crossing="getShowZeroCrossing(compartment)"
      :hide-details="hideDetails || showZeroCrossing"
      :compartment-count="loadCarrier?.loadCarrierType.compartments.length ?? 0"
      :is-multi-item="isMultiItemComputed"
      :consolidation-mode="consolidationMode"
      :show-indicator="showCompartmentIndicator(compartment.id)"
      :counted-compartments="getCountedCompartmentAmount(compartment.id)"
      @compartment-clicked="onCompartmentClicked(compartment)"
    />
  </div>
</template>

<style scoped lang="scss">
.load-carrier-compartments {
  width: 100%;
  height: 100%;
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-rows: minmax(0, 1fr);
  gap: 8px;
  aspect-ratio: var(--pcots-lc-aspect-ratio);
}
</style>
