import { z } from 'zod'
import {
  ConfirmedItemTypeValidator,
  ProblemTypeValidator,
} from '@/types/Api/pcots/PcotsApiModel'
import { ZeroCrossingResultEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

export const BookPurgeAndRecallTaskRequestTypeValidator = z.object({
  taskId: z.string(),
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string(),
  targetCompartmentId: z.string(),
  confirmedItems: z.array(ConfirmedItemTypeValidator),
  zeroCrossingResult: z.nativeEnum(ZeroCrossingResultEnum),
  problems: z.array(ProblemTypeValidator),
})
export type BookPurgeAndRecallTaskRequestType = z.infer<
  typeof BookPurgeAndRecallTaskRequestTypeValidator
>
