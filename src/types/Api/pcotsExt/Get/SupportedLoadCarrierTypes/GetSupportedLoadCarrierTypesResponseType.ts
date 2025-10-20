import { z } from 'zod'
import { LoadCarrierTypeTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetSupportedLoadCarrierTypesResponseTypeValidator = z.array(
  LoadCarrierTypeTypeValidator
)
export type GetSupportedLoadCarrierTypesResponseType = z.infer<
  typeof GetSupportedLoadCarrierTypesResponseTypeValidator
>
