<script setup lang="ts">
import {
  CompartmentType,
  LoadCarrierType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'

const props = defineProps<Props>()
const { isCompartmentCounted } = useApiDataHelper()
interface Props {
  task: TaskType
  loadCarrier: LoadCarrierType
  selectedCompartment: CompartmentType
}
const isSelectedCompartmentCounted = computed(() => {
  return isCompartmentCounted(props.selectedCompartment)
})
</script>

<template>
  <div class="advanced-cycle-count-tab-details">
    <LoadCarrierItemDetails
      v-if="isSelectedCompartmentCounted"
      :task="task"
      :load-carrier="loadCarrier"
      :selected-compartment="selectedCompartment"
    />
    <NotCounted v-else />
  </div>
</template>

<style scoped lang="scss">
.advanced-cycle-count-tab-details {
  height: 100%;

  :deep(.load-carrier-item-details-container) {
    box-shadow: none;
    height: 100%;

    .header-text {
      display: none;
    }
  }
}
</style>
