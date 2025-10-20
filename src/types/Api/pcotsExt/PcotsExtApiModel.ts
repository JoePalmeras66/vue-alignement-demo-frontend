import { z } from 'zod'
import {
  AdditionalDataTypeValidator,
  QuantityTypeValidator,
  TaskTypeValidator,
} from '@/types/Api/pcots/PcotsApiModel'

export const QuantityWithUnitTypeValidator = QuantityTypeValidator.extend({
  unit: z.string(),
  description: z.string().optional(),
})
export type QuantityWithUnitType = z.infer<typeof QuantityWithUnitTypeValidator>

export const OrderLineTypeValidator = AdditionalDataTypeValidator.extend({
  task: TaskTypeValidator,
  quantity: QuantityWithUnitTypeValidator,
  description: z.string().optional(),
})
export type OrderLineType = z.infer<typeof OrderLineTypeValidator>
