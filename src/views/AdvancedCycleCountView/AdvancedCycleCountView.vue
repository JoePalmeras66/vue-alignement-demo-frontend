<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Ref, computed } from 'vue'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import {
  BarcodeDataType,
  CompartmentType,
  CycleCountTaskType,
  LoadCarrierType,
} from '@/types/Api/pcots/PcotsApiModel'
import { AdvancedCycleCountButtonAction } from '@/types/AdvancedCycleCountButtonAction'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { CycleCountTabs } from '@/types/CycleCountTabs'
import { CycleCountState } from '@/types/CycleCountState'
import DeleteCountMessageBox from '@/components/DeleteCountMessageBox/DeleteCountMessageBox.vue'
import { usePcotsWebsockets } from '@/composables/usePcotsWebsockets'
import ScanHintDialog from '@/components/ScanHintDialog/ScanHintDialog.vue'
import { ScanModificationMode } from '@/types/ScanModificationMode'
import { useTranslations } from '@/composables/useTranslations'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'

const router = useRouter()
const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const barcodeStore = useBarcodeStore()
const loadCarrierStore = useLoadCarrierStore()
const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
const taskStore = useTaskStore()
const {
  isCompartmentCounted,
  isScanEach,
  isScanOnce,
  getCompartmentInfos,
  isSourceToSourceCount,
  getCompartmentByTask,
  getStockFromCompartment,
  getCycleCountOrMultiItemCycleCountTask,
  isMultiItemCycleCountTask,
  getCompartmentByItemId,
  getBarcodeGroups,
} = useApiDataHelper()
const { barcodes } = storeToRefs(barcodeStore)
const { sourceLoadCarrier, targetLoadCarrier } = storeToRefs(loadCarrierStore)
const { pcotsLocation, loadCarrier } = storeToRefs(loadCarrierDetailsStore)
const { task, cycleCountedQuantities } = storeToRefs(taskStore)
const selectedCompartment: Ref<CompartmentType | undefined> = ref<
  CompartmentType | undefined
>()
const selectedBarcodes: Ref<BarcodeDataType[]> = ref<BarcodeDataType[]>([])
const activeTab = ref<CycleCountTabs>()
const deleteCountMessageBoxRef = ref()
const isScanHintDialogVisible: Ref<boolean> = ref<boolean>(false)
const { getTranslation } = useTranslations('advanced-cycle-count-view')
const { onHandlePcotsEvent } = usePcotsEventHandler()
const { locale } = useI18n()

const cycleCountTask = computed(() => {
  return getCycleCountOrMultiItemCycleCountTask(task.value)
})

const currentBarcodes = computed(() => {
  if (pcotsLocation.value === PcotsLocationEnum.Source) {
    return barcodes.value
  }
  return [] as BarcodeDataType[]
})

const headerText = computed(() => {
  let loadCarrierText = 'source_load_carrier'
  if (pcotsLocation.value === PcotsLocationEnum.Target) {
    loadCarrierText = 'target_load_carrier'
  }
  return `${getTranslation(loadCarrierText)} ${getTranslation(
    'header_text',
    loadCarrier.value?.id
  )}`
})

const showOppositeTextMinWidth = computed(() => {
  if (locale.value === 'de') {
    return '276px'
  }
  return '206px'
})

const countedCompartments = computed((): CompartmentType[] => {
  if (loadCarrier.value?.compartments) {
    return loadCarrier.value.compartments.filter((compartment) =>
      isCompartmentCounted(compartment)
    )
  }
  return []
})
const itemsCounted = computed(() => {
  let items = 0
  for (const countedCompartment of countedCompartments.value) {
    if (countedCompartment.cycleCountState === CycleCountState.finished) {
      const stock = getStockFromCompartment(countedCompartment, task.value)
      items += stock?.quantity !== undefined ? stock.quantity : 0
    } else if (
      countedCompartment.cycleCountState === CycleCountState.inProgress
    ) {
      items += countedCompartment?.countedQuantity
        ? countedCompartment.countedQuantity
        : 0
    }
  }
  return items
})
const itemTypesCounted = computed(() => {
  const itemTypes: string[] = []
  for (const countedCompartment of countedCompartments.value) {
    const stock = getStockFromCompartment(countedCompartment, task.value)
    if (stock?.item && !itemTypes.includes(stock.item.id)) {
      itemTypes.push(stock.item.id)
    }
  }
  return itemTypes.length
})
const headerSubTexts = computed(() => {
  return [
    getTranslation('items_counted', itemsCounted.value),
    getTranslation('item_types_counted', itemTypesCounted.value),
  ]
})

const isShowOppositeLcButtonDisabled = computed(() => {
  if (pcotsLocation.value === PcotsLocationEnum.Source) {
    return targetLoadCarrier.value === undefined
  }
  return sourceLoadCarrier.value === undefined
})
const showOppositeLcButtonText = computed(() => {
  if (pcotsLocation.value === PcotsLocationEnum.Source) {
    return getTranslation('show_target')
  }
  return getTranslation('show_source')
})
const onShowOppositeLcButtonClicked = () => {
  selectedCompartment.value = undefined
  loadCarrierDetailsStore.swapPcotsLocation()
}

