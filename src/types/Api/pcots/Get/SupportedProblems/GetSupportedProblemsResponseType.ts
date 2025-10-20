import { z } from 'zod'
import { SupportedProblemsTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetSupportedProblemsResponseTypeValidator =
  SupportedProblemsTypeValidator
export type GetSupportedProblemsResponseType = z.infer<
  typeof GetSupportedProblemsResponseTypeValidator
>
