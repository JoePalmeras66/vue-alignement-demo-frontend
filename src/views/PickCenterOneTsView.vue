<script setup lang="ts">
import { Ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppContainer, useLogger } from '@tgw-components/core'
import { TgwMessageBox } from '@tgw-components/web'
import { MessageBoxOptionType } from '@tgw-components/web/dist/packages/core/src'
import type {
  CompartmentType,
  ConsolidationTaskType,
  CycleCountTaskType,
  EventMessageType,
  LoadCarrierOccupancyType,
  LoadCarrierType,
  LoadCarrierTypeType,
  ManualConsolidationTaskType,
  PickingTaskType,
  ProblemType,
  PurgeAndRecallTaskType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import {
  BarcodeDataType,
  MultiItemCycleCountTaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { ButtonAction } from '@/types/ButtonAction'
import MessageContainer from '@/components/MessageContainer/MessageContainer.vue'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  bookConsolidationTask as bookConsolidationTaskApi,
  bookCycleCountTask as bookCycleCountTaskApi,
  bookPickingTask as bookPickingTaskApi,
  bookPurgeAndRecallTask as bookPurgeAndRecallTaskApi,
  changeTaskExecutionMode,
  getLoadCarriers,
} from '@/composables/usePcotsApi'
import { DisabledButton } from '@/types/DisabledButton'
import { Position } from '@/types/Position'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { usePcotsWebsockets } from '@/composables/usePcotsWebsockets'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'
import { ConsolidationActionEnum } from '@/types/ConsolidationActionEnum'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { MessageBoxType } from '@/types/MessageBoxType'
import { LoadCarrierAction } from '@/types/LoadCarrierAction'
import { LoadCarrierEvent } from '@/types/LoadCarrierEvent'
import { WorkStationProcess } from '@/types/WorkStationProcess'
import { TriggerCompartmentAnimationData } from '@/types/TriggerCompartmentAnimationData'
import { CompartmentAnimationName } from '@/types/CompartmentAnimationName'
import CreateScanDialog from '@/components/CreateScanDialog/CreateScanDialog.vue'
import ScanHintDialog from '@/components/ScanHintDialog/ScanHintDialog.vue'
import { ScanModificationMode } from '@/types/ScanModificationMode'
import { useTranslations } from '@/composables/useTranslations'
import {
  BarcodeTypeEnum,
  ExecutionModeEnum,
  PcotsEventEnum,
  PcotsLocationEnum,
  WorkStationModeEnum,
  ZeroCrossingResultEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { OccupancyChangedEventType } from '@/types/Api/pcots/Events/OccupancyChanged/OccupancyChangedEventType'
import {
  bookCycleCountCompartment,
  getLoadCarrierHeading,
} from '@/composables/usePcotsExtApi'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'
import { TaskExecutionStartedEventType } from '@/types/Api/pcots/Events/TaskExecutionStarted/TaskExecutionStartedEventType'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { RovoflexState } from '@/types/RovoflexState'
import UndoSplitPickMessageBox from '@/components/UndoSplitPickMessageBox/UndoSplitPickMessageBox.vue'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'
import SwitchToRobotModeDialog from '@/components/SwitchToRobotModeDialog/SwitchToRobotModeDialog.vue'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import { RovoflexInstructionEnum } from '@/types/RovoflexInstructionEnum'
import { useRouteToInactiveView } from '@/composables/useRouteToInactiveView/useRouteToInactiveView'
import RovoflexProblemDialog from '@/components/RovoflexProblemDialog/RovoflexProblemDialog.vue'
import { useAppContainerConfigStore } from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import { CompartmentState } from '@/types/CompartmentState'
import { PcotsLocationType } from '@/types/PcotsLocationType'
import { useItemScanValidator } from '@/composables/useItemScanValidator/useItemScanValidator'
import UnknownItemMessageBox from '@/components/UnknownItemMessageBox/UnknownItemMessageBox.vue'
import ActionBar from '@/components/ActionBar/ActionBar.vue'
import ConsolidationActionBar from '@/components/ConsolidationActionBar/ConsolidationActionBar.vue'
import CycleCountActionBar from '@/components/CycleCountActionBar/CycleCountActionBar.vue'

useRouteToInactiveView()
const {
  willSourceBeEmptyAfterPick,
  getPickingTask,
  getConsolidationTask,
  getCycleCountTask,
  getCycleCountOrMultiItemCycleCountTask,
  getPurgeAndRecallTask,
  getCompartmentInfos,
  isMultiItemCycleCountTask,
  isManualConsolidationTask,
  getManualConsolidationTask,
  refreshIsCompleted,
  refreshCycleCountState,
  getCompartmentByTask,
  getWorkStationProcess,
  isFirstScanFinished,
  isScanEach,
  isSourceToSourceCount,
  hasSameItem,
  getStockFromCompartment,
  getQuantityFromTask,
  isMultiItemCompartment,
  isLoadCarrierFilled,
  isLoadCarrierEmpty,
  isTaskSplitted,
  getConfirmedItems,
  isZeroCrossingTask,
  getItemByGtin,
  addNewUnknownItemToSourceLoadCarrier,
  hasUnknownItem,
  isScanningRequired,
  isScanningFinished,
} = useApiDataHelper()
const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const { onHandlePcotsEvent } = usePcotsEventHandler()
const { onExecuteAction } = useAppContainer()

const router = useRouter()
const { getTranslation } = useTranslations('pick-center-one-ts-view')
const { resetAppIdle } = useAppIdle()

const hasConfirmedTask = ref<boolean>(false)
const activeSourceCompartment: Ref<CompartmentType | undefined> = ref<
  CompartmentType | undefined
>()

const activeTargetCompartment: Ref<CompartmentType | undefined> = ref<
  CompartmentType | undefined
>()
let zeroCrossingAnswer: ZeroCrossingResultEnum =
  ZeroCrossingResultEnum.NoZeroCrossing
const consolidationAction = ref<ConsolidationActionEnum>()
const consolidationMode: Ref<ConsolidationModeEnum> =
  ref<ConsolidationModeEnum>(ConsolidationModeEnum.AUTO)
const enteredQuantity = ref<number>()
const onActionButtonClickedExecuting = ref<boolean>(false)

const barcodeStore = useBarcodeStore()
const taskStore = useTaskStore()
const loadCarrierStore = useLoadCarrierStore()
const scanModificationStore = useScanModificationStore()
const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
const apiVersionStore = useApiVersionStore()
const rovoflexStore = useRovoflexStore()
const appContainerConfigStore = useAppContainerConfigStore()
const workspaceStore = useWorkspaceStore()
const { workstationMode, workstationDirection } = storeToRefs(workspaceStore)
const { pcotsLocation: loadCarrierDetailsLocation } = storeToRefs(
  loadCarrierDetailsStore
)
const logger = useLogger()
const { barcodes } = storeToRefs(barcodeStore)
const {
  sourceLoadCarrier,
  targetLoadCarrier,
  loadCarrierHeaderDataTarget,
  loadCarrierHeaderDataSource,
} = storeToRefs(loadCarrierStore)
const {
  task,
  originalQuantity,
  cycleCountCountedCompartments: countedCompartments,
  countedLoadCarrierId,
  cycleCountedQuantities,
}: {
  task: Ref<TaskType | undefined>
  originalQuantity: Ref<number | undefined>
  cycleCountCountedCompartments: Ref<CountedCompartmentsType>
  countedLoadCarrierId: Ref<string>
  cycleCountedQuantities: Ref<Record<string, number>>
} = storeToRefs(taskStore)
const troubleshootingStore = useTroubleshootingStore()
const { getOverallProblemCount, shouldSendToReject } =
  storeToRefs(troubleshootingStore)
const {
  isItemScanFailedDialogVisible,
  itemScanFailedBackendErrorMessageTranslated,
  isCreateScanDialogVisible,
  createScanModel,
} = storeToRefs(scanModificationStore)
const { rovoflexState, hasConfirmedError } = storeToRefs(rovoflexStore)
const actionBarRef = ref<InstanceType<typeof ActionBar>>()
const consolidationActionBarRef =
  ref<InstanceType<typeof ConsolidationActionBar>>()
const cycleCountActionBarRef = ref<InstanceType<typeof CycleCountActionBar>>()
const isQuantityInputVisible: Ref<boolean> = ref<boolean>(false)
const compartmentEmptyDialogRef = ref<InstanceType<
  typeof TgwMessageBox
> | null>(null)
const showCompartmentEmptyDialog: Ref<boolean> = ref<boolean>(false)
const loadCarrierLeftRef = ref()
const loadCarrierRightRef = ref()
const rovoflexProblemDialogRef = ref<InstanceType<
  typeof RovoflexProblemDialog
> | null>(null)
const showItemRecountRequiredDialog: Ref<boolean> = ref<boolean>(false)
const showItemRecountMismatchDialog: Ref<boolean> = ref<boolean>(false)
const isRecount = ref<boolean>(false)
const undoSplitPickMessageBoxRef = ref()
const showRovoflexErrorInfo = ref(false)
const switchToRobotModeMessageBoxRef = ref<InstanceType<
  typeof SwitchToRobotModeDialog
> | null>(null)
const unknownItemMessageBoxRef = ref()
const { showUnknownItemScanMessageBox } = useItemScanValidator()

const { width: loadCarrierWidth } = useElementSize(loadCarrierLeftRef)
const loadCarrierAspectRatioWidth = useCssVar(
  '--pcots-lc-aspect-ratio-width',
  loadCarrierLeftRef
)
const loadCarrierAspectRatioHeight = useCssVar(
  '--pcots-lc-aspect-ratio-height',
  loadCarrierLeftRef
)

const cycleCountQuantityComputed = computed({
  get() {
    const lastScannedItem = barcodeStore.getLastScannedItem(
      loadCarrierStore.sourceLoadCarrier
    )
    if (isMultiItemCycleCountTask(task.value) && lastScannedItem) {
      return taskStore.getCycleCountQuantity(lastScannedItem.id)
    }
    return taskStore.getCycleCountQuantity()
  },
  set(newValue: number) {
    const { isMultiItemCycleCountTask } = useApiDataHelper()
    const lastScannedItem = barcodeStore.getLastScannedItem(
      loadCarrierStore.sourceLoadCarrier
    )
    if (isMultiItemCycleCountTask(task.value) && lastScannedItem) {
      taskStore.setCycleCountQuantity(newValue, lastScannedItem.id)
    } else {
      taskStore.setCycleCountQuantity(newValue)
    }
  },
})

const disabledButtons = computed(() => {
  if (onActionButtonClickedExecuting.value) {
    return [DisabledButton.all]
  }
  return [DisabledButton.none]
})
const activeSourceStock = computed(() => {
  return getStockFromCompartment(activeSourceCompartment.value, task.value)
})
const activeTargetStock = computed(() => {
  return getStockFromCompartment(activeTargetCompartment.value, task.value)
})
const loadCarrierDataLeft = computed((): LoadCarrierType | undefined => {
  if (!workspaceStore.isRightToLeft()) {
    return sourceLoadCarrier.value as LoadCarrierType
  } else {
    return targetLoadCarrier.value as LoadCarrierType
  }
})
const loadCarrierDataRight = computed((): LoadCarrierType | undefined => {
  if (workspaceStore.isRightToLeft()) {
    return sourceLoadCarrier.value as LoadCarrierType
  } else {
    return targetLoadCarrier.value as LoadCarrierType
  }
})
const loadCarrierHeaderDataLeft = computed(() => {
  if (!workspaceStore.isRightToLeft()) {
    return loadCarrierHeaderDataSource.value
  } else {
    return loadCarrierHeaderDataTarget.value
  }
})
const loadCarrierHeaderDataRight = computed(() => {
  if (workspaceStore.isRightToLeft()) {
    return loadCarrierHeaderDataSource.value
  } else {
    return loadCarrierHeaderDataTarget.value
  }
})
const pcotsLocationLeft = computed((): PcotsLocationType => {
  return !workspaceStore.isRightToLeft()
    ? PcotsLocationEnum.Source
    : PcotsLocationEnum.Target
})
const pcotsLocationRight = computed((): PcotsLocationType => {
  return !workspaceStore.isRightToLeft()
    ? PcotsLocationEnum.Target
    : PcotsLocationEnum.Source
})
const consolidationTaskComputed = computed(
  (): ConsolidationTaskType | ManualConsolidationTaskType | undefined => {
    const consolidationTask = getConsolidationTask(task.value)
    const manualConsolidationTask = getManualConsolidationTask(task.value)
    if (consolidationTask) {
      return consolidationTask
    } else if (manualConsolidationTask) {
      return manualConsolidationTask
    }
    return undefined
  }
)

const imagesFromTask = computed(() => {
  const pickingTask = getPickingTask(task.value)
  const cycleCountTask = getCycleCountTask(task.value)
  const purgeAndRecallTask = getPurgeAndRecallTask(task.value)
  if (pickingTask?.item?.images) {
    return pickingTask.item.images
  } else if (consolidationTaskComputed.value?.item?.images) {
    return consolidationTaskComputed.value?.item.images
  } else if (cycleCountTask?.item?.images) {
    return cycleCountTask.item.images
  } else if (purgeAndRecallTask?.item?.images) {
    return purgeAndRecallTask?.item?.images
  }
  return undefined
})

const quantityFromTask = computed(() => {
  let quantity
  if (task.value) {
    quantity = getQuantityFromTask(task.value, barcodes.value)
  }
  return quantity ?? 0
})

const showRovoflexComponents = computed(() => {
  return (
    rovoflexState.value === RovoflexState.RovoflexPicking ||
    rovoflexState.value === RovoflexState.Error ||
    rovoflexState.value === RovoflexState.ManualPickingRequested
  )
})

const refreshSourceAndTargetCycleCountState = () => {
  refreshCycleCountState(
    sourceLoadCarrier.value,
    task.value,
    countedCompartments.value,
    cycleCountQuantityComputed.value,
    isRecount.value
  )
  refreshCycleCountState(
    targetLoadCarrier.value,
    task.value,
    countedCompartments.value,
    cycleCountQuantityComputed.value,
    isRecount.value
  )
}

const resetActiveCompartments = () => {
  activeTargetCompartment.value = undefined
  activeSourceCompartment.value = undefined
}

const loadLoadCarrierHeading = async (locations: PcotsLocationEnum[]) => {
  if (!workspaceStore.isExtendedApiSupported) {
    return
  }
  const response = await getLoadCarrierHeading({
    location: locations,
  })
  if (response?.headings?.length > 0) {
    for (const heading of response.headings) {
      if (heading.pcotsLocation === PcotsLocationEnum.Source) {
        loadCarrierHeaderDataSource.value = heading.text
      } else if (heading.pcotsLocation === PcotsLocationEnum.Target) {
        loadCarrierHeaderDataTarget.value = ''
      }
    }
  }
}

const loadTask = async (taskFromEvent: TaskType | undefined = undefined) => {
  let currentTask:
    | TaskType
    | PickingTaskType
    | ConsolidationTaskType
    | CycleCountTaskType
    | MultiItemCycleCountTaskType
    | ManualConsolidationTaskType
    | PurgeAndRecallTaskType
    | undefined = taskFromEvent

  if (!currentTask) {
    currentTask = await getTask()
  }

  const consolidationTask = getConsolidationTask(currentTask)
  const cycleCountingTask = getCycleCountOrMultiItemCycleCountTask(currentTask)
  logger.info('Loaded task:', currentTask)
  zeroCrossingAnswer = ZeroCrossingResultEnum.NoZeroCrossing
  hasConfirmedTask.value = false
  barcodeStore.clearBarcodes()
  taskStore.setTask(currentTask)
  // Reset hasConfirmed error because robot would be in paused state
  const rovoflexStore = useRovoflexStore()
  rovoflexStore.hasConfirmedError = false
  if ((currentTask as PickingTaskType)?.quantity) {
    originalQuantity.value = (currentTask as PickingTaskType).quantity.value
  } else if (consolidationTask && sourceLoadCarrier.value) {
    consolidationTask.sourceCompartment = getCompartmentByTask(
      PcotsLocationEnum.Source,
      sourceLoadCarrier.value,
      consolidationTask
    )
  } else if (cycleCountingTask) {
    if (cycleCountingTask.sourceLoadCarrierId !== countedLoadCarrierId.value) {
      countedLoadCarrierId.value = ''
      countedCompartments.value = {}
    }
  }

  refreshIsCompleted(
    task.value,
    sourceLoadCarrier.value,
    targetLoadCarrier.value
  )
  refreshSourceAndTargetCycleCountState()
}

const loadLoadCarriers = async (
  locations: PcotsLocationEnum[],
  loadCarrierOccupancies: LoadCarrierOccupancyType[] | undefined = undefined
) => {
  let occupancies: LoadCarrierOccupancyType[]
  if (
    loadCarrierOccupancies === undefined ||
    loadCarrierOccupancies.length === 0
  ) {
    const response = await getLoadCarriers({
      location: locations,
    })
    occupancies = response.loadCarriers
  } else {
    occupancies = loadCarrierOccupancies
  }
  for (const occupancy of occupancies) {
    logger.info(`Loaded ${occupancy.pcotsLocation}:`, occupancy.loadCarrier)
    loadCarrierStore.setLoadCarrier(
      occupancy.pcotsLocation as PcotsLocationType,
      occupancy.loadCarrier
    )

    troubleshootingStore.updateProblemsByOccupancy(occupancy)

    if (occupancy.pcotsLocation === PcotsLocationEnum.Source) {
      // Refresh is also needed when load carrier reload -> because additional data is stored on compartment
      refreshCycleCountState(
        sourceLoadCarrier.value,
        task.value,
        countedCompartments.value,
        cycleCountQuantityComputed.value,
        isRecount.value
      )
      // Reset counted compartments if no loadcarrier is present
      if (occupancy.loadCarrier === undefined) {
        taskStore.resetCycleCountedCompartments()
      }
    } else if (occupancy.pcotsLocation === PcotsLocationEnum.Target) {
      refreshCycleCountState(
        targetLoadCarrier.value,
        task.value,
        countedCompartments.value,
        cycleCountQuantityComputed.value,
        isRecount.value
      )
    }
  }
  await loadLoadCarrierHeading(locations)
}
const getCompartmentInfosByPosition = (position: Position) => {
  return getCompartmentInfos(
    position === Position.right
      ? loadCarrierDataRight.value
      : loadCarrierDataLeft.value,
    task.value,
    position === Position.right
      ? pcotsLocationRight.value
      : pcotsLocationLeft.value,
    activeSourceCompartment.value,
    activeTargetCompartment.value,
    consolidationAction.value,
    consolidationMode.value
  )
}
const getActiveCompartmentId = (
  location: PcotsLocationEnum.Source | PcotsLocationEnum.Target
): string | undefined => {
  if (location === PcotsLocationEnum.Source && activeSourceCompartment.value) {
    return activeSourceCompartment.value.id
  } else if (
    location === PcotsLocationEnum.Target &&
    activeTargetCompartment.value
  ) {
    return activeTargetCompartment.value.id
  } else {
    // We don't have an active compartment -> maybe a problem with abort is selected
    // So we need calc the active compartment first, because we need a compartment id for booking
    const position =
      pcotsLocationLeft.value === location ? Position.left : Position.right
    const compartmentInfosByPosition = getCompartmentInfosByPosition(position)
    return compartmentInfosByPosition.find(
      (compartmentInfo) => compartmentInfo.state === CompartmentState.active
    )?.id
  }
}

const bookPickingTask = async (pickingTask: PickingTaskType) => {
  // Book current picking task
  const sourceCompartmentId = getActiveCompartmentId(PcotsLocationEnum.Source)
  const targetCompartmentId = getActiveCompartmentId(PcotsLocationEnum.Target)

  if (sourceCompartmentId !== undefined && targetCompartmentId !== undefined) {
    let problems: ProblemType[] = []
    if (getOverallProblemCount.value > 0) {
      problems = troubleshootingStore.getAllProblems(
        sourceLoadCarrier.value?.id,
        targetLoadCarrier.value?.id
      )
    }

    await bookPickingTaskApi({
      taskId: pickingTask.id,
      sourceLoadCarrierId: pickingTask.sourceLoadCarrierId,
      sourceCompartmentId,
      targetLoadCarrierId: pickingTask.targetLoadCarrierId,
      targetCompartmentId,
      confirmedItems: getConfirmedItems(
        pickingTask.quantity.value,
        barcodes.value,
        pickingTask.item.id,
        troubleshootingStore.hasProblemWithAbort()
      ),
      zeroCrossingResult: zeroCrossingAnswer,
      problems,
    })
  } else {
    logger.error(
      'Booking not possible with sourceCompartmentId',
      sourceCompartmentId,
      'and targetCompartmentId',
      targetCompartmentId
    )
  }
}

const bookPurgeAndRecallTask = async (
  purgeAndRecallTask: PurgeAndRecallTaskType
) => {
  const sourceCompartmentId = getActiveCompartmentId(PcotsLocationEnum.Source)
  const targetCompartmentId = getActiveCompartmentId(PcotsLocationEnum.Target)

  if (sourceCompartmentId !== undefined && targetCompartmentId !== undefined) {
    let problems: ProblemType[] = []
    if (getOverallProblemCount.value > 0) {
      problems = troubleshootingStore.getAllProblems(
        sourceLoadCarrier.value?.id,
        targetLoadCarrier.value?.id
      )
    }

    await bookPurgeAndRecallTaskApi({
      taskId: purgeAndRecallTask.id,
      sourceLoadCarrierId: purgeAndRecallTask.sourceLoadCarrierId,
      sourceCompartmentId,
      targetLoadCarrierId: purgeAndRecallTask.targetLoadCarrierId,
      targetCompartmentId,
      confirmedItems: getConfirmedItems(
        purgeAndRecallTask.quantity.value,
        barcodes.value,
        purgeAndRecallTask.item.id,
        troubleshootingStore.hasProblemWithAbort()
      ),
      zeroCrossingResult: zeroCrossingAnswer,
      problems,
    })
  } else {
    logger.error(
      'Booking not possible with sourceCompartmentId',
      sourceCompartmentId,
      'and targetCompartmentId',
      targetCompartmentId
    )
  }
}

const sendLoadCarrierAway = async (
  loadCarrierLocation: PcotsLocationEnum,
  loadCarrierData: LoadCarrierType | undefined
) => {
  if (loadCarrierData) {
    try {
      await transportLoadCarrier({ loadCarrierId: loadCarrierData.id })
      if (loadCarrierLocation === PcotsLocationEnum.Source) {
        loadCarrierStore.resetSourceLoadCarrier()
      } else {
        loadCarrierStore.resetTargetLoadCarrier()
      }
    } catch (e) {
      logger.error(`Failed to send load carrier #${loadCarrierData.id} away.`)
    }
  }
}

const bookConsolidationTask = async (
  consolidationTask:
    | ConsolidationTaskType
    | ManualConsolidationTaskType
    | undefined
) => {
  if (consolidationTask) {
    const quantity = consolidationTask.quantity.value
    const problems: ProblemType[] = troubleshootingStore.getAllProblems(
      sourceLoadCarrier.value?.id,
      targetLoadCarrier.value?.id
    )
    if (getManualConsolidationTask(consolidationTask)?.isCompleted) {
      if (isLoadCarrierFilled(targetLoadCarrier.value!)) {
        await sendLoadCarrierAway(
          PcotsLocationEnum.Target,
          targetLoadCarrier.value
        )
      }
      if (isLoadCarrierEmpty(sourceLoadCarrier.value!)) {
        await sendLoadCarrierAway(
          PcotsLocationEnum.Source,
          sourceLoadCarrier.value
        )
      }
      refreshIsCompleted(
        task.value,
        sourceLoadCarrier.value,
        targetLoadCarrier.value
      )
    } else {
      await bookConsolidationTaskApi({
        taskId: consolidationTask.id,
        sourceLoadCarrierId: consolidationTask.sourceLoadCarrierId,
        sourceCompartmentId: consolidationTask.sourceCompartmentId,
        targetLoadCarrierId: consolidationTask.targetLoadCarrierId,
        targetCompartmentId: consolidationTask.targetCompartmentId,
        confirmedItems: getConfirmedItems(
          quantity ?? 0,
          quantity > 0 ? barcodes.value : [],
          consolidationTask.item.id,
          troubleshootingStore.hasProblemWithAbort()
        ),
        zeroCrossingResult: zeroCrossingAnswer,
        problems,
      })
    }
  }
}

const bookCycleCountTask = async (
  cycleCountTask: CycleCountTaskType | MultiItemCycleCountTaskType
) => {
  if (cycleCountQuantityComputed.value === undefined) {
    logger.warn(
      'Can not confirm cycle count task with cycleCountQuantity',
      cycleCountQuantityComputed.value
    )
    return
  }
  let problems: ProblemType[] = []
  if (getOverallProblemCount.value > 0) {
    problems = troubleshootingStore.getAllProblems(
      sourceLoadCarrier.value?.id,
      targetLoadCarrier.value?.id
    )
  }

  // store activeSourceStock because it gets changed directly after booking
  const sourceStockTemp = activeSourceStock.value

  try {
    await bookCycleCountTaskApi({
      taskId: cycleCountTask.id,
      sourceLoadCarrierId: cycleCountTask.sourceLoadCarrierId,
      sourceCompartmentId: cycleCountTask.sourceCompartmentId,
      targetLoadCarrierId:
        cycleCountTask.targetLoadCarrierId ??
        cycleCountTask.sourceLoadCarrierId,
      targetCompartmentId:
        cycleCountTask.targetCompartmentId ??
        cycleCountTask.sourceCompartmentId,
      confirmedItems: getConfirmedItems(
        cycleCountQuantityComputed.value,
        barcodes.value,
        cycleCountTask.item?.id,
        troubleshootingStore.hasProblemWithAbort(),
        cycleCountTask,
        sourceLoadCarrier.value
      ),
      problems,
    })

    taskStore.addCountedCycleCountCompartment(cycleCountTask, sourceStockTemp)
  } finally {
    taskStore.resetCycleCountQuantities()
  }
}

const bookTaskByType = async () => {
  const pickingTask = getPickingTask(task.value)
  const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task.value)
  const purgeAndRecallTask = getPurgeAndRecallTask(task.value)
  if (pickingTask) {
    await bookPickingTask(pickingTask)
  } else if (consolidationTaskComputed.value) {
    await bookConsolidationTask(consolidationTaskComputed.value)
  } else if (cycleCountTask) {
    await bookCycleCountTask(cycleCountTask)
  } else if (purgeAndRecallTask) {
    await bookPurgeAndRecallTask(purgeAndRecallTask)
  }
}

const bookTaskAndReset = async () => {
  if (task.value) {
    if (rovoflexState.value === RovoflexState.RovoflexPickingRequested) {
      // We need to confirm again when task was split and no abort problem is selected
      const needToConfirmAgain =
        isTaskSplitted(task.value) &&
        !troubleshootingStore.hasProblemWithAbort()

      if (!needToConfirmAgain) {
        if (rovoflexStore.getErrors.length > 0) {
          rovoflexStore.closeNotification()
          await router.push({
            name: 'robotInstruction',
            params: { instruction: RovoflexInstructionEnum.Continue },
          })
        } else {
          rovoflexStore.closeNotification()
          await router.push({
            name: 'robotInstruction',
            params: { instruction: RovoflexInstructionEnum.Switch },
          })
        }
      } else {
        logger.info('Need to confirm again for switching to rovoflex')
      }
    }
    const taskUuid = task.value?.uuidString
    try {
      await bookTaskByType()

      // Check if the task was changed in the meantime
      if (task.value?.uuidString === taskUuid) {
        taskStore.resetTask()
      }
    } catch (e) {
      logger.error('Error occurred while task was booked!', e)
      // reset data which belongs to the booking of the task
      resetActiveCompartments()
      barcodeStore.clearBarcodes()
      zeroCrossingAnswer = ZeroCrossingResultEnum.NoZeroCrossing
      await loadTask()
    }

    scanModificationStore.resetUnknownItemTypeCount()
    troubleshootingStore.clearProblems()
    await loadLoadCarriers([PcotsLocationEnum.Source, PcotsLocationEnum.Target])
  }
}

const showZeroCrossing = computed(() => {
  const zeroCrossingTask =
    getPickingTask(task.value) ??
    getConsolidationTask(task.value) ??
    getManualConsolidationTask(task.value) ??
    getPurgeAndRecallTask(task.value)
  if (zeroCrossingTask && sourceLoadCarrier.value) {
    if (
      zeroCrossingTask.zeroCrossing &&
      hasConfirmedTask.value &&
      willSourceBeEmptyAfterPick(sourceLoadCarrier.value, zeroCrossingTask)
    ) {
      return true
    }
  }
  return false
})

const activeCompartmentCount = computed(() => {
  let count = 0
  if (activeTargetCompartment.value) {
    count++
  }
  if (activeSourceCompartment.value) {
    count++
  }
  return count
})

const getPickingWorkingStep = (task: PickingTaskType) => {
  let workingStepKey = 'picking'

  if (showRovoflexComponents.value) {
    workingStepKey += '_rovoflex'
  } else {
    if (isScanningRequired(task) && !isScanningFinished(task, barcodes.value)) {
      workingStepKey += '_scan'
    }
  }

  return workingStepKey
}

const getCycleCountWorkingStep = (
  _: MultiItemCycleCountTaskType | CycleCountTaskType
) => {
  return isRecount.value ? 'cycle_count' : 'cycle_count_recount'
}

const getPurgeAndRecallWorkingStep = (_: PurgeAndRecallTaskType) => {
  return 'purge_and_recall'
}

const getConsolidationWorkingStep = (
  task: ConsolidationTaskType | ManualConsolidationTaskType
) => {
  let workingStepKey = 'consolidation'

  if (isScanningRequired(task) && !isScanningFinished(task, barcodes.value)) {
    workingStepKey += '_scan'
  } else {
    if (
      consolidationMode.value === ConsolidationModeEnum.MANUAL &&
      consolidationAction.value === undefined
    ) {
      workingStepKey += '_action'
    } else if (consolidationAction.value !== undefined) {
      if (
        (consolidationAction.value === ConsolidationActionEnum.move ||
          consolidationAction.value === ConsolidationActionEnum.swap) &&
        activeCompartmentCount.value &&
        activeCompartmentCount.value > 0
      ) {
        workingStepKey += `_${consolidationAction.value.toString()}_2`
      } else {
        workingStepKey += `_${consolidationAction.value.toString()}`
      }
    }
  }

  return workingStepKey
}

const headerClasses = computed(() => {
  let headerClasses = 'header'

  if (showZeroCrossing.value) {
    headerClasses += ' hide-text'
  }
  return headerClasses
})

const headerText = computed(() => {
  if (
    showRovoflexComponents.value &&
    workstationMode.value !== WorkStationModeEnum.None
  ) {
    return getTranslation(
      `robotic_${WorkStationModeEnum[workstationMode.value].toLowerCase()}`
    )
  }
  return getTranslation(
    WorkStationModeEnum[workstationMode.value].toLowerCase()
  )
})

const headerStep = computed(() => {
  let workingStepKey = ''

  if (!isQuantityInputVisible.value) {
    const pickingTask = getPickingTask(task.value)
    const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task.value)
    const purgeAndRecallTask = getPurgeAndRecallTask(task.value)
    const consolidationTask =
      getConsolidationTask(task.value) ?? getManualConsolidationTask(task.value)

    if (pickingTask) {
      workingStepKey = getPickingWorkingStep(pickingTask)
    } else if (cycleCountTask) {
      workingStepKey = getCycleCountWorkingStep(cycleCountTask)
    } else if (purgeAndRecallTask) {
      workingStepKey = getPurgeAndRecallWorkingStep(purgeAndRecallTask)
    } else if (consolidationTask) {
      workingStepKey = getConsolidationWorkingStep(consolidationTask)
    }
  }

  return workingStepKey ? getTranslation(`step_${workingStepKey}`) : ''
})

