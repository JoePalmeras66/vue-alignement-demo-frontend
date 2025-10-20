<script setup lang="ts">
import {
  CompartmentType,
  LoadCarrierType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

interface Props {
  loadCarrier?: LoadCarrierType
  pcotsLocation?: PcotsLocationEnum
  task?: TaskType
  isCycleCount?: boolean
  showQuantity?: boolean
  selectedCompartment: CompartmentType | undefined
}
defineProps<Props>()
const emit = defineEmits<{
  selectedCompartmentChanged: [compartment: CompartmentType]
}>()
const onSelectedCompartmentChanged = (compartment: CompartmentType) => {
  emit('selectedCompartmentChanged', compartment)
}
</script>

<template>
  <div class="load-carrier-details-container">
    <LoadCarrierDetailsCompartments
      :load-carrier="loadCarrier"
      :pcots-location="pcotsLocation"
      :task="task"
      :is-cycle-count="isCycleCount"
      :show-quantity="showQuantity"
      :selected-compartment="selectedCompartment"
      @selected-compartment-changed="onSelectedCompartmentChanged"
    />
  </div>
</template>

<style scoped lang="scss">
.load-carrier-details-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--tgw-dropshadow-medium);
  background: var(--pcots-bg-load-carrier-frame);
}
</style>