const disabledButtons = computed(() => {
  const disabledButtons: AdvancedCycleCountButtonAction[] = []

  if (selectedCompartment.value) {
    if (
      currentBarcodes.value.length === 0 ||
      selectedCompartment.value.cycleCountState !== CycleCountState.inProgress
    ) {
      disabledButtons.push(AdvancedCycleCountButtonAction.delete_scan)
    }
    if (
      !isCompartmentCounted(selectedCompartment.value) ||
      selectedCompartment.value.cycleCountState === CycleCountState.finished
    ) {
      disabledButtons.push(AdvancedCycleCountButtonAction.delete_count)
    }
  } else {
    disabledButtons.push(AdvancedCycleCountButtonAction.delete_count)
  }
  return disabledButtons
})
const hiddenButtons = computed(() => {
  const hiddenButtonsArray: AdvancedCycleCountButtonAction[] = []
  if (task.value) {
    if (activeTab.value !== CycleCountTabs.scanned || isScanOnce(task.value)) {
      hiddenButtonsArray.push(AdvancedCycleCountButtonAction.delete_scan)
    }
  }

  return hiddenButtonsArray
})

const compartmentInfos = computed(() => {
  if (task.value) {
    return getCompartmentInfos(
      loadCarrier.value as LoadCarrierType,
      task.value,
      PcotsLocationEnum.Source,
      undefined,
      undefined,
      undefined,
      undefined
    )
  }
  return undefined
})

