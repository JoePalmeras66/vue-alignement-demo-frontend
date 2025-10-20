import { z } from 'zod'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const GetLoadCarrierHeadingRequestTypeValidator = z.object({
  location: z.array(z.nativeEnum(PcotsLocationEnum)),
})
export type GetLoadCarrierHeadingRequestType = z.infer<
  typeof GetLoadCarrierHeadingRequestTypeValidator
>
