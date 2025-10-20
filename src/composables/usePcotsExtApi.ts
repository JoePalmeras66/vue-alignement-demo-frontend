import { AxiosResponse } from 'axios'
import { useApi } from '@/api/composables/useApi'
import {
  getMessageKeyError,
  getMessageKeyPermission,
  handleRequestError,
  validateResponse,
} from '@/helpers/apiHelpers'
import {
  GetSupportedLoadCarrierTypesResponseType,
  GetSupportedLoadCarrierTypesResponseTypeValidator,
} from '@/types/Api/pcotsExt/Get/SupportedLoadCarrierTypes/GetSupportedLoadCarrierTypesResponseType'
import {
  bookCycleCountCompartmentApi,
  changeLoadCarrierTypeApi,
  getLoadCarrierHeadingApi,
  getLoadCarrierOrdersApi,
  getSupportedLoadcarrierTypesApi,
  getSupportedVersionsApi,
  identifyLoadCarrierApi,
  moveCompartmentApi,
  swapCompartmentApi,
  transportLoadCarrierApi,
} from '@/api/pcotsExtApi'
import {
  ChangeLoadCarrierTypeResponseType,
  ChangeLoadCarrierTypeResponseTypeValidator,
} from '@/types/Api/pcotsExt/Post/ChangeLoadCarrierType/ChangeLoadCarrierTypeResponseType'
import { ChangeLoadCarrierTypeRequestType } from '@/types/Api/pcotsExt/Post/ChangeLoadCarrierType/ChangeLoadCarrierTypeRequestType'
import {
  MoveCompartmentResponseType,
  MoveCompartmentResponseTypeValidator,
} from '@/types/Api/pcotsExt/Post/MoveCompartment/MoveCompartmentResponseType'
import { MoveCompartmentRequestType } from '@/types/Api/pcotsExt/Post/MoveCompartment/MoveCompartmentRequestType'
import { SwapCompartmentRequestType } from '@/types/Api/pcotsExt/Post/SwapCompartment/SwapCompartmentRequestType'
import {
  SwapCompartmentResponseType,
  SwapCompartmentResponseTypeValidator,
} from '@/types/Api/pcotsExt/Post/SwapCompartment/SwapCompartmentResponseType'
import { TransportLoadCarrierRequestType } from '@/types/Api/pcotsExt/Post/TransportLoadCarrier/TransportLoadCarrierRequestType'
import {
  TransportLoadCarrierResponseType,
  TransportLoadCarrierResponseTypeValidator,
} from '@/types/Api/pcotsExt/Post/TransportLoadCarrier/TransportLoadCarrierResponseType'
import { IdentifyLoadCarrierRequestType } from '@/types/Api/pcotsExt/Post/IdentifyLoadCarrier/IdentifyLoadCarrierRequestType'
import {
  IdentifyLoadCarrierResponseType,
  IdentifyLoadCarrierResponseTypeValidator,
} from '@/types/Api/pcotsExt/Post/IdentifyLoadCarrier/IdentifyLoadCarrierResponseType'
import { GetLoadCarrierHeadingRequestType } from '@/types/Api/pcotsExt/Get/LoadCarrierHeading/GetLoadCarrierHeadingRequestType'
import {
  GetLoadCarrierHeadingResponseType,
  GetLoadCarrierHeadingResponseTypeValidator,
} from '@/types/Api/pcotsExt/Get/LoadCarrierHeading/GetLoadCarrierHeadingResponseType'
import { BookCycleCountCompartmentRequestType } from '@/types/Api/pcotsExt/Post/BookCycleCountCompartment/BookCycleCountCompartmentRequestType'
import {
  BookCycleCountCompartmentResponseType,
  BookCycleCountCompartmentResponseTypeValidator,
} from '@/types/Api/pcotsExt/Post/BookCycleCountCompartment/BookCycleCountCompartmentResponseType'
import { SupportedVersionType } from '@/types/Api/pcots/PcotsApiModel'
import {
  GetSupportedVersionsResponseType,
  GetSupportedVersionsResponseTypeValidator,
} from '@/types/Api/pcots/Get/SupportedVersions/GetSupportedVersionsResponseType'
import { GetLoadCarrierOrdersRequestType } from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersRequestType'
import {
  GetLoadCarrierOrdersResponseType,
  GetLoadCarrierOrdersResponseTypeValidator,
} from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersResponseType'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'

export const getSupportedVersionsPcotsExt = async (): Promise<
  SupportedVersionType[]
> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetSupportedVersionsResponseType>
  >('getSupportedVersionsApi', getSupportedVersionsApi)

  await exec()
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'get_supported_versions'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'get_supported_versions'),
  ])

  if (responseData) {
    validateResponse(responseData, GetSupportedVersionsResponseTypeValidator)
  }

  return responseData.versions
}

