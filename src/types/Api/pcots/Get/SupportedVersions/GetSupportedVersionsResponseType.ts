import { z } from 'zod'
import { SupportedVersionsTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

export const GetSupportedVersionsResponseTypeValidator =
  SupportedVersionsTypeValidator
export type GetSupportedVersionsResponseType = z.infer<
  typeof GetSupportedVersionsResponseTypeValidator
>