const hasUnknownItemAfterConfirmLeft = computed(() => {
  const isSourceToSource = isSourceToSourceCount(
    task.value as MultiItemCycleCountTaskType
  )
  return (
    isMultiItemCycleCountTask(task.value) &&
    hasUnknownItem(sourceLoadCarrier.value) &&
    (!workspaceStore.isRightToLeft() ? isSourceToSource : !isSourceToSource)
  )
})
const hasUnknownItemAfterConfirmRight = computed(() => {
  const isSourceToSource = isSourceToSourceCount(
    task.value as MultiItemCycleCountTaskType
  )
  return (
    isMultiItemCycleCountTask(task.value) &&
    hasUnknownItem(sourceLoadCarrier.value) &&
    (!workspaceStore.isRightToLeft() ? !isSourceToSource : isSourceToSource)
  )
})

const sendToRejectLeft = computed(() => {
  if (
    hasUnknownItemAfterConfirmLeft.value ||
    (workspaceStore.isRightToLeft() && hasUnknownItem(targetLoadCarrier.value))
  ) {
    return true
  } else if (troubleshootingStore.isTargetFullOnly()) {
    return false
  }

  return shouldSendToReject.value(pcotsLocationLeft.value)
})

const sendToRejectRight = computed(() => {
  if (
    hasUnknownItemAfterConfirmRight.value ||
    (!workspaceStore.isRightToLeft() && hasUnknownItem(targetLoadCarrier.value))
  ) {
    return true
  }
  if (troubleshootingStore.isTargetFullOnly()) {
    return false
  }

  return shouldSendToReject.value(pcotsLocationRight.value)
})
const compartmentInfosLeft = computed(() => {
  if (
    loadCarrierDataLeft.value &&
    task.value &&
    !troubleshootingStore.hasProblemWithAbort()
  ) {
    return getCompartmentInfosByPosition(Position.left)
  }
  return undefined
})
const compartmentInfosRight = computed(() => {
  if (
    loadCarrierDataRight.value &&
    task.value &&
    !troubleshootingStore.hasProblemWithAbort()
  ) {
    return getCompartmentInfosByPosition(Position.right)
  }
  return undefined
})

