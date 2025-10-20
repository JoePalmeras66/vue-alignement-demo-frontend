import { AxiosResponse } from 'axios'
import { GetSupportedVersionsResponseType } from '@/types/Api/pcots/Get/SupportedVersions/GetSupportedVersionsResponseType'
import { GetSupportedProblemsResponseType } from '@/types/Api/pcots/Get/SupportedProblems/GetSupportedProblemsResponseType'
import { GetWorkstationStateResponseType } from '@/types/Api/pcots/Get/WorkstationState/GetWorkstationStateResponseType'
import { GetLoadCarriersResponseType } from '@/types/Api/pcots/Get/LoadCarriers/GetLoadCarriersResponseType'
import { GetLoadCarriersRequestType } from '@/types/Api/pcots/Get/LoadCarriers/GetLoadCarriersRequestType'
import { GetCurrentTaskResponseType } from '@/types/Api/pcots/Get/CurrentTask/GetCurrentTaskResponseType'
import { GetRobotStateResponseType } from '@/types/Api/pcots/Get/RobotState/GetRobotStateResponseType'
import { ChangeTaskExecutionModeRequestType } from '@/types/Api/pcots/Post/ChangeTaskExecutionMode/ChangeTaskExecutionModeRequestType'
import { ChangeTaskExecutionModeResponseType } from '@/types/Api/pcots/Post/ChangeTaskExecutionMode/ChangeTaskExecutionModeResponseType'
import { BookPickingTaskRequestType } from '@/types/Api/pcots/Post/BookPickingTask/BookPickingTaskRequestType'
import { BookPickingTaskResponseType } from '@/types/Api/pcots/Post/BookPickingTask/BookPickingTaskResponseType'
import { BookConsolidationTaskRequestType } from '@/types/Api/pcots/Post/BookConsolidationTask/BookConsolidationTaskRequestType'
import { BookConsolidationTaskResponseType } from '@/types/Api/pcots/Post/BookConsolidationTask/BookConsolidationTaskResponseType'
import { BookCycleCountTaskRequestType } from '@/types/Api/pcots/Post/BookCycleCountTask/BookCycleCountTaskRequestType'
import { BookCycleCountTaskResponseType } from '@/types/Api/pcots/Post/BookCycleCountTask/BookCycleCountTaskResponseType'
import { BookPurgeAndRecallTaskRequestType } from '@/types/Api/pcots/Post/BookPurgeAndRecallTask/BookPurgeAndRecallTaskRequestType'
import { BookPurgeAndRecallTaskResponseType } from '@/types/Api/pcots/Post/BookPurgeAndRecallTask/BookPurgeAndRecallTaskResponseType'
import { VerifyBarcodeRequestType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeRequestType'
import { VerifyBarcodeResponseType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeResponseType'
import { apiGet, apiPost } from '@/api/apiExtensions'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'

// noinspection SpellCheckingInspection
const operations = {
  supportedVersions: `supportedversions`,
  supportedProblems: `currenttask/supportedproblems`,
  workstationState: `workstationstate`,
  loadCarriers: `loadcarriers`,
  currentTask: `currenttask`,
  robotState: `robotstate`,
  taskExecutionMode: `taskexecutionmode`,
  bookPicking: `currenttask/bookpicking`,
  bookConsolidation: `currenttask/bookconsolidation`,
  bookCycleCount: `currenttask/bookcyclecount`,
  bookPurgeAndRecall: 'currenttask/bookpurgeandrecall',
  verifyBarcode: `currenttask/verifybarcode`,
}

export const getSupportedVersionsApi = (): Promise<
  AxiosResponse<GetSupportedVersionsResponseType>
> => {
  return apiGet(
    ApiNameEnum.pcots,
    operations.supportedVersions,
    undefined,
    false,
    false
  )
}

export const getSupportedProblemsApi = (): Promise<
  AxiosResponse<GetSupportedProblemsResponseType>
> => {
  return apiGet(ApiNameEnum.pcots, operations.supportedProblems)
}

export const getWorkstationStateApi = (): Promise<
  AxiosResponse<GetWorkstationStateResponseType>
> => {
  return apiGet(ApiNameEnum.pcots, operations.workstationState)
}

export const getLoadCarriersApi = (
  request: GetLoadCarriersRequestType
): Promise<AxiosResponse<GetLoadCarriersResponseType>> => {
  return apiGet(ApiNameEnum.pcots, operations.loadCarriers, request)
}

export const getCurrentTaskApi = (): Promise<
  AxiosResponse<GetCurrentTaskResponseType>
> => {
  return apiGet(ApiNameEnum.pcots, operations.currentTask)
}

export const getRobotStateApi = (): Promise<
  AxiosResponse<GetRobotStateResponseType>
> => {
  return apiGet(ApiNameEnum.pcots, operations.robotState)
}

export const changeTaskExecutionModeApi = (
  request: ChangeTaskExecutionModeRequestType
): Promise<AxiosResponse<ChangeTaskExecutionModeResponseType>> => {
  return apiPost(ApiNameEnum.pcots, operations.taskExecutionMode, request)
}

export const bookPickingTaskApi = (
  request: BookPickingTaskRequestType
): Promise<AxiosResponse<BookPickingTaskResponseType>> => {
  return apiPost(ApiNameEnum.pcots, operations.bookPicking, request)
}

export const bookConsolidationTaskApi = (
  request: BookConsolidationTaskRequestType
): Promise<AxiosResponse<BookConsolidationTaskResponseType>> => {
  return apiPost(ApiNameEnum.pcots, operations.bookConsolidation, request)
}

export const bookCycleCountTaskApi = (
  request: BookCycleCountTaskRequestType
): Promise<AxiosResponse<BookCycleCountTaskResponseType>> => {
  return apiPost(ApiNameEnum.pcots, operations.bookCycleCount, request)
}

export const bookPurgeAndRecallTaskApi = (
  request: BookPurgeAndRecallTaskRequestType
): Promise<AxiosResponse<BookPurgeAndRecallTaskResponseType>> => {
  return apiPost(ApiNameEnum.pcots, operations.bookPurgeAndRecall, request)
}

export const verifyBarcodeApi = (
  request: VerifyBarcodeRequestType
): Promise<AxiosResponse<VerifyBarcodeResponseType>> => {
  return apiPost(ApiNameEnum.pcots, operations.verifyBarcode, request)
}
