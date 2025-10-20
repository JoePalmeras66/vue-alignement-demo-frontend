import { z } from 'zod'
import {
  ConfirmedItemTypeValidator,
  ProblemTypeValidator,
} from '@/types/Api/pcots/PcotsApiModel'

export const BookCycleCountTaskRequestTypeValidator = z.object({
  taskId: z.string(),
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string().optional(),
  targetCompartmentId: z.string().optional(),
  confirmedItems: z.array(ConfirmedItemTypeValidator),
  problems: z.array(ProblemTypeValidator),
})
export type BookCycleCountTaskRequestType = z.infer<
  typeof BookCycleCountTaskRequestTypeValidator
>
