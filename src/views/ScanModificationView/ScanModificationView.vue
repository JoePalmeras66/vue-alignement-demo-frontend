<script setup lang="ts">
import { Ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePcotsWebsockets } from '@/composables/usePcotsWebsockets'
import { ScanButtonAction } from '@/types/ScanButtonAction'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import {
  BarcodeDataType,
  CompartmentType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import CreateScanDialog from '@/components/CreateScanDialog/CreateScanDialog.vue'
import ScanHintDialog from '@/components/ScanHintDialog/ScanHintDialog.vue'
import { ScanModificationMode } from '@/types/ScanModificationMode'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'
import { ConsolidationActionEnum } from '@/types/ConsolidationActionEnum'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { useTranslations } from '@/composables/useTranslations'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'

const router = useRouter()
const barcodeStore = useBarcodeStore()
const scanModificationStore = useScanModificationStore()
const taskStore = useTaskStore()
const loadCarrierStore = useLoadCarrierStore()
const {
  createScanModel,
  isCreateScanDialogVisible,
  isItemScanFailedDialogVisible,
  itemScanFailedBackendErrorMessageTranslated,
} = storeToRefs(scanModificationStore)
const { isScanningFinished, getCompartmentInfos } = useApiDataHelper()
const selectedBarcodes: Ref<BarcodeDataType[]> = ref<BarcodeDataType[]>([])
const isScanHintDialogVisible: Ref<boolean> = ref<boolean>(false)
const scanHintDialogMode: Ref<ScanModificationMode> = ref<ScanModificationMode>(
  ScanModificationMode.create
)
const { task } = storeToRefs(taskStore)
const { barcodes } = storeToRefs(barcodeStore)
const { sourceLoadCarrier, targetLoadCarrier } = storeToRefs(loadCarrierStore)
const createdScanBarcodeData = ref<BarcodeDataType[]>([])
const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const { workstationDirection } = storeToRefs(useWorkspaceStore())
const activeSourceCompartment = ref<CompartmentType>()
const activeTargetCompartment = ref<CompartmentType>()
const consolidationAction = ref<ConsolidationActionEnum>()
const consolidationMode = ref<ConsolidationModeEnum>()
const { getTranslation } = useTranslations('scan-modification-view')
const { onHandlePcotsEvent } = usePcotsEventHandler()
const headerText = computed(() => {
  return getTranslation('header_text')
})
const headerDescription = computed(() => {
  return getTranslation('header_description')
})
const taskComputed = computed(() => {
  return task.value
})

const onButtonClicked = (button: ScanButtonAction) => {
  if (button === ScanButtonAction.back) {
    router.back()
  } else if (button === ScanButtonAction.delete_scan) {
    scanHintDialogMode.value = ScanModificationMode.delete
    isScanHintDialogVisible.value = true
  } else if (button === ScanButtonAction.create_scan) {
    isCreateScanDialogVisible.value = true
  }
}
const onBarcodesSelected = (barcodes: BarcodeDataType[]) => {
  selectedBarcodes.value = barcodes
}
const disabledButtons = computed((): ScanButtonAction[] => {
  const disabledButtons: ScanButtonAction[] = []
  if (selectedBarcodes.value.length === 0 || barcodes.value.length === 0) {
    disabledButtons.push(ScanButtonAction.delete_scan)
  }
  if (
    task.value &&
    isScanningFinished(task.value as TaskType, barcodes.value)
  ) {
    disabledButtons.push(ScanButtonAction.create_scan)
  }

  return disabledButtons
})
const scanHintDialogLoadCarrier = computed(() => {
  if (scanHintDialogMode.value === ScanModificationMode.create) {
    return targetLoadCarrier.value
  } else if (scanHintDialogMode.value === ScanModificationMode.delete) {
    return sourceLoadCarrier.value
  }

  return undefined
})
const scanHintBarcodes = computed(() => {
  if (scanHintDialogMode.value === ScanModificationMode.create) {
    return createdScanBarcodeData.value
  } else if (scanHintDialogMode.value === ScanModificationMode.delete) {
    return selectedBarcodes.value
  }
  return []
})
const closeHintScanDialog = () => {
  isScanHintDialogVisible.value = false
}

const onConfirmClicked = () => {
  if (scanHintDialogMode.value === ScanModificationMode.create) {
    barcodeStore.addBarcodes(createdScanBarcodeData.value)
    createdScanBarcodeData.value = []
    closeHintScanDialog()
  } else if (scanHintDialogMode.value === ScanModificationMode.delete) {
    closeHintScanDialog()
    barcodeStore.removeBarcodes(selectedBarcodes.value)
    selectedBarcodes.value = []
  }
}
const onContinueClicked = (barcodeData: BarcodeDataType[]) => {
  createdScanBarcodeData.value = barcodeData
  scanHintDialogMode.value = ScanModificationMode.create
  isScanHintDialogVisible.value = true
}

const compartmentInfos = computed(() => {
  if (task.value) {
    let loadCarrier = sourceLoadCarrier.value
    let pcotsLocation = PcotsLocationEnum.Source

    if (scanHintDialogMode.value === ScanModificationMode.create) {
      loadCarrier = targetLoadCarrier.value
      pcotsLocation = PcotsLocationEnum.Target
    }

    return getCompartmentInfos(
      loadCarrier,
      task.value,
      pcotsLocation,
      activeSourceCompartment.value,
      activeTargetCompartment.value,
      consolidationAction.value,
      consolidationMode.value
    )
  }
  return undefined
})

const noScansImage = computed(() => {
  if (isDark.value) {
    return `src/assets/images/item-details/Empty-LC-Dark.svg`
  } else {
    return `src/assets/images/item-details/Empty-LC-Light.svg`
  }
})

const noScansBackground = computed(() => {
  if (isDark.value) {
    return `src/assets/fallback_bg_decoration-dark.svg`
  } else {
    return `src/assets/fallback_bg_decoration-light.svg`
  }
})

const noScansText = computed(() => {
  return getTranslation('no_scans')
})

onMounted(async () => {
  if (!taskStore.hasTask) {
    onButtonClicked(ScanButtonAction.back)
  } else {
    connectPcotsEvents(onHandlePcotsEvent)
  }
})

onUnmounted(() => {
  disconnectPcotsEvents()
})
</script>

<template>
  <ItemScanFailedDialog
    v-model:is-visible="isItemScanFailedDialogVisible"
    :error-message="itemScanFailedBackendErrorMessageTranslated"
  />
  <div class="scan-modification-view">
    <div class="header">
      <span class="header-text">{{ headerText }}</span>
      <span class="header-description">{{ headerDescription }}</span>
    </div>
    <div class="content">
      <ScanList
        v-if="barcodes.length > 0"
        :barcodes="barcodes"
        :task="task"
        @barcodes-selected="onBarcodesSelected"
      />
      <div v-else class="no-scans-container">
        <img
          class="no-scans-bg"
          :src="noScansBackground"
          :alt="noScansBackground"
        />
        <img class="no-scans-image" :src="noScansImage" :alt="noScansImage" />
        <span class="no-scans-text">{{ noScansText }}</span>
      </div>
    </div>
    <div class="footer">
      <ScanFooter
        :disabled-buttons="disabledButtons"
        @button-clicked="onButtonClicked"
      />
    </div>
  </div>
  <CreateScanDialog
    v-model:is-visible="isCreateScanDialogVisible"
    :task="taskComputed"
    :create-scan-model="createScanModel"
    @continue="onContinueClicked"
  />
  <ScanHintDialog
    v-model:is-visible="isScanHintDialogVisible"
    :mode="scanHintDialogMode"
    :task="taskComputed"
    :load-carrier="scanHintDialogLoadCarrier"
    :barcodes="scanHintBarcodes"
    :workstation-direction="workstationDirection"
    :compartment-infos="compartmentInfos"
    @confirm="onConfirmClicked"
  />
</template>

<style scoped lang="scss">
.scan-modification-view {
  display: flex;
  flex-direction: column;
  background-color: var(--tgw-bg-10);
  width: 100%;
  min-height: 100vh;
  height: 100%;

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 44px;
    margin-bottom: 84px;
    row-gap: 20px;

    .header-text {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      font-weight: 700;
      font-size: 36px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .header-description {
      font-family: Roboto, Helvetica, sans-serif;
      font-weight: 700;
      font-size: 24px;
      letter-spacing: 1px;
      color: var(--tgw-text-sub);
    }
  }
  .content {
    //Footer height - header height - header margin-top - header margin-bottom - header gap - header-description height
    --pcots-scan-content-height: calc(
      100vh - var(--pcots-footer-bottom-height) - 36px - 44px - 84px - 32px -
        29px
    );
    .scan-list {
      height: var(--pcots-scan-content-height);
    }

    .no-scans-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: calc(var(--pcots-scan-content-height) - 130px);
      margin-bottom: 130px;

      .no-scans-bg {
        bottom: var(--pcots-footer-bottom-height);
        position: absolute;
        transform: translateX(40px);
        height: auto;
        width: auto;
      }

      .no-scans-image {
        width: 216px;
        height: 216px;
      }

      .no-scans-text {
        font-weight: 700;
        font-size: 32px;
        color: var(--tgw-text-secondary);
        text-align: center;
        margin-top: 34px;
      }
    }
  }
}
</style>
