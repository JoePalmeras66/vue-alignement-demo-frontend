import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const IdentifyLoadCarrierResponseTypeValidator = MessageTypeValidator
export type IdentifyLoadCarrierResponseType = z.infer<
  typeof IdentifyLoadCarrierResponseTypeValidator
>
