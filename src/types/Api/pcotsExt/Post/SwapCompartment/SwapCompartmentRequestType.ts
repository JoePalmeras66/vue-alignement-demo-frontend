import { z } from 'zod'

export const SwapCompartmentRequestTypeValidator = z.object({
  sourceLoadCarrierId: z.string(),
  sourceCompartmentId: z.string(),
  targetLoadCarrierId: z.string(),
  targetCompartmentId: z.string(),
  sourceItemId: z.string().optional(),
  targetItemId: z.string().optional(),
})
export type SwapCompartmentRequestType = z.infer<
  typeof SwapCompartmentRequestTypeValidator
>