const showLoadCarrierModificationMenu = computed(() => {
  return (
    isManualConsolidationTask(task.value) &&
    workstationMode.value === WorkStationModeEnum.Consolidation &&
    workspaceStore.isExtendedApiSupported &&
    !showZeroCrossing.value
  )
})

const lastScannedItemImage = computed(() => {
  if (!isMultiItemCycleCountTask(task.value) || barcodes.value.length === 0) {
    return
  }
  return barcodeStore.getLastScannedItem(sourceLoadCarrier.value)?.images
})

const itemImages = computed((): string[] | undefined => {
  if (troubleshootingStore.hasProblemWithAbort()) {
    return undefined
  } else if (consolidationMode.value === ConsolidationModeEnum.MANUAL) {
    if (activeSourceStock.value) {
      return activeSourceStock.value?.item?.images?.map((images) => images.url)
    } else if (activeTargetStock.value) {
      return activeTargetStock.value?.item?.images?.map((images) => images.url)
    }
    return undefined
  } else if (imagesFromTask.value) {
    return imagesFromTask.value?.map((image) => image.url)
  } else if (
    isMultiItemCycleCountTask(task.value) &&
    lastScannedItemImage.value
  ) {
    return lastScannedItemImage.value?.map((images) => images.url)
  } else if (task.value) {
    return undefined
  }
  return undefined
})

