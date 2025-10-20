import { CycleCountState } from '@/types/CycleCountState'
import {
  BarcodeTypeEnum,
  ProblemCategoryEnum, ProblemSendToRejectOption,
  ProblemStrategyEnum,
  ProblemSubCategoryEnum,
  ProblemTypeEnum,
  ScanRuleEnum,
  TaskTypeEnum
} from '@/types/Api/pcots/PcotsApiModelEnums'
import {
  BarcodeDataType,
  BarcodeType,
  CompartmentType,
  ConsolidationTaskType,
  CycleCountTaskType,
  ItemType,
  LoadCarrierType,
  LoadCarrierTypeType,
  ManualConsolidationTaskType,
  MinMaxQuantityType,
  MultiItemCycleCountTaskType,
  PickingTaskType,
  ProblemDefinitionType,
  PurgeAndRecallTaskType,
  StockType
} from '@/types/Api/pcots/PcotsApiModel'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { OrderLineType, QuantityWithUnitType } from '@/types/Api/pcotsExt/PcotsExtApiModel'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'

const { getUnknownItem } = useApiDataHelper()

export class BarcodeTestData {
  public static Gtins = {
    Gtin1: '123456789012', // Valid GTIN-12
    Gtin2: '123456789128', // Valid GTIN-12
    Gtin3: '123456789999', // Valid GTIN-12
    Gtin4: '987654321098', // Valid GTIN-12
    Gtin5: '987654321012', // Valid GTIN-12
  }

  public static Imei = {
    Imei1: '448255738063551', // Valid IMEI (15 digits)
    Imei2: '490154203237518', // Valid IMEI (15 digits)
    Imei3: '509167913496439', // Valid IMEI (15 digits)
    Imei4: '356938035643809', // Valid IMEI (15 digits)
    Imei5: '500559425613734', // Valid IMEI (15 digits)
  }

  public static Serial = {
    Serial1: 'SRL123456', // Sample serial number format
    Serial2: 'SRL987654', // Sample serial number format
    Serial3: 'SRL555555', // Sample serial number format
    Serial4: 'SRL888888', // Sample serial number format
    Serial5: 'SRL222222', // Sample serial number format
  }
}

export const getWeight = () => {
  return 69
}

export const getLoadCarrierType = () => {
  return {
    id: ' ',
    length: 300,
    width: 300,
    height: 300,
    compartments: [],
  } as LoadCarrierTypeType
}

export const getAllLoadCarrierTypes = (): LoadCarrierTypeType[] => {
  return [
    // 1 Sector
    {
      id: '1',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 600,
          width: 400,
        },
      ],
    },
    // 3 Sector
    {
      id: '2',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 200,
          width: 400,
        },
        {
          id: '2',
          x: 200,
          y: 0,
          length: 200,
          width: 400,
        },
        {
          id: '3',
          x: 400,
          y: 0,
          length: 200,
          width: 400,
        },
      ],
    },
    // 6 Sector
    {
      id: '3',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 200,
          length: 200,
          width: 200,
        },
        {
          id: '2',
          x: 0,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '3',
          x: 200,
          y: 200,
          length: 200,
          width: 200,
        },
        {
          id: '4',
          x: 200,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '5',
          x: 400,
          y: 200,
          length: 200,
          width: 200,
        },
        {
          id: '6',
          x: 400,
          y: 0,
          length: 200,
          width: 200,
        },
      ],
    },
  ]
}

