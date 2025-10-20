import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const SwapCompartmentResponseTypeValidator = MessageTypeValidator
export type SwapCompartmentResponseType = z.infer<
  typeof SwapCompartmentResponseTypeValidator
>
