<script setup lang="ts">
import { Ref, WatchStopHandle } from 'vue'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  CompartmentType,
  LoadCarrierType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'

const props = defineProps<Props>()
const emit = defineEmits<{
  quantityChanged: [quantity: number]
}>()
const { isCompartmentEmpty, isCompartmentCounted, getStockFromCompartment } =
  useApiDataHelper()
interface Props {
  task: TaskType
  loadCarrier: LoadCarrierType | undefined
  selectedCompartment: CompartmentType | undefined
}
const countedQuantity: Ref<number> = ref<number>(0)
const stock = computed(() => {
  if (props.selectedCompartment) {
    return getStockFromCompartment(props.selectedCompartment, props.task)
  }
})
const item = computed(() => {
  return stock.value?.item
})
const isSelectedCompartmentEmpty = computed(() => {
  return (
    !props.selectedCompartment || isCompartmentEmpty(props.selectedCompartment)
  )
})
const isSelectedCompartmentCounted = computed(() => {
  return isCompartmentCounted(props.selectedCompartment)
})
const itemImageUrls = computed(() => {
  if (item.value?.images) {
    return item.value?.images.map((image) => image.url)
  }
})
let stopCountedQuantityWatcher: WatchStopHandle
const createCountedQuantityWatcher = () => {
  stopCountedQuantityWatcher = watch(
    countedQuantity,
    async (value, oldValue) => {
      if (value !== oldValue) {
        emit('quantityChanged', countedQuantity.value)
      }
    }
  )
}

createCountedQuantityWatcher()

watch(
  () => props.selectedCompartment,
  () => {
    if (
      props.selectedCompartment &&
      isCompartmentCounted(props.selectedCompartment)
    ) {
      // Stop watcher to suspend triggering of quantityChanged event when a new compartment will be selected
      stopCountedQuantityWatcher()
      countedQuantity.value = props.selectedCompartment.countedQuantity ?? 0
      createCountedQuantityWatcher()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (
    props.selectedCompartment &&
    isCompartmentCounted(props.selectedCompartment)
  ) {
    countedQuantity.value = props.selectedCompartment.countedQuantity ?? 0
  }
})
</script>

<template>
  <div class="advanced-cycle-count-tab-counted">
    <div
      v-if="!isSelectedCompartmentEmpty && isSelectedCompartmentCounted"
      class="content"
    >
      <ItemImage :item-image-urls="itemImageUrls" />
      <CycleCountInput
        v-model="countedQuantity"
        :show-delete-message-box="true"
      />
    </div>
    <NotCounted v-else />
  </div>
</template>

<style scoped lang="scss">
.advanced-cycle-count-tab-counted {
  display: flex;
  flex-direction: column;
  height: 100%;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100%;

    :deep(.item-image) {
      width: 22%;
    }
  }
}
</style>
