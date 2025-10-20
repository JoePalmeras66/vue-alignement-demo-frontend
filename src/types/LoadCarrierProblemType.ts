import { z } from 'zod'
import {
  ProblemCategoryEnum,
  ProblemTypeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'

export const LoadCarrierProblemTypeValidator = z.object({
  loadCarrierId: z.string().optional().nullable(),
  problemType: z.nativeEnum(ProblemTypeEnum),
  problemCategory: z.nativeEnum(ProblemCategoryEnum),
})
export type LoadCarrierProblemType = z.infer<
  typeof LoadCarrierProblemTypeValidator
>
