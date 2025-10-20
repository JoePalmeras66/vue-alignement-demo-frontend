<script setup lang="ts">
import {
  BarcodeDataType,
  CompartmentType,
  CycleCountTaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { CycleCountState } from '@/types/CycleCountState'

interface Props {
  selectedCompartment: CompartmentType | undefined
  barcodes: BarcodeDataType[]
  task?: CycleCountTaskType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  barcodesSelected: [barcodes: BarcodeDataType[]]
}>()

const onBarcodesSelected = (barcodes: BarcodeDataType[]) => {
  emit('barcodesSelected', barcodes)
}
const cycleCountInProgress = computed(() => {
  return !!(
    props.selectedCompartment &&
    props.selectedCompartment.cycleCountState === CycleCountState.inProgress
  )
})
</script>

<template>
  <div class="advanced-cycle-count-tab-scans">
    <ScanList
      v-if="cycleCountInProgress"
      :barcodes="barcodes"
      :task="task"
      @barcodes-selected="onBarcodesSelected"
    />
    <NotCounted v-else />
  </div>
</template>

<style scoped lang="scss">
.advanced-cycle-count-tab-scans {
  height: 100%;
  :deep(.scan-list) {
    background: var(--tgw-bg-30);
    height: 100%;
    .scan-items-container {
      .scan-items {
        //On top we have 15px margin already from .el-tabs__header
        padding: 25px 24px 40px 24px;
      }
    }
    .tgw-scrollbar {
      .tgw-scrollbar-wrapper {
        //100vh - header-height - 2* 40px margin - tab header height - tab header margin - scan-items margin bottom
        max-height: calc(
          100vh - 124px - 80px - 79px - 15px - 40px -
            var(--pcots-footer-bottom-height)
        );
      }
    }
  }
}
</style>