export const getAllLoadCarrierTypesWithPaddings = (): LoadCarrierTypeType[] => {
  return [
    // 1 Sector
    {
      id: '1',
      length: 600,
      width: 400,
      height: 270,
      compartments: [
        {
          id: '1',
          x: 15,
          y: 15,
          length: 570,
          width: 370,
        },
      ],
    },
    // 2 Sector
    {
      id: '2',
      length: 600,
      width: 400,
      height: 270,
      compartments: [
        {
          id: '1',
          x: 15,
          y: 15,
          length: 283,
          width: 370,
        },
        {
          id: '2',
          x: 302,
          y: 15,
          length: 283,
          width: 370,
        },
      ],
    },
    // 3 Sector
    {
      id: '3',
      length: 600,
      width: 400,
      height: 270,
      compartments: [
        {
          id: '1',
          x: 15,
          y: 15,
          length: 188,
          width: 370,
        },
        {
          id: '2',
          x: 206,
          y: 15,
          length: 188,
          width: 370,
        },
        {
          id: '3',
          x: 397,
          y: 15,
          length: 188,
          width: 370,
        },
      ],
    },
    // 6 Sector
    {
      id: '4',
      length: 600,
      width: 400,
      height: 270,
      compartments: [
        {
          id: '1',
          x: 15,
          y: 15,
          length: 188,
          width: 181,
        },
        {
          id: '2',
          x: 206,
          y: 15,
          length: 188,
          width: 181,
        },
        {
          id: '3',
          x: 397,
          y: 15,
          length: 188,
          width: 181,
        },
        {
          id: '4',
          x: 15,
          y: 204,
          length: 188,
          width: 181,
        },
        {
          id: '5',
          x: 206,
          y: 204,
          length: 188,
          width: 181,
        },
        {
          id: '6',
          x: 397,
          y: 204,
          length: 188,
          width: 181,
        },
      ],
    },
  ]
}

export const getAllLoadCarrierTypesColRowSpan = (): LoadCarrierTypeType[] => {
  return [
    // 4 Sectors, mixed row and column span
    {
      id: '1',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '2',
          x: 0,
          y: 200,
          length: 400,
          width: 200,
        },
        {
          id: '3',
          x: 200,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '4',
          x: 400,
          y: 0,
          length: 200,
          width: 400,
        },
      ],
    },
    // 3 sectors, 2 column spans
    {
      id: '2',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 400,
          width: 200,
        },
        {
          id: '2',
          x: 0,
          y: 200,
          length: 600,
          width: 200,
        },
        {
          id: '3',
          x: 400,
          y: 0,
          length: 200,
          width: 200,
        },
      ],
    },
    // 4 Sectors, 2 Rowspans
    {
      id: '3',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 200,
          width: 400,
        },
        {
          id: '2',
          x: 200,
          y: 0,
          length: 200,
          width: 400,
        },
        {
          id: '3',
          x: 400,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '4',
          x: 400,
          y: 200,
          length: 200,
          width: 200,
        },
      ],
    },
    // 4 Sectors, 2 Columnspans
    {
      id: '4',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 400,
          width: 200,
        },
        {
          id: '2',
          x: 0,
          y: 200,
          length: 400,
          width: 200,
        },
        {
          id: '3',
          x: 400,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '4',
          x: 400,
          y: 200,
          length: 200,
          width: 200,
        },
      ],
    },
    // 3 sectors, 1 column + rowspan
    {
      id: '5',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 400,
          width: 400,
        },
        {
          id: '2',
          x: 400,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '3',
          x: 400,
          y: 200,
          length: 200,
          width: 200,
        },
      ],
    },
    // 5 Sectors, 4 normal 1 rowspan
    {
      id: '6',
      length: 600,
      width: 400,
      height: 120,
      compartments: [
        {
          id: '1',
          x: 0,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '2',
          x: 0,
          y: 200,
          length: 200,
          width: 200,
        },
        {
          id: '3',
          x: 200,
          y: 0,
          length: 200,
          width: 400,
        },
        {
          id: '4',
          x: 400,
          y: 0,
          length: 200,
          width: 200,
        },
        {
          id: '5',
          x: 400,
          y: 200,
          length: 200,
          width: 200,
        },
      ],
    },
  ]
}

