export enum WorkStationModeEnum {
  None = 'None',
  Off = 'Off',
  Picking = 'Picking',
  Consolidation = 'Consolidation',
  CycleCount = 'CycleCount',
  PurgeAndRecall = 'PurgeAndRecall',
}

export enum TaskExecutionModeEnum {
  Init = 'Init',
  Human = 'Human',
  Robot = 'Robot',
}

export enum ProblemTypeEnum {
  DirtyLoadCarrier = 'DirtyLoadCarrier',
  DamagedLoadCarrier = 'DamagedLoadCarrier',
  DirtyItem = 'DirtyItem',
  DamagedItem = 'DamagedItem',
  WrongItem = 'WrongItem',
  MissingQuantity = 'MissingQuantity',
  ItemToLarge = 'ItemToLarge',
  WrongDimensionData = 'WrongDimensionData',
  ItemBarcodeNotReadable = 'ItemBarcodeNotReadable',
  OtherItemDamaged = 'OtherItemDamaged',
  SectionMismatch = 'SectionMismatch',
  TargetFull = 'TargetFull',
}

export enum ProblemCategoryEnum {
  Source = 'Source',
  Task = 'Task',
  Target = 'Target',
}

export enum ProblemSubCategoryEnum {
  LoadCarrier = 'LoadCarrier',
  Item = 'Item',
}

export enum ProblemStrategyEnum {
  Continue = 'Continue',
  Abort = 'Abort',
}

export enum ProblemSendToRejectOption {
  None = 'None',
  Source = 'Source',
  Target = 'Target',
  Both = 'Both',
}

export enum PcotsLocationEnum {
  PreSource = 'PreSource',
  Source = 'Source',
  PreTarget = 'PreTarget',
  Target = 'Target',
}

export enum MessageTypeEnum {
  Empty = 'Empty',
  Information = 'Information',
  Success = 'Success',
  Warning = 'Warning',
  Error = 'Error',
}

export enum BarcodeTypeEnum {
  Gtin = 'Gtin',
  Serial = 'Serial',
  Imei = 'Imei',
}

export enum ScanRuleEnum {
  ScanOnce = 'ScanOnce',
  ScanEach = 'ScanEach',
}

export enum ZeroCrossingResultEnum {
  NoZeroCrossing = 'NoZeroCrossing',
  Empty = 'Empty',
  NotEmpty = 'NotEmpty',
}

export enum WorkStationDirectionEnum {
  RightToLeft = 'RightToLeft',
  LeftToRight = 'LeftToRight',
}

export enum ExecutionModeEnum {
  Human = 'Human',
  Robot = 'Robot',
}

export enum RobotOperatingStateEnum {
  Off = 'Off',
  Auto = 'Auto',
  Manual = 'Manual',
  Error = 'Error',
}

export enum RobotOrderStateEnum {
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
}

export enum PcotsEventEnum {
  WorkstationChangedEvent = 'WorkstationChangedEvent',
  ConfirmButtonPressedEvent = 'ConfirmButtonPressedEvent',
  ItemScannedEvent = 'ItemScannedEvent',
  OccupancyChangedEvent = 'OccupancyChangedEvent',
  TaskExecutionStartedEvent = 'TaskExecutionStartedEvent',
  UserNotificationEvent = 'UserNotificationEvent',
  RobotStateChangedEvent = 'RobotStateChangedEvent',
}

export enum TaskTypeEnum {
  PickingTask = 'PickingTask',
  ConsolidationTask = 'ConsolidationTask',
  ManualConsolidationTask = 'ManualConsolidationTask',
  CycleCountTask = 'CycleCountTask',
  MultiItemCycleCountTask = 'MultiItemCycleCountTask',
  PurgeAndRecallTask = 'PurgeAndRecallTask',
}

export enum AdditionalDataKeyEnum {
  IsNoRead = 'IsNoRead',
  ForUnitTests = 'ForUnitTests',
}
