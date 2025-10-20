import { z } from 'zod'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const GetLoadCarrierOrdersRequestTypeValidator = z.object({
  location: z.nativeEnum(PcotsLocationEnum),
})
export type GetLoadCarrierOrdersRequestType = z.infer<
  typeof GetLoadCarrierOrdersRequestTypeValidator
>