const onSelectedCompartmentChanged = (
  newCompartment: CompartmentType | undefined
) => {
  if (loadCarrier.value?.compartments) {
    selectedCompartment.value = newCompartment
  }
}
const getSelectedLoadCarrierCompartment = () => {
  return loadCarrier.value?.compartments.find((compartment) => {
    if (isMultiItemCycleCountTask(task.value)) {
      return (
        compartment.id === selectedCompartment.value?.id &&
        compartment.stockIndex === selectedCompartment.value?.stockIndex
      )
    } else {
      return compartment.id === selectedCompartment.value?.id
    }
  })
}
const onQuantityChanged = async (quantity: number) => {
  if (
    selectedCompartment.value &&
    selectedCompartment.value?.countedQuantity !== quantity &&
    task.value
  ) {
    selectedCompartment.value.countedQuantity = quantity
    const loadCarrierCompartment = getSelectedLoadCarrierCompartment()
    if (loadCarrierCompartment) {
      loadCarrierCompartment.countedQuantity = quantity
    }

    if (isMultiItemCycleCountTask(task.value)) {
      taskStore.setCycleCountQuantity(
        quantity,
        selectedCompartment.value?.items[0].item.id
      )
    } else {
      taskStore.setCycleCountQuantity(quantity)
    }

    if (isScanOnce(task.value) && quantity === 0) {
      barcodeStore.clearBarcodes()
    } else if (isScanEach(task.value) && selectedBarcodes.value) {
      barcodeStore.removeBarcodes(selectedBarcodes.value)
    }
  }
}
const onBarcodesSelected = (sBarcodes: BarcodeDataType[]) => {
  selectedBarcodes.value = sBarcodes
}
const onActiveTabChanged = (tab: CycleCountTabs | undefined) => {
  activeTab.value = tab
}
const onDeleteScanClicked = async () => {
  isScanHintDialogVisible.value = false
  if (selectedCompartment.value?.countedQuantity) {
    await onQuantityChanged(selectedCompartment.value.countedQuantity - 1)
  }
}
const deleteCurrentCount = async () => {
  if (isMultiItemCycleCountTask(task.value)) {
    if (selectedCompartment.value && task.value) {
      const barcodeGroups = getBarcodeGroups(task.value, barcodes.value)
      const groupsToRemove = barcodeGroups.filter((barcodeGroup) =>
        selectedCompartment.value?.items[0].item?.gtins.includes(
          barcodeGroup.barcodes.find(
            (barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin
          )?.barcode ?? ''
        )
      )
      groupsToRemove.forEach((barcodeGroup) =>
        barcodeStore.removeBarcodes(barcodeGroup.barcodes)
      )
      taskStore.resetCycleCountQuantityByItemId(
        selectedCompartment.value.items[0].item.id
      )
      loadCarrier.value!.compartments.find(
        (compartment) =>
          compartment.id === selectedCompartment.value?.id &&
          compartment.stockIndex === selectedCompartment.value?.stockIndex
      )!.countedQuantity = 0
    }
    selectedCompartment.value = undefined
  } else {
    await onQuantityChanged(0)
    barcodeStore.clearBarcodes()
  }
}
const onButtonClicked = async (button: AdvancedCycleCountButtonAction) => {
  if (button === AdvancedCycleCountButtonAction.back) {
    await router.push('/')
  } else if (button === AdvancedCycleCountButtonAction.delete_count) {
    if (selectedCompartment.value) {
      const deleteCount = await deleteCountMessageBoxRef.value.showAndWait()
      if (deleteCount) {
        await deleteCurrentCount()
      }
    }
  } else if (button === AdvancedCycleCountButtonAction.delete_scan) {
    if (!isSourceToSourceCount(cycleCountTask.value)) {
      isScanHintDialogVisible.value = true
    } else {
      await onDeleteScanClicked()
    }
  }
}

// Needed when changing view while scanning
watch(
  cycleCountedQuantities,
  async () => {
    // sets the pcotsLocation to Source when a new barcode got scanned to change the view
    // to the source load carrier and see the new scanned barcode
    pcotsLocation.value = PcotsLocationEnum.Source

    loadCarrier.value = loadCarrierStore.getLoadCarrier(
      loadCarrierDetailsStore.pcotsLocation
    )
    if (loadCarrier.value && task.value) {
      // update selectedCompartment to recognize the latest scans
      let activeCompartment: CompartmentType | undefined
      if (isMultiItemCycleCountTask(task.value)) {
        const itemId = barcodeStore.getLastScannedItem(loadCarrier.value)?.id
        activeCompartment = getCompartmentByItemId(loadCarrier.value, itemId)
      } else {
        activeCompartment = getCompartmentByTask(
          pcotsLocation.value ?? PcotsLocationEnum.Source,
          loadCarrier.value,
          task.value
        )
      }

      if (activeCompartment) {
        activeCompartment.countedQuantity = taskStore.getCycleCountQuantity()
      }
    }
  },
  { deep: true }
)

watch(colorMode, () => {
  loadCarrierStore.updateUnknownItemsUrls()
})

onMounted(async () => {
  if (!loadCarrier.value || !cycleCountTask.value) {
    await onButtonClicked(AdvancedCycleCountButtonAction.back)
  } else {
    connectPcotsEvents(onHandlePcotsEvent)
  }
})
onUnmounted(() => {
  disconnectPcotsEvents()
})

defineExpose({ deleteCurrentCount })
</script>

<template>
  <ScanHintDialog
    v-model:is-visible="isScanHintDialogVisible"
    :mode="ScanModificationMode.delete"
    :task="task"
    :load-carrier="loadCarrier"
    :barcodes="selectedBarcodes"
    :compartment-infos="compartmentInfos"
    @confirm="onDeleteScanClicked"
  />
  <DeleteCountMessageBox ref="deleteCountMessageBoxRef" />
  <div class="advanced-cycle-count-view">
    <div class="header">
      <HeaderWithDetails :text="headerText" :sub-texts="headerSubTexts" />
      <IconButton
        plain
        type="primary"
        class="show-opposite-lc-button"
        icon="double-arrow-right"
        icon-alignment="left"
        :disabled="isShowOppositeLcButtonDisabled"
        :text="showOppositeLcButtonText"
        @click="onShowOppositeLcButtonClicked"
      />
    </div>
    <div class="content">
      <LoadCarrierDetails
        :task="task"
        :load-carrier="loadCarrier"
        :pcots-location="pcotsLocation"
        :show-quantity="cycleCountTask?.showQuantity"
        :selected-compartment="selectedCompartment"
        :is-cycle-count="true"
        @selected-compartment-changed="onSelectedCompartmentChanged"
      />
      <AdvancedCycleCountTabs
        class="content__tabs"
        :load-carrier="loadCarrier!"
        :task="cycleCountTask as CycleCountTaskType"
        :barcodes="currentBarcodes"
        :selected-compartment="selectedCompartment"
        :pcots-location="pcotsLocation"
        @quantity-changed="onQuantityChanged"
        @barcodes-selected="onBarcodesSelected"
        @active-tab-changed="onActiveTabChanged"
      />
    </div>
    <div class="footer">
      <AdvancedCycleCountFooter
        :disabled-buttons="disabledButtons"
        :hidden-buttons="hiddenButtons"
        @button-clicked="onButtonClicked"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.advanced-cycle-count-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;

  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    position: relative;

    :deep(.show-opposite-lc-button) {
      position: absolute;
      margin-top: 32px;
      min-width: v-bind('showOppositeTextMinWidth');
      height: 54px;
      right: 80px;
      text-transform: uppercase;

      span {
        flex: 1;
      }

      .flex-container {
        flex: 1;

        .button-text {
          flex: 1;
          font-family: Roboto, Helvetica, sans-serif;
          font-weight: 700;
          font-size: 16px;
          text-align: right;
        }
      }
    }
  }

  .content {
    display: flex;
    align-items: stretch;
    column-gap: 55px;
    flex: 1;
    margin: 40px;

    .load-carrier-details-container {
      aspect-ratio: var(--pcots-lc-aspect-ratio);
      width: 33%;
      align-self: flex-end;
    }

    .content__tabs {
      flex: 1;
    }
  }
}
</style>