export const getLoadCarrierTypeWithCompartments = (
  compartmentAmount: 1 | 3 | 6
) => {
  const allLoadCarrierTypes = getAllLoadCarrierTypes()
  if (compartmentAmount === 1) {
    return allLoadCarrierTypes[0]
  } else if (compartmentAmount === 3) {
    return allLoadCarrierTypes[1]
  } else if (compartmentAmount === 6) {
    return allLoadCarrierTypes[2]
  }
}

export const getItem1 = (gtin = '') => {
  return {
    id: '800002',
    name: 'en="TGW Pen";de="TGW Stift"',
    description: 'en="TGW Pen";de="TGW Stift"',
    weight: getWeight(),
    gtins: [gtin],
    images: [
      {
        url: '../../../src/assets/images/item-images/TGW_PEN.png',
      },
      {
        url: '../../../src/assets/images/item-images/TGW_NOTES.png',
      },
      {
        url: '../../../src/assets/images/item-images/TGW_MINT.png',
      },
    ],
  } as ItemType
}

export const getItem2 = (gtin = '') => {
  return {
    id: '800003',
    name: 'TGW Shirt',
    description: 'TGW Shirt',
    weight: getWeight(),
    gtins: [gtin],
    images: [
      {
        url: '../../../src/assets/images/item-images/TGW_PEN.png',
      },
      {
        url: '../../../src/assets/images/item-images/TGW_NOTES.png',
      },
      {
        url: '../../../src/assets/images/item-images/TGW_MINT.png',
      },
    ],
  } as ItemType
}
export const getStock = () => {
  return {
    item: getItem1(),
    quantity: 10,
  }
}
export const getCompartment = () => {
  return {
    id: '1',
    items: [getStock()],
  } as CompartmentType
}
export const getMultiItemCompartment = () => {
  return {
    id: '1',
    items: [
      { item: getItem1(), quantity: 10 },
      { item: getItem2(), quantity: 20 },
    ],
  } as CompartmentType
}
export const getCompartmentCycleCounting = (
  cycleCountState: CycleCountState,
  countedQuantity: number
) => {
  const compartment = getCompartment()
  compartment.cycleCountState = cycleCountState
  compartment.countedQuantity = countedQuantity
  return compartment
}
export const getEmptyCompartment = () => {
  return {
    id: '1',
    name: '1',
    items: [],
  } as CompartmentType
}
export const getSourceLoadCarrier = (rotation = 0) => {
  return {
    id: '4711',
    loadCarrierType: getLoadCarrierTypeWithCompartments(1),
    rotation,
    compartments: [getCompartment()],
  } as LoadCarrierType
}

export const getNoReadLoadCarrier = () => {
  const loadCarrier = getSourceLoadCarrier()

  loadCarrier.additionalData = { IsNoRead: '1' }
  return loadCarrier
}

