import { z } from 'zod'
import { OrderLineTypeValidator } from '@/types/Api/pcotsExt/PcotsExtApiModel'

export const GetLoadCarrierOrdersResponseTypeValidator = z.object({
  orderLines: z.array(OrderLineTypeValidator),
})
export type GetLoadCarrierOrdersResponseType = z.infer<
  typeof GetLoadCarrierOrdersResponseTypeValidator
>
