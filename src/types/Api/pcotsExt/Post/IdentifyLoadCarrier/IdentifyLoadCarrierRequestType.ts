import { z } from 'zod'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const IdentifyLoadCarrierRequestValidator = z.object({
  loadCarrierId: z.string(),
  location: z.nativeEnum(PcotsLocationEnum),
})
export type IdentifyLoadCarrierRequestType = z.infer<
  typeof IdentifyLoadCarrierRequestValidator
>
