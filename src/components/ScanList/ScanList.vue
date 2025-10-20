<script setup lang="ts">
import { BarcodeDataType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { BarcodeGroup } from '@/types/BarcodeGroup'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { ScanRuleEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

const props = defineProps<Props>()
const emit = defineEmits<{
  barcodesSelected: [barcodes: BarcodeDataType[]]
}>()
const {
  getBarcodesFromTask,
  getQuantityFromTask,
  getCycleCountOrMultiItemCycleCountTask,
  getBarcodeGroups,
} = useApiDataHelper()
interface Props {
  barcodes: BarcodeDataType[]
  task?: TaskType
}
const { barcodes } = toRefs(props)
const selectedBarcodes = ref<BarcodeDataType[]>([])

const barcodesComputed = computed(() => {
  return getBarcodesFromTask(props.task as TaskType)
})
const quantity = computed(() => {
  return getQuantityFromTask(props.task as TaskType, props.barcodes)
})

const barcodeGroups = computed((): BarcodeGroup[] => {
  if (props.task) {
    return getBarcodeGroups(props.task, props.barcodes)
  }
  return []
})
const maxScans = computed(() => {
  if (barcodesComputed.value) {
    if (barcodesComputed.value?.[0]?.scanRule === ScanRuleEnum.ScanOnce) {
      return 1
    } else {
      if (
        getCycleCountOrMultiItemCycleCountTask(props.task) &&
        barcodeGroups.value
      ) {
        return barcodeGroups.value.length
      }
      return quantity.value
    }
  }
})
const selectFirstBarcodes = () => {
  if (barcodeGroups.value.length > 0) {
    selectedBarcodes.value = barcodeGroups.value[0].barcodes
    emit('barcodesSelected', selectedBarcodes.value)
  }
}
const onScanItemClicked = (barcodes: BarcodeDataType[]) => {
  if (!selectedBarcodes.value.includes(barcodes[0])) {
    selectedBarcodes.value = []
    barcodes.forEach((barcode) => {
      selectedBarcodes.value.push(barcode)
    })

    emit('barcodesSelected', selectedBarcodes.value)
  }
}
const isItemSelected = (barcodes: BarcodeDataType[]): boolean => {
  let isSelected = false
  barcodes.forEach((barcode) => {
    if (selectedBarcodes.value.includes(barcode)) {
      isSelected = true
    } else {
      return false
    }
  })
  return isSelected
}
watch(
  barcodes,
  () => {
    // Update selected barcodes when there was deleted something
    selectedBarcodes.value = selectedBarcodes.value.filter((x) => {
      return barcodes.value.includes(x)
    })
    if (selectedBarcodes.value.length === 0) {
      selectFirstBarcodes()
    }

    emit('barcodesSelected', selectedBarcodes.value)
  },
  { deep: true }
)
onMounted(() => {
  if (selectedBarcodes.value.length === 0) {
    selectFirstBarcodes()
  }
})
</script>

<template>
  <div class="scan-list">
    <TgwScrollbar>
      <div class="scan-items-container">
        <div class="scan-items">
          <ScanItem
            v-for="(barcodeGroup, index) in barcodeGroups"
            :key="barcodeGroups.length - index"
            class="scan-item"
            :barcodes="barcodeGroup.barcodes"
            :is-selected="isItemSelected(barcodeGroup.barcodes)"
            :scan-number="barcodeGroups.length - index"
            :max-scans="maxScans"
            @click="onScanItemClicked(barcodeGroup.barcodes)"
          />
        </div>
      </div>
    </TgwScrollbar>
  </div>
</template>

<style scoped lang="scss">
.scan-list {
  background-color: var(--tgw-bg-10);

  .scan-items-container {
    display: flex;
    justify-content: center;

    .scan-items {
      display: flex;
      flex: 1;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 40px;
      padding: 0 80px;
    }
  }
}
</style>