const messageContainerAlignment = computed((): Position => {
  if (pcotsLocationRight.value === PcotsLocationEnum.Source) {
    return Position.left
  }
  return Position.right
})
const messageText = computed((): string | undefined => {
  if (showZeroCrossing.value) {
    return getTranslation('messages.zero_crossing')
  }

  return undefined
})
const showMidContainer = computed((): boolean => {
  return !(
    (messageContainerAlignment.value === Position.right ||
      messageContainerAlignment.value === Position.left) &&
    messageText.value
  )
})
const showRightContainer = computed((): boolean => {
  return !(
    messageContainerAlignment.value === Position.right && messageText.value
  )
})
const showLeftContainer = computed((): boolean => {
  return !(
    messageContainerAlignment.value === Position.left && messageText.value
  )
})

const showTask = computed(() => {
  return troubleshootingStore.hasProblemWithAbort() && !showZeroCrossing.value
    ? null
    : task.value
})

const handleConfirmButtonClick = async (buttonAction: ButtonAction) => {
  const zeroCrossingTask =
    getPickingTask(task.value) ??
    getConsolidationTask(task.value) ??
    getManualConsolidationTask(task.value) ??
    getPurgeAndRecallTask(task.value)
  if (buttonAction === ButtonAction.confirm) {
    if (
      sourceLoadCarrier.value &&
      isZeroCrossingTask(task.value) &&
      zeroCrossingTask &&
      willSourceBeEmptyAfterPick(sourceLoadCarrier.value, zeroCrossingTask) &&
      !troubleshootingStore.hasProblemWithAbort()
    ) {
      // Source will be empty so display empty message first
      hasConfirmedTask.value = true
    } else {
      await bookTaskAndReset()
    }
    return true
  }
  return false
}

const handleConsolidationActionButtonClicked = (buttonAction: ButtonAction) => {
  if (buttonAction === ButtonAction.inventory) {
    resetActiveCompartments()
    consolidationAction.value = ConsolidationActionEnum.inventory
    return true
  } else if (buttonAction === ButtonAction.move) {
    enteredQuantity.value = undefined
    resetActiveCompartments()
    consolidationAction.value = ConsolidationActionEnum.move
    return true
  } else if (buttonAction === ButtonAction.swap) {
    resetActiveCompartments()
    consolidationAction.value = ConsolidationActionEnum.swap
    return true
  } else if (buttonAction === ButtonAction.cancel) {
    consolidationAction.value = undefined
    enteredQuantity.value = undefined
    return true
  }
  return false
}

const handleZeroCrossingButtonClicked = async (buttonAction: ButtonAction) => {
  if (
    buttonAction === ButtonAction.zero_crossing_empty_no ||
    buttonAction === ButtonAction.zero_crossing_empty_yes
  ) {
    zeroCrossingAnswer =
      buttonAction === ButtonAction.zero_crossing_empty_no
        ? ZeroCrossingResultEnum.NotEmpty
        : ZeroCrossingResultEnum.Empty

    await bookTaskAndReset()
    return true
  }
  return false
}

const handleUndoLastScanButtonClicked = (buttonAction: ButtonAction) => {
  if (buttonAction === ButtonAction.undo_last_scan && task.value) {
    for (let i = 0; i < task.value.barcodes.length; i++) {
      barcodes.value.pop()
    }

    return true
  }
  return false
}
const handleSplitPickButtonClicked = async (buttonAction: ButtonAction) => {
  if (buttonAction === ButtonAction.split_pick) {
    const workingTask =
      getPickingTask(task.value) ??
      getConsolidationTask(task.value) ??
      getPurgeAndRecallTask(task.value)
    if (workingTask) {
      if (isTaskSplitted(task.value)) {
        const undoSplitPick =
          await undoSplitPickMessageBoxRef.value.showAndWait()
        if (undoSplitPick && originalQuantity.value !== undefined) {
          workingTask.quantity.value = originalQuantity.value
        }
      } else if (
        workingTask?.quantity.value ||
        workingTask?.quantity.value === 0
      ) {
        isQuantityInputVisible.value = true
      }
    }
    return true
  }
  return false
}

