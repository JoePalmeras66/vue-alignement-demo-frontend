import { AxiosResponse } from 'axios'
import { GetSupportedLoadCarrierTypesResponseType } from '@/types/Api/pcotsExt/Get/SupportedLoadCarrierTypes/GetSupportedLoadCarrierTypesResponseType'
import { ChangeLoadCarrierTypeRequestType } from '@/types/Api/pcotsExt/Post/ChangeLoadCarrierType/ChangeLoadCarrierTypeRequestType'
import { ChangeLoadCarrierTypeResponseType } from '@/types/Api/pcotsExt/Post/ChangeLoadCarrierType/ChangeLoadCarrierTypeResponseType'
import { MoveCompartmentRequestType } from '@/types/Api/pcotsExt/Post/MoveCompartment/MoveCompartmentRequestType'
import { MoveCompartmentResponseType } from '@/types/Api/pcotsExt/Post/MoveCompartment/MoveCompartmentResponseType'
import { SwapCompartmentResponseType } from '@/types/Api/pcotsExt/Post/SwapCompartment/SwapCompartmentResponseType'
import { SwapCompartmentRequestType } from '@/types/Api/pcotsExt/Post/SwapCompartment/SwapCompartmentRequestType'
import { TransportLoadCarrierRequestType } from '@/types/Api/pcotsExt/Post/TransportLoadCarrier/TransportLoadCarrierRequestType'
import { TransportLoadCarrierResponseType } from '@/types/Api/pcotsExt/Post/TransportLoadCarrier/TransportLoadCarrierResponseType'
import { IdentifyLoadCarrierRequestType } from '@/types/Api/pcotsExt/Post/IdentifyLoadCarrier/IdentifyLoadCarrierRequestType'
import { IdentifyLoadCarrierResponseType } from '@/types/Api/pcotsExt/Post/IdentifyLoadCarrier/IdentifyLoadCarrierResponseType'
import { GetLoadCarrierHeadingRequestType } from '@/types/Api/pcotsExt/Get/LoadCarrierHeading/GetLoadCarrierHeadingRequestType'
import { GetLoadCarrierHeadingResponseType } from '@/types/Api/pcotsExt/Get/LoadCarrierHeading/GetLoadCarrierHeadingResponseType'
import { apiGet, apiPost } from '@/api/apiExtensions'
import { BookCycleCountCompartmentRequestType } from '@/types/Api/pcotsExt/Post/BookCycleCountCompartment/BookCycleCountCompartmentRequestType'
import { BookCycleCountCompartmentResponseType } from '@/types/Api/pcotsExt/Post/BookCycleCountCompartment/BookCycleCountCompartmentResponseType'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import { GetSupportedVersionsResponseType } from '@/types/Api/pcots/Get/SupportedVersions/GetSupportedVersionsResponseType'
import { GetLoadCarrierOrdersRequestType } from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersRequestType'
import { GetLoadCarrierOrdersResponseType } from '@/types/Api/pcotsExt/Get/LoadCarrierOrders/GetLoadCarrierOrdersResponseType'

// noinspection SpellCheckingInspection
const operations = {
  supportedVersions: `supportedversions`,
  supportedLoadCarrierTypes: `supportedloadcarriertypes`,
  changeLoadCarrierType: `changeloadcarriertype`,
  moveCompartment: `loadcarriers/movecompartment`,
  swapCompartment: `loadcarriers/swapcompartment`,
  bookCycleCountCompartment: `loadcarriers/bookcyclecount`,
  transportLoadCarrier: `loadcarriers/transport`,
  identifyLoadCarrier: `loadcarriers/identify`,
  loadCarrierHeading: `loadcarrierheading`,
  loadCarrierOrders: `loadcarrierorders`,
}

export const getSupportedVersionsApi = (): Promise<
  AxiosResponse<GetSupportedVersionsResponseType>
> => {
  return apiGet(
    ApiNameEnum.pcotsExt,
    operations.supportedVersions,
    undefined,
    false,
    false
  )
}

export const getSupportedLoadcarrierTypesApi = (): Promise<
  AxiosResponse<GetSupportedLoadCarrierTypesResponseType>
> => {
  return apiGet(ApiNameEnum.pcotsExt, operations.supportedLoadCarrierTypes)
}

export const changeLoadCarrierTypeApi = (
  request: ChangeLoadCarrierTypeRequestType
): Promise<AxiosResponse<ChangeLoadCarrierTypeResponseType>> => {
  return apiPost(
    ApiNameEnum.pcotsExt,
    operations.changeLoadCarrierType,
    request
  )
}

export const moveCompartmentApi = (
  request: MoveCompartmentRequestType
): Promise<AxiosResponse<MoveCompartmentResponseType>> => {
  return apiPost(ApiNameEnum.pcotsExt, operations.moveCompartment, request)
}

export const swapCompartmentApi = (
  request: SwapCompartmentRequestType
): Promise<AxiosResponse<SwapCompartmentResponseType>> => {
  return apiPost(ApiNameEnum.pcotsExt, operations.swapCompartment, request)
}

export const bookCycleCountCompartmentApi = (
  request: BookCycleCountCompartmentRequestType
): Promise<AxiosResponse<BookCycleCountCompartmentResponseType>> => {
  return apiPost(
    ApiNameEnum.pcotsExt,
    operations.bookCycleCountCompartment,
    request
  )
}

export const transportLoadCarrierApi = (
  request: TransportLoadCarrierRequestType
): Promise<AxiosResponse<TransportLoadCarrierResponseType>> => {
  return apiPost(ApiNameEnum.pcotsExt, operations.transportLoadCarrier, request)
}

export const identifyLoadCarrierApi = (
  request: IdentifyLoadCarrierRequestType
): Promise<AxiosResponse<IdentifyLoadCarrierResponseType>> => {
  return apiPost(ApiNameEnum.pcotsExt, operations.identifyLoadCarrier, request)
}

export const getLoadCarrierHeadingApi = (
  request: GetLoadCarrierHeadingRequestType
): Promise<AxiosResponse<GetLoadCarrierHeadingResponseType>> => {
  return apiGet(ApiNameEnum.pcotsExt, operations.loadCarrierHeading, request)
}

export const getLoadCarrierOrdersApi = (
  request: GetLoadCarrierOrdersRequestType
): Promise<AxiosResponse<GetLoadCarrierOrdersResponseType>> => {
  return apiGet(ApiNameEnum.pcotsExt, operations.loadCarrierOrders, request)
}
