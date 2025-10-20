import { z } from 'zod'
import { WorkstationOccupancyTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetLoadCarriersResponseTypeValidator = z
  .object({})
  .extend(WorkstationOccupancyTypeValidator.shape)
export type GetLoadCarriersResponseType = z.infer<
  typeof GetLoadCarriersResponseTypeValidator
>