const handleAdvancedViewButtonClicked = async (buttonAction: ButtonAction) => {
  if (buttonAction === ButtonAction.advanced_view) {
    const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task.value)
    let pcotsLocation: PcotsLocationType
    if (
      loadCarrierDetailsLocation.value === PcotsLocationEnum.Source ||
      isSourceToSourceCount(cycleCountTask)
    ) {
      pcotsLocation = PcotsLocationEnum.Source
    } else {
      pcotsLocation = PcotsLocationEnum.Target
    }
    const loadCarrier = loadCarrierStore.getLoadCarrier(
      loadCarrierDetailsLocation.value
    )
    loadCarrierDetailsStore.setLoadCarrierDetails(loadCarrier, pcotsLocation)
    refreshSourceAndTargetCycleCountState()
    await router.push('advancedCycleCount')
    return true
  }
  return false
}

const onActionButtonClicked = async (buttonAction: ButtonAction) => {
  try {
    onActionButtonClickedExecuting.value = true
    if (buttonAction === ButtonAction.report_problem) {
      await router.push('troubleshooting')
    } else if (buttonAction === ButtonAction.edit_scans) {
      await router.push('editScans')
    } else if (buttonAction === ButtonAction.create_scan) {
      isCreateScanDialogVisible.value = true
    } else if (buttonAction === ButtonAction.error_info) {
      showRovoflexErrorInfo.value = true
    } else if (buttonAction === ButtonAction.show_details) {
      await router.push('loadCarrierDetails')
    } else if (await handleAdvancedViewButtonClicked(buttonAction)) {
      /* empty */
    } else if (handleUndoLastScanButtonClicked(buttonAction)) {
      /* empty */
    } else if (await handleSplitPickButtonClicked(buttonAction)) {
      /* empty */
    } else if (await handleConfirmButtonClick(buttonAction)) {
      /* empty */
    } else if (await handleZeroCrossingButtonClicked(buttonAction)) {
      /* empty */
    } else if (handleConsolidationActionButtonClicked(buttonAction)) {
      /* empty */
    }
  } finally {
    onActionButtonClickedExecuting.value = false
  }
}

const createdScanBarcodeData: Ref<BarcodeDataType[]> = ref<BarcodeDataType[]>(
  []
)
const createScan = () => {
  const scanModificationStore = useScanModificationStore()
  barcodeStore.addBarcodes(createdScanBarcodeData.value)
  if (isMultiItemCycleCountTask(task.value)) {
    const gtin = createdScanBarcodeData.value.find(
      (barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin
    )?.barcode
    let item = getItemByGtin(sourceLoadCarrier.value?.compartments, gtin)
    if (item === undefined) {
      item = addNewUnknownItemToSourceLoadCarrier(
        createdScanBarcodeData.value,
        scanModificationStore.unknownItemTypeCount
      )
    }
    scanModificationStore.increaseUnknownItemTypeCount()
    taskStore.increaseCycleCountQuantity(item.id)
  } else {
    taskStore.increaseCycleCountQuantity()
  }
}

const isScanHintDialogVisible: Ref<boolean> = ref<boolean>(false)
const onCreateScanContinueClicked = (barcodeData: BarcodeDataType[]) => {
  createdScanBarcodeData.value = barcodeData
  const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task.value)
  if (cycleCountTask && isSourceToSourceCount(cycleCountTask)) {
    createScan()
  } else {
    isScanHintDialogVisible.value = true
  }
}

const onScanHintConfirmClicked = () => {
  createScan()
  createdScanBarcodeData.value = []
}

const scanHintDialogCompartmentInfos = computed(() => {
  if (targetLoadCarrier.value) {
    return getCompartmentInfos(
      targetLoadCarrier.value,
      task.value,
      PcotsLocationEnum.Target,
      undefined,
      undefined,
      undefined,
      undefined
    )
  }
  return undefined
})

const triggerCompartmentAnimation = (
  loadCarrierId: string,
  compartmentId: string,
  transitionName: CompartmentAnimationName,
  transitionDelayMs = 0
) => {
  const data: TriggerCompartmentAnimationData = {
    compartmentId,
    transitionName,
    transitionDelayMs,
  }
  if (
    loadCarrierDataLeft.value &&
    loadCarrierDataLeft.value?.id === loadCarrierId
  ) {
    loadCarrierLeftRef.value.triggerAnimation(data)
  }
  if (
    loadCarrierDataRight.value &&
    loadCarrierDataRight.value?.id === loadCarrierId
  ) {
    loadCarrierRightRef.value.triggerAnimation(data)
  }
}

const doManualOperation = async (
  pcotsLocation: PcotsLocationEnum,
  compartment: CompartmentType,
  operation: ConsolidationActionEnum
) => {
  const sourceLoadCarrierId = activeSourceCompartment.value
    ? sourceLoadCarrier.value?.id
    : targetLoadCarrier.value?.id
  const targetLoadCarrierId =
    pcotsLocation === PcotsLocationEnum.Source
      ? sourceLoadCarrier.value?.id
      : targetLoadCarrier.value?.id
  const sourceCompartment = activeSourceCompartment.value
    ? activeSourceCompartment.value
    : activeTargetCompartment.value
  const targetCompartment = compartment
  let sourceTransitionName = CompartmentAnimationName.scale
  let targetTransitionName = CompartmentAnimationName.scale
  const targetTransitionDelay = 0

  if (
    sourceLoadCarrierId &&
    targetLoadCarrierId &&
    sourceCompartment &&
    targetCompartment
  ) {
    const sourceItemId: string | undefined = sourceCompartment.items[0]?.item.id
    const sourceCompartmentId = sourceCompartment.id

    const targetItemId: string | undefined = targetCompartment.items[0]?.item.id
    const targetCompartmentId = targetCompartment.id

    try {
      if (
        operation === ConsolidationActionEnum.move &&
        enteredQuantity.value &&
        sourceItemId
      ) {
        if (activeSourceStock.value?.quantity !== enteredQuantity.value) {
          // Subset will be moved -> quantity should jump
          sourceTransitionName = CompartmentAnimationName.jump
        }
        if (hasSameItem(sourceCompartment, targetCompartment)) {
          // Target has same item -> quantity should jump
          targetTransitionName = CompartmentAnimationName.jump
        }

        await moveCompartment({
          sourceLoadCarrierId,
          sourceCompartmentId,
          targetLoadCarrierId,
          targetCompartmentId,
          quantity: enteredQuantity.value,
          itemId: sourceItemId,
        })
      } else if (operation === ConsolidationActionEnum.swap) {
        await swapCompartment({
          sourceLoadCarrierId,
          sourceCompartmentId,
          targetLoadCarrierId,
          targetCompartmentId,
          sourceItemId,
          targetItemId,
        })
      }

      triggerCompartmentAnimation(
        sourceLoadCarrierId,
        sourceCompartment.id,
        sourceTransitionName
      )
      triggerCompartmentAnimation(
        targetLoadCarrierId,
        targetCompartment.id,
        targetTransitionName,
        targetTransitionDelay
      )
    } catch (e) {
      logger.error('Error occurred while booking manual operation!', e)
      enteredQuantity.value = undefined
    }
    resetActiveCompartments()
    // Reset consolidation action
    await consolidationActionBarRef.value!.buttonClicked(ButtonAction.cancel)
    await loadLoadCarriers([PcotsLocationEnum.Source, PcotsLocationEnum.Target])
    await loadTask()
  }
}

const onActiveCompartmentChanged = async (
  pcotsLocation: PcotsLocationEnum,
  compartment: CompartmentType | undefined
) => {
  logger.info(
    'Active',
    PcotsLocationEnum[pcotsLocation].toLowerCase(),
    'compartment changed to',
    compartment?.id
  )

  // Move operation because the destination compartment was selected
  if (
    compartment !== undefined &&
    (consolidationAction.value === ConsolidationActionEnum.move ||
      consolidationAction.value === ConsolidationActionEnum.swap) &&
    (activeSourceCompartment.value || activeTargetCompartment.value)
  ) {
    await doManualOperation(
      pcotsLocation,
      compartment,
      consolidationAction.value as ConsolidationActionEnum
    )
    return
  }

  if (pcotsLocation === PcotsLocationEnum.Source) {
    activeSourceCompartment.value = compartment
  } else if (pcotsLocation === PcotsLocationEnum.Target) {
    activeTargetCompartment.value = compartment
  }

  if (
    (activeTargetCompartment.value || activeSourceCompartment.value) &&
    (consolidationAction.value === ConsolidationActionEnum.inventory ||
      consolidationAction.value === ConsolidationActionEnum.move)
  ) {
    isQuantityInputVisible.value = true
  }
}

const onViewContentClicked = async (position: Position) => {
  let loadCarrier
  let pcotsLocation
  if (position === Position.left) {
    loadCarrier = loadCarrierDataLeft.value
    pcotsLocation = pcotsLocationLeft.value
  } else {
    loadCarrier = loadCarrierDataRight.value
    pcotsLocation = pcotsLocationRight.value
  }

  loadCarrierDetailsStore.setLoadCarrierDetails(loadCarrier, pcotsLocation)
  await router.push('loadCarrierDetails')
}

const onConsolidationModeChanged = (
  newConsolidationMode: ConsolidationModeEnum
) => {
  if (newConsolidationMode === ConsolidationModeEnum.AUTO) {
    // Reset consolidation action here
    consolidationAction.value = undefined

    // Maybe the manual consolidation task is already completed.
    refreshIsCompleted(
      task.value,
      sourceLoadCarrier.value,
      targetLoadCarrier.value
    )
  }

  consolidationMode.value = newConsolidationMode
  if (consolidationMode.value === ConsolidationModeEnum.MANUAL) {
    resetActiveCompartments()
  }
}

