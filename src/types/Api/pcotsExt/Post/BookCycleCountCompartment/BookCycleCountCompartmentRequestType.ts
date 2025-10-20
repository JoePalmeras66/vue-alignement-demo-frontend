import { z } from 'zod'
import { ConfirmedItemTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const BookCycleCountCompartmentRequestTypeValidator = z.object({
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  confirmedItems: z.array(ConfirmedItemTypeValidator),
})
export type BookCycleCountCompartmentRequestType = z.infer<
  typeof BookCycleCountCompartmentRequestTypeValidator
>
