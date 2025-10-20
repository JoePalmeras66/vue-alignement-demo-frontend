import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  getCompartment,
  getConsolidationTask,
  getCycleCountTask,
  getEmptyCompartment,
  getItem1,
  getItem2,
  getManualConsolidationTask,
  getMultiItemCompartment,
  getMultiItemCycleCountTask,
  getMultiItemLoadCarrier,
  getNoReadLoadCarrier,
  getPickingTask,
  getPurgeAndRecallTask,
  getSourceLoadCarrier,
  getSourceLoadCarrierWithCompartments,
  getTargetLoadCarrier,
  getUnknownItemCompartment,
} from '@/helpers/testDataProvider'
import {
  AdditionalDataKeyEnum,
  BarcodeTypeEnum,
  PcotsLocationEnum,
  ScanRuleEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { WorkStationProcess } from '@/types/WorkStationProcess'
import {
  BarcodeDataType,
  BarcodeType,
  CompartmentType,
  CycleCountTaskType,
  MultiItemCycleCountTaskType,
  StockType,
} from '@/types/Api/pcots/PcotsApiModel'
import { ConsolidationActionEnum } from '@/types/ConsolidationActionEnum'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { CompartmentState } from '@/types/CompartmentState'
import { CompartmentInfo } from '@/types/CompartmentInfo'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { CycleCountState } from '@/types/CycleCountState'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { setConsoleLogger } from '@/helpers/loggerHelper'

setActivePinia(createPinia())

describe('Test useApiDataHelper', () => {
  const {
    isMultiItem,
    isMultiItemCompartment,
    getStockCompartments,
    getStockFromCompartment,
    getCompartmentByTask,
    getWorkStationProcess,
    willSourceBeEmptyAfterPick,
    isLoadCarrierEmpty,
    isLoadCarrierFilled,
    hasSameItem,
    getCompartmentIdByTask,
    getLoadCarrierIdByTask,
    getConfirmedItems,
    isZeroCrossingTask,
    getItemFromTask,
    getQuantityFromTask,
    getBarcodesFromTask,
    getGtinsFromTask,
    getVerifyBarcodeFromTask,
    getScannedAmount,
    isScanningRequired,
    isScanOnce,
    isScanEach,
    isSourceToSourceCount,
    isScanningFinished,
    isFirstScanFinished,
    isCompartmentEmpty,
    getCompartmentInfos,
    refreshIsCompleted,
    refreshCycleCountState,
    isCompartmentCounted,
    getAdditionalDataValue,
    getItemCountWithQuantityLargerZero,
    isTaskSplitted,
    getCompartmentByItemId,
    getItemByGtin,
    addNewUnknownItemToSourceLoadCarrier,
    isUnknownItem,
    hasUnknownItem,
    hasNotScannedBarcodeBefore,
    shouldAddBarcode,
    getUnknownItem,
  } = useApiDataHelper()

  setConsoleLogger()

  it('should return correct value for isMultiItemCompartment', () => {
    let compartment = getCompartment()
    let isMultiItemCompartmentValue = isMultiItemCompartment(compartment)
    expect(isMultiItemCompartmentValue).toBeFalsy()
    compartment = getMultiItemCompartment()
    isMultiItemCompartmentValue = isMultiItemCompartment(compartment)
    expect(isMultiItemCompartmentValue).toBeTruthy()
  })

  it('should return correct value for isMultiItem', () => {
    let loadCarrier = getSourceLoadCarrier()
    let isMultiItemValue = isMultiItem(loadCarrier.compartments)
    expect(isMultiItemValue).toBeFalsy()
    loadCarrier = getMultiItemLoadCarrier()
    isMultiItemValue = isMultiItem(loadCarrier.compartments)
    expect(isMultiItemValue).toBeTruthy()

    const compartments1 = getStockCompartments(loadCarrier.compartments)
    expect(isMultiItem(compartments1)).toBeTruthy()
    const compartments2 = [getCompartment()]
    expect(isMultiItem(compartments2)).toBeFalsy()
  })

  it('should return correct stock compartments with zero quantity', () => {
    const compartmentWithZeroQuantity = getCompartment()
    compartmentWithZeroQuantity.items[0].quantity = 0
    compartmentWithZeroQuantity.items.push(compartmentWithZeroQuantity.items[0])
    const expected = [
      { id: '1', items: [], stockIndex: 0 },
      { id: '1', items: [], stockIndex: 1 },
    ] as CompartmentType[]
    expect(getStockCompartments([compartmentWithZeroQuantity])).toEqual(
      expected
    )
  })

  it('should return correct stockCompartments for every stock', () => {
    const multiItemCompartment = getMultiItemCompartment()
    const singeItemCompartment = getCompartment()
    let compartments = [singeItemCompartment]
    let getStockCompartmentsValue = getStockCompartments(compartments)
    expect(getStockCompartmentsValue).toEqual([
      { ...singeItemCompartment, stockIndex: 0 },
    ])
    compartments = [multiItemCompartment]
    getStockCompartmentsValue = getStockCompartments(compartments)
    const item1 = getItem1()
    const item2 = getItem2()
    const multiItemCompartmentStocks = [
      {
        id: multiItemCompartment.id,
        items: [
          {
            item: { ...item1 },
            quantity: multiItemCompartment.items[0].quantity,
          },
        ],
        stockIndex: 0,
      },
      {
        id: multiItemCompartment.id,
        items: [
          {
            item: { ...item2 },
            quantity: multiItemCompartment.items[1].quantity,
          },
        ],
        stockIndex: 1,
      },
    ]
    expect(getStockCompartmentsValue).toEqual(multiItemCompartmentStocks)
    multiItemCompartment.id = '2'
    compartments = [singeItemCompartment, multiItemCompartment]
    getStockCompartmentsValue = getStockCompartments(compartments)
    const mixedItemCompartmentStocks = [
      {
        id: singeItemCompartment.id,
        items: [
          {
            item: { ...item1 },
            quantity: singeItemCompartment.items[0].quantity,
          },
        ],
        stockIndex: 0,
      },
      {
        id: multiItemCompartment.id,
        items: [
          {
            item: { ...item1 },
            quantity: multiItemCompartment.items[0].quantity,
          },
        ],
        stockIndex: 0,
      },
      {
        id: multiItemCompartment.id,
        items: [
          {
            item: { ...item2 },
            quantity: multiItemCompartment.items[1].quantity,
          },
        ],
        stockIndex: 1,
      },
    ]
    expect(getStockCompartmentsValue).toEqual(mixedItemCompartmentStocks)
  })

  it('should return correct stock', () => {
    const compartment = getMultiItemCompartment()
    const task = getConsolidationTask()
    task.item = getItem1()
    let getStockFromCompartmentValue = getStockFromCompartment(
      compartment,
      task
    )
    expect(getStockFromCompartmentValue).toEqual({
      item: { ...getItem1() },
      quantity: compartment.items[0].quantity,
    })
    task.item = getItem2()
    getStockFromCompartmentValue = getStockFromCompartment(compartment, task)
    expect(getStockFromCompartmentValue).toEqual({
      item: { ...getItem2() },
      quantity: compartment.items[1].quantity,
    })
  })

  it('should return correct compartment from task with stock compartments', () => {
    const multiItemCompartment = getMultiItemCompartment()
    const stockCompartments = getStockCompartments([multiItemCompartment])
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments = stockCompartments
    const task = getPickingTask(1)
    task.item = getItem1()
    let compartmentFromTask = getCompartmentByTask(
      PcotsLocationEnum.Source,
      loadCarrier,
      task
    )

    expect(compartmentFromTask).toBeTruthy()
    expect(compartmentFromTask?.id).toBe('1')
    expect(compartmentFromTask?.stockIndex).toBe(0)

    task.item = getItem2()
    compartmentFromTask = getCompartmentByTask(
      PcotsLocationEnum.Source,
      loadCarrier,
      task
    )

    expect(compartmentFromTask).toBeTruthy()
    expect(compartmentFromTask?.id).toBe('1')
    expect(compartmentFromTask?.stockIndex).toBe(1)

    loadCarrier.compartments = [getCompartment()]
    compartmentFromTask = getCompartmentByTask(
      PcotsLocationEnum.Source,
      loadCarrier,
      task
    )
    expect(compartmentFromTask).toBeTruthy()
    expect(compartmentFromTask?.id).toBe('1')
    expect(compartmentFromTask?.stockIndex).toBe(undefined)

    loadCarrier.compartments = stockCompartments
    task.item.id = '123123123'
    compartmentFromTask = getCompartmentByTask(
      PcotsLocationEnum.Source,
      loadCarrier,
      task
    )
    expect(compartmentFromTask).toBe(undefined)
  })

  it('should return correct workstation process without task', () => {
    let workstationProcess = getWorkStationProcess(
      undefined,
      WorkStationModeEnum.Picking
    )
    expect(workstationProcess).toBe(WorkStationProcess.Picking)
    workstationProcess = getWorkStationProcess(
      undefined,
      WorkStationModeEnum.Consolidation
    )
    expect(workstationProcess).toBe(WorkStationProcess.Consolidation)
    workstationProcess = getWorkStationProcess(
      undefined,
      WorkStationModeEnum.CycleCount
    )
    expect(workstationProcess).toBe(WorkStationProcess.CycleCounting)
    workstationProcess = getWorkStationProcess(
      undefined,
      WorkStationModeEnum.PurgeAndRecall
    )
    expect(workstationProcess).toBe(WorkStationProcess.PurgeAndRecall)
  })

  it('should return correct workstation process with task', () => {
    let workstationProcess = getWorkStationProcess(
      getPickingTask(10),
      WorkStationModeEnum.Consolidation
    )
    expect(workstationProcess).toBe(WorkStationProcess.Picking)
    workstationProcess = getWorkStationProcess(
      getConsolidationTask(),
      WorkStationModeEnum.Picking
    )
    expect(workstationProcess).toBe(WorkStationProcess.Consolidation)
    workstationProcess = getWorkStationProcess(
      getCycleCountTask('S2T'),
      WorkStationModeEnum.Consolidation
    )
    expect(workstationProcess).toBe(WorkStationProcess.CycleCounting)
    workstationProcess = getWorkStationProcess(
      getPurgeAndRecallTask(77),
      WorkStationModeEnum.PurgeAndRecall
    )
    expect(workstationProcess).toBe(WorkStationProcess.PurgeAndRecall)
  })

  it('should return correct compartment id by task', () => {
    const pickingTask = getPickingTask(10)

    let compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Source,
      pickingTask
    )
    expect(compartmentId).toBe('1')
    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Target,
      pickingTask
    )
    expect(compartmentId).toBe('1')

    const consolidationTask = getConsolidationTask()

    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Source,
      consolidationTask
    )
    expect(compartmentId).toBe('1')
    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Target,
      consolidationTask
    )
    expect(compartmentId).toBe('1')

    const cycleCountTask = getCycleCountTask('S2T')

    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Source,
      cycleCountTask
    )
    expect(compartmentId).toBe('1')
    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Target,
      cycleCountTask
    )
    expect(compartmentId).toBe('1')

    const cycleCountTaskS2S = getCycleCountTask('S2S')
    cycleCountTaskS2S.targetCompartmentId = undefined

    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Source,
      cycleCountTaskS2S
    )
    expect(compartmentId).toBe('1')
    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Target,
      cycleCountTaskS2S
    )
    expect(compartmentId).toBe('1')

    const purgeAndRecallTask = getPurgeAndRecallTask(77)

    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Source,
      purgeAndRecallTask
    )
    expect(compartmentId).toBe('1')
    compartmentId = getCompartmentIdByTask(
      PcotsLocationEnum.Target,
      purgeAndRecallTask
    )
    expect(compartmentId).toBe('1')
  })

  it('should return correct load carrier id by task', () => {
    const pickingTask = getPickingTask(10)

    let loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Source,
      pickingTask
    )
    expect(loadCarrierId).toBe('4711')
    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Target,
      pickingTask
    )
    expect(loadCarrierId).toBe('4712')

    const consolidationTask = getConsolidationTask()

    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Source,
      consolidationTask
    )
    expect(loadCarrierId).toBe('4711')
    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Target,
      consolidationTask
    )
    expect(loadCarrierId).toBe('4712')

    const cycleCountTask = getCycleCountTask('S2T')

    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Source,
      cycleCountTask
    )
    expect(loadCarrierId).toBe('4711')
    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Target,
      cycleCountTask
    )
    expect(loadCarrierId).toBe('4712')

    const cycleCountTaskS2S = getCycleCountTask('S2S')
    cycleCountTaskS2S.targetLoadCarrierId = undefined

    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Source,
      cycleCountTaskS2S
    )
    expect(loadCarrierId).toBe('4711')
    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Target,
      cycleCountTaskS2S
    )
    expect(loadCarrierId).toBe('4711')

    const purgeAndRecallTask = getPurgeAndRecallTask(77)

    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Source,
      purgeAndRecallTask
    )
    expect(loadCarrierId).toBe('4711')
    loadCarrierId = getLoadCarrierIdByTask(
      PcotsLocationEnum.Target,
      purgeAndRecallTask
    )
    expect(loadCarrierId).toBe('4712')
  })

  it('should correctly detect if source will be empty after picking task', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    let pickingTask = getPickingTask(2)
    const consolidationTask = getConsolidationTask()
    const manualConsolidationTask = getManualConsolidationTask()
    let purgeAndRecallTask = getPurgeAndRecallTask(7)
    consolidationTask.quantity.value = 2
    manualConsolidationTask.quantity.value = 2
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, pickingTask)
    ).toBeFalsy()
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, consolidationTask)
    ).toBeFalsy()
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, manualConsolidationTask)
    ).toBeFalsy()
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, purgeAndRecallTask)
    ).toBeFalsy()
    pickingTask = getPickingTask(10)
    consolidationTask.quantity.value = 10
    manualConsolidationTask.quantity.value = 10
    purgeAndRecallTask = getPurgeAndRecallTask(10)
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, pickingTask)
    ).toBeTruthy()
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, consolidationTask)
    ).toBeTruthy()
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, manualConsolidationTask)
    ).toBeTruthy()
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, purgeAndRecallTask)
    ).toBeTruthy()

    const multiItemLoadCarrier = getMultiItemLoadCarrier()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, pickingTask)
    ).toBeFalsy()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, consolidationTask)
    ).toBeFalsy()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, manualConsolidationTask)
    ).toBeFalsy()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, purgeAndRecallTask)
    ).toBeFalsy()

    // test multi item where one item has a quantity of 0
    multiItemLoadCarrier.compartments[0].items[1].quantity = 0
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, pickingTask)
    ).toBeTruthy()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, consolidationTask)
    ).toBeTruthy()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, manualConsolidationTask)
    ).toBeTruthy()
    expect(
      willSourceBeEmptyAfterPick(multiItemLoadCarrier, purgeAndRecallTask)
    ).toBeTruthy()

    pickingTask.sourceLoadCarrierId = 'LC DOES NOT EXIST'
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, pickingTask)
    ).toBeTruthy()
    purgeAndRecallTask.sourceLoadCarrierId = 'LC DOES NOT EXIST'
    expect(
      willSourceBeEmptyAfterPick(sourceLoadCarrier, purgeAndRecallTask)
    ).toBeTruthy()
  })

  it('should check if a load carrier is empty', () => {
    const loadCarrier = getSourceLoadCarrier()
    const emptyCompartment = getEmptyCompartment()
    expect(isLoadCarrierEmpty(loadCarrier)).toBeFalsy()
    loadCarrier.compartments[0] = emptyCompartment
    expect(isLoadCarrierEmpty(loadCarrier)).toBeTruthy()

    const multiItemLoadCarrier = getMultiItemLoadCarrier()
    expect(isLoadCarrierEmpty(multiItemLoadCarrier)).toBeFalsy()
    multiItemLoadCarrier.compartments[0].items.pop()
    expect(isLoadCarrierEmpty(multiItemLoadCarrier)).toBeFalsy()
    multiItemLoadCarrier.compartments[0].items.pop()
    expect(isLoadCarrierEmpty(multiItemLoadCarrier)).toBeTruthy()
  })

  it('should check if a load carrier is filled', () => {
    const loadCarrier = getSourceLoadCarrier()
    const emptyCompartment = getEmptyCompartment()
    expect(isLoadCarrierFilled(loadCarrier)).toBeTruthy()
    loadCarrier.compartments[0] = emptyCompartment
    expect(isLoadCarrierFilled(loadCarrier)).toBeFalsy()

    const multiItemLoadCarrier = getMultiItemLoadCarrier()
    expect(isLoadCarrierFilled(multiItemLoadCarrier)).toBeTruthy()
    multiItemLoadCarrier.compartments[0].items.pop()
    expect(isLoadCarrierFilled(multiItemLoadCarrier)).toBeTruthy()
    multiItemLoadCarrier.compartments[0].items.pop()
    expect(isLoadCarrierFilled(multiItemLoadCarrier)).toBeFalsy()
  })

  it('should check if two compartments have the same item', () => {
    const compartment1 = getCompartment()
    const compartment2 = getCompartment()
    expect(hasSameItem(compartment1, compartment2)).toBeTruthy()
    compartment1.items[0].item = getItem1()
    compartment2.items[0].item = getItem2()
    expect(hasSameItem(compartment1, compartment2)).toBeFalsy()

    const multiItemCompartment1 = getMultiItemCompartment()
    const multiItemCompartment2 = getMultiItemCompartment()
    expect(
      hasSameItem(multiItemCompartment1, multiItemCompartment2)
    ).toBeTruthy()
    multiItemCompartment2.items[0].item = getItem2()
    expect(
      hasSameItem(multiItemCompartment1, multiItemCompartment2)
    ).toBeTruthy()
    multiItemCompartment1.items[1].item = getItem1()
    expect(
      hasSameItem(multiItemCompartment1, multiItemCompartment2)
    ).toBeFalsy()
  })

  it('should return correct confirmedItems', () => {
    const taskStore = useTaskStore()
    const quantity = 2
    let barcodes: BarcodeDataType[] = [
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
    ]
    const itemId = 'myItemId'
    expect(getConfirmedItems(quantity, barcodes, itemId, false)).toEqual([
      { quantity, barcodes, itemId },
    ])
    expect(getConfirmedItems(quantity, barcodes, itemId, true)).toEqual([])

    // MultiItemCycleCount
    let barcodeTypes: BarcodeType[] = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    let multiItemCycleCountTask = getMultiItemCycleCountTask(
      'S2S',
      barcodeTypes
    )
    const sourceLoadCarrier = getSourceLoadCarrier()
    sourceLoadCarrier.compartments = [getMultiItemCompartment()]
    const item1 = getItem1('1234')
    const item2 = getItem2('5678')
    sourceLoadCarrier.compartments[0].items[0].item = item1
    sourceLoadCarrier.compartments[0].items[1].item = item2

    barcodes = [
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
    ]

    expect(
      getConfirmedItems(
        quantity,
        barcodes,
        itemId,
        false,
        multiItemCycleCountTask,
        sourceLoadCarrier
      )
    ).toEqual([
      {
        itemId: item1.id,
        quantity: 3,
        barcodes: [
          { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
        ],
      },
      {
        itemId: item2.id,
        quantity: 4,
        barcodes: [
          { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
        ],
      },
    ])

    // MultiItemCycleCount with Serial
    barcodeTypes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
      {
        barcodeType: BarcodeTypeEnum.Serial,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    multiItemCycleCountTask = getMultiItemCycleCountTask('S2S', barcodeTypes)
    barcodes = [
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '500001', barcodeType: BarcodeTypeEnum.Serial },
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '500002', barcodeType: BarcodeTypeEnum.Serial },
      { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '600001', barcodeType: BarcodeTypeEnum.Serial },
    ]

    expect(
      getConfirmedItems(
        quantity,
        barcodes,
        itemId,
        false,
        multiItemCycleCountTask,
        sourceLoadCarrier
      )
    ).toEqual([
      {
        itemId: item1.id,
        quantity: 2,
        barcodes: [
          { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '500001', barcodeType: BarcodeTypeEnum.Serial },
          { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '500002', barcodeType: BarcodeTypeEnum.Serial },
        ],
      },
      {
        itemId: item2.id,
        quantity: 1,
        barcodes: [
          { barcode: '5678', barcodeType: BarcodeTypeEnum.Gtin },
          { barcode: '600001', barcodeType: BarcodeTypeEnum.Serial },
        ],
      },
    ])

    // MultiItemCycleCount with unknown item - ScanEach
    barcodeTypes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    multiItemCycleCountTask = getMultiItemCycleCountTask('S2T', barcodeTypes)
    barcodes = [
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '4321', barcodeType: BarcodeTypeEnum.Gtin },
    ]
    sourceLoadCarrier.compartments[1] = getUnknownItemCompartment('1', 2, 1, [
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '4321' },
    ])

    expect(sourceLoadCarrier.compartments[1].items[0].item.id).toBe(
      'unknown-item-1'
    )
    expect(
      getConfirmedItems(
        quantity,
        barcodes,
        itemId,
        false,
        multiItemCycleCountTask,
        sourceLoadCarrier
      )
    ).toEqual([
      {
        itemId: '800002',
        quantity: 1,
        barcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      },
      {
        itemId: '',
        quantity: 1,
        barcodes: [{ barcode: '4321', barcodeType: BarcodeTypeEnum.Gtin }],
      },
    ])

    // MultiItemCycleCount with unknown item - ScanOnce
    taskStore.cycleCountedQuantities = {
      '800002': 1,
      'unknown-item-1': 2,
    }
    barcodeTypes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanOnce,
      },
    ]
    multiItemCycleCountTask = getMultiItemCycleCountTask('S2T', barcodeTypes)
    barcodes = [
      { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      { barcode: '4321', barcodeType: BarcodeTypeEnum.Gtin },
    ]
    sourceLoadCarrier.compartments[1] = getUnknownItemCompartment('1', 2, 1, [
      { barcode: '4321', barcodeType: BarcodeTypeEnum.Gtin },
    ])

    expect(
      getConfirmedItems(
        quantity,
        barcodes,
        itemId,
        false,
        multiItemCycleCountTask,
        sourceLoadCarrier
      )
    ).toEqual([
      {
        itemId: '800002',
        quantity: 1,
        barcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      },
      {
        itemId: '',
        quantity: 2,
        barcodes: [{ barcode: '4321', barcodeType: BarcodeTypeEnum.Gtin }],
      },
    ])
  })

  it('should check if zero crossing should be active', () => {
    const pickingTask = getPickingTask(2)
    const consolidationTask = getConsolidationTask()
    const manualConsolidationTask = getManualConsolidationTask()
    const cycleCountTask = getCycleCountTask('S2S')
    const purgeAndRecallTask = getPurgeAndRecallTask(7)
    expect(isZeroCrossingTask(pickingTask)).toBeFalsy()
    expect(isZeroCrossingTask(consolidationTask)).toBeFalsy()
    expect(isZeroCrossingTask(manualConsolidationTask)).toBeFalsy()
    expect(isZeroCrossingTask(cycleCountTask)).toBeFalsy()
    expect(isZeroCrossingTask(purgeAndRecallTask)).toBeFalsy()

    pickingTask.zeroCrossing = true
    consolidationTask.zeroCrossing = true
    manualConsolidationTask.zeroCrossing = true
    purgeAndRecallTask.zeroCrossing = true
    expect(isZeroCrossingTask(pickingTask)).toBeTruthy()
    expect(isZeroCrossingTask(consolidationTask)).toBeTruthy()
    expect(isZeroCrossingTask(manualConsolidationTask)).toBeTruthy()
    expect(isZeroCrossingTask(purgeAndRecallTask)).toBeTruthy()
  })

  it('should get item from task', () => {
    const pickingTask = getPickingTask(2)
    const consolidationTask = getConsolidationTask()
    const cycleCountTask = getCycleCountTask('S2S')
    const purgeAndRecallTask = getPurgeAndRecallTask(7)

    expect(getItemFromTask(pickingTask)).toBe(pickingTask.item)
    expect(getItemFromTask(consolidationTask)).toBe(consolidationTask.item)
    expect(getItemFromTask(cycleCountTask)).toBe(cycleCountTask.item)
    expect(getItemFromTask(purgeAndRecallTask)).toBe(purgeAndRecallTask.item)
  })

  it('should get quantity from task', () => {
    const pickingTask = getPickingTask(2)
    const consolidationTask = getConsolidationTask()
    const cycleCountTask = getCycleCountTask('S2S')
    const purgeAndRecallTask = getPurgeAndRecallTask(7)

    expect(getQuantityFromTask(pickingTask, [])).toBe(2)
    expect(getQuantityFromTask(consolidationTask, [])).toBe(69)
    expect(getQuantityFromTask(cycleCountTask, [])).toBe(1)
    expect(getQuantityFromTask(purgeAndRecallTask, [])).toBe(7)
  })

  it('should get barcodes from task', () => {
    const barcodes = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanOnce },
    ] as BarcodeType[]
    const pickingTask = getPickingTask(2, barcodes)
    const consolidationTask = getConsolidationTask(2, barcodes)
    const cycleCountTask = getCycleCountTask('S2S', barcodes)
    const purgeAndRecallTask = getPurgeAndRecallTask(7, barcodes)

    expect(getBarcodesFromTask(pickingTask)).toBe(barcodes)
    expect(getBarcodesFromTask(consolidationTask)).toBe(barcodes)
    expect(getBarcodesFromTask(cycleCountTask)).toBe(barcodes)
    expect(getBarcodesFromTask(purgeAndRecallTask)).toBe(barcodes)
  })

  it('should get gtins from task', () => {
    const gtin = 'SPATTI'
    const pickingTask = getPickingTask(2, [], gtin)
    const consolidationTask = getConsolidationTask()
    const cycleCountTask = getCycleCountTask('S2S')
    const purgeAndRecallTask = getPurgeAndRecallTask(7, [], gtin)

    expect(getGtinsFromTask(pickingTask)).toStrictEqual([gtin])
    expect(getGtinsFromTask(consolidationTask)).toStrictEqual([''])
    expect(getGtinsFromTask(cycleCountTask)).toStrictEqual([''])
    expect(getGtinsFromTask(purgeAndRecallTask)).toStrictEqual([gtin])
  })

  it('should get verify barcode from task', () => {
    const verifyBarcode = false
    const pickingTask = getPickingTask(2)
    const consolidationTask = getConsolidationTask()
    const cycleCountTask = getCycleCountTask('S2S')
    const purgeAndRecallTask = getPurgeAndRecallTask(7)

    expect(getVerifyBarcodeFromTask(pickingTask)).toBe(verifyBarcode)
    expect(getVerifyBarcodeFromTask(consolidationTask)).toStrictEqual(
      verifyBarcode
    )
    expect(getVerifyBarcodeFromTask(cycleCountTask)).toStrictEqual(
      verifyBarcode
    )
    expect(getVerifyBarcodeFromTask(purgeAndRecallTask)).toBe(verifyBarcode)
  })

  it('should return scanned amount', () => {
    const scannedBarcodes = [
      { barcode: '0815', barcodeType: BarcodeTypeEnum.Gtin },
    ] as BarcodeDataType[]
    const pickingTask = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    expect(getScannedAmount(pickingTask, scannedBarcodes)).toBe(1)

    const purgeAndRecallTask = getPurgeAndRecallTask(7, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    expect(getScannedAmount(purgeAndRecallTask, scannedBarcodes)).toBe(1)
  })

  it('should return correct scanning required', () => {
    const pickingTaskWithScans = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const pickingTask = getPickingTask(2)

    expect(isScanningRequired(pickingTaskWithScans)).toBe(true)
    expect(isScanningRequired(pickingTask)).toBe(false)

    const purgeAndRecallTaskWithScans = getPurgeAndRecallTask(7, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const purgeAndRecallTask = getPurgeAndRecallTask(7)

    expect(isScanningRequired(purgeAndRecallTaskWithScans)).toBe(true)
    expect(isScanningRequired(purgeAndRecallTask)).toBe(false)
  })

  it('should return correct is scan once', () => {
    const pickingTaskScanOnce = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const pickingTaskScanEach = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])

    expect(isScanOnce(pickingTaskScanOnce)).toBe(true)
    expect(isScanOnce(pickingTaskScanEach)).toBe(false)

    const purgeAndRecallTaskScanOnce = getPurgeAndRecallTask(7, [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const purgeAndRecallTaskScanEach = getPurgeAndRecallTask(7, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])

    expect(isScanOnce(purgeAndRecallTaskScanOnce)).toBe(true)
    expect(isScanOnce(purgeAndRecallTaskScanEach)).toBe(false)
  })

  it('should return correct is scan each', () => {
    const pickingTaskScanOnce = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const pickingTaskScanEach = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])

    expect(isScanEach(pickingTaskScanOnce)).toBe(false)
    expect(isScanEach(pickingTaskScanEach)).toBe(true)

    const purgeAndRecallTaskScanOnce = getPurgeAndRecallTask(7, [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const purgeAndRecallTaskScanEach = getPurgeAndRecallTask(7, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])

    expect(isScanEach(purgeAndRecallTaskScanOnce)).toBe(false)
    expect(isScanEach(purgeAndRecallTaskScanEach)).toBe(true)
  })

  it('should return correct is source to source count', () => {
    const cycleCountTaskS2S = getCycleCountTask('S2S')
    const cycleCountTaskS2T = getCycleCountTask('S2T')

    expect(isSourceToSourceCount(cycleCountTaskS2S)).toBe(true)
    expect(isSourceToSourceCount(cycleCountTaskS2T)).toBe(false)
    expect(isSourceToSourceCount(undefined)).toBe(false)
  })

  it('should return correct is scanning finished', () => {
    const scannedBarcode = {
      barcode: '0815',
      barcodeType: BarcodeTypeEnum.Gtin,
    } as BarcodeDataType
    const pickingTaskScanEach = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const pickingTaskScanOnce = getPickingTask(2, [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const pickingTask = getPickingTask(2)
    const cycleCountTaskScanEach = getCycleCountTask('S2T', [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const cycleCountTaskScanOnce = getCycleCountTask('S2T', [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const purgeAndRecallTaskScanEach = getPurgeAndRecallTask(3, [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const purgeAndRecallTaskScanOnce = getPurgeAndRecallTask(3, [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const purgeAndRecallTask = getPurgeAndRecallTask(3)

    expect(isScanningFinished(pickingTaskScanEach, [scannedBarcode])).toBe(
      false
    )
    expect(
      isScanningFinished(pickingTaskScanEach, [scannedBarcode, scannedBarcode])
    ).toBe(true)
    expect(isScanningFinished(pickingTaskScanOnce, [])).toBe(false)
    expect(isScanningFinished(pickingTaskScanOnce, [scannedBarcode])).toBe(true)
    expect(isScanningFinished(pickingTask, [])).toBe(true)

    expect(isScanningFinished(cycleCountTaskScanEach, [scannedBarcode])).toBe(
      false
    )
    expect(
      isScanningFinished(cycleCountTaskScanEach, [
        scannedBarcode,
        scannedBarcode,
      ])
    ).toBe(false)
    expect(isScanningFinished(cycleCountTaskScanOnce, [])).toBe(false)
    expect(isScanningFinished(cycleCountTaskScanOnce, [scannedBarcode])).toBe(
      false
    )

    expect(
      isScanningFinished(purgeAndRecallTaskScanEach, [scannedBarcode])
    ).toBe(false)
    expect(
      isScanningFinished(purgeAndRecallTaskScanEach, [
        scannedBarcode,
        scannedBarcode,
        scannedBarcode,
      ])
    ).toBe(true)
    expect(isScanningFinished(purgeAndRecallTaskScanOnce, [])).toBe(false)
    expect(
      isScanningFinished(purgeAndRecallTaskScanOnce, [scannedBarcode])
    ).toBe(true)
    expect(isScanningFinished(purgeAndRecallTask, [])).toBe(true)
  })

  it('should return correct is first scan finished', () => {
    const scannedBarcodes = [
      { barcode: '0815', barcodeType: BarcodeTypeEnum.Gtin },
    ] as BarcodeDataType[]
    const cycleCountTaskS2SNoScan = getCycleCountTask('S2S')
    const cycleCountTaskS2SScanEach = getCycleCountTask('S2S', [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const cycleCountTaskS2SScanOnce = getCycleCountTask('S2S', [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const cycleCountTaskNoScan = getCycleCountTask('S2T')
    const cycleCountTaskScanEach = getCycleCountTask('S2T', [
      { scanRule: ScanRuleEnum.ScanEach, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const cycleCountTaskScanOnce = getCycleCountTask('S2T', [
      { scanRule: ScanRuleEnum.ScanOnce, barcodeType: BarcodeTypeEnum.Gtin },
    ])
    const pickingTask = getPickingTask(2)
    pickingTask.barcodes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ] as BarcodeType[]

    const purgeAndRecallTask = getPurgeAndRecallTask(7)
    purgeAndRecallTask.barcodes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ] as BarcodeType[]

    expect(isFirstScanFinished(cycleCountTaskS2SNoScan, [])).toBe(true)
    expect(isFirstScanFinished(cycleCountTaskS2SScanEach, [])).toBe(false)
    expect(isFirstScanFinished(cycleCountTaskS2SScanOnce, [])).toBe(false)
    expect(isFirstScanFinished(cycleCountTaskNoScan, [])).toBe(true)
    expect(isFirstScanFinished(cycleCountTaskScanEach, [])).toBe(false)
    expect(isFirstScanFinished(cycleCountTaskScanOnce, [])).toBe(false)
    expect(isFirstScanFinished(pickingTask, [])).toBe(false)
    expect(isFirstScanFinished(purgeAndRecallTask, [])).toBe(false)

    expect(isFirstScanFinished(cycleCountTaskS2SNoScan, scannedBarcodes)).toBe(
      true
    )
    expect(
      isFirstScanFinished(cycleCountTaskS2SScanEach, scannedBarcodes)
    ).toBe(true)
    expect(
      isFirstScanFinished(cycleCountTaskS2SScanOnce, scannedBarcodes)
    ).toBe(true)
    expect(isFirstScanFinished(cycleCountTaskNoScan, scannedBarcodes)).toBe(
      true
    )
    expect(isFirstScanFinished(cycleCountTaskScanEach, scannedBarcodes)).toBe(
      true
    )
    expect(isFirstScanFinished(cycleCountTaskScanOnce, scannedBarcodes)).toBe(
      true
    )
    expect(isFirstScanFinished(pickingTask, scannedBarcodes)).toBe(true)
    expect(isFirstScanFinished(purgeAndRecallTask, scannedBarcodes)).toBe(true)
  })

  it('should return correct is compartment empty', () => {
    const emptyCompartment = getEmptyCompartment()
    expect(isCompartmentEmpty(emptyCompartment)).toBe(true)
    emptyCompartment.items = []
    expect(isCompartmentEmpty(emptyCompartment)).toBe(true)
  })

  it('should getCompartmentInfos manual inventory', () => {
    let sourceLoadCarrier = getSourceLoadCarrier()
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        sourceLoadCarrier.compartments[0],
        undefined,
        ConsolidationActionEnum.inventory,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: 0 },
    ] as CompartmentInfo[])

    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Target,
        undefined,
        sourceLoadCarrier.compartments[0],
        ConsolidationActionEnum.inventory,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: 0 },
    ] as CompartmentInfo[])

    sourceLoadCarrier = getSourceLoadCarrier()

    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        sourceLoadCarrier.compartments[0],
        undefined,
        ConsolidationActionEnum.inventory,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: 0 },
    ] as CompartmentInfo[])
  })

  it('should getCompartmentInfos manual move', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    sourceLoadCarrier.compartments.push(getCompartment())
    sourceLoadCarrier.compartments[1].id = '2'
    sourceLoadCarrier.compartments[1].items = [
      { item: getItem2(), quantity: 10 },
    ] as StockType[]

    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        sourceLoadCarrier.compartments[0],
        undefined,
        ConsolidationActionEnum.move,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: 0 },
      { id: '1', state: CompartmentState.selectable, stockIndex: 0 },
      { id: '2', state: CompartmentState.disabled, stockIndex: undefined },
    ] as CompartmentInfo[])
  })

  it('should getCompartmentInfos manual swap', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    sourceLoadCarrier.compartments.push(getCompartment())
    sourceLoadCarrier.compartments[1].id = '2'
    sourceLoadCarrier.compartments[1].items = [
      { item: getItem2(), quantity: 10 },
    ] as StockType[]

    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        sourceLoadCarrier.compartments[0],
        undefined,
        ConsolidationActionEnum.swap,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: 0 },
      { id: '2', state: CompartmentState.selectable, stockIndex: 0 },
    ] as CompartmentInfo[])
  })

  it('should getCompartmentInfos manual no active compartment', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        ConsolidationActionEnum.swap,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.selectable, stockIndex: 0 },
    ] as CompartmentInfo[])

    sourceLoadCarrier.compartments[0].items[0].quantity = 0
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        ConsolidationActionEnum.swap,
        ConsolidationModeEnum.MANUAL
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.selectable, stockIndex: 0 },
    ] as CompartmentInfo[])
  })

  it('should return correct compartment infos auto', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        ConsolidationModeEnum.AUTO
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: undefined },
    ] as CompartmentInfo[])
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: undefined },
    ] as CompartmentInfo[])

    // ConsolidationMode undefined
    expect(
      getCompartmentInfos(
        undefined,
        getConsolidationTask(),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      )
    ).toStrictEqual([] as CompartmentInfo[])

    // ManualConsolidationTask completed
    const manualConsolidationTask = getManualConsolidationTask()
    manualConsolidationTask.isCompleted = true
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        manualConsolidationTask,
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      )
    ).toStrictEqual([] as CompartmentInfo[])
  })

  it('should return correct compartment infos manual consolidation', () => {
    const manualConsolidationTask = getManualConsolidationTask()
    manualConsolidationTask.isCompleted = true
    expect(
      getCompartmentInfos(
        getSourceLoadCarrier(),
        manualConsolidationTask,
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        undefined
      )
    ).toStrictEqual([] as CompartmentInfo[])
  })

  it('should return correct compartment infos picking', () => {
    const pickingTask = getPickingTask(2)
    pickingTask.targetCompartmentId = undefined
    expect(
      getCompartmentInfos(
        getTargetLoadCarrier(),
        pickingTask,
        PcotsLocationEnum.Target,
        undefined,
        undefined,
        undefined,
        undefined
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: undefined },
    ] as CompartmentInfo[])
  })

  it('should return correct compartment infos cycle count', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    expect(
      getCompartmentInfos(
        sourceLoadCarrier,
        getCycleCountTask('S2S'),
        PcotsLocationEnum.Source,
        undefined,
        undefined,
        undefined,
        ConsolidationModeEnum.AUTO
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: 0 },
    ] as CompartmentInfo[])
  })

  it('should return correct compartment infos purge and recall', () => {
    const purgeAndRecallTask = getPurgeAndRecallTask(2)
    purgeAndRecallTask.targetCompartmentId = undefined
    expect(
      getCompartmentInfos(
        getTargetLoadCarrier(),
        purgeAndRecallTask,
        PcotsLocationEnum.Target,
        undefined,
        undefined,
        undefined,
        undefined
      )
    ).toStrictEqual([
      { id: '1', state: CompartmentState.active, stockIndex: undefined },
    ] as CompartmentInfo[])
  })

  it('should return correct is compartment counted', () => {
    const compartment = getCompartment()
    expect(isCompartmentCounted(undefined)).toBe(false)
    compartment.cycleCountState = undefined
    expect(isCompartmentCounted(compartment)).toBe(false)
    compartment.cycleCountState = CycleCountState.finished
    expect(isCompartmentCounted(compartment)).toBe(true)
    compartment.cycleCountState = CycleCountState.inProgress
    compartment.countedQuantity = null
    expect(isCompartmentCounted(compartment)).toBe(false)
    compartment.cycleCountState = CycleCountState.inProgress
    compartment.countedQuantity = undefined
    expect(isCompartmentCounted(compartment)).toBe(false)
    compartment.cycleCountState = CycleCountState.inProgress
    compartment.countedQuantity = 0
    expect(isCompartmentCounted(compartment)).toBe(false)
    compartment.cycleCountState = CycleCountState.inProgress
    compartment.countedQuantity = 1
    expect(isCompartmentCounted(compartment)).toBe(true)
  })

  it('should return correct additional data value', () => {
    const loadCarrier = getNoReadLoadCarrier()
    expect(
      getAdditionalDataValue(loadCarrier, AdditionalDataKeyEnum.IsNoRead)
    ).toBe('1')
    expect(
      getAdditionalDataValue(loadCarrier, AdditionalDataKeyEnum.ForUnitTests)
    ).toBe(undefined)
  })

  it('should return correct stock from compartment', () => {
    let compartment = getCompartment()
    compartment.items[0].item = getItem2()
    expect(getStockFromCompartment(undefined, undefined)).toBe(undefined)
    expect(getStockFromCompartment(compartment, getPickingTask(2))).toBe(
      compartment.items[0]
    )

    compartment = getCompartment()
    compartment.items[0].item = getItem2()
    expect(getStockFromCompartment(undefined, undefined)).toBe(undefined)
    expect(getStockFromCompartment(compartment, getPurgeAndRecallTask(2))).toBe(
      compartment.items[0]
    )
  })

  it('should correctly count items with quantity lager than 0', () => {
    let compartment = getCompartment()
    expect(getItemCountWithQuantityLargerZero(compartment.items)).toBe(1)
    compartment = getMultiItemCompartment()
    expect(getItemCountWithQuantityLargerZero(compartment.items)).toBe(2)
    compartment.items[1].quantity = 0
    expect(getItemCountWithQuantityLargerZero(compartment.items)).toBe(1)
    compartment.items[0].quantity = 0
    expect(getItemCountWithQuantityLargerZero(compartment.items)).toBe(0)
  })

  it('should return correct task splitted', () => {
    const taskStore = useTaskStore()
    taskStore.originalQuantity = 3
    expect(isTaskSplitted(getPickingTask(2))).toBe(true)
    expect(isTaskSplitted(getPickingTask(3))).toBe(false)
    expect(isTaskSplitted(getConsolidationTask())).toBe(true)
    taskStore.originalQuantity = 69
    expect(isTaskSplitted(getConsolidationTask())).toBe(false)
    expect(isTaskSplitted(undefined)).toBe(false)
    taskStore.originalQuantity = 7
    expect(isTaskSplitted(getPurgeAndRecallTask(4))).toBe(true)
    expect(isTaskSplitted(getPurgeAndRecallTask(7))).toBe(false)
  })

  it('should refresh isCompleted', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    const targetLoadCarrier = getTargetLoadCarrier()
    const manualConsolidationTask = getManualConsolidationTask()
    refreshIsCompleted(
      manualConsolidationTask,
      sourceLoadCarrier,
      targetLoadCarrier
    )
    expect(manualConsolidationTask.isCompleted).toBeFalsy()

    targetLoadCarrier.compartments[0].items[0].item = getItem2()
    refreshIsCompleted(
      manualConsolidationTask,
      sourceLoadCarrier,
      targetLoadCarrier
    )
    expect(manualConsolidationTask.isCompleted).toBeTruthy()
  })

  it('should refresh cycleCountState', () => {
    const sourceLoadCarrier = getSourceLoadCarrier()
    let cycleCountTask: CycleCountTaskType | MultiItemCycleCountTaskType =
      getCycleCountTask('S2S')
    refreshCycleCountState(
      sourceLoadCarrier,
      cycleCountTask,
      {} as CountedCompartmentsType,
      undefined,
      true
    )
    expect(sourceLoadCarrier.compartments[0].cycleCountState).toBe(
      CycleCountState.inProgress
    )
    expect(sourceLoadCarrier.compartments[0].isRecount).toBeTruthy()

    cycleCountTask = getMultiItemCycleCountTask('S2T')
    refreshCycleCountState(
      sourceLoadCarrier,
      cycleCountTask,
      {} as CountedCompartmentsType,
      undefined,
      true
    )
    expect(sourceLoadCarrier.compartments[0].cycleCountState).toBe(
      CycleCountState.inProgress
    )
    expect(sourceLoadCarrier.compartments[0].isRecount).toBeTruthy()
    cycleCountTask = getCycleCountTask('S2S')
    refreshCycleCountState(
      sourceLoadCarrier,
      cycleCountTask,
      { 1: ['800002'] } as CountedCompartmentsType,
      undefined,
      false
    )
    expect(sourceLoadCarrier.compartments[0].cycleCountState).toBe(
      CycleCountState.finished
    )

    sourceLoadCarrier.compartments.push(getCompartment())
    sourceLoadCarrier.compartments[1].id = '2'
    refreshCycleCountState(
      sourceLoadCarrier,
      cycleCountTask,
      { 1: [] } as CountedCompartmentsType,
      undefined,
      false
    )
    expect(sourceLoadCarrier.compartments[1].cycleCountState).toBe(
      CycleCountState.toDo
    )

    sourceLoadCarrier.compartments = [getMultiItemCompartment()]
    refreshCycleCountState(
      sourceLoadCarrier,
      cycleCountTask,
      { 1: [] } as CountedCompartmentsType,
      undefined,
      false
    )
    expect(sourceLoadCarrier.compartments.length).toBe(2)
    expect(sourceLoadCarrier.compartments[0].cycleCountState).toBe(
      CycleCountState.inProgress
    )
    expect(sourceLoadCarrier.compartments[0].stockIndex).toBe(0)
    expect(sourceLoadCarrier.compartments[1].cycleCountState).toBe(
      CycleCountState.toDo
    )
    expect(sourceLoadCarrier.compartments[1].stockIndex).toBe(1)

    cycleCountTask = getCycleCountTask('S2T')
    sourceLoadCarrier.compartments = [getMultiItemCompartment()]
    sourceLoadCarrier.compartments[0].items = [] as StockType[]
    refreshCycleCountState(
      sourceLoadCarrier,
      cycleCountTask,
      { 1: [] } as CountedCompartmentsType,
      undefined,
      false
    )
    expect(sourceLoadCarrier.compartments[0].cycleCountState).toBe(
      CycleCountState.finished
    )
  })

  it('should get correct compartment by item id of load carrier', () => {
    const loadCarrier = getSourceLoadCarrierWithCompartments([
      getCompartment(),
      getCompartment(),
    ])
    loadCarrier.compartments[1].id = '2'
    loadCarrier.compartments[1].items[0].item = getItem2()
    const itemId = getItem2().id
    expect(getCompartmentByItemId(loadCarrier, itemId)).toEqual(
      loadCarrier.compartments[1]
    )
  })

  it('should get correct compartment by item id of load carrier with multi item compartment', () => {
    const loadCarrier = getMultiItemLoadCarrier()
    loadCarrier.compartments.push(getMultiItemCompartment())
    loadCarrier.compartments[1].items[1].item.id = '3'
    loadCarrier.compartments[1].id = '2'
    const itemId = '3'
    expect(getCompartmentByItemId(loadCarrier, itemId)).toEqual(
      loadCarrier.compartments[1]
    )
  })

  it('should return undefined if gtin is not in compartment', () => {
    const compartments = [getMultiItemCompartment()]
    compartments[0].items[0].item = getItem1('1234')
    compartments[0].items[1].item = getItem2('4321')
    expect(getItemByGtin(compartments, '5678')).toBe(undefined)
  })

  it('should add new unknown item to source load carrier', () => {
    const taskStore = useTaskStore()
    const scanModificationStore = useScanModificationStore()
    scanModificationStore.unknownItemTypeCount = 1
    const loadCarrierStore = useLoadCarrierStore()
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.targetLoadCarrier = getTargetLoadCarrier()
    const barcodes: BarcodeType[] = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    taskStore.task = getMultiItemCycleCountTask('S2T', barcodes)

    // Check if unknown item 1 gets added
    const unknownItem1 = addNewUnknownItemToSourceLoadCarrier(
      [{ barcode: '1234' }] as BarcodeDataType[],
      scanModificationStore.unknownItemTypeCount
    )
    const unknownItemCompartment1 = getUnknownItemCompartment(
      '1',
      1,
      scanModificationStore.unknownItemTypeCount
    )
    expect(unknownItem1).toEqual(unknownItemCompartment1.items[0].item)
    expect(loadCarrierStore.sourceLoadCarrier.compartments[1]).toEqual(
      unknownItemCompartment1
    )
    scanModificationStore.unknownItemTypeCount++

    // Check if unknown item 2 gets added
    const unknownItem2 = addNewUnknownItemToSourceLoadCarrier(
      [{ barcode: '4321' }] as BarcodeDataType[],
      scanModificationStore.unknownItemTypeCount
    )
    const unknownItemCompartment2 = getUnknownItemCompartment(
      '1',
      2,
      scanModificationStore.unknownItemTypeCount
    )
    expect(unknownItem2).toEqual(unknownItemCompartment2.items[0].item)
    expect(loadCarrierStore.sourceLoadCarrier.compartments[2]).toEqual(
      unknownItemCompartment2
    )
    scanModificationStore.unknownItemTypeCount++
  })

  it('should test isUnknownItem', () => {
    const item = getItem1()
    const unknownItem = getUnknownItem(1)
    expect(isUnknownItem(unknownItem)).toBeTruthy()
    expect(isUnknownItem(item)).toBeFalsy()
    expect(isUnknownItem(undefined)).toBeFalsy()
  })

  it('should test hasUnknownItem', () => {
    const loadCarrier = getSourceLoadCarrier()
    expect(hasUnknownItem(loadCarrier)).toBeFalsy()
    loadCarrier.compartments[0] = getUnknownItemCompartment('1', 1, 1)
    expect(hasUnknownItem(loadCarrier)).toBeTruthy()
    loadCarrier.compartments.push(getCompartment())
    expect(hasUnknownItem(loadCarrier)).toBeTruthy()
    expect(hasUnknownItem(undefined)).toBeFalsy()
  })

  it('should test hasNotScannedBarcodeBefore', () => {
    const barcodeStore = useBarcodeStore()
    const taskStore = useTaskStore()
    const barcodeTypes: BarcodeType[] = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    taskStore.task = getMultiItemCycleCountTask('S2T', barcodeTypes)
    barcodeStore.addBarcodes([
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' },
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '5678' },
    ])

    expect(
      hasNotScannedBarcodeBefore({
        barcodeType: BarcodeTypeEnum.Gtin,
        barcode: '4321',
      })
    ).toBeTruthy()
    expect(
      hasNotScannedBarcodeBefore({
        barcodeType: BarcodeTypeEnum.Gtin,
        barcode: '1234',
      })
    ).toBeFalsy()
    expect(
      hasNotScannedBarcodeBefore({
        barcodeType: BarcodeTypeEnum.Gtin,
        barcode: '5678',
      })
    ).toBeFalsy()
  })

  it('should test shouldAddBarcode', () => {
    const barcodeStore = useBarcodeStore()
    const taskStore = useTaskStore()

    // ScanEach
    let barcodeTypes: BarcodeType[] = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      },
    ]
    let newBarcode: BarcodeDataType = {
      barcodeType: BarcodeTypeEnum.Gtin,
      barcode: '4321',
    }
    let multiItemCycleCountTask = getMultiItemCycleCountTask(
      'S2T',
      barcodeTypes
    )
    taskStore.task = multiItemCycleCountTask
    barcodeStore.addBarcodes([
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' },
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '5678' },
    ])

    expect(shouldAddBarcode(multiItemCycleCountTask, newBarcode)).toBeTruthy()

    let cycleCountTask = getCycleCountTask('S2T', barcodeTypes)
    taskStore.task = cycleCountTask
    expect(shouldAddBarcode(cycleCountTask, newBarcode)).toBeTruthy()

    let consolidationTask = getConsolidationTask(10, barcodeTypes)
    taskStore.task = consolidationTask
    expect(shouldAddBarcode(consolidationTask, newBarcode)).toBeTruthy()

    let pickingTask = getPickingTask(10, barcodeTypes, '4321')
    taskStore.task = pickingTask
    expect(shouldAddBarcode(pickingTask, newBarcode)).toBeTruthy()

    let purgeAndRecallTask = getPurgeAndRecallTask(10, barcodeTypes, '4321')
    taskStore.task = purgeAndRecallTask
    expect(shouldAddBarcode(purgeAndRecallTask, newBarcode)).toBeTruthy()

    // ScanOnce
    barcodeTypes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanOnce,
      },
    ]

    multiItemCycleCountTask = getMultiItemCycleCountTask('S2T', barcodeTypes)
    taskStore.task = multiItemCycleCountTask
    expect(shouldAddBarcode(multiItemCycleCountTask, newBarcode)).toBeTruthy()

    cycleCountTask = getCycleCountTask('S2T', barcodeTypes)
    taskStore.task = cycleCountTask
    expect(shouldAddBarcode(cycleCountTask, newBarcode)).toBeTruthy()

    consolidationTask = getConsolidationTask(10, barcodeTypes)
    taskStore.task = consolidationTask
    expect(shouldAddBarcode(consolidationTask, newBarcode)).toBeTruthy()

    pickingTask = getPickingTask(10, barcodeTypes, '4321')
    taskStore.task = pickingTask
    expect(shouldAddBarcode(pickingTask, newBarcode)).toBeTruthy()

    purgeAndRecallTask = getPurgeAndRecallTask(10, barcodeTypes, '4321')
    taskStore.task = purgeAndRecallTask
    expect(shouldAddBarcode(purgeAndRecallTask, newBarcode)).toBeTruthy()

    newBarcode = {
      barcodeType: BarcodeTypeEnum.Gtin,
      barcode: '1234',
    }

    taskStore.task = multiItemCycleCountTask
    expect(shouldAddBarcode(multiItemCycleCountTask, newBarcode)).toBeFalsy()

    taskStore.task = cycleCountTask
    expect(shouldAddBarcode(cycleCountTask, newBarcode)).toBeFalsy()

    taskStore.task = consolidationTask
    expect(shouldAddBarcode(consolidationTask, newBarcode)).toBeFalsy()

    taskStore.task = pickingTask
    expect(shouldAddBarcode(pickingTask, newBarcode)).toBeFalsy()

    taskStore.task = purgeAndRecallTask
    expect(shouldAddBarcode(purgeAndRecallTask, newBarcode)).toBeFalsy()
  })
})
