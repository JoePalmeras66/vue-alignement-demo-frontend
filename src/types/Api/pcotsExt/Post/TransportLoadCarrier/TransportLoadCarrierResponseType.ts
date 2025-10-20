import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const TransportLoadCarrierResponseTypeValidator = MessageTypeValidator
export type TransportLoadCarrierResponseType = z.infer<
  typeof TransportLoadCarrierResponseTypeValidator
>