const handlePcotsDeviceButtonPressed = () => {
  if (actionBarRef.value) {
    actionBarRef.value.buttonClicked(ButtonAction.confirm)
  } else if (consolidationActionBarRef.value) {
    consolidationActionBarRef.value.buttonClicked(ButtonAction.confirm)
  } else if (cycleCountActionBarRef.value) {
    cycleCountActionBarRef.value.buttonClicked(ButtonAction.confirm)
  }
}

const handleOccupancyChanged = async (data: OccupancyChangedEventType) => {
  const locations = data.loadCarriers
    .filter(
      (occupancy) =>
        occupancy.pcotsLocation === PcotsLocationEnum.Source ||
        occupancy.pcotsLocation === PcotsLocationEnum.Target
    )
    .map((occupancy) => occupancy.pcotsLocation)

  if (locations.length > 0) {
    rovoflexStore.updateOrderState(undefined)
    resetActiveCompartments()
    taskStore.resetTask()
  }
  await loadLoadCarriers(locations, data.loadCarriers)
}

const handleTaskExecutionStarted = async (
  data: TaskExecutionStartedEventType
) => {
  rovoflexStore.updateOrderState(undefined)
  if (data) {
    await loadTask(data)
  }
}

const quantityInputConfig = computed(() => {
  if (consolidationAction.value) {
    const quantity = activeTargetCompartment.value
      ? activeTargetStock.value?.quantity
      : activeSourceStock.value?.quantity
    const title =
      consolidationAction.value === ConsolidationActionEnum.inventory
        ? getTranslation('inventory_title')
        : getTranslation('move_title')
    return {
      title,
      subtitle: '',
      min:
        consolidationAction.value === ConsolidationActionEnum.inventory
          ? undefined
          : 1,
      max:
        consolidationAction.value === ConsolidationActionEnum.inventory
          ? undefined
          : quantity,
      quantity,
    }
  } else {
    // Split pick
    const workingTask =
      getPickingTask(task.value) ??
      getConsolidationTask(task.value) ??
      getPurgeAndRecallTask(task.value)
    const title = getTranslation('split_pick_title')
    const subtitle = ''
    const min = workingTask?.quantity.minValue
    const max = workingTask?.quantity.maxValue
    const quantity = workingTask?.quantity?.value

    return { title, subtitle, min, max, quantity }
  }
})

const onCompartmentEmptyDialogClosed = () => {
  if (consolidationAction.value === ConsolidationActionEnum.inventory) {
    resetActiveCompartments()
    // Reset consolidation action
    consolidationActionBarRef.value!.buttonClicked(ButtonAction.cancel)
  }
}

const inventoryBooking = async (quantity: number) => {
  let loadCarrier
  let compartment: CompartmentType | undefined
  let pcotsLocation = PcotsLocationEnum.Target
  if (activeTargetCompartment.value) {
    loadCarrier = targetLoadCarrier.value
    compartment = activeTargetCompartment.value
    pcotsLocation = PcotsLocationEnum.Target
  } else if (activeSourceCompartment.value) {
    loadCarrier = sourceLoadCarrier.value
    compartment = activeSourceCompartment.value
    pcotsLocation = PcotsLocationEnum.Source
  }
  if (loadCarrier && compartment) {
    const compartmentId = compartment.id
    const itemId = compartment.items[0].item.id

    try {
      await bookCycleCountCompartment({
        sourceLoadCarrierId: loadCarrier.id,
        sourceCompartmentId: compartmentId,
        confirmedItems: [
          {
            quantity,
            barcodes: barcodes.value,
            itemId,
          },
        ],
      })

      triggerCompartmentAnimation(
        loadCarrier.id,
        compartment.id,
        quantity === 0
          ? CompartmentAnimationName.scale
          : CompartmentAnimationName.jump
      )

      // Reload data after booking
      await loadLoadCarriers([pcotsLocation])
    } catch (e) {
      logger.error('Error occurred while inventory was booked!', e)
      await loadLoadCarriers([
        PcotsLocationEnum.Source,
        PcotsLocationEnum.Target,
      ])
    }
  }
}

const onCompartmentEmptyDialogConfirmed = async () => {
  await inventoryBooking(0)
  isQuantityInputVisible.value = false
  onCompartmentEmptyDialogClosed()
}

const openComparmentEmptyDialog = async () => {
  showCompartmentEmptyDialog.value = true
  const confirmed = await compartmentEmptyDialogRef.value?.show()
  if (confirmed) {
    await onCompartmentEmptyDialogConfirmed()
  } else {
    onCompartmentEmptyDialogClosed()
  }
  showCompartmentEmptyDialog.value = false
}

const compartmentEmptyDialogConfig = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('compartment_empty'),
    description: getTranslation('compartment_empty_description'),
    dontShowAgain: true,
    okButton: {
      label: getTranslation('confirm'),
      type: 'primary',
    },
    cancelButton: {
      label: getTranslation('cancel'),
      type: 'default',
    },
    closeIcon: false,
  } as MessageBoxOptionType
})

const onQuantityChanged = async (quantity: number) => {
  if (consolidationAction.value === ConsolidationActionEnum.inventory) {
    if (
      quantity === 0 &&
      ((activeSourceCompartment.value &&
        !isMultiItemCompartment(activeSourceCompartment.value)) ||
        (activeTargetCompartment.value &&
          !isMultiItemCompartment(activeTargetCompartment.value)))
    ) {
      // Show sector empty dialog
      openComparmentEmptyDialog()
    } else {
      consolidationAction.value = undefined
      await inventoryBooking(quantity)
      await consolidationActionBarRef.value!.buttonClicked(ButtonAction.cancel)
    }
  } else if (consolidationAction.value === ConsolidationActionEnum.move) {
    enteredQuantity.value = quantity
  } else {
    // Split pick
    const workingTask =
      getPickingTask(task.value) ??
      getConsolidationTask(task.value) ??
      getPurgeAndRecallTask(task.value)
    if (workingTask) {
      workingTask.quantity.value = quantity
    }
  }
}

const currentWorkStationProcess = computed(() => {
  return getWorkStationProcess(task.value, workstationMode.value)
})

const onPcotsEventReceived = async (data: EventMessageType) => {
  await onHandlePcotsEvent(data)

  if (data.eventType === PcotsEventEnum.ConfirmButtonPressedEvent) {
    resetAppIdle()
    handlePcotsDeviceButtonPressed()
  } else if (data.eventType === PcotsEventEnum.OccupancyChangedEvent) {
    await handleOccupancyChanged(data.data as OccupancyChangedEventType)
  } else if (data.eventType === PcotsEventEnum.TaskExecutionStartedEvent) {
    await handleTaskExecutionStarted(data.data as TaskExecutionStartedEventType)
  }
}

const onPcotsEventsReconnected = async () => {
  logger.info('onPcotsEventsReconnected called')
  await loadLoadCarriers([PcotsLocationEnum.Source, PcotsLocationEnum.Target])
}

const identifyLoadCarrierWithPosition = async (
  loadCarrierId: string,
  loadCarrierLocation: PcotsLocationEnum
) => {
  try {
    await identifyLoadCarrier({ loadCarrierId, location: loadCarrierLocation })
    await loadLoadCarriers([loadCarrierLocation])
  } catch (e) {
    logger.error('IdentifyLoadCarrierWithPosition failed', e)
  }
}

const convertLoadCarrierType = async (
  loadCarrierId: string,
  loadCarrierTypeId: string
) => {
  try {
    await changeLoadCarrierType({ loadCarrierTypeId, loadCarrierId })
    if (loadCarrierId === sourceLoadCarrier.value?.id) {
      await loadLoadCarriers([PcotsLocationEnum.Source])
    } else {
      await loadLoadCarriers([PcotsLocationEnum.Target])
    }
    refreshIsCompleted(
      task.value,
      sourceLoadCarrier.value,
      targetLoadCarrier.value
    )
  } catch (e) {
    logger.error(
      `Failed to convert load carrier #${loadCarrierId} to type ${loadCarrierTypeId}.`
    )
  }
}

const onLoadCarrierAction = async (
  loadCarrierData: LoadCarrierType | undefined,
  location: PcotsLocationEnum,
  event: LoadCarrierEvent | undefined
) => {
  if (
    event &&
    event.loadCarrierAction === LoadCarrierAction.send_away &&
    loadCarrierData
  ) {
    await sendLoadCarrierAway(location, loadCarrierData)
  } else if (
    event &&
    event.loadCarrierAction === LoadCarrierAction.change_load_carrier_type &&
    loadCarrierData?.id &&
    event.loadCarrierType
  ) {
    await convertLoadCarrierType(
      loadCarrierData.id,
      event.loadCarrierType as string
    )
  }
}

const onRovoflexProblemDialogSubmitted = () => {
  showRovoflexErrorInfo.value = false
  rovoflexStore.submitError()
}
const onSwitchToRobotModeSubmitted = async () => {
  if (rovoflexState.value === RovoflexState.ManualPicking) {
    await changeTaskExecutionMode({ executionMode: ExecutionModeEnum.Robot })
  } else {
    logger.info(
      'Could not change task execution mode to Robot, because of rovoflex state',
      rovoflexState.value
    )
  }
}

watchEffect(async () => {
  if (
    (rovoflexState.value === RovoflexState.Error &&
      rovoflexStore.getErrors.length > 0) ||
    showRovoflexErrorInfo.value
  ) {
    const submitted = await rovoflexProblemDialogRef.value?.showAndWait()
    if (submitted) {
      onRovoflexProblemDialogSubmitted()
    }
  }
  if (rovoflexState.value) {
    appContainerConfigStore.updateRobotModeMenuItem()
  }
})

