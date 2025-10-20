import { z } from 'zod'
import { TaskTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetCurrentTaskResponseTypeValidator = TaskTypeValidator
export type GetCurrentTaskResponseType = z.infer<
  typeof GetCurrentTaskResponseTypeValidator
>
