import { Nullable } from 'vitest'
import { storeToRefs } from 'pinia'
import {
  AdditionalDataType,
  BarcodeBaseType,
  BarcodeDataType,
  BarcodeType,
  CompartmentType,
  ConfirmedItemType,
  ConsolidationTaskType,
  CycleCountTaskType,
  ItemType,
  LoadCarrierType,
  ManualConsolidationTaskType,
  MultiItemCycleCountTaskType,
  PickingTaskType,
  PurgeAndRecallTaskType,
  StockType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { ConsolidationActionEnum } from '@/types/ConsolidationActionEnum'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { WorkStationProcess } from '@/types/WorkStationProcess'
import { CycleCountState } from '@/types/CycleCountState'
import {
  AdditionalDataKeyEnum,
  BarcodeTypeEnum,
  PcotsLocationEnum,
  ScanRuleEnum,
  TaskTypeEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { CompartmentInfo } from '@/types/CompartmentInfo'
import { CompartmentState } from '@/types/CompartmentState'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import {
  CreateScanModelKeyFormat,
  buildCreateScanModelKeyFormat,
} from '@/types/CreateScanModelKeyFormat'
import { BarcodeGroup } from '@/types/BarcodeGroup'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import {
  unknownItemUrlDark,
  unknownItemUrlLight,
} from '@/constants/unknownItemUrl'

export const useApiDataHelper = () => {
  const isPickingTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (task?.type === TaskTypeEnum.PickingTask) {
      return true
    }
    return false
  }

  const isConsolidationTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (task?.type === TaskTypeEnum.ConsolidationTask) {
      return true
    }
    return false
  }

  const isCycleCountTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (task?.type === TaskTypeEnum.CycleCountTask) {
      return true
    }
    return false
  }

  const isMultiItemCycleCountTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (task?.type === TaskTypeEnum.MultiItemCycleCountTask) {
      return true
    }
    return false
  }

  const isManualConsolidationTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (task?.type === TaskTypeEnum.ManualConsolidationTask) {
      return true
    }
    return false
  }

  const isPurgeAndRecallTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (task?.type === TaskTypeEnum.PurgeAndRecallTask) {
      return true
    }
    return false
  }

  const isPickingOrPurgeAndRecallTask = (task: Nullable<TaskType>): boolean => {
    // noinspection RedundantIfStatementJS
    if (
      task?.type === TaskTypeEnum.PickingTask ||
      task?.type === TaskTypeEnum.PurgeAndRecallTask
    ) {
      return true
    }
    return false
  }

  const getPickingTask = (
    task: Nullable<TaskType>
  ): PickingTaskType | undefined => {
    if (isPickingTask(task)) {
      return task as PickingTaskType
    }
    return undefined
  }

  const getConsolidationTask = (
    task: Nullable<TaskType>
  ): ConsolidationTaskType | undefined => {
    if (isConsolidationTask(task)) {
      return task as ConsolidationTaskType
    }
    return undefined
  }

  const getCycleCountTask = (
    task: Nullable<TaskType>
  ): CycleCountTaskType | undefined => {
    if (isCycleCountTask(task)) {
      return task as CycleCountTaskType
    }
    return undefined
  }

  const getMultiItemCycleCountTask = (
    task: Nullable<TaskType>
  ): MultiItemCycleCountTaskType | undefined => {
    if (isMultiItemCycleCountTask(task)) {
      return task as MultiItemCycleCountTaskType
    }
    return undefined
  }

  const getCycleCountOrMultiItemCycleCountTask = (
    task: Nullable<TaskType>
  ): MultiItemCycleCountTaskType | CycleCountTaskType | undefined => {
    if (isMultiItemCycleCountTask(task)) {
      return task as MultiItemCycleCountTaskType
    } else if (isCycleCountTask(task)) {
      return task as CycleCountTaskType
    }
    return undefined
  }

  const getManualConsolidationTask = (
    task: Nullable<TaskType>
  ): ManualConsolidationTaskType | undefined => {
    if (isManualConsolidationTask(task)) {
      return task as ManualConsolidationTaskType
    }
    return undefined
  }

  const getConsolidationOrManualConsolidationTask = (
    task: Nullable<TaskType>
  ): ConsolidationTaskType | ManualConsolidationTaskType | undefined => {
    if (isManualConsolidationTask(task)) {
      return getManualConsolidationTask(task)
    } else if (isConsolidationTask(task)) {
      return getConsolidationTask(task)
    }
    return undefined
  }

  const getPurgeAndRecallTask = (
    task: Nullable<TaskType>
  ): PurgeAndRecallTaskType | undefined => {
    if (isPurgeAndRecallTask(task)) {
      return task as PurgeAndRecallTaskType
    }
    return undefined
  }

  const getCompartmentIdByTask = (
    pcotsLocation: PcotsLocationEnum,
    task: TaskType
  ): string | undefined => {
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationOrManualConsolidationTask(task)
    const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)

    if (pickingTask) {
      return pcotsLocation === PcotsLocationEnum.Source
        ? pickingTask.sourceCompartmentId
        : pickingTask.targetCompartmentId
    } else if (consolidationTask) {
      return pcotsLocation === PcotsLocationEnum.Source
        ? consolidationTask.sourceCompartmentId
        : consolidationTask.targetCompartmentId
    } else if (cycleCountTask) {
      if (pcotsLocation === PcotsLocationEnum.Source) {
        return cycleCountTask.sourceCompartmentId
      } else {
        return (
          cycleCountTask.targetCompartmentId ??
          cycleCountTask.sourceCompartmentId
        )
      }
    } else if (purgeAndRecallTask) {
      return pcotsLocation === PcotsLocationEnum.Source
        ? purgeAndRecallTask.sourceCompartmentId
        : purgeAndRecallTask.targetCompartmentId
    }
  }

  const getLoadCarrierIdByTask = (
    pcotsLocation: PcotsLocationEnum,
    task: TaskType
  ): string | undefined => {
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationOrManualConsolidationTask(task)
    const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)
    if (pickingTask) {
      return pcotsLocation === PcotsLocationEnum.Source
        ? pickingTask.sourceLoadCarrierId
        : pickingTask.targetLoadCarrierId
    } else if (consolidationTask) {
      return pcotsLocation === PcotsLocationEnum.Source
        ? consolidationTask.sourceLoadCarrierId
        : consolidationTask.targetLoadCarrierId
    } else if (cycleCountTask) {
      if (pcotsLocation === PcotsLocationEnum.Source) {
        return cycleCountTask.sourceLoadCarrierId
      } else {
        return (
          cycleCountTask.targetLoadCarrierId ??
          cycleCountTask.sourceLoadCarrierId
        )
      }
    } else if (purgeAndRecallTask) {
      return pcotsLocation === PcotsLocationEnum.Source
        ? purgeAndRecallTask.sourceLoadCarrierId
        : purgeAndRecallTask.targetLoadCarrierId
    }
  }

  const getItemFromTask = (task: TaskType) => {
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationTask(task)
    const cycleCountTask = getCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)

    if (pickingTask) {
      return pickingTask?.item
    } else if (consolidationTask) {
      return consolidationTask.item
    } else if (cycleCountTask) {
      return cycleCountTask.item
    } else if (purgeAndRecallTask) {
      return purgeAndRecallTask.item
    }
  }

  const getQuantityFromTask = (
    task: TaskType,
    scannedBarcodes: BarcodeDataType[]
  ) => {
    let quantity = 0
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationOrManualConsolidationTask(task)
    const cycleCountTask = getCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)

    if (pickingTask) {
      quantity = pickingTask.quantity.value
    } else if (consolidationTask) {
      quantity = consolidationTask.quantity?.value
    } else if (cycleCountTask) {
      // Never finish scanning in cycle counting
      quantity = scannedBarcodes.length + 1
    } else if (purgeAndRecallTask) {
      quantity = purgeAndRecallTask.quantity.value
    }
    return quantity
  }

  const getItemCountWithQuantityLargerZero = (stocks: StockType[]): number => {
    const itemIds: string[] = []
    for (const stock of stocks) {
      if (!itemIds.includes(stock.item.id) && stock.quantity > 0) {
        itemIds.push(stock.item.id)
      }
    }
    return itemIds.length
  }

  const getItemIdsFromStocks = (stocks: StockType[]): string[] => {
    const itemIds: string[] = []
    for (const stock of stocks) {
      if (!itemIds.includes(stock.item.id)) {
        itemIds.push(stock.item.id)
      }
    }
    return itemIds
  }

  const isMultiItemCompartment = (compartment: CompartmentType) => {
    const itemIds = getItemIdsFromStocks(compartment.items)
    return (
      itemIds.length > 1 ||
      (itemIds.length === 1 && compartment.stockIndex !== undefined)
    )
  }

  const isMultiItem = (compartments: CompartmentType[] | undefined) => {
    if (compartments) {
      for (const compartment of compartments) {
        if (isMultiItemCompartment(compartment)) {
          return true
        }
      }
    }
    return false
  }

  const getStockIndex = (
    compartment: CompartmentType | undefined,
    task: TaskType | null | undefined
  ) => {
    if (task && compartment && compartment.items) {
      const index = compartment.items.findIndex((stock) => {
        return stock.item.id === task.item?.id
      })
      return index > -1 ? index : 0
    }
    return 0
  }

  const getStockFromCompartment = (
    compartment: CompartmentType | undefined,
    task: TaskType | null | undefined
  ) => {
    const stockIndex = getStockIndex(compartment, task)
    if (
      compartment?.items?.length &&
      compartment?.items?.length - 1 >= stockIndex
    ) {
      return compartment.items[stockIndex]
    }
    return undefined
  }

  const getCompartmentByItemId = (
    loadCarrier: LoadCarrierType,
    itemId?: string
  ): CompartmentType | undefined => {
    if (itemId) {
      return loadCarrier.compartments.find((compartment) =>
        compartment.items.find((stock: StockType) => stock.item.id === itemId)
      )
    }
  }

  const getCompartmentByTask = (
    pcotsLocation: PcotsLocationEnum,
    loadCarrier: LoadCarrierType,
    task: TaskType
  ): CompartmentType | undefined => {
    const compartmentId = getCompartmentIdByTask(pcotsLocation, task)
    const loadCarrierId = getLoadCarrierIdByTask(pcotsLocation, task)
    if (loadCarrier.id === loadCarrierId) {
      const compartmentCount = loadCarrier.compartments.filter(
        (compartment) => compartment.id === compartmentId
      ).length
      if (compartmentCount === 1) {
        return loadCarrier.compartments.find(
          (compartment) => compartment.id === compartmentId
        )
      } else if (compartmentCount > 1) {
        // Stock compartments -> multi item
        const itemFromTask = getItemFromTask(task)
        const quantity = getQuantityFromTask(task, [])
        let possibleCompartments = loadCarrier.compartments.filter(
          (compartment) => compartment.id === compartmentId
        )
        if (isMultiItemCycleCountTask(task)) {
          // return any compartment with the correct compartment id because it is only to display the active compartment
          return possibleCompartments[0]
        }
        possibleCompartments = possibleCompartments.filter((compartment) =>
          compartment.items.find(
            (item) =>
              item.item.id === itemFromTask?.id && item.quantity >= quantity
          )
        )

        if (isMultiItem(loadCarrier.compartments)) {
          const compartment = possibleCompartments[0]
          const stockFromCompartment = getStockFromCompartment(
            compartment,
            task
          )
          if (stockFromCompartment) {
            compartment.items = [stockFromCompartment]
            return compartment
          }
        }

        return possibleCompartments[0]
      }
    }
  }

  const getQuantityFromStocks = (stocks: StockType[], item: ItemType) => {
    const stockByItem = stocks.filter((stock) => stock.item.id === item.id)
    let quantity = 0
    if (stockByItem && stockByItem.length > 0) {
      for (const stock of stockByItem) {
        quantity += stock.quantity
      }
    }
    return quantity
  }

  const willSourceBeEmptyAfterPick = (
    sourceLoadCarrier: LoadCarrierType,
    task:
      | PickingTaskType
      | ConsolidationTaskType
      | ManualConsolidationTaskType
      | PurgeAndRecallTaskType
  ): boolean => {
    const compartment = getCompartmentByTask(
      PcotsLocationEnum.Source,
      sourceLoadCarrier,
      task
    )
    if (compartment?.items && compartment?.items.length > 0) {
      const itemCount = getItemCountWithQuantityLargerZero(compartment.items)
      const quantity = getQuantityFromStocks(compartment.items, task.item)
      if (itemCount > 1) {
        return false
      } else {
        return quantity - task.quantity.value === 0
      }
    }
    return true
  }

  const getBarcodesFromTask = (task: TaskType): BarcodeType[] | undefined => {
    let barcodes: BarcodeType[] | undefined
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationOrManualConsolidationTask(task)
    const cycleCountTask = getCycleCountTask(task)
    const multiItemCycleCountTask = getMultiItemCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)

    if (pickingTask) {
      barcodes = pickingTask.barcodes
    } else if (consolidationTask) {
      barcodes = consolidationTask.barcodes
    } else if (cycleCountTask) {
      barcodes = cycleCountTask.barcodes
    } else if (multiItemCycleCountTask) {
      barcodes = multiItemCycleCountTask.barcodes
    } else if (purgeAndRecallTask) {
      barcodes = purgeAndRecallTask.barcodes
    }
    return barcodes
  }

  const getGtinsFromTask = (task: TaskType): string[] => {
    let gtins: string[] = []
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationOrManualConsolidationTask(task)
    const cycleCountTask = getCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)

    if (pickingTask) {
      gtins = pickingTask.item.gtins
    } else if (consolidationTask) {
      gtins = consolidationTask.item.gtins
    } else if (cycleCountTask) {
      gtins = cycleCountTask.item.gtins
    } else if (purgeAndRecallTask) {
      gtins = purgeAndRecallTask.item.gtins
    }
    return gtins
  }

  const getGtinsFromLoadCarrier = (
    loadCarrier: LoadCarrierType | undefined
  ): string[] => {
    const gtins: string[] = []
    loadCarrier?.compartments.forEach((compartment) =>
      compartment.items.forEach((stock) => gtins.push(...stock.item.gtins))
    )
    return gtins
  }

  const getVerifyBarcodeFromTask = (task: TaskType) => {
    let verifyBarcode = false
    const pickingTask = getPickingTask(task)
    const consolidationTask = getConsolidationOrManualConsolidationTask(task)
    const cycleCountTask = getCycleCountTask(task)
    const purgeAndRecallTask = getPurgeAndRecallTask(task)

    if (pickingTask) {
      verifyBarcode = pickingTask.verifyBarcode
    } else if (consolidationTask) {
      verifyBarcode = consolidationTask.verifyBarcode
    } else if (cycleCountTask) {
      verifyBarcode = cycleCountTask.verifyBarcode
    } else if (purgeAndRecallTask) {
      verifyBarcode = purgeAndRecallTask.verifyBarcode
    }
    return verifyBarcode
  }

  const getScannedAmount = (
    task: TaskType,
    scannedBarcodes: BarcodeDataType[]
  ): number | undefined => {
    const barcodes = getBarcodesFromTask(task)
    if (barcodes && scannedBarcodes) {
      return Math.floor(scannedBarcodes.length / barcodes.length)
    }
  }

  const isScanningRequired = (task: TaskType): boolean => {
    const barcodes = getBarcodesFromTask(task)
    // noinspection RedundantIfStatementJS
    if ((barcodes && barcodes.length > 0) || isMultiItemCycleCountTask(task)) {
      return true
    }
    return false
  }

  const isScanOnce = (task: TaskType): boolean => {
    const barcodes = getBarcodesFromTask(task)
    // noinspection RedundantIfStatementJS
    if (
      barcodes &&
      barcodes.length > 0 &&
      barcodes[0].scanRule === ScanRuleEnum.ScanOnce
    ) {
      return true
    }
    return false
  }

  const isScanEach = (task: TaskType): boolean => {
    return isScanningRequired(task) && !isScanOnce(task)
  }

  const isSourceToSourceCount = (
    task: CycleCountTaskType | MultiItemCycleCountTaskType | undefined
  ) => {
    if (task) {
      return (
        task.targetLoadCarrierId === undefined ||
        task.targetCompartmentId === undefined
      )
    }
    return false
  }

  const isScanningFinished = (
    task: TaskType,
    scannedBarcodes?: BarcodeDataType[]
  ): boolean => {
    if (isScanningRequired(task) && scannedBarcodes) {
      const barcodes = getBarcodesFromTask(task)
      const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task)

      if (cycleCountTask) {
        return !(isScanOnce(cycleCountTask) || isScanEach(cycleCountTask))
      }
      if (
        barcodes &&
        barcodes.length > 0 &&
        barcodes[0].scanRule === ScanRuleEnum.ScanOnce
      ) {
        return getScannedAmount(task, scannedBarcodes) === 1
      }

      const quantity = getQuantityFromTask(task, scannedBarcodes)

      return getScannedAmount(task, scannedBarcodes) === quantity
    }
    return true
  }

  const isFirstScanFinished = (
    task: TaskType,
    scannedBarcodes?: BarcodeDataType[]
  ) => {
    if (isScanningRequired(task)) {
      return scannedBarcodes && scannedBarcodes?.length > 0
    }
    return true
  }

  const isCompartmentEmpty = (compartment: CompartmentType): boolean => {
    for (const item of compartment.items) {
      if (item?.quantity > 0) {
        return false
      }
    }
    return true
  }

  const isLoadCarrierEmpty = (loadCarrier: LoadCarrierType): boolean => {
    for (const compartment of loadCarrier.compartments) {
      if (!isCompartmentEmpty(compartment)) {
        return false
      }
    }
    return true
  }

  const isLoadCarrierFilled = (loadCarrier: LoadCarrierType): boolean => {
    return (
      loadCarrier.compartments.find((compartment) =>
        isCompartmentEmpty(compartment)
      ) === undefined
    )
  }

  const hasSameItem = (
    compartment1: CompartmentType,
    compartment2: CompartmentType
  ) => {
    const itemIds1 = getItemIdsFromStocks(compartment1.items)
    const itemIds2 = getItemIdsFromStocks(compartment2.items)
    for (const itemId of itemIds1) {
      if (itemIds2.includes(itemId)) {
        return true
      }
    }
    return false
  }

  const getStockCompartments = (
    compartments: CompartmentType[]
  ): CompartmentType[] => {
    const stockCompartments: CompartmentType[] = []
    compartments.forEach((compartment) => {
      if (compartment.items.length > 1) {
        compartment.items.forEach((stock, index) => {
          const currentStockCompartment: CompartmentType = {
            id: compartment.id,
            items: stock.quantity
              ? [{ item: stock.item, quantity: stock.quantity } as StockType]
              : [],
            stockIndex: index,
            countedQuantity: compartment.countedQuantity,
            cycleCountState: compartment.cycleCountState,
            isRecount: compartment.isRecount,
          }
          stockCompartments.push(currentStockCompartment)
        })
      } else {
        stockCompartments.push({
          id: compartment.id,
          items: compartment.items,
          stockIndex: compartment.stockIndex ?? 0,
          countedQuantity: compartment.countedQuantity,
          cycleCountState: compartment.cycleCountState,
          isRecount: compartment.isRecount,
        })
      }
    })

    return stockCompartments
  }

  const getCompartmentInfosAuto = (
    loadCarrier: LoadCarrierType,
    pcotsLocation: PcotsLocationEnum,
    task: TaskType | undefined
  ) => {
    const compartmentInfos: CompartmentInfo[] = []
    const pickingTask = task as PickingTaskType
    const manualConsolidationTask = getManualConsolidationTask(task)
    const purgeAndRecallTask = task as PurgeAndRecallTaskType
    if (manualConsolidationTask?.isCompleted) {
      return compartmentInfos
    }

    if (pickingTask && loadCarrier) {
      const compartmentFromTask = getCompartmentByTask(
        pcotsLocation,
        loadCarrier,
        pickingTask
      )
      if (compartmentFromTask) {
        compartmentInfos.push({
          id: compartmentFromTask.id,
          state: CompartmentState.active,
          stockIndex: compartmentFromTask.stockIndex,
        })
      } else if (
        pcotsLocation === PcotsLocationEnum.Target &&
        !pickingTask.targetCompartmentId
      ) {
        compartmentInfos.push({
          id: loadCarrier.compartments[0].id,
          state: CompartmentState.active,
          stockIndex: loadCarrier.compartments[0].stockIndex,
        })
      }
      return compartmentInfos
    }
    if (purgeAndRecallTask && loadCarrier) {
      const compartmentFromTask = getCompartmentByTask(
        pcotsLocation,
        loadCarrier,
        purgeAndRecallTask
      )
      if (compartmentFromTask) {
        compartmentInfos.push({
          id: compartmentFromTask.id,
          state: CompartmentState.active,
          stockIndex: compartmentFromTask.stockIndex,
        })
      } else if (
        pcotsLocation === PcotsLocationEnum.Target &&
        !purgeAndRecallTask.targetCompartmentId
      ) {
        compartmentInfos.push({
          id: loadCarrier.compartments[0].id,
          state: CompartmentState.active,
          stockIndex: loadCarrier.compartments[0].stockIndex,
        })
      }
    }
    return compartmentInfos
  }

  const getSelectableCompartmentsForMoveAction = (
    loadCarrier: LoadCarrierType,
    activeCompartment: CompartmentType
  ): CompartmentType[] => {
    const selectableCompartments: CompartmentType[] = []
    const compartments = getStockCompartments(loadCarrier.compartments)
    compartments.forEach((compartment: CompartmentType) => {
      if (
        isCompartmentEmpty(compartment) ||
        hasSameItem(compartment, activeCompartment)
      ) {
        selectableCompartments.push(compartment)
      }
    })

    return selectableCompartments
  }

  const getCompartmentInfosMoveAction = (
    loadCarrier: LoadCarrierType,
    activeCompartment: CompartmentType,
    myActiveCompartment: CompartmentType | undefined
  ) => {
    const selectableCompartments = getSelectableCompartmentsForMoveAction(
      loadCarrier,
      activeCompartment
    )
    let disabledCompartments = loadCarrier.compartments.filter(
      (compartment) =>
        !isCompartmentEmpty(compartment) &&
        !hasSameItem(compartment, activeCompartment)
    )

    // Current active compartment shouldn't be selectable
    if (myActiveCompartment) {
      disabledCompartments = disabledCompartments.filter(
        (compartment) => compartment.id !== myActiveCompartment.id
      )
    }

    const compartmentInfos: CompartmentInfo[] = []
    for (const selectableCompartment of selectableCompartments) {
      compartmentInfos.push({
        id: selectableCompartment.id,
        state: CompartmentState.selectable,
        stockIndex: selectableCompartment.stockIndex,
      })
    }

    for (const disabledCompartment of disabledCompartments) {
      compartmentInfos.push({
        id: disabledCompartment.id,
        state: CompartmentState.disabled,
        stockIndex: disabledCompartment.stockIndex,
      })
    }
    return compartmentInfos
  }

  const getCompartmentInfosSwapAction = (
    loadCarrier: LoadCarrierType,
    myActiveCompartment: CompartmentType | undefined
  ) => {
    const compartmentInfos: CompartmentInfo[] = []
    const compartments = getStockCompartments(
      loadCarrier.compartments.filter(
        (compartment) => compartment.id !== myActiveCompartment?.id
      )
    )
    for (const compartment of compartments) {
      compartmentInfos.push({
        id: compartment.id,
        state: CompartmentState.selectable,
        stockIndex: compartment.stockIndex,
      })
    }
    return compartmentInfos
  }

  const getCompartmentInfosManual = (
    loadCarrier: LoadCarrierType,
    task: TaskType | undefined,
    pcotsLocation: PcotsLocationEnum,
    activeSourceCompartment: CompartmentType | undefined,
    activeTargetCompartment: CompartmentType | undefined,
    consolidationAction: ConsolidationActionEnum | undefined
  ) => {
    const myActiveCompartment =
      pcotsLocation === PcotsLocationEnum.Source
        ? activeSourceCompartment
        : activeTargetCompartment
    // Get the compartment which was selected no matter if it's in the current load carrier or not
    const activeCompartment = activeSourceCompartment ?? activeTargetCompartment
    const compartmentInfos: CompartmentInfo[] = []

    // Display compartment of the current load carrier as active
    if (myActiveCompartment) {
      compartmentInfos.push({
        id: myActiveCompartment.id,
        state: CompartmentState.active,
        stockIndex: myActiveCompartment.stockIndex ?? 0,
      })
    }

    // No active compartment the filled ones should be selectable to inventory or move
    if (!activeCompartment) {
      const compartments = loadCarrier.compartments.filter(
        (compartment) =>
          !isCompartmentEmpty(compartment) ||
          consolidationAction === ConsolidationActionEnum.swap
      )
      const stockCompartments = getStockCompartments(compartments)
      for (const stock of stockCompartments) {
        compartmentInfos.push({
          id: stock.id,
          state: CompartmentState.selectable,
          stockIndex: stock.stockIndex,
        })
      }
    } else {
      // Select target sector for move -> all sectors which are empty or have same item as active compartment
      if (consolidationAction === ConsolidationActionEnum.move) {
        compartmentInfos.push(
          ...getCompartmentInfosMoveAction(
            loadCarrier,
            activeCompartment,
            myActiveCompartment
          )
        )
      } else if (consolidationAction === ConsolidationActionEnum.swap) {
        // All compartments should be selectable except the active one
        compartmentInfos.push(
          ...getCompartmentInfosSwapAction(loadCarrier, myActiveCompartment)
        )
      }
    }

    return compartmentInfos
  }

  const getCompartmentInfosCycleCount = (
    loadCarrier: LoadCarrierType,
    task: CycleCountTaskType | MultiItemCycleCountTaskType | undefined,
    pcotsLocation: PcotsLocationEnum
  ) => {
    const compartmentInfos: CompartmentInfo[] = []
    if (task) {
      const compartmentFromTask = getCompartmentByTask(
        pcotsLocation,
        loadCarrier,
        task
      )
      if (compartmentFromTask) {
        compartmentInfos.push({
          id: compartmentFromTask.id,
          state: CompartmentState.active,
          stockIndex: compartmentFromTask.stockIndex ?? 0,
        })
      }
    }
    return compartmentInfos
  }

  const getCompartmentInfos = (
    loadCarrier: LoadCarrierType | undefined,
    task: TaskType | undefined,
    pcotsLocation: PcotsLocationEnum,
    activeSourceCompartment: CompartmentType | undefined,
    activeTargetCompartment: CompartmentType | undefined,
    consolidationAction: ConsolidationActionEnum | undefined,
    consolidationMode: ConsolidationModeEnum | undefined
  ) => {
    if (loadCarrier) {
      if (
        consolidationAction &&
        consolidationMode === ConsolidationModeEnum.MANUAL
      ) {
        return getCompartmentInfosManual(
          loadCarrier,
          task,
          pcotsLocation,
          activeSourceCompartment,
          activeTargetCompartment,
          consolidationAction
        )
      } else if (
        consolidationMode === ConsolidationModeEnum.AUTO ||
        consolidationMode === undefined
      ) {
        const cycleCountOrMultiItemCycleCountTask =
          getCycleCountOrMultiItemCycleCountTask(task)
        if (task && cycleCountOrMultiItemCycleCountTask) {
          return getCompartmentInfosCycleCount(
            loadCarrier,
            cycleCountOrMultiItemCycleCountTask,
            pcotsLocation
          )
        } else {
          return getCompartmentInfosAuto(loadCarrier, pcotsLocation, task)
        }
      }
    }
    return []
  }

  const getItemNamesFromLoadCarrier = (loadCarrier: LoadCarrierType) => {
    const itemNames: string[] = []
    for (const compartment of loadCarrier.compartments) {
      for (const stock of compartment.items) {
        if (stock?.item && !itemNames.includes(stock.item.id)) {
          itemNames.push(stock.item.id)
        }
      }
    }
    return itemNames
  }

  const refreshIsCompleted = (
    task: Nullable<TaskType>,
    sourceLoadCarrier: LoadCarrierType | undefined,
    targetLoadCarrier: LoadCarrierType | undefined
  ) => {
    const manualConsolidationTask = getManualConsolidationTask(task)
    if (manualConsolidationTask && sourceLoadCarrier && targetLoadCarrier) {
      const sourceCompartment = getCompartmentByTask(
        PcotsLocationEnum.Source,
        sourceLoadCarrier,
        manualConsolidationTask
      )
      const targetCompartmentAmount = targetLoadCarrier.compartments.length
      const itemNamesInTarget: string[] =
        getItemNamesFromLoadCarrier(targetLoadCarrier)
      const areAllTargetCompartmentsOccupied =
        isLoadCarrierFilled(targetLoadCarrier)

      const hasSameItemInTarget =
        itemNamesInTarget.filter((itemId) =>
          sourceCompartment?.items.find((stock) => stock.item.id === itemId)
        ).length > 0

      manualConsolidationTask.isCompleted =
        isLoadCarrierEmpty(sourceLoadCarrier) ||
        (targetCompartmentAmount === itemNamesInTarget.length &&
          !hasSameItemInTarget &&
          !isMultiItem(targetLoadCarrier.compartments)) ||
        (areAllTargetCompartmentsOccupied && !hasSameItemInTarget)
    }
  }

  const refreshCycleCountState = (
    loadCarrier: LoadCarrierType | undefined,
    task: TaskType | undefined,
    cycleCountedCompartmentIds: CountedCompartmentsType,
    countedQuantity: number | undefined,
    isRecount: boolean
  ) => {
    const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task)
    if (loadCarrier && cycleCountTask && loadCarrier.compartments) {
      let compartments = loadCarrier.compartments
      if (isMultiItem(loadCarrier.compartments)) {
        compartments = getStockCompartments(loadCarrier?.compartments)
      }
      for (const compartment of compartments) {
        if (
          (cycleCountedCompartmentIds &&
            compartment.id in cycleCountedCompartmentIds &&
            cycleCountedCompartmentIds[compartment.id].includes(
              compartment.items[0]?.item.id
            )) ||
          (!isSourceToSourceCount(cycleCountTask) &&
            compartment.items.length === 0)
        ) {
          compartment.cycleCountState = CycleCountState.finished
        } else if (
          cycleCountTask.sourceLoadCarrierId === loadCarrier.id &&
          cycleCountTask.sourceCompartmentId === compartment.id &&
          (cycleCountTask.item?.id === compartment.items[0].item.id ||
            cycleCountTask.item === undefined)
        ) {
          if (isMultiItemCycleCountTask(cycleCountTask)) {
            const taskStore = useTaskStore()
            compartment.countedQuantity = taskStore.getCycleCountQuantity(
              compartment.items[0].item.id
            )
          } else {
            compartment.countedQuantity = countedQuantity
          }
          compartment.cycleCountState = CycleCountState.inProgress
          compartment.isRecount = isRecount
        } else {
          compartment.cycleCountState = CycleCountState.toDo
        }
      }
      loadCarrier.compartments = compartments
    }
  }

  const getWorkStationProcessByTask = (task: TaskType) => {
    if (isPickingTask(task)) {
      return WorkStationProcess.Picking
    } else if (isConsolidationTask(task) || isManualConsolidationTask(task)) {
      return WorkStationProcess.Consolidation
    } else if (getCycleCountOrMultiItemCycleCountTask(task)) {
      return WorkStationProcess.CycleCounting
    } else if (getPurgeAndRecallTask(task)) {
      return WorkStationProcess.PurgeAndRecall
    }
  }

  const getWorkStationProcessByWorkStationMode = (
    workStationMode: WorkStationModeEnum
  ) => {
    if (workStationMode === WorkStationModeEnum.Picking) {
      return WorkStationProcess.Picking
    } else if (workStationMode === WorkStationModeEnum.Consolidation) {
      return WorkStationProcess.Consolidation
    } else if (workStationMode === WorkStationModeEnum.CycleCount) {
      return WorkStationProcess.CycleCounting
    } else if (workStationMode === WorkStationModeEnum.PurgeAndRecall) {
      return WorkStationProcess.PurgeAndRecall
    }
  }

  const getWorkStationProcess = (
    task: Nullable<TaskType>,
    workStationMode: WorkStationModeEnum
  ) => {
    if (task) {
      return getWorkStationProcessByTask(task)
    }
    return getWorkStationProcessByWorkStationMode(workStationMode)
  }

  const isCompartmentCounted = (compartment: CompartmentType | undefined) => {
    if (compartment) {
      if (
        compartment.cycleCountState === CycleCountState.finished ||
        (compartment.cycleCountState === CycleCountState.inProgress &&
          compartment.countedQuantity !== undefined &&
          compartment.countedQuantity !== null &&
          compartment.countedQuantity > 0)
      ) {
        return true
      }
    }
    return false
  }

  const getAdditionalDataValue = (
    data: AdditionalDataType,
    key: AdditionalDataKeyEnum
  ): any => {
    if (data.additionalData && key.toString() in data.additionalData) {
      return data.additionalData[key.toString()]
    }
    return undefined
  }

  const isTaskSplitted = (task: TaskType | undefined) => {
    const taskStore = useTaskStore()
    const { originalQuantity } = storeToRefs(taskStore)
    if (task) {
      const currentTask =
        getPickingTask(task) ??
        getConsolidationTask(task) ??
        getPurgeAndRecallTask(task)
      if (
        currentTask?.quantity &&
        originalQuantity.value !== currentTask.quantity.value
      ) {
        return true
      }
    }
    return false
  }

  const getItemByGtin = (
    compartments: CompartmentType[] | undefined,
    gtin: string | undefined
  ) => {
    if (compartments && gtin) {
      for (const comp of compartments) {
        const stockWithGtin = comp.items.find((stock) =>
          stock.item.gtins.includes(gtin)
        )
        if (stockWithGtin) {
          return stockWithGtin?.item
        }
      }
    }
    return undefined
  }

  const hasUnknownItemUrl = (imageUrls: string[]) => {
    let hasUnknownItemUrl = false

    imageUrls.forEach((url) => {
      if (url === unknownItemUrlLight || url === unknownItemUrlDark) {
        hasUnknownItemUrl = true
      }
    })

    return hasUnknownItemUrl
  }

  const getItemNumberDisplay = (itemNo: string | undefined) => {
    return itemNo?.includes('unknown-item-') ? '-' : itemNo
  }

  const getUnknownItem = (
    unknownItemTypeCount: number,
    barcodes: BarcodeDataType[] = []
  ) => {
    const { getTranslationString } = useTranslations('unknown-item')
    const { unknownItemUrl } = useTheme()

    return {
      id: `unknown-item-${unknownItemTypeCount}`,
      name: getTranslationString('description', {
        itemCount: unknownItemTypeCount,
      }),
      description: getTranslationString('description', {
        itemCount: unknownItemTypeCount,
      }),
      images: [{ url: unknownItemUrl.value }],
      gtins: barcodes
        .filter((barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin)
        .map((barcode) => barcode.barcode),
      weight: undefined,
      isUnknownItem: true,
    } as ItemType
  }

  const addNewUnknownItemToSourceLoadCarrier = (
    barcodes: BarcodeDataType[],
    unknownItemTypeCount: number
  ): ItemType => {
    const loadCarrierStore = useLoadCarrierStore()
    const taskStore = useTaskStore()

    const item: ItemType = getUnknownItem(unknownItemTypeCount, barcodes)
    const newStock: StockType = {
      item,
      quantity: 1,
    }
    if (taskStore.task?.sourceCompartmentId) {
      const stockIndex =
        loadCarrierStore.sourceLoadCarrier?.compartments.filter(
          (compartment) =>
            compartment.id === taskStore.task?.sourceCompartmentId
        ).length
      const newCompartment: CompartmentType = {
        id: taskStore.task.sourceCompartmentId,
        items: [newStock],
        countedQuantity: 1,
        cycleCountState: CycleCountState.inProgress,
        isRecount: false,
        stockIndex,
      }
      loadCarrierStore.sourceLoadCarrier?.compartments.push(newCompartment)
    }
    return item
  }

  const getBarcodeGroups = (task: TaskType, barcodes: BarcodeDataType[]) => {
    const barcodeGroups: BarcodeGroup[] = []
    let barcodeGroup: BarcodeGroup = { barcodes: [] }
    const barcodesFromTask = getBarcodesFromTask(task)

    if (barcodesFromTask) {
      const groupSize = barcodesFromTask.length
      barcodes.forEach((barcode) => {
        barcodeGroup.barcodes.push(barcode)
        if (barcodeGroup.barcodes.length === groupSize) {
          barcodeGroups.push(barcodeGroup)
          barcodeGroup = { barcodes: [] }
        }
      })
    }
    return barcodeGroups
  }

  // Should be replaced with the JS groupBy as soon as it is supported by most browsers
  const groupBy = (list: any[], keyGetter: any) => {
    const map = new Map()
    list.forEach((item) => {
      const key = keyGetter(item)
      const collection = map.get(key)
      if (!collection) {
        map.set(key, [item])
      } else {
        collection.push(item)
      }
    })
    return map
  }

  const isUnknownItem = (item: ItemType | undefined) => {
    return item && item.isUnknownItem
  }

  const getConfirmedItems = (
    quantity: number,
    barcodes: BarcodeDataType[],
    itemId: string | undefined,
    hasProblemWithAbort: boolean,
    task?: TaskType,
    sourceLoadCarrier?: LoadCarrierType | undefined
  ): ConfirmedItemType[] => {
    if (hasProblemWithAbort) {
      return []
    } else if (task && isMultiItemCycleCountTask(task)) {
      const confirmedItems: ConfirmedItemType[] = []
      const barcodeGroups = getBarcodeGroups(task, barcodes)
      const barcodeGroupsGroupedByGtin = groupBy(
        barcodeGroups,
        (barcodeGroup: any) =>
          barcodeGroup.barcodes.find(
            (barcode: any) => barcode.barcodeType === BarcodeTypeEnum.Gtin
          ).barcode
      )

      barcodeGroupsGroupedByGtin.forEach((gtinGroup, key) => {
        const barcodes: BarcodeDataType[] = []
        gtinGroup.forEach((barcodeGroup: any) => {
          barcodes.push(...barcodeGroup.barcodes)
        })
        const itemWithGtin = getItemByGtin(sourceLoadCarrier?.compartments, key)
        if (itemWithGtin?.id) {
          let quantity = 0
          if (isScanOnce(task)) {
            const taskStore = useTaskStore()
            quantity = taskStore.getCycleCountQuantity(itemWithGtin.id)
          } else {
            quantity = gtinGroup.length
          }
          confirmedItems.push({
            quantity,
            itemId: isUnknownItem(itemWithGtin) ? '' : itemWithGtin.id,
            barcodes,
          })
        }
      })
      return confirmedItems
    }
    return [
      {
        quantity,
        barcodes,
        itemId,
      } as ConfirmedItemType,
    ]
  }

  const isZeroCrossingTask = (task: TaskType | undefined): boolean => {
    return !!(
      getPickingTask(task)?.zeroCrossing ??
      getConsolidationTask(task)?.zeroCrossing ??
      getManualConsolidationTask(task)?.zeroCrossing ??
      getPurgeAndRecallTask(task)?.zeroCrossing
    )
  }

  const createCompartmentKey = (compartment: CompartmentType): string => {
    if (compartment.stockIndex !== undefined) {
      return compartment.id + compartment.stockIndex
    }
    return compartment.id
  }

  const getCreateScanModelKey = (
    barcodes: BarcodeBaseType[],
    barcode: BarcodeBaseType
  ): CreateScanModelKeyFormat => {
    let fieldNumber = 1
    for (const barcodeInList of barcodes.filter(
      (x) => x.barcodeType === barcode.barcodeType
    )) {
      if (barcodeInList === barcode) {
        break
      }
      fieldNumber += 1
    }
    return buildCreateScanModelKeyFormat(barcode.barcodeType, fieldNumber)
  }

  const hasUnknownItem = (loadCarrier: LoadCarrierType | undefined) => {
    if (loadCarrier === undefined) {
      return false
    }
    for (const compartment of loadCarrier.compartments) {
      for (const item of compartment.items) {
        if (isUnknownItem(item.item)) {
          return true
        }
      }
    }
    return false
  }

  const hasNotScannedBarcodeBefore = (
    scannedBarcode: BarcodeDataType | undefined
  ) => {
    const barcodeStore = useBarcodeStore()
    return (
      barcodeStore.barcodes.filter(
        (barcode) =>
          barcode.barcodeType === BarcodeTypeEnum.Gtin &&
          barcode.barcode === scannedBarcode?.barcode
      ).length < 1
    )
  }

  const shouldAddBarcode = (
    task: TaskType,
    scannedBarcode: BarcodeDataType | undefined
  ) => {
    return (
      isScanEach(task) ||
      (!isScanEach(task) && hasNotScannedBarcodeBefore(scannedBarcode))
    )
  }

  return {
    getCompartmentIdByTask,
    getLoadCarrierIdByTask,
    getCompartmentByTask,
    getCompartmentByItemId,
    willSourceBeEmptyAfterPick,
    isScanningFinished,
    getScannedAmount,
    isScanningRequired,
    isScanOnce,
    isScanEach,
    isCompartmentEmpty,
    isLoadCarrierEmpty,
    isLoadCarrierFilled,
    isPickingTask,
    isConsolidationTask,
    isCycleCountTask,
    isMultiItemCycleCountTask,
    isManualConsolidationTask,
    isPurgeAndRecallTask,
    isPickingOrPurgeAndRecallTask,
    getPickingTask,
    getConsolidationTask,
    getCycleCountTask,
    getMultiItemCycleCountTask,
    getCycleCountOrMultiItemCycleCountTask,
    getManualConsolidationTask,
    getPurgeAndRecallTask,
    getCompartmentInfos,
    refreshIsCompleted,
    refreshCycleCountState,
    getQuantityFromTask,
    getBarcodesFromTask,
    getGtinsFromTask,
    getGtinsFromLoadCarrier,
    getVerifyBarcodeFromTask,
    getItemFromTask,
    getWorkStationProcess,
    isSourceToSourceCount,
    isFirstScanFinished,
    isCompartmentCounted,
    getAdditionalDataValue,
    isMultiItemCompartment,
    isMultiItem,
    hasSameItem,
    getStockFromCompartment,
    getStockCompartments,
    getItemCountWithQuantityLargerZero,
    getItemIdsFromStocks,
    isTaskSplitted,
    getQuantityFromStocks,
    getConfirmedItems,
    isZeroCrossingTask,
    createCompartmentKey,
    getCreateScanModelKey,
    addNewUnknownItemToSourceLoadCarrier,
    getItemByGtin,
    getBarcodeGroups,
    isUnknownItem,
    hasUnknownItem,
    hasUnknownItemUrl,
    hasNotScannedBarcodeBefore,
    shouldAddBarcode,
    getUnknownItem,
    getItemNumberDisplay,
  }
}