export const getSupportedLoadCarrierTypes =
  async (): Promise<GetSupportedLoadCarrierTypesResponseType> => {
    const { response, error, exec } = useApi<
      AxiosResponse<GetSupportedLoadCarrierTypesResponseType>
    >('getSupportedLoadcarrierTypesApi', getSupportedLoadcarrierTypesApi)

    await exec()
    const responseData = response.value.data

    await handleRequestError(responseData, error, [
      getMessageKeyPermission(
        ApiNameEnum.pcotsExt,
        'get_supported_load_carrier_types'
      ),
      getMessageKeyError(
        ApiNameEnum.pcotsExt,
        'get_supported_load_carrier_types'
      ),
    ])

    if (responseData) {
      validateResponse(
        responseData,
        GetSupportedLoadCarrierTypesResponseTypeValidator
      )
    }

    return responseData
  }

export const changeLoadCarrierType = async (
  request: ChangeLoadCarrierTypeRequestType
): Promise<ChangeLoadCarrierTypeResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<ChangeLoadCarrierTypeResponseType>
  >('changeLoadCarrierTypeApi', changeLoadCarrierTypeApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'change_load_carrier_type'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'change_load_carrier_type'),
  ])

  if (responseData) {
    validateResponse(responseData, ChangeLoadCarrierTypeResponseTypeValidator)
  }

  return responseData
}

export const moveCompartment = async (
  request: MoveCompartmentRequestType
): Promise<MoveCompartmentResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<MoveCompartmentResponseType>
  >('moveCompartmentApi', moveCompartmentApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'move_compartment'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'move_compartment'),
  ])

  if (responseData) {
    validateResponse(responseData, MoveCompartmentResponseTypeValidator)
  }

  return responseData
}

export const swapCompartment = async (
  request: SwapCompartmentRequestType
): Promise<SwapCompartmentResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<SwapCompartmentResponseType>
  >('swapCompartmentApi', swapCompartmentApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'swap_compartment'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'swap_compartment'),
  ])

  if (responseData) {
    validateResponse(responseData, SwapCompartmentResponseTypeValidator)
  }

  return responseData
}

export const bookCycleCountCompartment = async (
  request: BookCycleCountCompartmentRequestType
): Promise<BookCycleCountCompartmentResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<BookCycleCountCompartmentResponseType>
  >('bookCycleCountCompartmentApi', bookCycleCountCompartmentApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'inventory_compartment'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'inventory_compartment'),
  ])

  if (responseData) {
    validateResponse(
      responseData,
      BookCycleCountCompartmentResponseTypeValidator
    )
  }

  return responseData
}

export const transportLoadCarrier = async (
  request: TransportLoadCarrierRequestType
): Promise<TransportLoadCarrierResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<TransportLoadCarrierResponseType>
  >('transportLoadCarrierApi', transportLoadCarrierApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'transport_load_carrier'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'transport_load_carrier'),
  ])

  if (responseData) {
    validateResponse(responseData, TransportLoadCarrierResponseTypeValidator)
  }

  return responseData
}

export const identifyLoadCarrier = async (
  request: IdentifyLoadCarrierRequestType
): Promise<IdentifyLoadCarrierResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<IdentifyLoadCarrierResponseType>
  >('identifyLoadCarrierApi', identifyLoadCarrierApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'identify_load_carrier'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'identify_load_carrier'),
  ])

  if (responseData) {
    validateResponse(responseData, IdentifyLoadCarrierResponseTypeValidator)
  }

  return responseData
}

export const getLoadCarrierHeading = async (
  request: GetLoadCarrierHeadingRequestType
): Promise<GetLoadCarrierHeadingResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetLoadCarrierHeadingResponseType>
  >('getLoadCarrierHeadingApi', getLoadCarrierHeadingApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'get_load_carrier_headers'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'get_load_carrier_headers'),
  ])
  if (responseData) {
    validateResponse(responseData, GetLoadCarrierHeadingResponseTypeValidator)
  }

  return responseData
}

export const getLoadCarrierOrders = async (
  request: GetLoadCarrierOrdersRequestType
): Promise<GetLoadCarrierOrdersResponseType> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetLoadCarrierOrdersResponseType>
  >('getLoadCarrierOrdersApi', getLoadCarrierOrdersApi)

  await exec(request)
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.pcotsExt, 'get_load_carrier_orders'),
    getMessageKeyError(ApiNameEnum.pcotsExt, 'get_load_carrier_orders'),
  ])

  if (responseData) {
    validateResponse(responseData, GetLoadCarrierOrdersResponseTypeValidator)
  }

  return responseData
}
