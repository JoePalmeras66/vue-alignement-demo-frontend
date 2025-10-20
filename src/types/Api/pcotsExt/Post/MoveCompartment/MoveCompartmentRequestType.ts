import { z } from 'zod'

export const MoveCompartmentRequestTypeValidator = z.object({
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string(),
  targetCompartmentId: z.string(),
  quantity: z.number().optional(),
  itemId: z.string(),
})
export type MoveCompartmentRequestType = z.infer<
  typeof MoveCompartmentRequestTypeValidator
>
