import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const BookCycleCountTaskResponseTypeValidator = MessageTypeValidator
export type BookCycleCountTaskResponseType = z.infer<
  typeof BookCycleCountTaskResponseTypeValidator
>
