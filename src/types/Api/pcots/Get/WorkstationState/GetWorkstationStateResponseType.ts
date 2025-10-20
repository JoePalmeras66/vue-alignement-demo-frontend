import { z } from 'zod'
import { WorkstationStateTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetWorkstationStateResponseTypeValidator =
  WorkstationStateTypeValidator
export type GetWorkstationStateResponseType = z.infer<
  typeof GetWorkstationStateResponseTypeValidator
>
