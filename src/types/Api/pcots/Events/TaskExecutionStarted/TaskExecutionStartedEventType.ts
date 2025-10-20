import { z } from 'zod'
import { TaskTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const TaskExecutionStartedEventTypeValidator = z
  .object({})
  .extend(TaskTypeValidator.shape)
export type TaskExecutionStartedEventType = z.infer<
  typeof TaskExecutionStartedEventTypeValidator
>
