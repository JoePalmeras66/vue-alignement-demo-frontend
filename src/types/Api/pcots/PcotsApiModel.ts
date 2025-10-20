import { z } from 'zod'
import {
  BarcodeTypeEnum,
  MessageTypeEnum,
  PcotsEventEnum,
  PcotsLocationEnum,
  ProblemCategoryEnum,
  ProblemSendToRejectOption,
  ProblemStrategyEnum,
  ProblemSubCategoryEnum,
  ProblemTypeEnum,
  RobotOrderStateEnum,
  ScanRuleEnum,
  TaskExecutionModeEnum,
  TaskTypeEnum,
  WorkStationDirectionEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { CycleCountState } from '@/types/CycleCountState'

export const AdditionalDataTypeValidator = z.object({
  additionalData: z.record(z.string(), z.any()).nullable().optional(),
})
export type AdditionalDataType = z.infer<typeof AdditionalDataTypeValidator>

export const SupportedVersionTypeValidator = z.object({
  version: z.string(),
  customVersion: z.string().optional(),
  adapterVersion: z.string().optional(),
  name: z.string().optional(),
})
export type SupportedVersionType = z.infer<typeof SupportedVersionTypeValidator>

export const SupportedVersionsTypeValidator = z.object({
  versions: z.array(SupportedVersionTypeValidator),
})
export type SupportedVersionsType = z.infer<
  typeof SupportedVersionsTypeValidator
>

export const MessageParamTypeValidator = z.object({
  value: z.string(),
  format: z.string().optional(),
  translate: z.boolean(),
})
export type MessageParamType = z.infer<typeof MessageParamTypeValidator>

export const MessageTypeValidator = z.object({
  messageTitle: z.string().optional(),
  messageText: z.string(),
  messageType: z.nativeEnum(MessageTypeEnum),
  parameters: z.array(MessageParamTypeValidator),
  additionalInfo: z.string().optional(),
  stackTrace: z.string().optional(),
})
export type MessageType = z.infer<typeof MessageTypeValidator>

export const WorkstationStateTypeValidator = z.object({
  robotSupport: z.boolean().optional(),
  workstationMode: z.nativeEnum(WorkStationModeEnum),
  requestedWorkstationMode: z.nativeEnum(WorkStationModeEnum).optional(),
  taskExecutionMode: z.nativeEnum(TaskExecutionModeEnum),
  requestedTaskExecutionMode: z.nativeEnum(TaskExecutionModeEnum).optional(),
  amountOrdersLeft: z.number().optional(),
  workstationDirection: z.nativeEnum(WorkStationDirectionEnum),
})
export type WorkstationStateType = z.infer<typeof WorkstationStateTypeValidator>

export const ProblemDefinitionTypeValidator = z.object({
  name: z.string().optional(),
  type: z.nativeEnum(ProblemTypeEnum),
  category: z.nativeEnum(ProblemCategoryEnum),
  subCategory: z.nativeEnum(ProblemSubCategoryEnum),
  strategy: z.nativeEnum(ProblemStrategyEnum),
  sendToReject: z.nativeEnum(ProblemSendToRejectOption).optional(),
})
export type ProblemDefinitionType = z.infer<
  typeof ProblemDefinitionTypeValidator
>

export const SupportedProblemsTypeValidator = z.object({
  problems: z.array(ProblemDefinitionTypeValidator),
})
export type SupportedProblemsType = z.infer<
  typeof SupportedProblemsTypeValidator
>

export const CompartmentDefinitionTypeValidator = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  length: z.number(),
  width: z.number(),
})
export type CompartmentDefinitionType = z.infer<
  typeof CompartmentDefinitionTypeValidator
>

export const ImageTypeValidator = z.object({
  url: z.string(),
})
export type ImageType = z.infer<typeof ImageTypeValidator>

export const ItemTypeValidator = AdditionalDataTypeValidator.extend({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  weight: z.number().optional(),
  images: z.array(ImageTypeValidator),
  gtins: z.array(z.string()),
  isUnknownItem: z.boolean().optional(),
})
export type ItemType = z.infer<typeof ItemTypeValidator>

export const StockTypeValidator = z.object({
  item: ItemTypeValidator,
  quantity: z.number(),
})
export type StockType = z.infer<typeof StockTypeValidator>

export const CompartmentTypeValidator = z.object({
  id: z.string(),
  items: z.array(StockTypeValidator),
  // Custom data
  cycleCountState: z.nativeEnum(CycleCountState).optional().nullable(),
  countedQuantity: z.number().optional().nullable(),
  isRecount: z.boolean().optional().nullable(),
  stockIndex: z.number().optional(),
})
export type CompartmentType = z.infer<typeof CompartmentTypeValidator>

