import { z } from 'zod'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const BookPickingTaskResponseTypeValidator = MessageTypeValidator
export type BookPickingTaskResponseType = z.infer<
  typeof BookPickingTaskResponseTypeValidator
>
