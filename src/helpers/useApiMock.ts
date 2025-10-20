import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { vi } from 'vitest'
import { getAvailableStations, getOrderLine } from '@/helpers/testDataProvider'
import { GetSupportedStationsResponseType } from '@/types/Api/wm/Get/SupportedStations/GetSupportedStationsResponse'
import { VerifyBarcodeRequestType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeRequestType'
import { VerifyBarcodeResponseType } from '@/types/Api/pcots/Post/VerifyBarcode/VerifyBarcodeResponseType'
import {
  MessageTypeEnum,
  PcotsLocationEnum,
  ProblemCategoryEnum,
  ProblemStrategyEnum,
  ProblemSubCategoryEnum,
  ProblemTypeEnum,
  RobotOperatingStateEnum,
  TaskExecutionModeEnum,
  WorkStationDirectionEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { GetLoadCarrierOrdersRequestType } from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersRequestType'
import { GetLoadCarrierOrdersResponseType } from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersResponseType'
import { OrderLineType } from '@/types/Api/pcotsExt/PcotsExtApiModel'
import { GetSupportedVersionsResponseType } from '@/types/Api/pcots/Get/SupportedVersions/GetSupportedVersionsResponseType'
import { GetSupportedProblemsResponseType } from '@/types/Api/pcots/Get/SupportedProblems/GetSupportedProblemsResponseType'
import { GetWorkstationStateResponseType } from '@/types/Api/pcots/Get/WorkstationState/GetWorkstationStateResponseType'
import { GetRobotStateResponseType } from '@/types/Api/pcots/Get/RobotState/GetRobotStateResponseType'

export const useApiMock = () => {
  const getSupportedStationsResponseData: GetSupportedStationsResponseType = {
    stations: getAvailableStations(),
  }
  const fetchUserInfoResponseData =
    '{"sub":"3709d5e4-646a-41ab-87bc-46a97a1d079e","email_verified":true,"name":"Tobias Spatt","preferred_username":"spt","given_name":"Tobias","locale":"en","family_name":"Spatt","email":"spt@tgw-group.com"}'
  const getWorkstationStateResponseData: GetWorkstationStateResponseType = {
    taskExecutionMode: TaskExecutionModeEnum.Init,
    robotSupport: true,
    workstationDirection: WorkStationDirectionEnum.RightToLeft,
    workstationMode: WorkStationModeEnum.Off,
  }
  const getRobotStateResponseData: GetRobotStateResponseType = {
    operatingState: RobotOperatingStateEnum.Off,
    errors: [],
    robotInHome: false,
  }
  const getSupportedVersionsResponseData: GetSupportedVersionsResponseType = {
    versions: [{ version: '1.0' }, { version: '2.0' }],
  }
  const getSupportedProblemsResponseData: GetSupportedProblemsResponseType = {
    problems: [
      {
        name: ProblemTypeEnum.DirtyLoadCarrier,
        type: ProblemTypeEnum.DirtyLoadCarrier,
        subCategory: ProblemSubCategoryEnum.LoadCarrier,
        category: ProblemCategoryEnum.Source,
        strategy: ProblemStrategyEnum.Continue,
      },
      {
        name: ProblemTypeEnum.DirtyItem,
        type: ProblemTypeEnum.DirtyItem,
        subCategory: ProblemSubCategoryEnum.Item,
        category: ProblemCategoryEnum.Task,
        strategy: ProblemStrategyEnum.Continue,
      },
      {
        name: ProblemTypeEnum.DirtyLoadCarrier,
        type: ProblemTypeEnum.DirtyLoadCarrier,
        subCategory: ProblemSubCategoryEnum.LoadCarrier,
        category: ProblemCategoryEnum.Target,
        strategy: ProblemStrategyEnum.Continue,
      },
    ],
  }

  const getSuccessAxiosResponse = <T>(data: T) => {
    return {
      status: 200,
      data,
      request: null,
      config: {} as InternalAxiosRequestConfig,
      headers: {},
      statusText: 'success',
    } as AxiosResponse<T>
  }

  const getMockResponseFunction = <T>(data: T) => {
    return vi.fn(() => getSuccessAxiosResponse(data))
  }

  const mockGetSupportedStations = getMockResponseFunction(
    getSupportedStationsResponseData
  )

  const mockFetchUserInfo = getMockResponseFunction({
    data: fetchUserInfoResponseData,
  })

  const mockVerifyBarcodeApi = vi.fn((request: VerifyBarcodeRequestType) => {
    const response: AxiosResponse<VerifyBarcodeResponseType | null> = {
      status: 200,
      data: null,
      request: null,
      config: {} as InternalAxiosRequestConfig,
      headers: {},
      statusText: 'success',
    }
    if (request.barcodes[0].barcode === 'CLIENTERROR') {
      response.data = {
        messageType: MessageTypeEnum.Error,
        messageText: '',
        parameters: [],
      } as VerifyBarcodeResponseType
      response.status = 400
      throw new AxiosError(undefined, '400', undefined, undefined, response)
    }
    if (request.barcodes[0].barcode !== '69') {
      response.data = {
        messageType: MessageTypeEnum.Error,
        messageText: 'testing.specific_barcode_valid',
        parameters: [{ value: '69', translate: false }],
      } as VerifyBarcodeResponseType
      response.status = 400
      throw new AxiosError(undefined, '400', undefined, undefined, response)
    }
    return response
  })

  const mockGetLoadCarrierOrdersApi = vi.fn(
    (request: GetLoadCarrierOrdersRequestType) => {
      const response: AxiosResponse<GetLoadCarrierOrdersResponseType> = {
        status: 200,
        data: { orderLines: [] as OrderLineType[] },
        request: null,
        config: {} as InternalAxiosRequestConfig,
        headers: {},
        statusText: 'success',
      }
      if (
        request.location === PcotsLocationEnum.Target ||
        request.location === PcotsLocationEnum.Source
      ) {
        response.data.orderLines.push(getOrderLine())
      }
      return response
    }
  )

  const mockGetSupportedVersionsPcotsApi = getMockResponseFunction(
    getSupportedVersionsResponseData
  )

  const mockGetSupportedVersionsPcotsExtApi = getMockResponseFunction(
    getSupportedVersionsResponseData
  )

  const mockGetSupportedProblemsApi = getMockResponseFunction(
    getSupportedProblemsResponseData
  )

  const mockGetWorkstationStateApi = getMockResponseFunction(
    getWorkstationStateResponseData
  )

  const mockGetRobotStateApi = getMockResponseFunction(
    getRobotStateResponseData
  )

  return {
    getSupportedStationsResponseData,
    getWorkstationStateResponseData,
    getRobotStateResponseData,
    mockGetSupportedStations,
    mockFetchUserInfo,
    mockVerifyBarcodeApi,
    mockGetLoadCarrierOrdersApi,
    mockGetSupportedVersionsPcotsApi,
    mockGetSupportedVersionsPcotsExtApi,
    mockGetSupportedProblemsApi,
    mockGetWorkstationStateApi,
    mockGetRobotStateApi,
  }
}