export const LoadCarrierTypeTypeValidator = z.object({
  id: z.string(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  compartments: z.array(CompartmentDefinitionTypeValidator),
})
export type LoadCarrierTypeType = z.infer<typeof LoadCarrierTypeTypeValidator>

export const LoadCarrierTypeValidator = z
  .object({
    id: z.string(),
    loadCarrierType: LoadCarrierTypeTypeValidator,
    rotation: z.number().min(0).max(360),
    compartments: z.array(CompartmentTypeValidator),
  })
  .extend(AdditionalDataTypeValidator.shape)
export type LoadCarrierType = z.infer<typeof LoadCarrierTypeValidator>

export const QuantityTypeValidator = z.object({
  value: z.number(),
})
export type QuantityType = z.infer<typeof MinMaxQuantityTypeValidator>

export const MinMaxQuantityTypeValidator = QuantityTypeValidator.extend({
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
})
export type MinMaxQuantityType = z.infer<typeof MinMaxQuantityTypeValidator>

export const BarcodeBaseTypeValidator = z.object({
  barcodeType: z.nativeEnum(BarcodeTypeEnum),
})
export type BarcodeBaseType = z.infer<typeof BarcodeBaseTypeValidator>

export const BarcodeTypeValidator = BarcodeBaseTypeValidator.extend({
  scanRule: z.nativeEnum(ScanRuleEnum),
  format: z.string().optional(),
})
export type BarcodeType = z.infer<typeof BarcodeTypeValidator>

export const TaskTypeValidator = z.object({
  type: z.nativeEnum(TaskTypeEnum),
  id: z.string(),
  sourceLoadCarrierId: z.string().optional(),
  sourceCompartmentId: z.string().optional(),
  targetLoadCarrierId: z.string().optional(),
  targetCompartmentId: z.string().optional(),
  item: ItemTypeValidator.optional(),
  barcodes: z.array(BarcodeTypeValidator),
  verifyBarcode: z.boolean(),
  robotTask: z.boolean().optional(),

  // CustomData
  uuidString: z.string().optional(),
})
export type TaskType = z.infer<typeof TaskTypeValidator>

export const PickingTaskTypeValidator = TaskTypeValidator.extend({
  // Overwritten because it's required for booking
  item: ItemTypeValidator,
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string(),
  quantity: MinMaxQuantityTypeValidator,
  zeroCrossing: z.boolean(),
})
export type PickingTaskType = z.infer<typeof PickingTaskTypeValidator>

export const CycleCountTaskTypeValidator = TaskTypeValidator.extend({
  // Overwritten because it's required for booking
  item: ItemTypeValidator,
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  showQuantity: z.boolean(),
  recount: z.boolean(),
})
export type CycleCountTaskType = z.infer<typeof CycleCountTaskTypeValidator>

export const MultiItemCycleCountTaskValidator =
  CycleCountTaskTypeValidator.extend({
    item: ItemTypeValidator.optional(),
  })
export type MultiItemCycleCountTaskType = z.infer<
  typeof MultiItemCycleCountTaskValidator
>

export const ConsolidationTaskTypeValidator = TaskTypeValidator.extend({
  // Overwritten because it's required for booking
  item: ItemTypeValidator,
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string(),
  targetCompartmentId: z.string(),
  quantity: MinMaxQuantityTypeValidator,
  // Custom data for isScanningFinished
  sourceCompartment: CompartmentTypeValidator.nullable().optional(),
  zeroCrossing: z.boolean(),
})
export type ConsolidationTaskType = z.infer<
  typeof ConsolidationTaskTypeValidator
>

export const ManualConsolidationTaskTypeValidator = z
  .object({
    // Custom data
    isCompleted: z.boolean().optional().nullable(),
  })
  .extend(ConsolidationTaskTypeValidator.shape)
export type ManualConsolidationTaskType = z.infer<
  typeof ManualConsolidationTaskTypeValidator
>

export const PurgeAndRecallTaskTypeValidator = TaskTypeValidator.extend({
  // Overwritten because it's required for booking
  item: ItemTypeValidator,
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string(),
  quantity: MinMaxQuantityTypeValidator,
  zeroCrossing: z.boolean(),
})
export type PurgeAndRecallTaskType = z.infer<
  typeof PurgeAndRecallTaskTypeValidator
>

export const ProblemTypeValidator = z.object({
  problemType: z.nativeEnum(ProblemTypeEnum),
  problemCategory: z.nativeEnum(ProblemCategoryEnum),
})
export type ProblemType = z.infer<typeof ProblemTypeValidator>

export const LoadCarrierOccupancyTypeValidator = z.object({
  loadCarrier: LoadCarrierTypeValidator.optional(),
  pcotsLocation: z.nativeEnum(PcotsLocationEnum),
  problems: z.array(ProblemTypeValidator).optional(),
})
export type LoadCarrierOccupancyType = z.infer<
  typeof LoadCarrierOccupancyTypeValidator
>

export const WorkstationOccupancyTypeValidator = z.object({
  loadCarriers: z.array(LoadCarrierOccupancyTypeValidator),
})
export type WorkstationOccupancyType = z.infer<
  typeof WorkstationOccupancyTypeValidator
>

export const BarcodeDataTypeValidator = BarcodeBaseTypeValidator.extend({
  barcode: z.string(),
  barcodeType: z.nativeEnum(BarcodeTypeEnum),
})
export type BarcodeDataType = z.infer<typeof BarcodeDataTypeValidator>

export const ItemScannedTypeValidator = z.object({
  barcodes: z.array(BarcodeTypeValidator),
})
export type ItemScannedType = z.infer<typeof ItemScannedTypeValidator>

export const RobotOrderStatusTypeValidator = z.object({
  taskId: z.string(),
  orderState: z.nativeEnum(RobotOrderStateEnum).optional(),
  putQuantity: z.number().min(0).optional(),
  errors: z.array(z.string()),
})
export type RobotOrderStatusType = z.infer<typeof RobotOrderStatusTypeValidator>

export const EventMessageTypeValidator = z.object({
  eventType: z.nativeEnum(PcotsEventEnum),
  data: z.any(),
})
export type EventMessageType = z.infer<typeof EventMessageTypeValidator>

export const ConfirmedItemTypeValidator = z.object({
  quantity: z.number(),
  itemId: z.string().optional(),
  barcodes: z.array(BarcodeDataTypeValidator).optional(),
})
export type ConfirmedItemType = z.infer<typeof ConfirmedItemTypeValidator>
