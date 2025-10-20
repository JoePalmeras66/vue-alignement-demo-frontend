import { z } from 'zod'

export const ChangeLoadCarrierTypeRequestTypeValidator = z.object({
  loadCarrierId: z.string(),
  loadCarrierTypeId: z.string(),
})
export type ChangeLoadCarrierTypeRequestType = z.infer<
  typeof ChangeLoadCarrierTypeRequestTypeValidator
>
