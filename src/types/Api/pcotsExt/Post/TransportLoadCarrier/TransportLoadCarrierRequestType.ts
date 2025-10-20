import { z } from 'zod'

export const TransportLoadCarrierRequestTypeValidator = z.object({
  loadCarrierId: z.string(),
})
export type TransportLoadCarrierRequestType = z.infer<
  typeof TransportLoadCarrierRequestTypeValidator
>
