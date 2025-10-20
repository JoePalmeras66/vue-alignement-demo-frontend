import { z } from 'zod'
import { WorkstationStateTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const WorkstationChangedEventTypeValidator = z
  .object({})
  .extend(WorkstationStateTypeValidator.shape)
export type WorkstationChangedEventType = z.infer<
  typeof WorkstationChangedEventTypeValidator
>