watch(
  () => isQuantityInputVisible.value,
  () => {
    if (!isQuantityInputVisible.value) {
      if (
        (consolidationAction.value === ConsolidationActionEnum.inventory &&
          !showCompartmentEmptyDialog.value) ||
        (consolidationAction.value === ConsolidationActionEnum.move &&
          !enteredQuantity.value)
      ) {
        // Only reset when quantity input was closed and no compartment empty message box will be displayed
        // Only reset when quantity input was closed and no quantity to move was entered
        resetActiveCompartments()
      }
    }
  }
)
const loadCarrierTypes: Ref<LoadCarrierTypeType[]> = ref<LoadCarrierTypeType[]>(
  []
)
const loadLoadCarrierTypes = async () => {
  if (workspaceStore.isExtendedApiSupported) {
    loadCarrierTypes.value = await getSupportedLoadCarrierTypes()
  } else {
    loadCarrierTypes.value = []
  }
}

const isCycleCountInputDisabled = computed(() => {
  const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task.value)
  if (cycleCountTask && !troubleshootingStore.hasProblemWithAbort()) {
    return (
      !isScanEach(cycleCountTask) &&
      !isFirstScanFinished(cycleCountTask, barcodes.value)
    )
  }
  return true
})

const workstationProcessClasses = computed(() => {
  if (currentWorkStationProcess.value === WorkStationProcess.CycleCounting) {
    return 'cycle-count'
  } else if (
    currentWorkStationProcess.value === WorkStationProcess.Consolidation
  ) {
    return 'consolidation'
  } else if (showRovoflexComponents.value) {
    return 'rovoflex'
  }
  return ''
})

const getCountedCompartments = (pcotsLocation: PcotsLocationEnum) => {
  if (pcotsLocation === PcotsLocationEnum.Source) {
    return countedCompartments.value
  }
  return {} as CountedCompartmentsType
}
const getShowDummyLoadCarrier = (pcotsLocation: PcotsLocationEnum) => {
  const cycleCountTask = getCycleCountOrMultiItemCycleCountTask(task.value)
  return !!(
    cycleCountTask &&
    pcotsLocation === PcotsLocationEnum.Target &&
    isSourceToSourceCount(cycleCountTask)
  )
}
const showViewContent = computed(() => {
  return (
    getWorkStationProcess(task.value, workstationMode.value) !==
    WorkStationProcess.CycleCounting
  )
})
const allowOpenImageGallery = computed(() => {
  return !(
    rovoflexState.value === RovoflexState.Error ||
    rovoflexState.value === RovoflexState.RovoflexPicking ||
    rovoflexState.value === RovoflexState.ManualPickingRequested
  )
})
watch(
  cycleCountedQuantities,
  () => {
    if (activeSourceCompartment.value) {
      activeSourceCompartment.value.countedQuantity =
        cycleCountQuantityComputed.value
    }
  },
  { deep: true }
)
watch(isRecount, () => {
  const advancedViewIndex = disabledButtons.value.indexOf(
    DisabledButton.advanced_view
  )
  if (isRecount.value) {
    if (advancedViewIndex < 0) {
      disabledButtons.value.push(DisabledButton.advanced_view)
    }
  } else {
    const indexToRemove = disabledButtons.value.indexOf(
      DisabledButton.advanced_view
    )
    if (advancedViewIndex > -1) {
      disabledButtons.value.splice(indexToRemove, 1)
    }
  }
})

const onHandleExecuteAppContainerAction = async (data: {
  data: {
    payload: { url: string; actionName: string }
  }
}) => {
  if (
    data.data.payload.actionName === AppContainerActionEnum.SwitchToRobotMode
  ) {
    const confirm = await switchToRobotModeMessageBoxRef.value?.showAndWait()
    if (confirm) {
      await onSwitchToRobotModeSubmitted()
    }
  } else if (
    data.data.payload.actionName === AppContainerActionEnum.ExitRobotMode
  ) {
    if (rovoflexState.value === RovoflexState.RovoflexPicking) {
      await changeTaskExecutionMode({ executionMode: ExecutionModeEnum.Human })
    } else {
      logger.info(
        'Could not change task execution mode to Human, because of rovoflex state',
        rovoflexState.value
      )
    }
  }
}

const loadCarrierHeight = computed(() => {
  const aspectRatioWidth = Number.parseInt(loadCarrierAspectRatioWidth.value)
  const aspectRatioHeight = Number.parseInt(loadCarrierAspectRatioHeight.value)
  // 48 is for the padding which gets subtracted at first and then added again at the end
  const lcHeight =
    ((loadCarrierWidth.value - 48) / aspectRatioWidth) * aspectRatioHeight + 48
  return `${lcHeight}px`
})

watch(showUnknownItemScanMessageBox, async () => {
  if (showUnknownItemScanMessageBox.value) {
    await unknownItemMessageBoxRef.value.showAndWait()
    showUnknownItemScanMessageBox.value = false
  }
})

const loadLoadCarriersWhenNeeded = async (): Promise<void> => {
  const locationsToLoad: PcotsLocationEnum[] = []
  if (sourceLoadCarrier.value === undefined) {
    locationsToLoad.push(PcotsLocationEnum.Source)
  }
  if (targetLoadCarrier.value === undefined) {
    locationsToLoad.push(PcotsLocationEnum.Target)
  }
  if (locationsToLoad.length > 0) {
    await loadLoadCarriers(locationsToLoad)
  }
}

watch(colorMode, () => {
  loadCarrierStore.updateUnknownItemsUrls()
})

