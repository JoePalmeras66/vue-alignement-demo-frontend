import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const ChangeLoadCarrierTypeResponseTypeValidator = MessageTypeValidator
export type ChangeLoadCarrierTypeResponseType = z.infer<
  typeof ChangeLoadCarrierTypeResponseTypeValidator
>
