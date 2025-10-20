import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const BookConsolidationTaskResponseTypeValidator = MessageTypeValidator
export type BookConsolidationTaskResponseType = z.infer<
  typeof BookConsolidationTaskResponseTypeValidator
>