const isLoading = ref(true)
onMounted(async () => {
  try {
    await apiVersionStore.loadVersions()
    connectPcotsEvents(onPcotsEventReceived, onPcotsEventsReconnected)
    await loadLoadCarriersWhenNeeded()
    // Load task here when workstation mode(CycleCount) is set to late
    if (!taskStore.hasTask) {
      await loadTask()
    }
    await loadLoadCarrierTypes()
    await rovoflexStore.loadStates()
    onExecuteAction<typeof onHandleExecuteAppContainerAction>(
      onHandleExecuteAppContainerAction
    )
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  disconnectPcotsEvents()
})
</script>

<template>
  <Transition name="fade" mode="out-in" appear>
    <template v-if="isLoading">
      <LoadingComponent />
    </template>

    <template v-else>
      <div class="pcots-view">
        <SwitchToRobotModeDialog ref="switchToRobotModeMessageBoxRef" />
        <UndoSplitPickMessageBox ref="undoSplitPickMessageBoxRef" />
        <UnknownItemMessageBox ref="unknownItemMessageBoxRef" />
        <RovoflexProblemDialog
          ref="rovoflexProblemDialogRef"
          :errors="rovoflexStore.getErrors"
          @on-submit="onRovoflexProblemDialogSubmitted"
        />
        <ItemRecountRequiredDialog
          v-model:is-visible="showItemRecountRequiredDialog"
        />
        <ItemRecountMismatchDialog
          v-model:is-visible="showItemRecountMismatchDialog"
        />
        <TgwMessageBox
          ref="compartmentEmptyDialogRef"
          :options="compartmentEmptyDialogConfig"
          :is-touch="true"
          :close-on-click-modal="false"
        />
        <ItemScanFailedDialog
          v-model:is-visible="isItemScanFailedDialogVisible"
          :error-message="itemScanFailedBackendErrorMessageTranslated"
        />
        <CreateScanDialog
          v-model:is-visible="isCreateScanDialogVisible"
          :task="task"
          :create-scan-model="createScanModel"
          @continue="onCreateScanContinueClicked"
        />
        <ScanHintDialog
          v-model:is-visible="isScanHintDialogVisible"
          :mode="ScanModificationMode.create"
          :task="task"
          :load-carrier="targetLoadCarrier"
          :barcodes="createdScanBarcodeData"
          :workstation-direction="workstationDirection"
          :compartment-infos="scanHintDialogCompartmentInfos"
          @confirm="onScanHintConfirmClicked"
        />
        <QuantityInput
          v-if="isQuantityInputVisible"
          v-model:is-visible="isQuantityInputVisible"
          :title="quantityInputConfig.title"
          :subtitle="quantityInputConfig.subtitle"
          :quantity="quantityInputConfig.quantity"
          :min="quantityInputConfig.min"
          :max="quantityInputConfig.max"
          @quantity-changed="onQuantityChanged"
        />
        <div class="pick-center-one-ts">
          <div class="content">
            <MessageContainer
              v-if="messageText"
              :message-text="messageText"
              class="message-container"
              :class="messageContainerAlignment"
            />
            <div v-if="showLeftContainer" class="content-left">
              <LivePickLoadCarrier
                ref="loadCarrierLeftRef"
                :pcots-location="pcotsLocationLeft"
                :load-carrier="loadCarrierDataLeft"
                :header-data="loadCarrierHeaderDataLeft"
                :position="Position.left"
                :task="showTask"
                :scanned-barcodes="barcodes"
                :show-zero-crossing="showZeroCrossing"
                :send-to-reject="sendToRejectLeft"
                :show-modification-menu="showLoadCarrierModificationMenu"
                :compartment-infos="compartmentInfosLeft"
                :consolidation-mode="consolidationMode"
                :load-carrier-types="loadCarrierTypes"
                :workstation-mode="workstationMode"
                :counted-compartments="
                  getCountedCompartments(pcotsLocationLeft)
                "
                :show-view-content="false"
                :show-dummy-load-carrier="
                  getShowDummyLoadCarrier(pcotsLocationLeft)
                "
                :is-rovoflex-picking="showRovoflexComponents"
                :show-load-carrier-header="false"
                :show-load-carrier-number="false"
                :show-load-carrier-header-items="false"
                :class="workstationProcessClasses"
                @active-compartment-changed="
                  onActiveCompartmentChanged(pcotsLocationLeft, $event)
                "
                @view-content-clicked="onViewContentClicked(Position.left)"
                @identify-load-carrier="
                  identifyLoadCarrierWithPosition($event, pcotsLocationLeft)
                "
                @load-carrier-action="
                  onLoadCarrierAction(
                    loadCarrierDataLeft,
                    pcotsLocationLeft,
                    $event
                  )
                "
              />
            </div>
            <div v-if="showMidContainer" class="content-mid">
              <div :class="headerClasses">
                <h2 class="header-text">{{ headerText }}</h2>
                <h1 class="header-step">{{ headerStep }}</h1>
              </div>
              <LivePickLoadCarrier
                ref="loadCarrierRightRef"
                :pcots-location="pcotsLocationRight"
                :load-carrier="loadCarrierDataRight"
                :header-data="loadCarrierHeaderDataRight"
                :position="Position.right"
                :task="showTask"
                :scanned-barcodes="barcodes"
                :show-zero-crossing="showZeroCrossing"
                :send-to-reject="sendToRejectRight"
                :show-modification-menu="showLoadCarrierModificationMenu"
                :compartment-infos="compartmentInfosRight"
                :consolidation-mode="consolidationMode"
                :load-carrier-types="loadCarrierTypes"
                :workstation-mode="workstationMode"
                :counted-compartments="
                  getCountedCompartments(pcotsLocationRight)
                "
                :show-view-content="false"
                :show-dummy-load-carrier="
                  getShowDummyLoadCarrier(pcotsLocationRight)
                "
                :is-rovoflex-picking="showRovoflexComponents"
                :show-load-carrier-header="true"
                :show-load-carrier-number="false"
                :show-load-carrier-header-items="false"
                :class="workstationProcessClasses"
                @active-compartment-changed="
                  onActiveCompartmentChanged(pcotsLocationRight, $event)
                "
                @view-content-clicked="onViewContentClicked(Position.right)"
                @identify-load-carrier="
                  identifyLoadCarrierWithPosition($event, pcotsLocationRight)
                "
                @load-carrier-action="
                  onLoadCarrierAction(
                    loadCarrierDataRight,
                    pcotsLocationRight,
                    $event
                  )
                "
              />
            </div>
            <div v-if="showRightContainer" class="content-right">
              <LivePickLoadCarrier
                ref="loadCarrierLeftRef"
                :pcots-location="pcotsLocationLeft"
                :load-carrier="loadCarrierDataLeft"
                :header-data="loadCarrierHeaderDataLeft"
                :position="Position.left"
                :task="showTask"
                :scanned-barcodes="barcodes"
                :show-zero-crossing="showZeroCrossing"
                :send-to-reject="sendToRejectLeft"
                :show-modification-menu="showLoadCarrierModificationMenu"
                :compartment-infos="compartmentInfosLeft"
                :consolidation-mode="consolidationMode"
                :load-carrier-types="loadCarrierTypes"
                :workstation-mode="workstationMode"
                :counted-compartments="
                  getCountedCompartments(pcotsLocationLeft)
                "
                :show-view-content="false"
                :show-dummy-load-carrier="
                  getShowDummyLoadCarrier(pcotsLocationLeft)
                "
                :is-rovoflex-picking="showRovoflexComponents"
                :show-load-carrier-header="false"
                :show-load-carrier-number="false"
                :show-load-carrier-header-items="false"
                :class="workstationProcessClasses"
                @active-compartment-changed="
                  onActiveCompartmentChanged(pcotsLocationLeft, $event)
                "
                @view-content-clicked="onViewContentClicked(Position.left)"
                @identify-load-carrier="
                  identifyLoadCarrierWithPosition($event, pcotsLocationLeft)
                "
                @load-carrier-action="
                  onLoadCarrierAction(
                    loadCarrierDataLeft,
                    pcotsLocationLeft,
                    $event
                  )
                "
              />
            </div>
            <div
              v-if="
                currentWorkStationProcess ===
                  WorkStationProcess.CycleCounting ||
                (showRovoflexComponents && quantityFromTask > 0)
              "
              class="content-bottom"
            >
              <CycleCountInput
                v-if="
                  currentWorkStationProcess === WorkStationProcess.CycleCounting
                "
                v-model="cycleCountQuantityComputed"
                :disabled="isCycleCountInputDisabled"
                :quantity-color="
                  isRecount ? 'var(--tgw-status-warning-darken)' : ''
                "
                :modifiable="task && !isScanEach(task)"
              />
              <RovoflexPickCounter
                v-else
                :current-count="rovoflexStore.getPutQuantity"
                :target-count="quantityFromTask"
              />
            </div>
          </div>
          <div class="footer">
            <RovoflexFooter
              v-if="showRovoflexComponents"
              :state="rovoflexState as RovoflexState"
            />
            <ConsolidationActionBar
              v-else-if="
                currentWorkStationProcess === WorkStationProcess.Consolidation
              "
              ref="consolidationActionBarRef"
              :show-zero-crossing="showZeroCrossing"
              :disabled-buttons="disabledButtons"
              :scanned-barcodes="barcodes"
              :task="consolidationTaskComputed"
              :active-compartment-count="activeCompartmentCount"
              @action-button-clicked="onActionButtonClicked"
              @consolidation-mode-changed="onConsolidationModeChanged"
            />
            <CycleCountActionBar
              v-else-if="
                currentWorkStationProcess === WorkStationProcess.CycleCounting
              "
              ref="cycleCountActionBarRef"
              :task="getCycleCountOrMultiItemCycleCountTask(task)"
              :scanned-barcodes="barcodes"
              :disabled-buttons="disabledButtons"
              :show-scan-error="isItemScanFailedDialogVisible"
              @action-button-clicked="onActionButtonClicked"
            />
            <LivePickActionBar
              v-else
              ref="actionBarRef"
              :show-zero-crossing="showZeroCrossing"
              :disabled-buttons="disabledButtons"
              :scanned-barcodes="barcodes"
              :task="task"
              :robot-paused="hasConfirmedError"
              @action-button-clicked="onActionButtonClicked"
            />
          </div>
        </div>
      </div>
    </template>
  </Transition>
</template>

<style scoped lang="scss">
.loading-component {
  height: 100vh;
}

/*fade*/
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.pick-center-one-ts {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  height: 100%;
  background-color: var(--tgw-bg-10);

  .content {
    display: grid;
    // example: (100% - (100% * 0.325)) / 2
    grid-template-columns:
      calc((100% - (100% * var(--pcots-content-mid-ratio))) / 2)
      calc(100% * var(--pcots-content-mid-ratio))
      calc((100% - (100% * var(--pcots-content-mid-ratio))) / 2);
    grid-auto-rows: 1fr auto;
    width: 100%;
    flex: 1;
    padding: 0 var(--pcots-outer-lc-padding);
    box-sizing: border-box;

    .message-container {
      text-align: center;
      justify-self: center;
      aspect-ratio: var(--pcots-lc-aspect-ratio);
      width: 70%;
      max-width: 70vh;
      // calculate width of one load carrier
      // (100vw - 2 * outside padding) * (percentage of load carrier grid width / 100)
      --pcots-lc-width: calc(
        (100vw - 2 * var(--pcots-outer-lc-padding)) *
          (var(--pcots-lc-width-percentage) / 100)
      );
      // calculate height of one load carrier using the width and the aspect ratio
      // (load carrier width * aspect ratio height) / aspect ratio width
      height: calc(
        (var(--pcots-lc-width) * var(--pcots-lc-aspect-ratio-height)) /
          var(--pcots-lc-aspect-ratio-width)
      );
      margin-top: var(--pcots-load-carrier-headline-height);

      &.right {
        grid-column-start: 2;
        grid-column-end: 4;
      }
      &.left {
        grid-column-start: 1;
        grid-column-end: 3;
      }
    }

    .content-left,
    .content-right {
      grid-row: 1;
      display: flex;
      width: 100%;

      :deep(.load-carrier) {
        &.cycle-count {
          //65vh - cycle-count-input height
          max-width: calc(65vh - 120px);
        }
        &.rovoflex {
          //65vh - rovoflex-counter height
          max-width: calc(65vh - 108px);
        }
        &.consolidation {
          //65vh - view-content-button height
          max-width: calc(65vh - 91px);
        }
      }
    }

    .content-left {
      grid-column: 1;
      justify-content: left;
    }
    .content-right {
      grid-column: 3;
      justify-content: right;
    }
    .content-mid {
      grid-column: 2;
      justify-content: center;
      margin: var(--pcots-load-carrier-headline-height) 30px 0;
      display: flex;
      flex-direction: column;

      .header {
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 100%;
        height: var(--pcots-header-height);
        row-gap: 4px;
        margin-bottom: 18px;

        &.hide-text {
          visibility: hidden;
        }

        .header-text {
          font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
          font-weight: 700;
          font-style: normal;
          font-size: 20px;
          line-height: normal;
          letter-spacing: 1px;
          text-align: center;
          text-transform: uppercase;
          color: var(--tgw-text-sub);
          margin: 32px 0 0;
          user-select: none;
        }

        .header-step {
          color: var(--tgw-primary);
          text-align: center;
          font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin: 0;
        }
      }

      .item-image-wrapper {
        height: v-bind(loadCarrierHeight);
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        //&.consolidation {
        //  width: 50%;
        //}

        :deep(.item-image) {
          max-width: 12vw;

          .item-image-container {
            max-height: v-bind(loadCarrierHeight);
          }
        }
      }
    }

    .content-bottom {
      grid-row: 2 / 3;
      grid-column: 1 / 4;
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 32px 0;

      .rovoflex-pick-counter {
        position: absolute;
        bottom: calc(var(--pcots-footer-bottom-height) + 48px);
      }
    }
  }

  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: auto;
  }
}

@media only screen and (max-height: 1000px) {
  .content-mid {
    .header {
      --pcots-header-height: 64px;
    }
  }
}

@media only screen and (max-height: 900px) {
  .content-mid {
    .header {
      --pcots-header-height: 56px;

      .header-text {
        margin: 20px 0 0;
      }
    }
  }
}

@media screen and (max-width: 1920px) {
  .pick-center-one-ts {
    .content {
      padding: 0 64px;
    }
    .content-mid {
      padding: 36px 0;
      gap: 128px;
    }
  }
}
</style>