export const getSourceLoadCarrierWithCompartments = (
  compartments: CompartmentType[]
) => {
  return {
    id: '4711',
    loadCarrierType: getLoadCarrierType(),
    weight: getWeight(),
    rotation: 0,
    compartments,
  } as LoadCarrierType
}
export const getTargetLoadCarrier = () => {
  return {
    id: '4712',
    loadCarrierType: getLoadCarrierType(),
    weight: getWeight(),
    rotation: 1,
    compartments: [getCompartment()],
  } as LoadCarrierType
}
export const getMultiItemLoadCarrier = () => {
  const loadCarrier = getSourceLoadCarrier()
  loadCarrier.compartments = [getMultiItemCompartment()]
  return loadCarrier
}
export const getPickingTask = (
  quantity: number,
  barcodes?: BarcodeType[],
  gtin?: string,
  verifyBarcode = false
) => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  return {
    id: '',
    type: TaskTypeEnum.PickingTask,
    sourceLoadCarrierId: sourceLoadCarrier.id,
    targetLoadCarrierId: targetLoadCarrier.id,
    sourceCompartmentId: sourceLoadCarrier.compartments[0].id,
    targetCompartmentId: targetLoadCarrier.compartments[0].id,
    quantity: { value: quantity, max: quantity },
    verifyBarcode,
    zeroCrossing: false,
    barcodes: barcodes ?? [],
    item: getItem1(gtin),
  } as PickingTaskType
}
export const getConsolidationTask = (
  quantity: number = 69,
  barcodes?: BarcodeType[],
  verifyBarcode = false
) => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  return {
    id: '',
    type: TaskTypeEnum.ConsolidationTask,
    sourceLoadCarrierId: sourceLoadCarrier.id,
    sourceCompartmentId: '1',
    targetLoadCarrierId: targetLoadCarrier.id,
    targetCompartmentId: '1',
    item: getItem1(),
    quantity: { value: quantity },
    barcodes,
    verifyBarcode,
  } as ConsolidationTaskType
}
export const getConsolidationTaskWithQuantity = (
  quantity: MinMaxQuantityType
) => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  return {
    id: '',
    type: TaskTypeEnum.ConsolidationTask,
    sourceLoadCarrierId: sourceLoadCarrier.id,
    sourceCompartmentId: '1',
    targetLoadCarrierId: targetLoadCarrier.id,
    targetCompartmentId: '1',
    item: getItem1(),
    quantity,
    barcodes: [],
    verifyBarcode: false,
    zeroCrossing: false,
  } as ConsolidationTaskType
}
export const getManualConsolidationTask = (
  quantity: number = 69,
  barcodes?: BarcodeType[],
  verifyBarcode = false
) => {
  const manualConsolidationTask = getConsolidationTask(
    quantity,
    barcodes,
    verifyBarcode
  )
  manualConsolidationTask.type = TaskTypeEnum.ManualConsolidationTask
  return manualConsolidationTask as ManualConsolidationTaskType
}

export const getCycleCountTask = (
  mode: 'S2S' | 'S2T',
  barcodes?: BarcodeType[],
  verifyBarcode = false,
  gtin = ''
) => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  const cycleCountTask = {
    id: '',
    type: TaskTypeEnum.CycleCountTask,
    sourceLoadCarrierId: sourceLoadCarrier.id,
    sourceCompartmentId: '1',
    targetLoadCarrierId: targetLoadCarrier.id,
    targetCompartmentId: '1',
    item: getItem1(gtin),
    showQuantity: false,
    barcodes,
    verifyBarcode,
  } as CycleCountTaskType
  if (mode === 'S2S') {
    cycleCountTask.targetLoadCarrierId = undefined
    cycleCountTask.targetCompartmentId = undefined
  }
  return cycleCountTask
}

export const getMultiItemCycleCountTask = (
  mode: 'S2S' | 'S2T',
  barcodes?: BarcodeType[],
  verifyBarcode = false
) => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  const multiItemCycleCountTask = {
    id: '',
    type: TaskTypeEnum.MultiItemCycleCountTask,
    sourceLoadCarrierId: sourceLoadCarrier.id,
    sourceCompartmentId: '1',
    targetLoadCarrierId: targetLoadCarrier.id,
    targetCompartmentId: '1',
    showQuantity: false,
    barcodes,
    verifyBarcode,
  } as MultiItemCycleCountTaskType
  if (mode === 'S2S') {
    multiItemCycleCountTask.targetLoadCarrierId = undefined
    multiItemCycleCountTask.targetCompartmentId = undefined
  }
  return multiItemCycleCountTask
}

