import { z } from 'zod'
import { ExecutionModeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const ChangeTaskExecutionModeRequestTypeValidator = z.object({
  executionMode: z.nativeEnum(ExecutionModeEnum),
})
export type ChangeTaskExecutionModeRequestType = z.infer<
  typeof ChangeTaskExecutionModeRequestTypeValidator
>
