import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const MoveCompartmentResponseTypeValidator = MessageTypeValidator
export type MoveCompartmentResponseType = z.infer<
  typeof MoveCompartmentResponseTypeValidator
>
