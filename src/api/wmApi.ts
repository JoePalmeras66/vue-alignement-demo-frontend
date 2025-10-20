import { AxiosResponse } from 'axios'
import { GetSupportedStationsResponseType } from '@/types/Api/wm/Get/SupportedStations/GetSupportedStationsResponse'
import { apiGet } from '@/api/apiExtensions'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'

// noinspection SpellCheckingInspection
const operations = {
  supportedStations: `supportedstations`,
}

export const getSupportedStationsApi = (): Promise<
  AxiosResponse<GetSupportedStationsResponseType>
> => {
  return apiGet(
    ApiNameEnum.wm,
    operations.supportedStations,
    undefined,
    false,
    false
  )
}
