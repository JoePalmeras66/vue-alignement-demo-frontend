import { AxiosResponse } from 'axios'
import { useApi } from '@/api/composables/useApi'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  ConsolidationTaskType,
  ConsolidationTaskTypeValidator,
  CycleCountTaskType,
  CycleCountTaskTypeValidator,
  ManualConsolidationTaskType,
  ManualConsolidationTaskTypeValidator,
  MessageTypeValidator,
  MultiItemCycleCountTaskType,
  MultiItemCycleCountTaskValidator,
  PickingTaskType,
  PickingTaskTypeValidator,
  ProblemDefinitionType,
  PurgeAndRecallTaskType,
  PurgeAndRecallTaskTypeValidator,
  SupportedVersionType,
  TaskType,
  WorkstationStateType,
} from '@/types/Api/pcots/PcotsApiModel'
import {
  bookConsolidationTaskApi,
  bookCycleCountTaskApi,
  bookPickingTaskApi,
  bookPurgeAndRecallTaskApi,
  changeTaskExecutionModeApi,
  getCurrentTaskApi,
  getLoadCarriersApi,
  getRobotStateApi,
  getSupportedProblemsApi,
  getSupportedVersionsApi,
  getWorkstationStateApi,
  verifyBarcodeApi,
} from '@/api/pcotsApi'
import {
  GetSupportedVersionsResponseType,
  GetSupportedVersionsResponseTypeValidator,
} from '@/types/Api/pcots/Get/SupportedVersions/GetSupportedVersionsResponseType'
import {
  getMessageKeyError,
  getMessageKeyPermission,
  handleRequestError,
  validateResponse,
} from '@/helpers/apiHelpers'
import {
  GetSupportedProblemsResponseType,
  GetSupportedProblemsResponseTypeValidator,
} from '@/types/Api/pcots/Get/SupportedProblems/GetSupportedProblemsResponseType'
import {
  GetWorkstationStateResponseType,
  GetWorkstationStateResponseTypeValidator,
} from '@/types/Api/pcots/Get/WorkstationState/GetWorkstationStateResponseType'
import {
  GetLoadCarriersResponseType,
  GetLoadCarriersResponseTypeValidator,
} from '@/types/Api/pcots/Get/LoadCarriers/GetLoadCarriersResponseType'
import { GetLoadCarriersRequestType } from '@/types/Api/pcots/Get/LoadCarriers/GetLoadCarriersRequestType'
import {
  GetCurrentTaskResponseType,
  GetCurrentTaskResponseTypeValidator,
} from '@/types/Api/pcots/Get/CurrentTask/GetCurrentTaskResponseType'
import {
  GetRobotStateResponseType,
  GetRobotStateResponseTypeValidator,
} from '@/types/Api/pcots/Get/RobotState/GetRobotStateResponseType'
import {
  ChangeTaskExecutionModeResponseType,
  ChangeTaskExecutionModeResponseTypeValidator,
} from '@/types/Api/pcots/Post/ChangeTaskExecutionMode/ChangeTaskExecutionModeResponseType'
import { ChangeTaskExecutionModeRequestType } from '@/types/Api/pcots/Post/ChangeTaskExecutionMode/ChangeTaskExecutionModeRequestType'
import {
  BookPickingTaskResponseType,
  BookPickingTaskResponseTypeValidator,
} from '@/types/Api/pcots/Post/BookPickingTask/BookPickingTaskResponseType'
import { BookPickingTaskRequestType } from '@/types/Api/pcots/Post/BookPickingTask/BookPickingTaskRequestType'
import {
  BookConsolidationTaskResponseType,
  BookConsolidationTaskResponseTypeValidator,
} from '@/types/Api/pcots/Post/BookConsolidationTask/BookConsolidationTaskResponseType'
import { BookConsolidationTaskRequestType } from '@/types/Api/pcots/Post/BookConsolidationTask/BookConsolidationTaskRequestType'
import {
  BookCycleCountTaskResponseType,
  BookCycleCountTaskResponseTypeValidator,
} from '@/types/Api/pcots/Post/BookCycleCountTask/BookCycleCountTaskResponseType'
import { BookCycleCountTaskRequestType } from '@/types/Api/pcots/Post/BookCycleCountTask/BookCycleCountTaskRequestType'
import { VerifyBarcodeRequestType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeRequestType'
import {
  VerifyBarcodeResponseType,
  VerifyBarcodeResponseTypeValidator,
} from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeResponseType'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import { BookPurgeAndRecallTaskRequestType } from '@/types/Api/pcots/Post/BookPurgeAndRecallTask/BookPurgeAndRecallTaskRequestType'
import {
  BookPurgeAndRecallTaskResponseType,
  BookPurgeAndRecallTaskResponseTypeValidator,
} from '@/types/Api/pcots/Post/BookPurgeAndRecallTask/BookPurgeAndRecallTaskResponseType'

const {
  isPickingTask,
  isConsolidationTask,
  isCycleCountTask,
  isMultiItemCycleCountTask,
  isManualConsolidationTask,
  isPurgeAndRecallTask,
} = useApiDataHelper()

export const getSupportedVersionsPcots = async (): Promise<
  SupportedVersionType[]
> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetSupportedVersionsResponseType>
  >('getSupportedVersionsApi', getSupportedVersionsApi)

  await exec()
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'get_supported_versions'),
    getMessageKeyError(ApiNameEnum.pcots, 'get_supported_versions'),
  ])

  if (responseData) {
    validateResponse(responseData, GetSupportedVersionsResponseTypeValidator)
  }

  return responseData.versions
}

