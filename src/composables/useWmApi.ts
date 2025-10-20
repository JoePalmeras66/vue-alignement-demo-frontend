import { AxiosResponse } from 'axios'
import { useApi } from '@/api/composables/useApi'
import {
  getMessageKeyError,
  getMessageKeyPermission,
  handleRequestError,
  validateResponse,
} from '@/helpers/apiHelpers'
import {
  GetSupportedStationsResponseType,
  GetSupportedStationsResponseTypeValidator,
} from '@/types/Api/wm/Get/SupportedStations/GetSupportedStationsResponse'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'
import { getSupportedStationsApi } from '@/api/wmApi'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'

export const getSupportedStations = async (): Promise<
  SupportedStationType[]
> => {
  const { response, error, exec } = useApi<
    AxiosResponse<GetSupportedStationsResponseType>
  >('getSupportedStationsApi', getSupportedStationsApi)

  await exec()
  const responseData = response.value.data

  await handleRequestError(responseData, error, [
    getMessageKeyPermission(ApiNameEnum.wm, 'get_supported_stations'),
    getMessageKeyError(ApiNameEnum.wm, 'get_supported_stations'),
  ])

  if (responseData) {
    validateResponse(responseData, GetSupportedStationsResponseTypeValidator)
  }

  return responseData.stations
}
