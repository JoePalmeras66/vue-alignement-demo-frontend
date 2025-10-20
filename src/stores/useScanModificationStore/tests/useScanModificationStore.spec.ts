import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'
import {
  getCycleCountTask,
  getMultiItemCycleCountTask,
  getPickingTask,
  getPurgeAndRecallTask,
  getSourceLoadCarrier,
  getUnknownItemCompartment,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { ItemScannedEventType } from '@/types/Api/pcots/Events/ItemScanned/ItemScannedEventType'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { VerifyBarcodeRequestType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeRequestType'
import { buildCreateScanModelKeyFormat } from '@/types/CreateScanModelKeyFormat'
import { setConsoleLogger } from '@/helpers/loggerHelper'
import { useApiMock } from '@/helpers/useApiMock'
import i18n from '@/plugins/i18nFactory'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { BarcodeDataType, BarcodeType } from '@/types/Api/pcots/PcotsApiModel'

const { mockVerifyBarcodeApi } = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  verifyBarcodeApi: (request: VerifyBarcodeRequestType) =>
    mockVerifyBarcodeApi(request),
}))

setActivePinia(createPinia())

describe('Test useScanModificationStore', () => {
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

  setConsoleLogger()
  const pickingTask = getPickingTask(
    10,
    [{ barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach }],
    '69'
  )
  const pickingTaskWithBackendValidation = getPickingTask(
    10,
    [{ barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach }],
    '69',
    true
  )
  const cycleCountTask = getCycleCountTask(
    'S2T',
    [{ barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach }],
    false,
    '69'
  )
  const purgeAndRecallTask = getPurgeAndRecallTask(
    7,
    [{ barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach }],
    '69'
  )
  const purgeAndRecallTaskWithBEValidation = getPurgeAndRecallTask(
    10,
    [{ barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach }],
    '69',
    true
  )
  const correctScan: ItemScannedEventType = {
    barcodes: [{ barcode: '69', barcodeType: BarcodeTypeEnum.Gtin }],
  }
  const incorrectScanNumber: ItemScannedEventType = {
    barcodes: [{ barcode: '70', barcodeType: BarcodeTypeEnum.Gtin }],
  }
  const scanModificationStore = useScanModificationStore()
  const barcodeStore = useBarcodeStore()
  const taskStore = useTaskStore()
  const loadCarrierStore = useLoadCarrierStore()

  beforeEach(() => {
    scanModificationStore.$reset()
    barcodeStore.$reset()
    taskStore.$reset()
    loadCarrierStore.$reset()
  })

  it('should handle correct scan', async () => {
    taskStore.setTask(pickingTask)
    await scanModificationStore.handleItemScan(correctScan)
    expect(barcodeStore.barcodes.length).toBe(1)
  })

  it('should handle correct scan with dialog open', async () => {
    scanModificationStore.isCreateScanDialogVisible = true
    taskStore.setTask(pickingTask)
    await scanModificationStore.handleItemScan(correctScan)
    expect(barcodeStore.barcodes.length).toBe(0)
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Gtin, 1)
      ]
    ).toBe('69')
  })

  it('should finish scanning', async () => {
    taskStore.setTask(pickingTask)
    for (let i = 0; i < 11; i++) {
      await scanModificationStore.handleItemScan(correctScan)
    }
    expect(barcodeStore.barcodes.length).toBe(10)
  })

  it('should handle incorrect scan', async () => {
    taskStore.setTask(pickingTask)
    await scanModificationStore.handleItemScan(incorrectScanNumber)
    expect(barcodeStore.barcodes.length).toBe(0)
    expect(scanModificationStore.isItemScanFailedDialogVisible).toBeTruthy()
  })

  it('should increase cycle count quantity after scan', async () => {
    taskStore.setTask(cycleCountTask)
    await scanModificationStore.handleItemScan(correctScan)
    expect(taskStore.getCycleCountQuantity()).toBe(1)
  })

  it('should not increase cycle count quantity after incorrect scan', async () => {
    taskStore.setTask(cycleCountTask)
    expect(taskStore.getCycleCountQuantity()).toBe(0)
    await scanModificationStore.handleItemScan(incorrectScanNumber)
    expect(taskStore.getCycleCountQuantity()).toBe(0)
  })

  it('should set error message from backend', async () => {
    taskStore.setTask(pickingTaskWithBackendValidation)
    await scanModificationStore.handleItemScan(incorrectScanNumber)
    expect(
      scanModificationStore.itemScanFailedBackendErrorMessageTranslated
    ).toBe('Only 69 is valid!')
  })

  it('should not set error message from backend', async () => {
    taskStore.setTask(pickingTaskWithBackendValidation)
    await scanModificationStore.handleItemScan(correctScan)
    expect(
      scanModificationStore.itemScanFailedBackendErrorMessageTranslated
    ).toBe('')
  })

  it('should support multiple barcodes of same barcodeType', async () => {
    scanModificationStore.isCreateScanDialogVisible = true
    taskStore.setTask(
      getPickingTask(
        10,
        [
          {
            barcodeType: BarcodeTypeEnum.Gtin,
            scanRule: ScanRuleEnum.ScanEach,
          },
          {
            barcodeType: BarcodeTypeEnum.Imei,
            scanRule: ScanRuleEnum.ScanEach,
          },
          {
            barcodeType: BarcodeTypeEnum.Imei,
            scanRule: ScanRuleEnum.ScanEach,
          },
        ],
        '69',
        false
      )
    )
    // No validation should be done so we can use invalid imeis
    await scanModificationStore.handleItemScan({
      barcodes: [
        { barcodeType: BarcodeTypeEnum.Gtin, barcode: '69' },
        {
          barcodeType: BarcodeTypeEnum.Imei,
          barcode: '1',
        },
        { barcodeType: BarcodeTypeEnum.Imei, barcode: '2' },
      ],
    })
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Gtin, 1)
      ]
    ).toBe('69')
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 1)
      ]
    ).toBe('1')
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 2)
      ]
    ).toBe('2')
  })

  it('should add new unknown item if the gtin could not be found in the load carrier', async () => {
    taskStore.task = getMultiItemCycleCountTask('S2T', [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      } as BarcodeType,
    ])
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    expect(loadCarrierStore.sourceLoadCarrier.compartments.length).toBe(1)
    expect(scanModificationStore.unknownItemTypeCount).toBe(1)
    scanModificationStore.handleValidItemScan({
      barcodes: [
        {
          barcode: '4321',
          barcodeType: BarcodeTypeEnum.Gtin,
        } as BarcodeDataType,
      ],
    } as ItemScannedEventType)
    expect(loadCarrierStore.sourceLoadCarrier.compartments.length).toBe(2)
    expect(loadCarrierStore.sourceLoadCarrier.compartments[1]).toEqual(
      getUnknownItemCompartment('1', 1, 1, [
        { barcodeType: BarcodeTypeEnum.Gtin, barcode: '4321' },
      ])
    )
    expect(scanModificationStore.unknownItemTypeCount).toBe(2)
  })

  it('should reset unknownItemTypeCount to 1', () => {
    scanModificationStore.unknownItemTypeCount = 3
    expect(scanModificationStore.unknownItemTypeCount).toBe(3)
    scanModificationStore.resetUnknownItemTypeCount()
    expect(scanModificationStore.unknownItemTypeCount).toBe(1)
  })

  it('should handle purge and recall correct scan', async () => {
    taskStore.setTask(purgeAndRecallTask)
    await scanModificationStore.handleItemScan(correctScan)
    expect(barcodeStore.barcodes.length).toBe(1)
  })

  it('should finish purge and recall scanning', async () => {
    taskStore.setTask(purgeAndRecallTask)
    for (let i = 0; i < 11; i++) {
      await scanModificationStore.handleItemScan(correctScan)
    }
    expect(barcodeStore.barcodes.length).toBe(7)
  })

  it('should handle purge and recall correct scan with dialog open', async () => {
    scanModificationStore.isCreateScanDialogVisible = true
    taskStore.setTask(purgeAndRecallTask)
    await scanModificationStore.handleItemScan(correctScan)
    expect(barcodeStore.barcodes.length).toBe(0)
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Gtin, 1)
      ]
    ).toBe('69')
  })

  it('should handle purge and recall incorrect scan', async () => {
    taskStore.setTask(purgeAndRecallTask)
    await scanModificationStore.handleItemScan(incorrectScanNumber)
    expect(barcodeStore.barcodes.length).toBe(0)
    expect(scanModificationStore.isItemScanFailedDialogVisible).toBeTruthy()
  })

  it('should set error message from backend for purge and recall task', async () => {
    taskStore.setTask(purgeAndRecallTaskWithBEValidation)
    await scanModificationStore.handleItemScan(incorrectScanNumber)
    expect(
      scanModificationStore.itemScanFailedBackendErrorMessageTranslated
    ).toBe('Only 69 is valid!')
  })

  it('should not set error message from backend for purge and recall task', async () => {
    taskStore.setTask(purgeAndRecallTaskWithBEValidation)
    await scanModificationStore.handleItemScan(correctScan)
    expect(
      scanModificationStore.itemScanFailedBackendErrorMessageTranslated
    ).toBe('')
  })

  it('should support multiple barcodes of same barcodeType for purge and recall task', async () => {
    scanModificationStore.isCreateScanDialogVisible = true
    taskStore.setTask(
      getPurgeAndRecallTask(
        7,
        [
          {
            barcodeType: BarcodeTypeEnum.Gtin,
            scanRule: ScanRuleEnum.ScanEach,
          },
          {
            barcodeType: BarcodeTypeEnum.Imei,
            scanRule: ScanRuleEnum.ScanEach,
          },
          {
            barcodeType: BarcodeTypeEnum.Imei,
            scanRule: ScanRuleEnum.ScanEach,
          },
        ],
        '69',
        false
      )
    )
    // No validation should be done so we can use invalid imeis
    await scanModificationStore.handleItemScan({
      barcodes: [
        { barcodeType: BarcodeTypeEnum.Gtin, barcode: '69' },
        {
          barcodeType: BarcodeTypeEnum.Imei,
          barcode: '1',
        },
        { barcodeType: BarcodeTypeEnum.Imei, barcode: '2' },
      ],
    })
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Gtin, 1)
      ]
    ).toBe('69')
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 1)
      ]
    ).toBe('1')
    expect(
      scanModificationStore.createScanModel[
        buildCreateScanModelKeyFormat(BarcodeTypeEnum.Imei, 2)
      ]
    ).toBe('2')
  })
})