export const getSupportedProblems = async (): Promise<
  ProblemDefinitionType[]
> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetSupportedProblemsResponseType>
  >('getSupportedProblemsApi', getSupportedProblemsApi)

  await exec()
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'get_supported_problems'),
    getMessageKeyError(ApiNameEnum.pcots, 'get_supported_problems'),
  ])
  if (responseData) {
    validateResponse(responseData, GetSupportedProblemsResponseTypeValidator)
  }

  return responseData.problems
}

export const getWorkstationState = async (): Promise<WorkstationStateType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetWorkstationStateResponseType>
  >('getWorkstationStateApi', getWorkstationStateApi)

  await exec()
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'get_workstation_state'),
    getMessageKeyError(ApiNameEnum.pcots, 'get_workstation_state'),
  ])

  if (responseData) {
    validateResponse(responseData, GetWorkstationStateResponseTypeValidator)
  }

  return responseData
}

export const getLoadCarriers = async (
  request: GetLoadCarriersRequestType
): Promise<GetLoadCarriersResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetLoadCarriersResponseType>
  >('getLoadCarriersApi', getLoadCarriersApi)

  await exec(request)
  const responseData = response.value.data

  const errorOccurred = await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'get_load_carriers'),
    getMessageKeyError(ApiNameEnum.pcots, 'get_load_carriers'),
  ])

  if (!errorOccurred) {
    validateResponse(responseData, GetLoadCarriersResponseTypeValidator)
  }

  return responseData
}

export const getTask = async (): Promise<
  | TaskType
  | PickingTaskType
  | ConsolidationTaskType
  | CycleCountTaskType
  | MultiItemCycleCountTaskType
  | ManualConsolidationTaskType
  | PurgeAndRecallTaskType
  | undefined
> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetCurrentTaskResponseType | string>
  >('getCurrentTaskApi', getCurrentTaskApi)

  await exec()
  if (response.value.data === '') {
    return undefined
  }
  const responseData = response.value.data as GetCurrentTaskResponseType

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'get_task'),
    getMessageKeyError(ApiNameEnum.pcots, 'get_task'),
  ])

  if (responseData) {
    validateResponse(responseData, GetCurrentTaskResponseTypeValidator)
  }

  if (isPickingTask(responseData)) {
    validateResponse(responseData, PickingTaskTypeValidator)
    return responseData as PickingTaskType
  } else if (isConsolidationTask(responseData)) {
    validateResponse(responseData, ConsolidationTaskTypeValidator)
    return responseData as ConsolidationTaskType
  } else if (isCycleCountTask(responseData)) {
    validateResponse(responseData, CycleCountTaskTypeValidator)
    return responseData as CycleCountTaskType
  } else if (isMultiItemCycleCountTask(responseData)) {
    validateResponse(responseData, MultiItemCycleCountTaskValidator)
    return responseData as MultiItemCycleCountTaskType
  } else if (isManualConsolidationTask(responseData)) {
    validateResponse(responseData, ManualConsolidationTaskTypeValidator)
    return responseData as ManualConsolidationTaskType
  } else if (isPurgeAndRecallTask(responseData)) {
    validateResponse(responseData, PurgeAndRecallTaskTypeValidator)
    return responseData as PurgeAndRecallTaskType
  }
}

