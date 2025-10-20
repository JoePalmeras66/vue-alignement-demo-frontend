import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const BookPurgeAndRecallTaskResponseTypeValidator = MessageTypeValidator
export type BookPurgeAndRecallTaskResponseType = z.infer<
  typeof BookPurgeAndRecallTaskResponseTypeValidator
>
