import { defineStore } from 'pinia'
import {
  BarcodeDataType,
  LoadCarrierType,
} from '@/types/Api/pcots/PcotsApiModel'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'

export const useBarcodeStore = defineStore('barcode', {
  state: () => ({
    barcodes: [] as BarcodeDataType[],
    lastScannedBarcodes: [] as BarcodeDataType[],
  }),
  actions: {
    addBarcode(barcode: BarcodeDataType) {
      this.barcodes.push(barcode)
    },
    addBarcodes(barcodes: BarcodeDataType[]) {
      const taskStore = useTaskStore()
      const { shouldAddBarcode } = useApiDataHelper()

      barcodes.forEach((barcode) => {
        if (
          taskStore.task &&
          shouldAddBarcode(
            taskStore.task,
            barcodes.find(
              (barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin
            )
          )
        ) {
          this.addBarcode(barcode)
        }
        this.lastScannedBarcodes = barcodes
      })
    },
    removeBarcode(barcode: BarcodeDataType) {
      this.barcodes.splice(this.barcodes.indexOf(barcode), 1)
    },
    removeBarcodes(barcodes: BarcodeDataType[]) {
      barcodes.forEach((barcode) => {
        this.removeBarcode(barcode)
      })
    },
    clearBarcodes() {
      this.barcodes = []
    },
  },
  getters: {
    getLastScannedItem: (state) => {
      const { getItemByGtin } = useApiDataHelper()
      return (sourceLoadCarrier: LoadCarrierType | undefined) => {
        if (state.barcodes.length === 0) {
          return
        }

        const lastScannedGtin = state.lastScannedBarcodes
          .filter((barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin)
          .reverse()
        if (lastScannedGtin?.length > 0) {
          return getItemByGtin(
            sourceLoadCarrier?.compartments,
            lastScannedGtin[0].barcode
          )
        }
      }
    },
  },
})
