import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const BookCycleCountCompartmentResponseTypeValidator =
  MessageTypeValidator
export type BookCycleCountCompartmentResponseType = z.infer<
  typeof BookCycleCountCompartmentResponseTypeValidator
>