export const getRobotState = async (): Promise<GetRobotStateResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetRobotStateResponseType>
  >('getRobotStateApi', getRobotStateApi)

  await exec()
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'get_robot_state'),
    getMessageKeyError(ApiNameEnum.pcots, 'get_robot_state'),
  ])

  if (responseData) {
    validateResponse(responseData, GetRobotStateResponseTypeValidator)
  }

  return responseData
}

export const changeTaskExecutionMode = async (
  request: ChangeTaskExecutionModeRequestType
): Promise<ChangeTaskExecutionModeResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<ChangeTaskExecutionModeResponseType>
  >('changeTaskExecutionModeApi', changeTaskExecutionModeApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'change_task_execution_mode'),
    getMessageKeyError(ApiNameEnum.pcots, 'change_task_execution_mode'),
  ])
  if (responseData) {
    validateResponse(responseData, ChangeTaskExecutionModeResponseTypeValidator)
  }

  return responseData
}

export const bookPickingTask = async (
  request: BookPickingTaskRequestType
): Promise<BookPickingTaskResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<BookPickingTaskResponseType>
  >('bookPickingTaskApi', bookPickingTaskApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'book_picking_task'),
    getMessageKeyError(ApiNameEnum.pcots, 'book_picking_task'),
  ])
  if (responseData) {
    validateResponse(responseData, BookPickingTaskResponseTypeValidator)
  }

  return responseData
}

export const bookPurgeAndRecallTask = async (
  request: BookPurgeAndRecallTaskRequestType
): Promise<BookPurgeAndRecallTaskResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<BookPurgeAndRecallTaskResponseType>
  >('bookPurgeAndRecallTaskApi', bookPurgeAndRecallTaskApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'book_purge_and_recall_task'),
    getMessageKeyError(ApiNameEnum.pcots, 'book_purge_and_recall_task'),
  ])
  if (responseData) {
    validateResponse(responseData, BookPurgeAndRecallTaskResponseTypeValidator)
  }

  return responseData
}

export const bookConsolidationTask = async (
  request: BookConsolidationTaskRequestType
): Promise<BookConsolidationTaskResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<BookConsolidationTaskResponseType>
  >('bookConsolidationTaskApi', bookConsolidationTaskApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'book_consolidation_task'),
    getMessageKeyError(ApiNameEnum.pcots, 'book_consolidation_task'),
  ])

  if (responseData) {
    validateResponse(responseData, BookConsolidationTaskResponseTypeValidator)
  }

  return responseData
}

export const bookCycleCountTask = async (
  request: BookCycleCountTaskRequestType
): Promise<BookCycleCountTaskResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<BookCycleCountTaskResponseType>
  >('bookCycleCountTaskApi', bookCycleCountTaskApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcots, 'book_cycle_count_task'),
    getMessageKeyError(ApiNameEnum.pcots, 'book_cycle_count_task'),
  ])
  if (responseData) {
    validateResponse(responseData, BookCycleCountTaskResponseTypeValidator)
  }

  return responseData
}

export const verifyBarcode = async (
  request: VerifyBarcodeRequestType
): Promise<VerifyBarcodeResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<VerifyBarcodeResponseType>
  >('verifyBarcodeApi', verifyBarcodeApi)

  await exec(request)
  const responseData = response.value.data

  try {
    await handleRequestError(
      responseData,
      error,
      [
        getMessageKeyPermission(ApiNameEnum.pcots, 'verify_barcode'),
        getMessageKeyError(ApiNameEnum.pcots, 'verify_barcode'),
      ],
      false
    )
  } catch (e: any) {
    const messageParseResult = MessageTypeValidator.safeParse(e.response.data)
    if (!messageParseResult.success) {
      e.response.data = {
        messageText: `${getMessageKeyError(
          ApiNameEnum.pcots,
          'verify_barcode'
        )}-description`,
      }
    }
    throw e
  }

  if (responseData) {
    validateResponse(responseData, VerifyBarcodeResponseTypeValidator)
  }

  return responseData
}
