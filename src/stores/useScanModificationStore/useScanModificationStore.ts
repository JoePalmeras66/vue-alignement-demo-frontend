import { defineStore, storeToRefs } from 'pinia'
import { useLogger } from '@tgw-components/core'
import { useItemScanValidator } from '@/composables/useItemScanValidator/useItemScanValidator'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { ItemScannedEventType } from '@/types/Api/pcots/Events/ItemScanned/ItemScannedEventType'
import { TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { CreateScanModelRecordType } from '@/types/CreateScanModelKeyFormat'
import { BarcodeValidationResult } from '@/types/BarcodeValidationResult'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'

export const useScanModificationStore = defineStore('scanModification', {
  state: () => ({
    isCreateScanDialogVisible: false as boolean,
    createScanModel: {} as CreateScanModelRecordType,
    isItemScanFailedDialogVisible: false as boolean,
    itemScanFailedBackendErrorMessageTranslated: '' as string,
    unknownItemTypeCount: 1 as number,
  }),
  actions: {
    async onItemScan(data: ItemScannedEventType, task: TaskType) {
      const { validateItemScan } = useItemScanValidator()
      let validationResult: BarcodeValidationResult =
        new BarcodeValidationResult(true)
      if (!this.isCreateScanDialogVisible) {
        // Do only validate when the dialog isn't open
        validationResult = await validateItemScan(task, data.barcodes)
        if (validationResult.errorMessageTranslated) {
          this.itemScanFailedBackendErrorMessageTranslated =
            validationResult.errorMessageTranslated
        }
      }

      if (validationResult.isValid) {
        this.handleValidItemScan(data)
      } else if (!this.isCreateScanDialogVisible) {
        this.isItemScanFailedDialogVisible = true
      }
    },
    handleValidItemScan(data: ItemScannedEventType) {
      const {
        isCycleCountTask,
        getCreateScanModelKey,
        isMultiItemCycleCountTask,
        getItemByGtin,
        addNewUnknownItemToSourceLoadCarrier,
      } = useApiDataHelper()
      const barcodeStore = useBarcodeStore()
      const taskStore = useTaskStore()
      const { task } = storeToRefs(taskStore)

      this.isItemScanFailedDialogVisible = false
      if (this.isCreateScanDialogVisible) {
        data.barcodes.forEach((barcode) => {
          this.createScanModel[getCreateScanModelKey(data.barcodes, barcode)] =
            barcode.barcode
        })
      } else {
        barcodeStore.addBarcodes(data.barcodes)
        if (isMultiItemCycleCountTask(task.value)) {
          const { showUnknownItemScanMessageBox } = useItemScanValidator()
          const loadCarrierStore = useLoadCarrierStore()
          const gtin = data.barcodes.find(
            (barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin
          )?.barcode
          let item = getItemByGtin(
            loadCarrierStore.sourceLoadCarrier?.compartments,
            gtin
          )
          if (item === undefined) {
            item = addNewUnknownItemToSourceLoadCarrier(
              data.barcodes,
              this.unknownItemTypeCount
            )
            this.increaseUnknownItemTypeCount()
            showUnknownItemScanMessageBox.value = true
          }
          taskStore.increaseCycleCountQuantity(item?.id)
        } else if (isCycleCountTask(task.value)) {
          taskStore.increaseCycleCountQuantity()
        }
      }
    },
    async handleItemScan(data: ItemScannedEventType) {
      const { isScanningFinished } = useApiDataHelper()
      const logger = useLogger()
      const barcodeStore = useBarcodeStore()
      const taskStore = useTaskStore()
      const { task } = storeToRefs(taskStore)
      const { barcodes } = storeToRefs(barcodeStore)

      if (task.value) {
        if (!isScanningFinished(task.value, barcodes.value)) {
          await this.onItemScan(data, task.value)
        } else {
          logger.info('Scanning is finished already!')
        }
      }
    },
    resetUnknownItemTypeCount() {
      this.unknownItemTypeCount = 1
    },
    increaseUnknownItemTypeCount() {
      this.unknownItemTypeCount++
    },
  },
})
