import { z } from 'zod'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const GetLoadCarriersRequestTypeValidator = z.object({
  location: z.array(z.nativeEnum(PcotsLocationEnum)),
})
export type GetLoadCarriersRequestType = z.infer<
  typeof GetLoadCarriersRequestTypeValidator
>
