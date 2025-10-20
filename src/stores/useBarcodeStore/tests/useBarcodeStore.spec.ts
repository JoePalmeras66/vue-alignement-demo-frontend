import { beforeEach, describe, expect, it } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import {
  getBarcodeData,
  getItem1,
  getItem2,
  getMultiItemCycleCountTask,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { BarcodeType } from '@/types/Api/pcots/PcotsApiModel'

setActivePinia(createPinia())
describe('Test useBarcodeStore', () => {
  const barcodeStore = useBarcodeStore()
  const barcode1 = getBarcodeData(BarcodeTypeEnum.Gtin)
  const barcode2 = getBarcodeData(BarcodeTypeEnum.Gtin, '0816')
  const taskStore = useTaskStore()

  beforeEach(() => {
    barcodeStore.$reset()
    taskStore.$reset()

    const barcodeTypes: BarcodeType[] = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    taskStore.task = getMultiItemCycleCountTask('S2T', barcodeTypes)
  })

  it('should add barcode', () => {
    barcodeStore.addBarcode(barcode1)
    expect(barcodeStore.barcodes.length).toBe(1)
    expect(barcodeStore.barcodes[0]).toStrictEqual(barcode1)
  })

  it('should add barcodes', () => {
    barcodeStore.addBarcodes([barcode1, barcode2])
    expect(barcodeStore.barcodes.length).toBe(2)
    expect(barcodeStore.barcodes[0]).toStrictEqual(barcode1)
    expect(barcodeStore.barcodes[1]).toStrictEqual(barcode2)
  })

  it('should add barcodes', () => {
    barcodeStore.addBarcodes([barcode1, barcode2])
    barcodeStore.clearBarcodes()
    expect(barcodeStore.barcodes.length).toBe(0)
  })

  it('should remove barcode', () => {
    barcodeStore.addBarcodes([barcode1, barcode2])
    barcodeStore.removeBarcode(barcode1)
    expect(barcodeStore.barcodes.length).toBe(1)
  })

  it('should remove barcodes', () => {
    barcodeStore.addBarcodes([barcode1, barcode2])
    barcodeStore.removeBarcodes([barcode1, barcode2])
    expect(barcodeStore.barcodes.length).toBe(0)
  })

  it('should return the last scanned item', () => {
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments[0].items[0] = {
      item: getItem1('0815'),
      quantity: 10,
    }
    loadCarrier.compartments[0].items[1] = {
      item: getItem2('0816'),
      quantity: 20,
    }
    barcodeStore.addBarcodes([barcode1, barcode2])
    expect(barcodeStore.getLastScannedItem(loadCarrier)).toEqual(
      getItem2('0816')
    )
  })
})
