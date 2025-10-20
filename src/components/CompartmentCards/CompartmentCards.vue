<script setup lang="ts">
import { Nullable } from 'vitest'
import { CompartmentType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { CompartmentInfo } from '@/types/CompartmentInfo'
import { CompartmentState } from '@/types/CompartmentState'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'

interface Props {
  task: Nullable<TaskType>
  compartments?: CompartmentType[]
  compartmentInfos?: CompartmentInfo[]
}
const props = defineProps<Props>()
const emit = defineEmits<{
  activeCompartmentChanged: [compartment: CompartmentType | undefined]
}>()
const { getStockCompartments, createCompartmentKey } = useApiDataHelper()
const activeCompartment = ref<CompartmentType>()
const compartmentsComputed = computed(() => {
  if (props.compartments) {
    return getStockCompartments(props.compartments)
  }
  return []
})
const getCompartmentState = (
  compartment: CompartmentType
): CompartmentState => {
  if (props.compartmentInfos && props.compartmentInfos.length > 0) {
    const compartmentState = props.compartmentInfos.find(
      (compartmentInfo) =>
        compartmentInfo.id === compartment.id &&
        compartmentInfo.stockIndex === compartment.stockIndex
    )?.state
    if (compartmentState) {
      if (compartmentState === CompartmentState.active) {
        activeCompartment.value = compartment
      }
      return compartmentState
    }
  }
  return CompartmentState.none
}
watch(activeCompartment, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    emit('activeCompartmentChanged', newValue)
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
const onCompartmentClicked = (compartment: CompartmentType) => {
  activeCompartment.value = compartment
}
</script>

<template>
  <ElCarousel
    :autoplay="false"
    arrow="never"
    trigger="click"
    class="compartment-cards"
    type="card"
  >
    <ElCarouselItem
      v-for="compartment in compartmentsComputed"
      :key="createCompartmentKey(compartment)"
    >
      <CompartmentCard
        :task="task"
        :compartment="compartment"
        :state="getCompartmentState(compartment)"
        @compartment-clicked="onCompartmentClicked(compartment)"
      />
    </ElCarouselItem>
  </ElCarousel>
</template>

<style scoped lang="scss">
.compartment-cards {
  aspect-ratio: var(--pcots-lc-aspect-ratio);
  box-shadow: var(--pcots-innershadow-load-carrier-section);
  background: var(--tgw-bg-30);
  border: 3px solid var(--pcots-stroke-deep-effect);
  border-radius: 4px;
  box-sizing: border-box;

  :deep(.el-carousel__container) {
    //100% - indicator height
    height: calc(100% - 32px);

    .el-carousel__item {
      display: flex;
      justify-content: center;
      align-items: center;

      &.is-in-stage:not(.is-active) {
        opacity: 0.6;

        .el-carousel__mask {
          display: none;
        }

        .compartment-card {
          pointer-events: none;
          transform: scale(0.6);
          transition: transform 0.4s ease-in-out;
        }
      }

      &:not(.is-in-stage):not(.is-active) {
        display: none;
      }
    }
  }

  :deep(.el-carousel__indicators) {
    .el-carousel__indicator {
      .el-carousel__button {
        border: 1px solid var(--tgw-line-30);
        background-color: transparent;
        width: 8px;
        height: 8px;
        border-radius: 50px;
      }

      &.is-active {
        .el-carousel__button {
          background-color: var(--tgw-line-30);
        }
      }
    }
  }
}
</style>