export const getPurgeAndRecallTask = (
  quantity: number,
  barcodes?: BarcodeType[],
  gtin?: string,
  verifyBarcode = false
) => {
  const sourceLoadCarrier = getSourceLoadCarrier()
  const targetLoadCarrier = getTargetLoadCarrier()
  return {
    id: '',
    type: TaskTypeEnum.PurgeAndRecallTask,
    sourceLoadCarrierId: sourceLoadCarrier.id,
    targetLoadCarrierId: targetLoadCarrier.id,
    sourceCompartmentId: sourceLoadCarrier.compartments[0].id,
    targetCompartmentId: targetLoadCarrier.compartments[0].id,
    quantity: { value: quantity, max: quantity },
    verifyBarcode,
    zeroCrossing: false,
    barcodes: barcodes ?? [],
    item: getItem1(gtin),
  } as PurgeAndRecallTaskType
}

export const getBarcode = (
  barcodeType: BarcodeTypeEnum,
  scanRule = ScanRuleEnum.ScanOnce,
  format = ''
) => {
  return {
    barcodeType,
    scanRule,
    name: '',
    format,
  } as BarcodeType
}

export const getBarcodeData = (
  barcodeType: BarcodeTypeEnum,
  barcode = '0815'
) => {
  return {
    barcodeType,
    barcode,
  } as BarcodeDataType
}

export const addCriticalProblem = () => {
  const troubleshootingStore = useTroubleshootingStore()
  troubleshootingStore.allProblems.push({
    type: ProblemTypeEnum.DamagedLoadCarrier,
    strategy: ProblemStrategyEnum.Abort,
    category: ProblemCategoryEnum.Source,
    subCategory: ProblemSubCategoryEnum.LoadCarrier,
  })
  troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
}

export const addTargetFull = () => {
  const troubleshootingStore = useTroubleshootingStore()
  troubleshootingStore.allProblems.push({
    type: ProblemTypeEnum.TargetFull,
    strategy: ProblemStrategyEnum.Abort,
    category: ProblemCategoryEnum.Target,
    subCategory: ProblemSubCategoryEnum.LoadCarrier,
  })
  troubleshootingStore.targetProblems.push(ProblemTypeEnum.TargetFull)
}

export const addProblemWithSendToReject = (category: ProblemCategoryEnum, sendToReject?: ProblemSendToRejectOption) => {
  const troubleshootingStore = useTroubleshootingStore()
  troubleshootingStore.allProblems = [] as ProblemDefinitionType[]

  if(sendToReject !== undefined) {
    const problem: ProblemDefinitionType = {
      category: category,
      strategy: ProblemStrategyEnum.Continue,
      type: category === ProblemCategoryEnum.Task ? ProblemTypeEnum.WrongItem : ProblemTypeEnum.DamagedLoadCarrier,
      sendToReject: sendToReject,
      subCategory: ProblemSubCategoryEnum.LoadCarrier,
    }

    troubleshootingStore.allProblems.push(problem)

    if (category === ProblemCategoryEnum.Source) {
      troubleshootingStore.sourceProblems.push(problem.type)
    } else if (category === ProblemCategoryEnum.Target) {
      troubleshootingStore.targetProblems.push(problem.type)
    } else {
      troubleshootingStore.taskProblems.push(problem.type)
    }
  }
}

export const getOrderLine = (): OrderLineType => {
  return {
    description: 'Test order line',
    task: getPickingTask(10),
    quantity: {
      value: 10,
      unit: 'Pcs',
      description: 'Single item',
    } as QuantityWithUnitType,
  } as OrderLineType
}

export const getAvailableStations = () => {
  return [
    { id: '0815', name: 'Spatti station', path: '' },
    { id: '0816', name: 'Simon station', path: '' },
  ] as SupportedStationType[]
}

export const getUnknownItemCompartment = (compartmentId: string, stockIndex: number, unknownItemCount: number, gtins = [] as BarcodeDataType[]) => {
  return {
    id: compartmentId,
    items: [
      {
        item: getUnknownItem(unknownItemCount, gtins),
        quantity: 1,
      } as StockType,
    ],
    stockIndex: stockIndex,
    countedQuantity: 1,
    cycleCountState: CycleCountState.inProgress,
    isRecount: false,
  } as CompartmentType
}
