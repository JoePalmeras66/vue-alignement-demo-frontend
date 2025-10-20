import { z } from 'zod'
import { SupportedStationsTypeValidator } from '@/types/Api/wm/WmApiModel'

export const GetSupportedStationsResponseTypeValidator =
  SupportedStationsTypeValidator
export type GetSupportedStationsResponseType = z.infer<
  typeof GetSupportedStationsResponseTypeValidator
>
