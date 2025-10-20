import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { useItemScanValidator } from '@/composables/useItemScanValidator/useItemScanValidator'
import {
  BarcodeDataType,
  BarcodeType,
  MultiItemCycleCountTaskType,
  PickingTaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
  TaskTypeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { VerifyBarcodeRequestType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeRequestType'
import i18n from '@/plugins/i18nFactory'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { getItem1, getSourceLoadCarrier } from '@/helpers/testDataProvider'
import { useApiMock } from '@/helpers/useApiMock'

const { mockVerifyBarcodeApi } = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  verifyBarcodeApi: (request: VerifyBarcodeRequestType) =>
    mockVerifyBarcodeApi(request),
}))

setActivePinia(createPinia())

describe('Test useItemScanValidator', () => {
  const i18nPlugin = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        testing: {
          specific_barcode_valid: 'Only {0} is valid!',
        },
      },
    },
  })

  // Set i18n for composable useMessage
  i18n.global.t = i18nPlugin.global.t

  const loadCarrierStore = useLoadCarrierStore()
  const { validateItemScan } = useItemScanValidator()
  const getPickingTaskWithBarcodes = (
    barcodes: BarcodeType[],
    gtin: string
  ) => {
    return {
      id: '',
      type: TaskTypeEnum.PickingTask,
      sourceLoadCarrierId: '0815',
      targetLoadCarrierId: '4711',
      sourceCompartmentId: '1',
      targetCompartmentId: '',
      quantity: { value: 10 },
      verifyBarcode: false,
      zeroCrossing: false,
      barcodes,
      item: { gtins: [gtin] },
    } as PickingTaskType
  }
  const getPickingTaskWithBarcodesAndBackendValidation = (
    barcodes: BarcodeType[]
  ) => {
    return {
      id: '',
      type: TaskTypeEnum.PickingTask,
      sourceLoadCarrierId: '0815',
      targetLoadCarrierId: '4711',
      sourceCompartmentId: '1',
      targetCompartmentId: '',
      quantity: { value: 10 },
      verifyBarcode: true,
      zeroCrossing: false,
      barcodes,
    } as PickingTaskType
  }
  const getMultiItemCycleCountTaskWithBarcodes = (barcodes: BarcodeType[]) => {
    return {
      id: '',
      type: TaskTypeEnum.MultiItemCycleCountTask,
      sourceLoadCarrierId: '0815',
      sourceCompartmentId: '1',
      verifyBarcode: false,
      zeroCrossing: false,
      barcodes,
      recount: false,
      showQuantity: false,
    } as MultiItemCycleCountTaskType
  }
  const getBarcode = (barcodeType: BarcodeTypeEnum, format = '') => {
    return {
      barcodeType,
      scanRule: ScanRuleEnum.ScanOnce,
      format,
    } as BarcodeType
  }

  beforeEach(() => {
    mockVerifyBarcodeApi.mockClear()
  })

  it('should validate valid gtin', async () => {
    const gtin = '0815'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Gtin
    const scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: gtin }]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, '')],
      gtin
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeTruthy()
  })

  it('should validate invalid gtin', async () => {
    const gtin = '0815'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Gtin
    const scannedBarcodes: BarcodeDataType[] = [
      { barcodeType, barcode: 'WRONGGTIN' },
    ]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, '')],
      gtin
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeFalsy()
  })

  it('should validate valid imei', async () => {
    const imei = '358724043184400'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Imei
    const scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: imei }]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, '')],
      ''
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeTruthy()
  })

  it('should validate invalid imei(too short)', async () => {
    const imei = '0815'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Imei
    const scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: imei }]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, '')],
      ''
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeFalsy()
  })

  it('should validate invalid imei(wrong checksum)', async () => {
    const imei = '358724043184409'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Imei
    const scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: imei }]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, '')],
      ''
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeFalsy()
  })

  it('should validate valid gtin with format on task', async () => {
    const gtin = '5'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Gtin
    const format = '^[0-9]$'
    const scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: gtin }]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, format)],
      ''
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeTruthy()
  })

  it('should validate invalid gtin with format on task', async () => {
    const gtin = '10'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Gtin
    const format = '^[0-9]$'
    const scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: gtin }]
    const pickingTask = getPickingTaskWithBarcodes(
      [getBarcode(barcodeType, format)],
      ''
    )
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeFalsy()
  })

  it('should validate valid serial with backend call', async () => {
    const serial = '69'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Serial
    const scannedBarcodes: BarcodeDataType[] = [
      { barcodeType, barcode: serial },
    ]
    const pickingTask = getPickingTaskWithBarcodesAndBackendValidation([
      getBarcode(barcodeType, ''),
    ])
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeTruthy()
  })

  it('should validate invalid serial with backend call', async () => {
    const serial = '1'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Serial
    const scannedBarcodes: BarcodeDataType[] = [
      { barcodeType, barcode: serial },
    ]
    const pickingTask = getPickingTaskWithBarcodesAndBackendValidation([
      getBarcode(barcodeType, ''),
    ])
    const result = await validateItemScan(pickingTask, scannedBarcodes)
    expect(result.isValid).toBeFalsy()
    expect(result.errorMessageTranslated).toBe('Only 69 is valid!')
  })

  it('should call verify barcode once for all barcodes', async () => {
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Serial
    const scannedBarcodes: BarcodeDataType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '123213' },
      { barcodeType: BarcodeTypeEnum.Serial, barcode: '1' },
    ]
    const pickingTask = getPickingTaskWithBarcodesAndBackendValidation([
      getBarcode(barcodeType, ''),
    ])
    await validateItemScan(pickingTask, scannedBarcodes)
    expect(mockVerifyBarcodeApi).toHaveBeenCalledOnce()
  })

  it('should validate gtin with multiItemCycleCountTask', async () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    sourceLoadCarrier.compartments[0].items[0].item = getItem1('5')
    loadCarrierStore.sourceLoadCarrier = sourceLoadCarrier
    let gtin = '5'
    const barcodeType: BarcodeTypeEnum = BarcodeTypeEnum.Gtin
    let scannedBarcodes: BarcodeDataType[] = [{ barcodeType, barcode: gtin }]
    let multiItemCycleCountTask = getMultiItemCycleCountTaskWithBarcodes([
      getBarcode(barcodeType),
    ])
    let result = await validateItemScan(
      multiItemCycleCountTask,
      scannedBarcodes
    )
    expect(result.isValid).toBeTruthy()

    gtin = '6'
    scannedBarcodes = [{ barcodeType, barcode: gtin }]
    multiItemCycleCountTask = getMultiItemCycleCountTaskWithBarcodes([
      getBarcode(barcodeType),
    ])
    result = await validateItemScan(multiItemCycleCountTask, scannedBarcodes)
    // true as there is no check for gtin in multiItemCycleCount as it could be an unknown item which is not in the load carrier
    expect(result.isValid).toBeTruthy()
  })
})
