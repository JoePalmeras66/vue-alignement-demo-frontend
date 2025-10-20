import { z } from 'zod'
import { WorkstationOccupancyTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const OccupancyChangedEventTypeValidator = z
  .object({})
  .extend(WorkstationOccupancyTypeValidator.shape)
export type OccupancyChangedEventType = z.infer<
  typeof OccupancyChangedEventTypeValidator
>
